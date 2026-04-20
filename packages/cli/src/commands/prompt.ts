import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to find monorepo root
const resolveRoot = () => {
  return path.resolve(__dirname, '../../../../');
};

const ENGINE_PROMPTS_PATH = path.join(resolveRoot(), 'packages/engine/prompts');
const ENGINE_PINNED_VERSION_FILE = path.join(resolveRoot(), 'packages/engine/.prompt-version');

export const promptCommand = new Command('prompt')
  .description('Manage system prompt versions.');

promptCommand.command('list')
  .description('List available prompt versions.')
  .action(async () => {
    const spinner = ora('Reading prompt versions...').start();
    try {
      const entries = await fs.readdir(ENGINE_PROMPTS_PATH, { withFileTypes: true });
      const versions = entries
        .filter(entry => entry.isDirectory() && entry.name.startsWith('v'))
        .map(entry => entry.name.substring(1));

      let pinned = null;
      try {
        pinned = await fs.readFile(ENGINE_PINNED_VERSION_FILE, 'utf-8');
        pinned = pinned.trim();
      } catch {
        // No pinned version
      }

      spinner.succeed(chalk.green('Available prompt versions:'));
      
      if (versions.length === 0) {
        console.log(chalk.yellow('  No versions found.'));
      } else {
        versions.forEach(v => {
          const isPinned = pinned === v;
          console.log(`  ${isPinned ? chalk.cyan('*') : ' '} v${v}${isPinned ? chalk.dim(' (pinned)') : ''}`);
        });
      }
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to list prompt versions.'));
      console.error(chalk.dim(error.message));
      process.exit(1);
    }
  });

promptCommand.command('diff')
  .description('Show differences between two prompt versions.')
  .argument('<v1>', 'First version (e.g., 1.0)')
  .argument('<v2>', 'Second version (e.g., 1.1)')
  .action(async (v1, v2) => {
    const dir1 = path.join(ENGINE_PROMPTS_PATH, `v${v1}`);
    const dir2 = path.join(ENGINE_PROMPTS_PATH, `v${v2}`);

    try {
      await fs.access(dir1);
      await fs.access(dir2);
    } catch {
      console.error(chalk.red(`Error: One or both versions (v${v1}, v${v2}) do not exist.`));
      process.exit(1);
    }

    console.log(chalk.bold(`Diffing v${v1} and v${v2}...\n`));

    try {
      // Use system diff command if available for better output
      const diffOutput = execSync(`diff -u -r ${dir1} ${dir2}`, { encoding: 'utf-8' });
      console.log(diffOutput);
    } catch (error: any) {
      // execSync throws if diff finds differences (exit code 1)
      if (error.stdout) {
        console.log(error.stdout);
      } else if (error.status === 1) {
        // Differences found but no stdout? Unexpected but possible.
        console.log(chalk.yellow('Differences found but could not be displayed.'));
      } else {
        console.error(chalk.red('Failed to run diff. Ensure "diff" utility is installed.'));
        console.error(chalk.dim(error.message));
        process.exit(1);
      }
    }
  });

promptCommand.command('rollback')
  .description('Pin the engine to a specific prompt version.')
  .argument('<version>', 'The version to rollback to (e.g., 1.0)')
  .action(async (version) => {
    const spinner = ora(`Pinning engine to prompt version v${version}...`).start();
    const versionDir = path.join(ENGINE_PROMPTS_PATH, `v${version}`);

    try {
      await fs.access(versionDir);
    } catch {
      spinner.fail(chalk.red(`Version v${version} does not exist in ${ENGINE_PROMPTS_PATH}`));
      process.exit(1);
    }

    try {
      await fs.writeFile(ENGINE_PINNED_VERSION_FILE, version, 'utf-8');
      spinner.succeed(chalk.green(`Engine successfully pinned to prompt version ${chalk.bold(version)}`));
      console.log(chalk.dim(`Pinned version stored in: ${ENGINE_PINNED_VERSION_FILE}`));
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to pin version.'));
      console.error(chalk.dim(error.message));
      process.exit(1);
    }
  });
