import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';

export const createCommand = new Command('create')
  .description('Create a new Alloy project.')
  .argument('<name>', 'Name of the project')
  .option('-t, --template <template>', 'Template to use (default: basic)', 'basic')
  .action(async (name, options) => {
    const spinner = ora(`Creating new Alloy project: ${chalk.bold(name)}...`).start();
    
    try {
      const targetDir = path.resolve(process.cwd(), name);
      
      if (fs.existsSync(targetDir)) {
        spinner.fail(chalk.red(`Directory ${name} already exists.`));
        process.exit(1);
      }

      spinner.text = 'Scaffolding project structure...';
      await fs.ensureDir(targetDir);
      
      // Basic project structure
      const packageJson = {
        name,
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'alloy dev',
          build: 'alloy build',
          deploy: 'alloy deploy',
        },
        dependencies: {
          '@alloy/core': 'latest',
          '@alloy/engine': 'latest',
          'zod': '^3.0.0',
        },
        devDependencies: {
          'typescript': '^5.0.0',
          'alloy': 'latest',
        }
      };

      await fs.writeJson(path.join(targetDir, 'package.json'), packageJson, { spaces: 2 });
      
      await fs.ensureDir(path.join(targetDir, 'src/components'));
      await fs.ensureDir(path.join(targetDir, 'src/tools'));
      
      await fs.writeFile(path.join(targetDir, 'alloy.config.js'), `module.exports = {
  name: '${name}',
  providers: {
    default: 'openai',
  },
};
`);

      await fs.writeFile(path.join(targetDir, 'tsconfig.json'), `{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"]
}
`);

      spinner.succeed(chalk.green(`Successfully created Alloy project: ${chalk.bold(name)}`));
      
      console.log(`\nNext steps:`);
      console.log(chalk.cyan(`  cd ${name}`));
      console.log(chalk.cyan(`  npm install`));
      console.log(chalk.cyan(`  alloy dev`));
      
    } catch (error: any) {
      spinner.fail(chalk.red(`Failed to create project.`));
      console.error(error.message);
      process.exit(1);
    }
  });
