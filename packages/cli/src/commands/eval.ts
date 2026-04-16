import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

const CI_PASS_THRESHOLD = 0.95; // 95% pass rate required

interface EvalCase {
  prompt: string;
  description?: string;
  latencyThresholdMs?: number;
}

interface EvalResult {
  prompt: string;
  description: string;
  passed: boolean;
  checks: {
    schemaValid: boolean;
    noHallucinations: boolean;
    dataAccuracy: boolean;
    a11yCompliant: boolean;
    latencyOk: boolean;
  };
  latencyMs: number;
  error?: string;
}

/**
 * Loads eval cases from ferroui/evals/ directory or returns built-in defaults.
 */
async function loadEvalCases(evalsDir: string, singlePrompt?: string): Promise<EvalCase[]> {
  if (singlePrompt) {
    return [{ prompt: singlePrompt, description: 'Ad-hoc prompt' }];
  }
  if (await fs.pathExists(evalsDir)) {
    const files = (await fs.readdir(evalsDir)).filter(f => f.endsWith('.json'));
    if (files.length > 0) {
      const cases: EvalCase[] = [];
      for (const file of files) {
        const content = await fs.readJson(path.join(evalsDir, file));
        if (Array.isArray(content)) {
          cases.push(...content);
        } else if (content.prompt) {
          cases.push(content);
        }
      }
      if (cases.length > 0) return cases;
    }
  }
  // Built-in default suite
  return [
    { prompt: 'Show me a dashboard with KPIs', description: 'KPI Dashboard', latencyThresholdMs: 5000 },
    { prompt: 'Display user analytics for the last week', description: 'User Analytics', latencyThresholdMs: 5000 },
    { prompt: 'Create a sales overview with revenue and conversions', description: 'Sales Overview', latencyThresholdMs: 5000 },
    { prompt: 'Show a summary of active orders', description: 'Order Summary', latencyThresholdMs: 5000 },
  ];
}

/**
 * Calls the FerroUI engine and evaluates the response.
 */
