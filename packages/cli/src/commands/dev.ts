import { Command } from 'commander';
import chalk from 'chalk';
import execa from 'execa';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import fs from 'fs-extra';
import ora from 'ora';

export const devCommand = new Command('dev')
  .description('Start the development environment (engine, registry inspector, and playground).')
  .option('-p, --port <number>', 'Playground port', '3000')
  .option('--engine-port <number>', 'Engine port', '3001')
  .option('--inspector-port <number>', 'Registry inspector port', '3002')
  .option('--no-open', 'Don\'t open browser')
  .action(async (options) => {
    console.log(chalk.bold.cyan('\nAlloy UI Development Environment\n'));
    
    const rootDir = path.resolve(process.cwd(), '../..');
    const appsDir = path.join(rootDir, 'apps');
    const packagesDir = path.join(rootDir, 'packages');

    const spinner = ora('Starting development services...').start();

    try {
      // 1. Layout Playground (apps/web)
      const playgroundPort = options.port;
      const playgroundProcess = execa('/usr/local/bin/npm', ['run', 'dev', '--', '--port', playgroundPort], {
        cwd: path.join(appsDir, 'web'),
        stdio: 'inherit',
        env: { ...process.env, PORT: playgroundPort.toString(), PATH: process.env.PATH }
      });

      // 2. Orchestration Engine
      const enginePort = options.enginePort;
      const engineProcess = execa('/usr/local/bin/node', [path.join(packagesDir, 'engine/src/server.ts'), '--port', enginePort], {
        stdio: 'inherit',
        env: { ...process.env, PORT: enginePort, PATH: process.env.PATH }
      });

      // 3. Registry Inspector
      const inspectorPort = options.inspectorPort;
      const inspectorProcess = execa('/usr/local/bin/node', [path.join(packagesDir, 'registry/src/inspector.ts'), '--port', inspectorPort], {
        stdio: 'inherit',
        env: { ...process.env, PORT: inspectorPort, PATH: process.env.PATH }
      });

      spinner.succeed(chalk.green('Services started!'));
      
      console.log(`\n  ${chalk.bold('✔ Layout Playground:')}    ${chalk.blue(`http://localhost:${playgroundPort}`)}`);
      console.log(`  ${chalk.bold('✔ Orchestration Engine:')}  ${chalk.blue(`http://localhost:${enginePort}`)}`);
      console.log(`  ${chalk.bold('✔ Registry Inspector:')}   ${chalk.blue(`http://localhost:${inspectorPort}`)}`);
      console.log(chalk.dim('\nWatching for changes...\n'));

      // Wait for all processes (they are long-running)
      await Promise.all([playgroundProcess, engineProcess, inspectorProcess]);
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to start services.'));
      console.error(error.message);
      process.exit(1);
    }
  });
