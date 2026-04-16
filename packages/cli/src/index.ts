import { Command } from 'commander';
import chalk from 'chalk';
import { devCommand } from './commands/dev.js';
import { generateCommand } from './commands/generate.js';
import { evalCommand } from './commands/eval.js';
import { doctorCommand } from './commands/doctor.js';
import { createCommand } from './commands/create.js';
import { buildCommand } from './commands/build.js';
import { deployCommand } from './commands/deploy.js';
import { registryCommand } from './commands/registry.js';
import { updateCommand } from './commands/update.js';
import { logsCommand } from './commands/logs.js';
import { tokensCommand } from './commands/tokens.js';
import { migrateCommand } from './commands/migrate.js';

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
program.addCommand(migrateCommand);

program.on('command:*', () => {
  console.error(chalk.red('Invalid command: %s\nSee --help for a list of available commands.'), program.args.join(' '));
  process.exit(1);
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
