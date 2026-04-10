import { Command } from 'commander';
import chalk from 'chalk';
import execa = require('execa');

/**
 * Doctor Command
 * Performs health checks for the Alloy UI environment.
 */
export const doctorCommand = new Command('doctor')
  .description('Perform a health check on the Alloy UI environment.')
  .action(async () => {
    console.log(chalk.blue('🩺 Alloy UI Doctor - Running health checks...\n'));

    const checks = [
      { name: 'Node.js Version', command: 'node -v' },
      { name: 'NPM Version', command: 'npm -v' },
      { name: 'TypeScript Version', command: 'npx tsc -v' },
      { name: 'Alloy Schema Package', command: 'ls packages/schema/dist/index.js' },
    ];

    let allPassed = true;

    for (const check of checks) {
      try {
        await execa(check.command.split(' ')[0], check.command.split(' ').slice(1));
        console.log(`${chalk.green('✔')} ${check.name}`);
      } catch (error) {
        console.log(`${chalk.red('✖')} ${check.name} failed`);
        allPassed = false;
      }
    }

    if (allPassed) {
      console.log(chalk.green('\n✨ Everything looks good! You are ready to develop with Alloy UI.'));
    } else {
      console.log(chalk.yellow('\n⚠ Some checks failed. Please resolve the issues above.'));
      process.exit(1);
    }
  });
