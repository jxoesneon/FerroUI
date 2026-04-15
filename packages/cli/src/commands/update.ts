import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import { execSync } from 'child_process';
import { createRequire } from 'module';

/**
 * `ferroui update`
 * Checks for the latest version of the ferroui CLI package and upgrades it.
 * Implements PRD-002 §3.5 — Utility Commands.
 */
export const updateCommand = new Command('update')
  .description('Update FerroUI UI CLI to the latest version.')
  .option('--yes', 'Skip confirmation prompt')
  .option('--pkg-manager <manager>', 'Package manager to use: pnpm | npm | yarn', 'pnpm')
  .action(async (options) => {
    const spinner = ora('Checking for updates...').start();

    let currentVersion = 'unknown';
    let latestVersion = 'unknown';

    try {
      // Current version comes from this package's own package.json
      try {
        const _require = createRequire(import.meta.url);
        const pkg = _require('../../package.json') as { version?: string };
        currentVersion = pkg.version ?? 'unknown';
      } catch {
        // Running from source — keep 'unknown'
      }

      // Query npm registry for the latest published version
      const raw = execSync('npm view ferroui version --json 2>/dev/null || echo "null"', {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();

      latestVersion = raw.replace(/"/g, '') || 'unknown';
      spinner.stop();
    } catch {
      spinner.stop();
      // Network unavailable — latestVersion stays 'unknown'
    }

    console.log(`\n  ${chalk.dim('Current version:')} ${chalk.bold(currentVersion)}`);
    console.log(`  ${chalk.dim('Latest version: ')} ${chalk.bold(latestVersion)}\n`);

    if (currentVersion !== 'unknown' && latestVersion !== 'unknown' && currentVersion === latestVersion) {
      console.log(chalk.green('✔ Already up to date.'));
      return;
    }

    if (!options.yes) {
      const { confirmed } = await prompts(
        {
          type: 'confirm',
          name: 'confirmed',
          message: latestVersion !== 'unknown'
            ? `Update ferroui from ${chalk.bold(currentVersion)} → ${chalk.bold(latestVersion)}?`
            : 'Reinstall the latest version of ferroui?',
          initial: true,
        },
        { onCancel: () => { console.log(chalk.yellow('\nCancelled.')); process.exit(0); } }
      );

      if (!confirmed) {
        console.log(chalk.yellow('Update cancelled.'));
        return;
      }
    }

    const mgr: string = options.pkgManager;
    let installCmd: string;

    switch (mgr) {
      case 'yarn':
        installCmd = 'yarn global add ferroui@latest';
        break;
      case 'npm':
        installCmd = 'npm install -g ferroui@latest';
        break;
      case 'pnpm':
      default:
        installCmd = 'pnpm add -g ferroui@latest';
        break;
    }

    const installSpinner = ora(`Running: ${chalk.dim(installCmd)}`).start();

    try {
      execSync(installCmd, { stdio: 'ignore' });
      installSpinner.succeed(chalk.green('FerroUI CLI updated successfully!'));

      // Verify new version
      try {
        const newVersion = execSync('ferroui --version', { encoding: 'utf-8' }).trim();
        console.log(chalk.dim(`  Installed version: ${newVersion}`));
      } catch {
        // Version check is best-effort
      }

      console.log(chalk.dim('\n  Run `ferroui --help` to see what\'s new.\n'));
    } catch (error: any) {
      installSpinner.fail(chalk.red('Update failed.'));
      console.error(chalk.dim(error.message));
      console.log(chalk.yellow(`\n  Try running manually:\n  ${chalk.bold(installCmd)}\n`));
      process.exit(1);
    }
  });
