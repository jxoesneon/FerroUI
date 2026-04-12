import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCommand = new Command('generate')
  .alias('g')
  .description('Generate components or tools.');

generateCommand
  .command('component <name>')
  .description('Generate a new Alloy component with Zod schema, types, index, stories, and tests.')
  .option('-t, --tier <tier>', 'Atomic tier (atom, molecule, organism)', 'molecule')
  .option('--no-stories', 'Exclude Storybook stories')
  .option('--no-tests', 'Exclude tests')
  .option('-d, --dir <dir>', 'Output directory', 'src/components')
  .action(async (name, options) => {
    const spinner = ora(`Generating component ${chalk.bold(name)}...`).start();
    
    try {
      const componentName = name.charAt(0).toUpperCase() + name.slice(1);
      const outputDir = path.resolve(process.cwd(), options.dir, componentName);
      
      if (fs.existsSync(outputDir)) {
        spinner.fail(chalk.red(`Component directory already exists: ${outputDir}`));
        process.exit(1);
      }

      const templatesDir = path.resolve(__dirname, '../templates/component');
      
      const filesToGenerate = [
        { template: 'index.tsx.hbs', output: 'index.tsx' },
        { template: 'schema.ts.hbs', output: 'schema.ts' },
        { template: 'types.ts.hbs', output: 'types.ts' },
        { template: 'README.md.hbs', output: 'README.md' },
      ];

      if (options.stories) {
        filesToGenerate.push({ template: 'stories.tsx.hbs', output: `${componentName}.stories.tsx` });
      }

      if (options.tests) {
        filesToGenerate.push({ template: 'test.tsx.hbs', output: `${componentName}.test.tsx` });
      }

      await fs.ensureDir(outputDir);

      for (const file of filesToGenerate) {
        const templateContent = await fs.readFile(path.join(templatesDir, file.template), 'utf-8');
        const template = Handlebars.compile(templateContent);
        const result = template({
          name: componentName,
          tier: options.tier,
          lowerName: componentName.toLowerCase(),
        });
        await fs.writeFile(path.join(outputDir, file.output), result);
      }

      spinner.succeed(chalk.green(`Generated ${chalk.bold(componentName)} in ${options.dir}/${componentName}`));
      
      console.log(chalk.dim('\nFiles created:'));
      filesToGenerate.forEach(f => console.log(chalk.dim(`  - ${f.output}`)));
    } catch (error: any) {
      spinner.fail(chalk.red(`Failed to generate component.`));
      console.error(error.message);
      process.exit(1);
    }
  });

generateCommand
  .command('tool <name>')
  .description('Generate a new Alloy tool with Zod schema, execute function, and mock.')
  .option('-c, --category <category>', 'Tool category (data-fetch, computation, external-api)', 'data-fetch')
  .option('--no-mock', 'Exclude mock implementation')
  .option('-d, --dir <dir>', 'Output directory', 'src/tools')
  .action(async (name, options) => {
    const spinner = ora(`Generating tool ${chalk.bold(name)}...`).start();
    
    try {
      const toolName = name.charAt(0).toLowerCase() + name.slice(1);
      const outputDir = path.resolve(process.cwd(), options.dir, toolName);
      
      if (fs.existsSync(outputDir)) {
        spinner.fail(chalk.red(`Tool directory already exists: ${outputDir}`));
        process.exit(1);
      }

      const templatesDir = path.resolve(__dirname, '../templates/tool');
      
      const filesToGenerate = [
        { template: 'index.ts.hbs', output: 'index.ts' },
        { template: 'schema.ts.hbs', output: 'schema.ts' },
        { template: 'test.ts.hbs', output: 'test.ts' },
        { template: 'README.md.hbs', output: 'README.md' },
      ];

      if (options.mock) {
        filesToGenerate.push({ template: 'mock.ts.hbs', output: 'mock.ts' });
      }

      await fs.ensureDir(outputDir);

      for (const file of filesToGenerate) {
        const templateContent = await fs.readFile(path.join(templatesDir, file.template), 'utf-8');
        const template = Handlebars.compile(templateContent);
        const result = template({
          name: toolName,
          category: options.category,
        });
        await fs.writeFile(path.join(outputDir, file.output), result);
      }

      spinner.succeed(chalk.green(`Generated ${chalk.bold(toolName)} in ${options.dir}/${toolName}`));
      
      console.log(chalk.dim('\nFiles created:'));
      filesToGenerate.forEach(f => console.log(chalk.dim(`  - ${f.output}`)));
    } catch (error: any) {
      spinner.fail(chalk.red(`Failed to generate tool.`));
      console.error(error.message);
      process.exit(1);
    }
  });
