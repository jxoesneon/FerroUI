import { Command } from 'commander';
import chalk from 'chalk';
import { execa, type ResultPromise } from 'execa';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import ora from 'ora';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Detect the package manager by looking for lock files up from cwd. */
function detectPkgManager(cwd: string): string {
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

/** Open a URL in the system default browser (cross-platform). */
function openBrowser(url: string): void {
  try {
    const cmd =
      process.platform === 'win32'
        ? `start ${url}`
        : process.platform === 'darwin'
        ? `open ${url}`
        : `xdg-open ${url}`;
    execSync(cmd, { stdio: 'ignore' });
  } catch {
    // best-effort
  }
}

export const devCommand = new Command('dev')
  .description('Start the development environment (engine, registry inspector, and playground).')
  .option('-p, --port <number>', 'Playground port', '3000')
  .option('--engine-port <number>', 'Engine port', '3001')
  .option('--inspector-port <number>', 'Registry inspector port', '3002')
  .option('--no-open', "Don't open browser automatically")
  .option('--engine-only', 'Start only the orchestration engine (backend)')
  .option('--renderer-only', 'Start only the layout playground/renderer (frontend)')
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n✦ FerroUI Development Environment\n'));

    const cwd = process.cwd();
    const pkgManager = detectPkgManager(cwd);
    
    const startEngine = options.engineOnly || (!options.engineOnly && !options.rendererOnly);
    const startRenderer = options.rendererOnly || (!options.engineOnly && !options.rendererOnly);

    // Determine monorepo layout: if running inside the monorepo, use workspace paths.
    // Otherwise fall back to locally installed package entry points.
    const monoRoot = path.resolve(__dirname, '../../../..');
    const appsDir = path.join(monoRoot, 'apps');
    const packagesDir = path.join(monoRoot, 'packages');

    const playgroundPort = options.port;
    const enginePort = options.enginePort;
    const inspectorPort = options.inspectorPort;

    const spinner = ora('Starting development services...').start();
     
    const processes: ResultPromise[] = [];

    const sharedEnv = { ...process.env, PATH: process.env.PATH };

    try {
      // ── 1. Layout Playground ────────────────────────────────────────────
      if (startRenderer) {
        const webDir = path.join(appsDir, 'web');
        const webExists = await fs.pathExists(webDir);

        if (webExists) {
          const playground = execa(pkgManager, ['run', 'dev', '--', '--port', playgroundPort], {
            cwd: webDir,
            stdio: 'inherit',
            env: { ...sharedEnv, PORT: String(playgroundPort) },
            reject: false,
          });
          processes.push(playground);
        } else {
          spinner.warn(chalk.yellow('apps/web not found — playground not started'));
        }
      }

      // ── 2. Orchestration Engine ─────────────────────────────────────────
      if (startEngine) {
        let engineEntry: string | undefined;
        const engineDist = path.join(packagesDir, 'engine/dist/server.js');
        const engineSrc = path.join(packagesDir, 'engine/src/server.ts');
        if (await fs.pathExists(engineDist)) {
          engineEntry = engineDist;
        } else if (await fs.pathExists(engineSrc)) {
          engineEntry = engineSrc;
        }

        if (engineEntry) {
          const useTs = engineEntry.endsWith('.ts');
          const engineCmd = useTs ? 'npx' : 'node';
          const engineArgs = useTs
            ? ['ts-node', '--esm', engineEntry]
            : [engineEntry];

          const engine = execa(engineCmd, engineArgs, {
            stdio: 'inherit',
            env: { ...sharedEnv, PORT: String(enginePort) },
            reject: false,
          });
          processes.push(engine);
        } else {
          spinner.warn(chalk.yellow('Engine entry not found — engine not started'));
        }

        // ── 3. Registry Inspector ───────────────────────────────────────────
        let inspectorEntry: string | undefined;
        const inspectorDist = path.join(packagesDir, 'registry/dist/inspector.js');
        const inspectorSrc = path.join(packagesDir, 'registry/src/inspector.ts');
        if (await fs.pathExists(inspectorDist)) {
          inspectorEntry = inspectorDist;
        } else if (await fs.pathExists(inspectorSrc)) {
          inspectorEntry = inspectorSrc;
        }

        if (inspectorEntry) {
          const useTs = inspectorEntry.endsWith('.ts');
          const inspCmd = useTs ? 'npx' : 'node';
          const inspArgs = useTs
            ? ['ts-node', '--esm', inspectorEntry, '--port', String(inspectorPort)]
            : [inspectorEntry, '--port', String(inspectorPort)];

          const inspector = execa(inspCmd, inspArgs, {
            stdio: 'inherit',
            env: { ...sharedEnv, PORT: String(inspectorPort) },
            reject: false,
          });
          processes.push(inspector);
        } else {
          spinner.warn(chalk.yellow('Registry inspector entry not found — inspector not started'));
        }
      }

      spinner.succeed(chalk.green('Services started!'));

      if (startRenderer) {
        console.log(`  ${chalk.bold('✔ Layout Playground:')}   ${chalk.blue(`http://localhost:${playgroundPort}`)}`);
      }
      if (startEngine) {
        console.log(`  ${chalk.bold('✔ Orchestration Engine:')} ${chalk.blue(`http://localhost:${enginePort}`)}`);
        console.log(`  ${chalk.bold('✔ Registry Inspector:')}  ${chalk.blue(`http://localhost:${inspectorPort}`)}`);
      }

      console.log(chalk.dim('  Watching for changes... Press Ctrl+C to stop.\n'));

      if (options.open !== false) {
        // Give Vite a moment to start before opening
        await new Promise(r => setTimeout(r, 1500));
        openBrowser(`http://localhost:${playgroundPort}`);
      }

      // Keep alive — wait for all processes (they are long-running)
      await Promise.allSettled(processes);
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to start services.'));
      console.error(chalk.dim(error.message));
      // Kill any started processes
      for (const proc of processes) {
        try { proc.kill(); } catch { /* ignore */ }
      }
      process.exit(1);
    }
  });
