import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import prompts from 'prompts';
import { execSync } from 'child_process';

const TEMPLATES: Record<string, { label: string; description: string }> = {
  default: { label: 'Default', description: 'React + TypeScript + Node.js engine' },
  minimal: { label: 'Minimal', description: 'Core packages only, no examples' },
  full: { label: 'Full', description: 'Examples, Storybook, and documentation' },
};

export const createCommand = new Command('create')
  .description('Create a new FerroUI project.')
  .argument('<name>', 'Name of the project')
  .option('-t, --template <template>', 'Template: default | minimal | full')
  .option('-p, --pkg-manager <manager>', 'Package manager: pnpm | npm | yarn')
  .option('--no-git', 'Skip git initialization')
  .option('--no-install', 'Skip dependency installation')
  .action(async (name: string, options: Record<string, any>) => {
    console.log(chalk.bold.cyan('\n✦ FerroUI Project Creator\n'));

    const targetDir = path.resolve(process.cwd(), name);

    if (fs.existsSync(targetDir)) {
      console.error(chalk.red(`✖ Directory "${name}" already exists.`));
      process.exit(1);
    }

    // Interactive prompts when not supplied via flags
    const answers = await prompts(
      [
        {
          type: options.template ? null : 'select',
          name: 'template',
          message: 'Select template:',
          choices: Object.entries(TEMPLATES).map(([value, { label, description }]) => ({
            title: `${label} — ${chalk.dim(description)}`,
            value,
          })),
          initial: 0,
        },
        {
          type: options.pkgManager ? null : 'select',
          name: 'pkgManager',
          message: 'Package manager:',
          choices: [
            { title: 'pnpm', value: 'pnpm' },
            { title: 'npm', value: 'npm' },
            { title: 'yarn', value: 'yarn' },
          ],
          initial: 0,
        },
      ],
      { onCancel: () => { console.log(chalk.yellow('\nCancelled.')); process.exit(0); } }
    );

    const template: string = options.template || answers.template || 'default';
    const pkgManager: string = options.pkgManager || answers.pkgManager || 'pnpm';
    const useGit: boolean = options.git !== false;
    const runInstall: boolean = options.install !== false;

    const spinner = ora(`Scaffolding ${chalk.bold(name)}...`).start();

    try {
      await fs.ensureDir(targetDir);

      // ─── package.json ─────────────────────────────────────────────────────
      const packageJson: Record<string, any> = {
        name,
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'ferroui dev',
          build: 'ferroui build',
          deploy: 'ferroui deploy',
          test: 'vitest run',
          typecheck: 'tsc --noEmit',
        },
        dependencies: {
          '@ferroui/schema': 'workspace:*',
          '@ferroui/registry': 'workspace:*',
          '@ferroui/tools': 'workspace:*',
          'react': '^18.3.0',
          'react-dom': '^18.3.0',
          'zod': '^4.3.6',
        },
        devDependencies: {
          '@types/react': '^18.3.0',
          '@types/react-dom': '^18.3.0',
          'typescript': '^6.0.0',
          'vite': '^5.1.4',
          'vitest': '^4.1.4',
          'ferroui': 'latest',
        },
      };

      if (template === 'full') {
        packageJson.devDependencies['@storybook/react'] = '^8.0.0';
        packageJson.devDependencies['@storybook/react-vite'] = '^8.0.0';
      }

      await fs.writeJson(path.join(targetDir, 'package.json'), packageJson, { spaces: 2 });

      // ─── tsconfig.json ─────────────────────────────────────────────────────
      await fs.writeJson(
        path.join(targetDir, 'tsconfig.json'),
        {
          compilerOptions: {
            target: 'ESNext',
            module: 'ESNext',
            moduleResolution: 'Bundler',
            strict: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            jsx: 'react-jsx',
            outDir: 'dist',
          },
          include: ['src/**/*'],
        },
        { spaces: 2 }
      );

      // ─── ferroui.config.ts ───────────────────────────────────────────────────
      await fs.writeFile(
        path.join(targetDir, 'ferroui.config.ts'),
        `import type { FerroUIConfig } from '@ferroui/schema';

const config: FerroUIConfig = {
  framework: {
    schemaVersion: '1.0',
    defaultProvider: 'openai',
  },
  dev: {
    port: 3000,
    enginePort: 3001,
    inspectorPort: 3002,
    hotReload: true,
  },
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o',
    },
    ollama: {
      baseUrl: 'http://localhost:11434',
      model: 'llama3',
    },
  },
  registry: {
    paths: ['./src/components'],
    exclude: ['**/*.test.tsx'],
  },
  tools: {
    paths: ['./src/tools'],
    timeout: 5000,
  },
  validation: {
    strict: true,
    maxRepairAttempts: 3,
  },
};

export default config;
`
      );

      // ─── .env.local ────────────────────────────────────────────────────────
      await fs.writeFile(
        path.join(targetDir, '.env.local'),
        `# FerroUI Environment Variables
# Copy to .env and fill in your values
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
FERROUI_API_KEY=
`
      );

      // ─── .gitignore ────────────────────────────────────────────────────────
      await fs.writeFile(
        path.join(targetDir, '.gitignore'),
        `node_modules/
dist/
.env
.env.local
*.tsbuildinfo
`
      );

      // ─── Directory structure ───────────────────────────────────────────────
      await fs.ensureDir(path.join(targetDir, 'src/components'));
      await fs.ensureDir(path.join(targetDir, 'src/tools'));

      if (template !== 'minimal') {
        // Example component
        await fs.ensureDir(path.join(targetDir, 'src/components/MetricCard'));
        await fs.writeFile(
          path.join(targetDir, 'src/components/MetricCard/index.tsx'),
          `import React from 'react';
import { z } from 'zod';

export const MetricCardSchema = z.object({
  title: z.string().describe('Card title'),
  value: z.string().describe('Primary metric value'),
  trend: z.enum(['up', 'down', 'neutral']).optional(),
});

export type MetricCardProps = z.infer<typeof MetricCardSchema>;

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend }) => {
  const trendColor = trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : '#6b7280';
  return (
    <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{title}</p>
      <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 700, color: trendColor }}>{value}</p>
    </div>
  );
};
`
        );

        // Example tool
        await fs.ensureDir(path.join(targetDir, 'src/tools/getMetrics'));
        await fs.writeFile(
          path.join(targetDir, 'src/tools/getMetrics/index.ts'),
          `import { registerTool } from '@ferroui/tools';
import { z } from 'zod';

registerTool({
  name: 'getMetrics',
  description: 'Returns key business metrics for the dashboard.',
  parameters: z.object({
    period: z.enum(['day', 'week', 'month']).default('week').describe('Time period for metrics'),
  }),
  returns: z.object({
    revenue: z.string(),
    users: z.string(),
    conversions: z.string(),
  }),
  ttl: 300,
  execute: async ({ period }) => {
    // Replace with your real data source
    return {
      revenue: period === 'day' ? '$12,400' : period === 'week' ? '$84,200' : '$340,000',
      users: period === 'day' ? '1,240' : period === 'week' ? '8,750' : '34,200',
      conversions: period === 'day' ? '3.2%' : period === 'week' ? '4.1%' : '3.8%',
    };
  },
});
`
        );
      }

      // ─── README.md ─────────────────────────────────────────────────────────
      await fs.writeFile(
        path.join(targetDir, 'README.md'),
        `# ${name}

> Built with [FerroUI](https://ferroui.dev) — AI-powered, server-driven UI.

## Quick Start

\`\`\`bash
# 1. Install dependencies
${pkgManager} install

# 2. Add your LLM API key
cp .env.local .env
# Edit .env and set OPENAI_API_KEY (or ANTHROPIC_API_KEY)

# 3. Start development
ferroui dev

# 4. Open the playground
open http://localhost:3000
\`\`\`

## Project Structure

\`\`\`
src/
  components/       # FerroUI components (register with @ferroui/registry)
  tools/            # Data tools (register with @ferroui/tools)
ferroui.config.ts     # Framework configuration
\`\`\`

## Adding Components

\`\`\`bash
ferroui generate component MyComponent
\`\`\`

## Adding Tools

\`\`\`bash
ferroui generate tool getMyData
\`\`\`

## Deploying

\`\`\`bash
ferroui build
ferroui deploy
\`\`\`
`
      );

      spinner.succeed(chalk.green(`Project ${chalk.bold(name)} created!`));

      // ─── Git init ──────────────────────────────────────────────────────────
      if (useGit) {
        const gitSpinner = ora('Initializing git repository...').start();
        try {
          execSync('git init', { cwd: targetDir, stdio: 'ignore' });
          execSync('git add -A', { cwd: targetDir, stdio: 'ignore' });
          execSync('git commit -m "chore: initial commit from ferroui create"', { cwd: targetDir, stdio: 'ignore' });
          gitSpinner.succeed(chalk.green('Initialized git repository'));
        } catch {
          gitSpinner.warn(chalk.yellow('Could not initialize git (git not found or no config)'));
        }
      }

      // ─── Dependency install ────────────────────────────────────────────────
      if (runInstall) {
        const installSpinner = ora(`Installing dependencies with ${pkgManager}...`).start();
        try {
          execSync(`${pkgManager} install`, { cwd: targetDir, stdio: 'ignore' });
          installSpinner.succeed(chalk.green('Installed dependencies'));
        } catch {
          installSpinner.warn(chalk.yellow(`Could not run "${pkgManager} install" — run it manually`));
        }
      }

      // ─── Next steps ────────────────────────────────────────────────────────
      console.log(`
${chalk.bold('Next steps:')}

  ${chalk.cyan(`cd ${name}`)}
  ${chalk.dim('# Add your API key:')}
  ${chalk.cyan('cp .env.local .env && $EDITOR .env')}
  ${chalk.cyan('ferroui dev')}

  ${chalk.dim(`Open ${chalk.blue('http://localhost:3000')} and type your first prompt.`)}
`);
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to create project.'));
      console.error(error.message);
      process.exit(1);
    }
  });
