import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { execSync, spawnSync } from 'child_process';

/**
 * Run a command synchronously, streaming output. Returns true on success.
 */
function run(cmd: string, args: string[], cwd: string, label: string): boolean {
  const result = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    console.error(chalk.red(`  ✖ ${label} failed (exit ${result.status})`));
    return false;
  }
  return true;
}

export const buildCommand = new Command('build')
  .description('Build the Alloy project for production.')
  .option('-o, --output <dir>', 'Output directory', 'dist')
  .option('--skip-typecheck', 'Skip TypeScript type checking')
  .option('--skip-tests', 'Skip running tests')
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n✦ Alloy UI Production Build\n'));

    const cwd = process.cwd();
    const outputDir = path.resolve(cwd, options.output);
    let failed = false;

    // ── Step 1: TypeScript type check ───────────────────────────────────────
    if (!options.skipTypecheck) {
      const spinner = ora('Running TypeScript type check...').start();
      const ok = run('npx', ['tsc', '--noEmit'], cwd, 'TypeScript type check');
      if (ok) {
        spinner.succeed(chalk.green('Type check passed'));
      } else {
        spinner.fail(chalk.red('Type check failed'));
        failed = true;
      }
    }

    if (failed) {
      console.error(chalk.red('\n✖ Build aborted due to type errors.\n'));
      process.exit(1);
    }

    // ── Step 2: Build packages ───────────────────────────────────────────────
    const monoRoot = path.resolve(__dirname, '../../../..');
    const packagesDir = path.join(monoRoot, 'packages');
    const appsDir = path.join(monoRoot, 'apps');

    const targets = [
      { label: 'Schema package',    dir: path.join(packagesDir, 'schema'),   outSub: null },
      { label: 'Registry package',  dir: path.join(packagesDir, 'registry'), outSub: null },
      { label: 'Tools package',     dir: path.join(packagesDir, 'tools'),    outSub: null },
      { label: 'i18n package',      dir: path.join(packagesDir, 'i18n'),     outSub: null },
      { label: 'Telemetry package', dir: path.join(packagesDir, 'telemetry'),outSub: null },
      { label: 'Engine (server)',   dir: path.join(packagesDir, 'engine'),   outSub: 'server' },
      { label: 'Web app',           dir: path.join(appsDir, 'web'),          outSub: 'web' },
      { label: 'Edge worker',       dir: path.join(appsDir, 'edge'),         outSub: 'edge' },
    ];

    const hasPnpm = (() => {
      try { execSync('pnpm --version', { stdio: 'ignore' }); return true; } catch { return false; }
    })();
    const pm = hasPnpm ? 'pnpm' : 'npm';

    for (const target of targets) {
      const exists = await fs.pathExists(target.dir);
      if (!exists) continue;

      const spinner = ora(`Building ${target.label}...`).start();
      const ok = run(pm, ['run', 'build'], target.dir, target.label);

      if (ok) {
        spinner.succeed(chalk.green(`Built ${target.label}`));
        // Copy output to dist subdirectory if applicable
        if (target.outSub) {
          const srcDist = path.join(target.dir, 'dist');
          const destDir = path.join(outputDir, target.outSub);
          if (await fs.pathExists(srcDist)) {
            await fs.ensureDir(destDir);
            await fs.copy(srcDist, destDir, { overwrite: true });
          }
        }
      } else {
        spinner.fail(chalk.red(`Failed to build ${target.label}`));
        failed = true;
      }
    }

    if (failed) {
      console.error(chalk.red('\n✖ Build completed with errors.\n'));
      process.exit(1);
    }

    // ── Step 3: Generate manifest ────────────────────────────────────────────
    const manifestSpinner = ora('Generating alloy-manifest.json...').start();
    await fs.ensureDir(outputDir);

    const manifest = {
      schemaVersion: '1.0',
      version: '1.0.0',
      builtAt: new Date().toISOString(),
      outputs: ['web', 'server', 'edge'].filter(async d =>
        await fs.pathExists(path.join(outputDir, d))
      ),
    };

    await fs.writeJson(path.join(outputDir, 'alloy-manifest.json'), manifest, { spaces: 2 });
    manifestSpinner.succeed(chalk.green('Generated alloy-manifest.json'));

    console.log(`
${chalk.bold('Output:')}  ${chalk.dim(outputDir)}
  ├── web/              ${chalk.dim('# Static web build')}
  ├── server/           ${chalk.dim('# Engine server bundle')}
  └── edge/             ${chalk.dim('# Cloudflare Workers bundle')}
`);
    console.log(chalk.green('✔ Build complete.\n'));
  });
