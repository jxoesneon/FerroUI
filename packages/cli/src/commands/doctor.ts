import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CheckResult {
  name: string;
  passed: boolean;
  value?: string;
  warning?: boolean;
  fix?: string;
}

function checkCmd(cmd: string): string | null {
  try {
    return execSync(cmd, { stdio: 'pipe', encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

function semverMeetsMin(version: string, min: number[]): boolean {
  const parts = version.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < min.length; i++) {
    if ((parts[i] ?? 0) > min[i]) return true;
    if ((parts[i] ?? 0) < min[i]) return false;
  }
  return true;
}

/**
 * `ferroui doctor` — PRD-002 §3.5
 * Diagnose common issues with the FerroUI development environment.
 */
export const doctorCommand = new Command('doctor')
  .description('Diagnose common issues with the FerroUI environment.')
  .option('--json', 'Output results as JSON')
  .action(async (options) => {
    if (!options.json) {
      console.log(chalk.bold.cyan('\n✦ FerroUI Doctor\n'));
      console.log(chalk.dim('Checking your development environment...\n'));
    }

    const cwd = process.cwd();
    const results: CheckResult[] = [];

    // ── Node.js ───────────────────────────────────────────────────────────────
    const nodeVersion = checkCmd('node --version');
    results.push({
      name: 'Node.js',
      passed: !!nodeVersion && semverMeetsMin(nodeVersion, [18]),
      value: nodeVersion ?? 'not found',
      fix: !nodeVersion ? 'Install Node.js 18+ from https://nodejs.org' : undefined,
    });

    // ── pnpm ──────────────────────────────────────────────────────────────────
    const pnpmVersion = checkCmd('pnpm --version');
    results.push({
      name: 'pnpm',
      passed: !!pnpmVersion,
      value: pnpmVersion ? `v${pnpmVersion}` : 'not found',
      warning: !pnpmVersion,
      fix: !pnpmVersion ? 'Install pnpm: npm install -g pnpm' : undefined,
    });

    // ── TypeScript ────────────────────────────────────────────────────────────
    const tsVersion = checkCmd('npx tsc --version');
    results.push({
      name: 'TypeScript',
      passed: !!tsVersion,
      value: tsVersion ?? 'not found',
      fix: !tsVersion ? 'Run: pnpm install (TypeScript is in devDependencies)' : undefined,
    });

    // ── Git ───────────────────────────────────────────────────────────────────
    const gitVersion = checkCmd('git --version');
    const isGitRepo = fs.existsSync(path.join(cwd, '.git'));
    results.push({
      name: 'Git',
      passed: !!gitVersion,
      value: gitVersion ?? 'not found',
      fix: !gitVersion ? 'Install Git from https://git-scm.com' : undefined,
    });
    if (gitVersion) {
      results.push({
        name: 'Git repository',
        passed: isGitRepo,
        value: isGitRepo ? 'initialized' : 'not initialized',
        warning: !isGitRepo,
        fix: !isGitRepo ? 'Run: git init' : undefined,
      });
    }

    // ── tsconfig.json ─────────────────────────────────────────────────────────
    const hasTsConfig = fs.existsSync(path.join(cwd, 'tsconfig.json'));
    results.push({
      name: 'tsconfig.json',
      passed: hasTsConfig,
      value: hasTsConfig ? 'found' : 'missing',
      fix: !hasTsConfig ? 'Run: ferroui create <name> — or add tsconfig.json manually' : undefined,
    });

    // ── ESLint ────────────────────────────────────────────────────────────────
    const hasEslint =
      fs.existsSync(path.join(cwd, '.eslintrc.js')) ||
      fs.existsSync(path.join(cwd, '.eslintrc.json')) ||
      fs.existsSync(path.join(cwd, 'eslint.config.js')) ||
      fs.existsSync(path.join(cwd, 'eslint.config.mjs'));
    results.push({
      name: 'ESLint configuration',
      passed: hasEslint,
      value: hasEslint ? 'found' : 'missing',
      warning: !hasEslint,
      fix: !hasEslint ? 'Add eslint.config.js (optional but recommended)' : undefined,
    });

    // ── .env / API keys ───────────────────────────────────────────────────────
    const hasEnv =
      fs.existsSync(path.join(cwd, '.env')) ||
      fs.existsSync(path.join(cwd, '.env.local'));
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const hasAnyKey = !!openaiKey || !!anthropicKey;

    results.push({
      name: '.env file',
      passed: hasEnv,
      value: hasEnv ? 'found' : 'missing',
      warning: !hasEnv,
      fix: !hasEnv ? 'Create .env.local: cp .env.local.example .env.local (or ferroui create)' : undefined,
    });
    results.push({
      name: 'LLM API key (OPENAI or ANTHROPIC)',
      passed: hasAnyKey,
      value: hasAnyKey ? 'set' : 'not set',
      warning: !hasAnyKey,
      fix: !hasAnyKey
        ? 'Set OPENAI_API_KEY or ANTHROPIC_API_KEY in your .env file'
        : undefined,
    });

    // ── Ollama (optional) ─────────────────────────────────────────────────────
    const ollamaRunning = checkCmd('curl -s http://localhost:11434/api/tags') !== null;
    results.push({
      name: 'Ollama (local LLM)',
      passed: ollamaRunning,
      value: ollamaRunning ? 'running' : 'not detected',
      warning: true,  // always a warning, never a hard failure
      fix: !ollamaRunning ? 'Optional: install Ollama from https://ollama.ai for zero data-egress mode' : undefined,
    });

    // ── FerroUI schema package ──────────────────────────────────────────────────
    const schemaDir = path.join(cwd, 'node_modules/@ferroui/schema');
    const monoSchemaDir = path.join(__dirname, '../../../../packages/schema/dist');
    const hasSchema = fs.existsSync(schemaDir) || fs.existsSync(monoSchemaDir);
    results.push({
      name: '@ferroui/schema package',
      passed: hasSchema,
      value: hasSchema ? 'found' : 'missing',
      fix: !hasSchema ? 'Run: pnpm install (or pnpm build in the monorepo)' : undefined,
    });

    // ── Output ────────────────────────────────────────────────────────────────
    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    let hasFailure = false;
    for (const r of results) {
      const isHardFail = !r.passed && !r.warning;
      const isWarn = !r.passed && r.warning;

      if (isHardFail) {
        hasFailure = true;
        console.log(`${chalk.red('✖')} ${chalk.bold(r.name)}: ${chalk.dim(r.value ?? '')}`);
        if (r.fix) console.log(`  ${chalk.dim('Fix:')} ${chalk.yellow(r.fix)}`);
      } else if (isWarn) {
        console.log(`${chalk.yellow('⚠')} ${chalk.bold(r.name)}: ${chalk.dim(r.value ?? '')}`);
        if (r.fix) console.log(`  ${chalk.dim('Note:')} ${chalk.dim(r.fix)}`);
      } else {
        console.log(`${chalk.green('✔')} ${chalk.bold(r.name)}: ${chalk.dim(r.value ?? '')}`);
      }
    }

    console.log('');

    if (hasFailure) {
      console.log(chalk.red('✖ Some checks failed. Resolve the issues above before running ferroui dev.\n'));
      process.exit(1);
    } else {
      console.log(chalk.green('✔ Environment looks good! Run `ferroui dev` to start building.\n'));
    }
  });
