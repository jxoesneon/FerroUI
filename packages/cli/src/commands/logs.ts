import { Command } from 'commander';
import chalk from 'chalk';

const AUDIT_LOG_SERVICES = ['engine', 'registry', 'playground'] as const;
type ServiceName = typeof AUDIT_LOG_SERVICES[number];

function getServiceUrls(): Record<ServiceName, string> {
  return {
    engine: process.env.FERROUI_ENGINE_URL ?? 'http://localhost:4000',
    registry: process.env.FERROUI_REGISTRY_URL ?? 'http://localhost:3002',
    playground: process.env.FERROUI_PLAYGROUND_URL ?? 'http://localhost:3000',
  };
}

export const logsCommand = new Command('logs')
  .description('Stream structured audit logs from FerroUI services.')
  .option('-f, --follow', 'Stream logs continuously (tail -f style)', false)
  .option('-s, --service <service>', `Service to tail: ${AUDIT_LOG_SERVICES.join(' | ')}`, 'engine')
  .option('-n, --lines <number>', 'Number of past log lines to show on start', '50')
  .option('--json', 'Output raw JSON lines instead of formatted output', false)
  .action(async (options) => {
    const service = options.service as ServiceName;

    if (!AUDIT_LOG_SERVICES.includes(service)) {
      console.error(chalk.red(`Unknown service "${service}". Valid: ${AUDIT_LOG_SERVICES.join(', ')}`));
      process.exit(1);
    }

    const baseUrl = getServiceUrls()[service];
    const logsUrl = `${baseUrl}/admin/logs`;

    console.log(chalk.dim(`Connecting to ${chalk.bold(service)} logs at ${logsUrl}...\n`));

    if (options.follow) {
      await streamLogs(logsUrl, options.json);
    } else {
      await fetchRecentLogs(logsUrl, parseInt(options.lines, 10), options.json);
    }
  });

async function fetchRecentLogs(url: string, lines: number, jsonOutput: boolean): Promise<void> {
  try {
    const response = await fetch(`${url}?lines=${lines}`);
    if (!response.ok) {
      console.error(chalk.red(`Failed to fetch logs: HTTP ${response.status}`));
      process.exit(1);
    }
    const data = await response.json() as { events: unknown[] };
    for (const event of data.events ?? []) {
      printLogEvent(event, jsonOutput);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`Cannot connect to service: ${msg}`));
    console.log(chalk.dim('  Make sure the service is running with: ferroui dev'));
    process.exit(1);
  }
}

async function streamLogs(url: string, jsonOutput: boolean): Promise<void> {
  console.log(chalk.dim('Streaming logs... (Ctrl+C to stop)\n'));

  const poll = async (): Promise<void> => {
    try {
      const response = await fetch(`${url}?stream=true`);
      if (!response.ok || !response.body) {
        console.error(chalk.red(`Stream error: HTTP ${response.status}`));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const event = JSON.parse(line.replace(/^data:\s*/, ''));
            printLogEvent(event, jsonOutput);
          } catch {
            // skip partial lines
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(chalk.yellow(`\nConnection lost: ${msg}. Retrying in 3s...`));
      await new Promise(r => setTimeout(r, 3000));
      await poll();
    }
  };

  await poll();
}

function printLogEvent(event: unknown, jsonOutput: boolean): void {
  if (jsonOutput) {
    console.log(JSON.stringify(event));
    return;
  }

  const e = event as Record<string, unknown>;
  const ts = typeof e.timestamp === 'string'
    ? new Date(e.timestamp).toLocaleTimeString()
    : '??:??:??';
  const type = String(e.type ?? 'unknown').padEnd(20);
  const reqId = typeof e.requestId === 'string' ? e.requestId.slice(0, 8) : '';
  const userId = typeof e.userId === 'string'
    ? chalk.cyan(e.userId.slice(0, 8))
    : chalk.dim('anon');

  const typeStr = String(e.type ?? '');
  const typeColor =
    typeStr.includes('error') ? chalk.red(type) :
    typeStr.includes('complete') ? chalk.green(type) :
    typeStr.includes('tool') ? chalk.yellow(type) :
    chalk.blue(type);

  let detail = '';
  if (typeof e.toolName === 'string') {
    detail = `tool=${chalk.bold(e.toolName)} success=${e.success}`;
  } else if (typeof e.error === 'string') {
    detail = chalk.red(e.error);
  } else if (typeof e.durationMs === 'number') {
    detail = chalk.dim(`${e.durationMs}ms`);
  }

  console.log(`${chalk.dim(ts)} ${typeColor} ${chalk.dim(reqId)} ${userId} ${detail}`);
}
