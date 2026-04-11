import { Command } from 'commander';
import chalk from 'chalk';
import { devCommand } from './commands/dev';
import { generateCommand } from './commands/generate';
import { evalCommand } from './commands/eval';
import { doctorCommand } from './commands/doctor';
import { createCommand } from './commands/create';
import { buildCommand } from './commands/build';
import { deployCommand } from './commands/deploy';

const program = new Command();

program
  .name('alloy')
  .description('Alloy UI CLI — The primary interface for Alloy UI development.')
  .version('1.0.0');

// Register commands
program.addCommand(devCommand);
program.addCommand(generateCommand);
program.addCommand(evalCommand);
program.addCommand(doctorCommand);
program.addCommand(createCommand);
program.addCommand(buildCommand);
program.addCommand(deployCommand);

program.on('command:*', () => {
  console.error(chalk.red('Invalid command: %s\nSee --help for a list of available commands.'), program.args.join(' '));
  process.exit(1);
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
