import { Command } from 'commander';
import chalk from 'chalk';
import { devCommand } from './commands/dev';
import { generateCommand } from './commands/generate';
import { evalCommand } from './commands/eval';
import { doctorCommand } from './commands/doctor';
import { createCommand } from './commands/create';
import { buildCommand } from './commands/build';
import { deployCommand } from './commands/deploy';
import { registryCommand } from './commands/registry';
import { updateCommand } from './commands/update';
import { logsCommand } from './commands/logs';
import { tokensCommand } from './commands/tokens';

const program = new Command();

program
  .name('ferroui')
  .description('FerroUI CLI — The primary interface for FerroUI development.')
  .version('1.0.0');

// Register commands
program.addCommand(createCommand);
program.addCommand(devCommand);
program.addCommand(generateCommand);
program.addCommand(buildCommand);
program.addCommand(deployCommand);
program.addCommand(registryCommand);
program.addCommand(evalCommand);
program.addCommand(doctorCommand);
program.addCommand(updateCommand);
program.addCommand(logsCommand);
program.addCommand(tokensCommand);

program.on('command:*', () => {
  console.error(chalk.red('Invalid command: %s\nSee --help for a list of available commands.'), program.args.join(' '));
  process.exit(1);
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