async function runEvalCase(
  evalCase: EvalCase,
  engineUrl: string,
  options: { promptVersion?: string; provider?: string } = {}
): Promise<EvalResult> {
  const latencyThresholdMs = evalCase.latencyThresholdMs ?? 5000;
  const start = Date.now();

  const result: EvalResult = {
    prompt: evalCase.prompt,
    description: evalCase.description ?? evalCase.prompt.slice(0, 50),
    passed: false,
    checks: {
      schemaValid: false,
      noHallucinations: false,
      dataAccuracy: false,
      a11yCompliant: false,
      latencyOk: false,
    },
    latencyMs: 0,
  };

  try {
    const response = await fetch(`${engineUrl}/api/ferroui/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: evalCase.prompt,
        version: options.promptVersion,
        provider: options.provider,
        context: {
          userId: 'eval-user',
          requestId: `eval-${Date.now()}`,
          permissions: ['*'],
          locale: 'en-US',
        },
      }),
    });

    result.latencyMs = Date.now() - start;

    if (!response.ok) {
      result.error = `HTTP ${response.status}: ${response.statusText}`;
      return result;
    }

    // Collect full SSE stream
    const text = await response.text();
    const lines = text.split('\n').filter(l => l.startsWith('data:'));
    let layoutJson: any = null;
    let hasError = false;

    for (const line of lines) {
      try {
        const chunk = JSON.parse(line.replace(/^data:\s*/, ''));
        if (chunk.type === 'layout_chunk' && chunk.layout) {
          layoutJson = chunk.layout;
        }
        if (chunk.type === 'error') {
          hasError = true;
          result.error = chunk.error?.message;
        }
      } catch {
        // partial chunk — skip
      }
    }

    if (hasError || !layoutJson) {
      result.error = result.error ?? 'No layout received from engine';
      return result;
    }

    // ── Check 1: Schema validity ──────────────────────────────────────────
    result.checks.schemaValid =
      typeof layoutJson === 'object' &&
      typeof layoutJson.schemaVersion === 'string' &&
      typeof layoutJson.layout === 'object' &&
      typeof layoutJson.layout.type === 'string';

    // ── Check 2: No hallucinations (root must be a known container type) ──
    const knownRootTypes = ['Dashboard', 'Page', 'Container', 'Layout', 'View'];
    result.checks.noHallucinations = knownRootTypes.includes(layoutJson.layout?.type ?? '');

    // ── Check 3: Data accuracy (layout contains at least one child) ───────
    result.checks.dataAccuracy =
      Array.isArray(layoutJson.layout?.children) &&
      layoutJson.layout.children.length > 0;

    // ── Check 4: A11y compliance (aria props present on root) ─────────────
    const checkAriaRecursive = (node: any): boolean => {
      if (!node) return false;
      if (node.aria && typeof node.aria === 'object') return true;
      if (Array.isArray(node.children)) {
        return node.children.some(checkAriaRecursive);
      }
      return false;
    };
    result.checks.a11yCompliant = checkAriaRecursive(layoutJson.layout);

    // ── Check 5: Latency within threshold ─────────────────────────────────
    result.checks.latencyOk = result.latencyMs <= latencyThresholdMs;

    result.passed = Object.values(result.checks).every(Boolean);
  } catch (err: any) {
    result.latencyMs = Date.now() - start;
    result.error = err.message;
  }

  return result;
}

/**
 * Generates an HTML report of eval results.
 */
async function generateHtmlReport(results: EvalResult[], outputPath: string): Promise<void> {
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const passRate = total > 0 ? (passed / total) * 100 : 0;
  const now = new Date().toISOString();

  const rows = results
    .map(
      r => `
    <tr class="${r.passed ? 'pass' : 'fail'}">
      <td>${r.description}</td>
      <td title="${r.prompt}">${r.prompt.length > 60 ? r.prompt.slice(0, 60) + '…' : r.prompt}</td>
      <td>${r.checks.schemaValid ? '✔' : '✖'}</td>
      <td>${r.checks.noHallucinations ? '✔' : '✖'}</td>
      <td>${r.checks.dataAccuracy ? '✔' : '✖'}</td>
      <td>${r.checks.a11yCompliant ? '✔' : '✖'}</td>
      <td class="${r.checks.latencyOk ? '' : 'warn'}">${r.latencyMs}ms</td>
      <td>${r.passed ? '<span class="badge pass">PASS</span>' : '<span class="badge fail">FAIL</span>'}</td>
      ${r.error ? `<td class="error-cell">${r.error}</td>` : '<td>—</td>'}
    </tr>`
    )
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FerroUI Eval Report — ${now}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 2rem; background: #f8fafc; color: #1e293b; }
    h1 { margin: 0 0 .25rem; font-size: 1.75rem; }
    .meta { color: #64748b; font-size: .875rem; margin-bottom: 2rem; }
    .summary { display: flex; gap: 1.5rem; margin-bottom: 2rem; }
    .stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.5rem; min-width: 120px; }
    .stat .label { font-size: .75rem; text-transform: uppercase; letter-spacing: .05em; color: #64748b; }
    .stat .value { font-size: 1.75rem; font-weight: 700; margin-top: .25rem; }
    .pass .value { color: #16a34a; }
    .fail .value { color: #dc2626; }
    .neutral .value { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
    th { background: #f1f5f9; text-align: left; padding: .75rem 1rem; font-size: .8rem; text-transform: uppercase; letter-spacing: .04em; color: #475569; border-bottom: 1px solid #e2e8f0; }
    td { padding: .75rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: .875rem; }
    tr.pass td:first-child { border-left: 3px solid #16a34a; }
    tr.fail td:first-child { border-left: 3px solid #dc2626; }
    .badge { display: inline-block; padding: .2rem .6rem; border-radius: 9999px; font-size: .75rem; font-weight: 700; }
    .badge.pass { background: #dcfce7; color: #16a34a; }
    .badge.fail { background: #fee2e2; color: #dc2626; }
    .warn { color: #d97706; font-weight: 600; }
    .error-cell { color: #dc2626; font-size: .8rem; max-width: 200px; }
  </style>
</head>
<body>
  <h1>FerroUI Eval Report</h1>
  <p class="meta">Generated: ${now} · Suite: ${total} prompts</p>

  <div class="summary">
    <div class="stat neutral"><div class="label">Total</div><div class="value">${total}</div></div>
    <div class="stat pass"><div class="label">Passed</div><div class="value">${passed}</div></div>
    <div class="stat fail"><div class="label">Failed</div><div class="value">${total - passed}</div></div>
    <div class="stat ${passRate >= 95 ? 'pass' : 'fail'}"><div class="label">Pass Rate</div><div class="value">${passRate.toFixed(1)}%</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Name</th><th>Prompt</th><th>Schema</th><th>Hallucinations</th>
        <th>Data</th><th>A11y</th><th>Latency</th><th>Result</th><th>Error</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, html, 'utf-8');
}

/**
 * Eval Command — PRD-002 §3.3
 */
export const evalCommand = new Command('eval')
  .description('Run the prompt evaluation suite against the FerroUI engine.')
  .option('-p, --prompt <prompt>', 'Evaluate a single prompt instead of the full suite')
  .option('-u, --engine-url <url>', 'Engine base URL', 'http://localhost:3001')
  .option('-o, --output <path>', 'HTML report output path', `ferroui/evals/report-${new Date().toISOString().slice(0, 10)}.html`)
  .option('--prompt-version <version>', 'Specific prompt version to use (e.g., v1, v2)')
  .option('--provider <name>', 'Specific LLM provider to use (e.g., openai, anthropic)')
  .option('--no-report', 'Skip HTML report generation')
  .option('--ci', 'Exit with code 1 if pass rate < 95% (for CI pipelines)')
  .action(async (options) => {
    console.log(chalk.bold.blue('\n📊 FerroUI Evaluation Suite\n'));

    const evalsDir = path.resolve(process.cwd(), 'ferroui/evals');
    const evalCases = await loadEvalCases(evalsDir, options.prompt);

    console.log(chalk.dim(`Engine:     ${options.engineUrl}`));
    console.log(chalk.dim(`Prompts:    ${evalCases.length}`));
    console.log(chalk.dim(`Threshold:  ${(CI_PASS_THRESHOLD * 100).toFixed(0)}%\n`));

    const results: EvalResult[] = [];
    let passed = 0;

    for (const evalCase of evalCases) {
      const spinner = ora(`  ${evalCase.description ?? evalCase.prompt.slice(0, 50)}...`).start();
      const result = await runEvalCase(evalCase, options.engineUrl, {
        promptVersion: options.promptVersion,
        provider: options.provider
      });
      results.push(result);

      if (result.passed) {
        passed++;
        const latencyLabel = result.checks.latencyOk
          ? chalk.dim(`${result.latencyMs}ms`)
          : chalk.yellow(`${result.latencyMs}ms ⚠`);
        spinner.succeed(`${chalk.green('✔')} ${result.description} ${latencyLabel}`);
      } else {
        const checks = Object.entries(result.checks)
          .filter(([, v]) => !v)
          .map(([k]) => k)
          .join(', ');
        spinner.fail(`${chalk.red('✖')} ${result.description} ${chalk.dim(`[failed: ${checks}]`)}`);
        if (result.error) {
          console.log(chalk.dim(`    Error: ${result.error}`));
        }
      }
    }

    const total = results.length;
    const passRate = total > 0 ? passed / total : 0;
    const passRatePct = (passRate * 100).toFixed(1);

    console.log(`\n${chalk.bold('Results:')} ${passed}/${total} passed (${passRatePct}%)`);

    // HTML report
    if (options.report !== false) {
      const reportPath = path.resolve(process.cwd(), options.output);
      await generateHtmlReport(results, reportPath);
      console.log(chalk.dim(`Report:  ${reportPath}`));
    }

    if (passRate >= CI_PASS_THRESHOLD) {
      console.log(chalk.green(`\n✅ Pass rate ${passRatePct}% meets the ${(CI_PASS_THRESHOLD * 100).toFixed(0)}% threshold.\n`));
    } else {
      console.log(chalk.red(`\n✖ Pass rate ${passRatePct}% is below the ${(CI_PASS_THRESHOLD * 100).toFixed(0)}% threshold.\n`));
      if (options.ci) {
        process.exit(1);
      }
    }
  });
