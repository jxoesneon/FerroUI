import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Tokens Command — Design Token spec §7
 */
export const tokensCommand = new Command('tokens')
  .description('Manage design tokens and build pipeline.');

tokensCommand
  .command('build')
  .description('Transform JSON tokens into build-time artifacts (CSS, TS, JSON).')
  .option('-o, --output <dir>', 'Output directory', 'dist/tokens')
  .action(async (options) => {
    const spinner = ora('Building design tokens...').start();
    
    try {
      const monoRoot = path.resolve(__dirname, '../../../..');
      const buildScript = path.join(monoRoot, 'packages/tokens/src/build.ts');
      
      // Execute the build script using node with experimental strip types (Node 25+)
      await execa('node', ['--experimental-strip-types', buildScript, '--output', options.output], {
        cwd: monoRoot,
        stdio: 'inherit',
      });

      spinner.succeed(chalk.green('Design tokens built successfully!'));
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to build design tokens.'));
      console.error(chalk.dim(error.message));
      process.exit(1);
    }
  });
