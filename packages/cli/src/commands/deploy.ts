import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';

const DEPLOY_TARGETS = ['web', 'desktop', 'edge'] as const;
type DeployTarget = typeof DEPLOY_TARGETS[number];

export const deployCommand = new Command('deploy')
  .description('Deploy the FerroUI project to a specified target.')
  .argument('[target]', `Deployment target: ${DEPLOY_TARGETS.join(' | ')}`, 'web')
  .option('-e, --env <environment>', 'Deployment environment (staging, production)', 'production')
  .option('--dry-run', 'Validate config and build without actually deploying', false)
  .option('--wrangler-config <path>', 'Custom wrangler.toml path for edge deployments')
  .action(async (target: DeployTarget, options) => {
    if (!DEPLOY_TARGETS.includes(target)) {
      console.error(chalk.red(`Unknown target "${target}". Valid: ${DEPLOY_TARGETS.join(', ')}`));
      process.exit(1);
    }

    const spinner = ora(
      `Deploying ${chalk.bold(target)} (${options.env})${options.dryRun ? chalk.dim(' [dry-run]') : ''}...`
    ).start();

    try {
      const cwd = process.cwd();
      const distDir = path.resolve(cwd, 'dist');

      if (!await fs.pathExists(distDir)) {
        spinner.fail(chalk.red(`Build directory not found at ${distDir}. Run 'ferroui build' first.`));
        process.exit(1);
      }

      if (target === 'web') {
        await deployWeb(spinner, distDir, options.env, options.dryRun, cwd);
      } else if (target === 'edge') {
        await deployEdge(spinner, options.env, options.dryRun, options.wranglerConfig as string | undefined, cwd);
      } else if (target === 'desktop') {
        await deployDesktop(spinner, options.dryRun, cwd);
      }
    } catch (error: unknown) {
      spinner.fail(chalk.red('Deployment failed.'));
      console.error(chalk.dim(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

async function deployWeb(spinner: ReturnType<typeof ora>, distDir: string, env: string, dryRun: boolean, cwd: string): Promise<void> {
  const hasVercel = await commandExists('vercel');
  const hasNetlify = await commandExists('netlify');

  if (dryRun) {
    spinner.succeed(chalk.green('[dry-run] Web deployment validated.'));
    console.log(chalk.dim(`  Build dir: ${distDir}`));
    console.log(chalk.dim(`  Provider:  ${hasVercel ? 'vercel' : hasNetlify ? 'netlify' : 'none detected'}`));
    return;
  }

  if (hasVercel) {
    spinner.text = 'Deploying with Vercel...';
    const args = ['--prod', '--yes'];
    if (env !== 'production') args.push('--env', env);
    const result = await execa('vercel', args, { cwd, all: true });
    spinner.succeed(chalk.green('Deployed to Vercel!'));
    const urlMatch = (result.all ?? '').match(/https?:\/\/[^\s]+/);
    if (urlMatch) console.log(chalk.dim(`  URL: ${chalk.bold(urlMatch[0])}`));
  } else if (hasNetlify) {
    spinner.text = 'Deploying with Netlify...';
    const result = await execa('netlify', ['deploy', '--dir', distDir, '--prod'], { cwd, all: true });
    spinner.succeed(chalk.green('Deployed to Netlify!'));
    const urlMatch = (result.all ?? '').match(/https?:\/\/[^\s]+/);
    if (urlMatch) console.log(chalk.dim(`  URL: ${chalk.bold(urlMatch[0])}`));
  } else {
    spinner.fail(chalk.red('No deployment provider found.'));
    console.log(chalk.dim('\n  Install one of:\n    pnpm add -g vercel\n    pnpm add -g netlify-cli'));
    process.exit(1);
  }
}

async function deployEdge(spinner: ReturnType<typeof ora>, env: string, dryRun: boolean, wranglerConfig: string | undefined, cwd: string): Promise<void> {
  const appsEdge = path.resolve(cwd, 'apps/edge');
  const deployDir = await fs.pathExists(appsEdge) ? appsEdge : cwd;

  const args = ['deploy'];
  if (wranglerConfig) args.push('--config', wranglerConfig);
  if (env !== 'production') args.push('--env', env);
  if (dryRun) args.push('--dry-run');

  spinner.text = `Running wrangler deploy${dryRun ? ' --dry-run' : ''}...`;
  const result = await execa('wrangler', args, { cwd: deployDir, all: true });
  spinner.succeed(chalk.green(dryRun ? '[dry-run] Edge deployment validated.' : 'Deployed to Cloudflare Workers!'));
  if (result.all) console.log(chalk.dim(result.all));
}

async function deployDesktop(spinner: ReturnType<typeof ora>, dryRun: boolean, cwd: string): Promise<void> {
  const appsDesktop = path.resolve(cwd, 'apps/desktop');
  const deployDir = await fs.pathExists(appsDesktop) ? appsDesktop : cwd;

  if (dryRun) {
    spinner.succeed(chalk.green('[dry-run] Desktop build config validated.'));
    console.log(chalk.dim(`  Build dir: ${deployDir}`));
    return;
  }

  spinner.text = 'Building Tauri desktop app...';
  await execa('pnpm', ['tauri', 'build'], { cwd: deployDir, stdio: 'inherit' });
  spinner.succeed(chalk.green('Desktop app built! Installers in apps/desktop/src-tauri/target/release/bundle/'));
}

async function commandExists(cmd: string): Promise<boolean> {
  try {
    await execa(cmd, ['--version'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}
