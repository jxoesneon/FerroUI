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
  .description('Generate a new FerroUI component with Zod schema, types, index, stories, and tests.')
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
  .description('Generate a new FerroUI tool with Zod schema, execute function, and mock.')
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

generateCommand
  .command('prompt <name>')
  .description('Generate a new versioned FerroUI system prompt.')
  .option('-v, --version <version>', 'Prompt version (e.g., v1, v2)', 'v1')
  .option('-d, --dir <dir>', 'Output directory', 'prompts')
  .action(async (name, options) => {
    const spinner = ora(`Generating prompt ${chalk.bold(name)}...`).start();
    
    try {
      const promptName = name.toLowerCase().replace(/\s+/g, '-');
      const version = options.version.startsWith('v') ? options.version : `v${options.version}`;
      const outputDir = path.resolve(process.cwd(), options.dir, version);
      const outputFile = path.join(outputDir, `${promptName}.md`);
      
      if (fs.existsSync(outputFile)) {
        spinner.fail(chalk.red(`Prompt file already exists: ${outputFile}`));
        process.exit(1);
      }

      await fs.ensureDir(outputDir);

      const templatePath = path.resolve(__dirname, '../templates/prompt/index.md.hbs');
      let templateContent = '# {{name}} System Prompt\n\n## Role\n\n## Context\n\n## Constraints\n';
      
      if (await fs.pathExists(templatePath)) {
        templateContent = await fs.readFile(templatePath, 'utf-8');
      }

      const template = Handlebars.compile(templateContent);
      const result = template({
        name: name,
        version: version,
        date: new Date().toISOString().slice(0, 10),
      });
      
      await fs.writeFile(outputFile, result);

      spinner.succeed(chalk.green(`Generated ${chalk.bold(promptName)} in ${options.dir}/${version}/${promptName}.md`));
    } catch (error: any) {
      spinner.fail(chalk.red(`Failed to generate prompt.`));
      console.error(error.message);
      process.exit(1);
    }
  });
