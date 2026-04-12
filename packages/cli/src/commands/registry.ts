import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import path from 'path';

export const registryCommand = new Command('registry')
  .description('Manage and inspect the component registry.');

registryCommand
  .command('inspect')
  .description('Start the registry inspector in the browser.')
  .option('--port <number>', 'Inspector port', '3002')
  .option('--no-open', 'Do not open the browser automatically')
  .action(async (options) => {
    const spinner = ora('Starting registry inspector...').start();

    try {
      const port = parseInt(options.port, 10);

      // Resolve inspector entry from installed package
      let inspectorEntry: string;
      try {
        inspectorEntry = require.resolve('@alloy/registry/dist/inspector.js');
      } catch {
        // Fallback: relative path from monorepo
        inspectorEntry = path.resolve(__dirname, '../../../registry/dist/inspector.js');
      }

      spinner.succeed(
        chalk.green(`Registry Inspector started at ${chalk.blue(`http://localhost:${port}`)}`)
      );

      console.log(chalk.dim('\nPress Ctrl+C to stop.\n'));

      // Open browser if requested
      if (options.open !== false) {
        try {
          const openCmd =
            process.platform === 'win32'
              ? `start http://localhost:${port}`
              : process.platform === 'darwin'
              ? `open http://localhost:${port}`
              : `xdg-open http://localhost:${port}`;
          execSync(openCmd, { stdio: 'ignore' });
        } catch {
          // Browser open is best-effort
        }
      }

      // Start the inspector (long-running)
      const { execaNode } = await import('execa' as any);
      await execaNode(inspectorEntry, ['--port', String(port)], { stdio: 'inherit' });
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to start registry inspector.'));
      console.error(chalk.dim(error.message));
      process.exit(1);
    }
  });
