import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { globby } from 'globby';
import { validateLayout } from '@ferroui/schema';
import { registry } from '@ferroui/registry';

interface MigrationOptions {
  dryRun: boolean;
  from?: string;
  to?: string;
}

interface MigrationResult {
  file: string;
  success: boolean;
  changes: string[];
  error?: string;
}

/**
 * Migration CLI Command
 *
 * Usage:
 *   ferroui migrate component --from DataCard@1 --to DataCard@2
 *   ferroui migrate layout ./layouts/*.json --dry-run
 */
export const migrateCommand = new Command('migrate')
  .description('Migrate FerroUI components and layouts between versions.')
  .option('-d, --dry-run', 'Show changes without applying', false)
  .option('--from <version>', 'Source component version')
  .option('--to <version>', 'Target component version')
  .argument('<type>', 'Type of migration: component or layout')
  .argument('[path]', 'Path to layout files (for layout migrations)')
  .action(async (type, migrationPath, options: MigrationOptions) => {
    if (type === 'component') {
      await migrateComponent(options);
    } else if (type === 'layout') {
      await migrateLayouts(migrationPath || './', options);
    } else {
      console.error(chalk.red(`Unknown migration type: ${type}`));
      console.log(chalk.dim('Supported types: component, layout'));
      process.exit(1);
    }
  });

async function migrateComponent(options: MigrationOptions) {
  if (!options.from || !options.to) {
    console.error(chalk.red('Component migration requires --from and --to versions'));
    console.log(chalk.dim('Example: ferroui migrate component --from DataCard@1 --to DataCard@2'));
    process.exit(1);
  }

  const source = registry.getComponentEntry(options.from);
  const target = registry.getComponentEntry(options.to);

  if (!source) {
    console.error(chalk.red(`Source component not found: ${options.from}`));
    process.exit(1);
  }
  if (!target) {
    console.error(chalk.red(`Target component not found: ${options.to}`));
    process.exit(1);
  }

  console.log(chalk.bold.blue(`\nMigrating ${options.from} → ${options.to}\n`));

  const sourceProps = Object.keys(source.schema.shape || {});
  const targetProps = Object.keys(target.schema.shape || {});

  const added = targetProps.filter((p) => !sourceProps.includes(p));
  const removed = sourceProps.filter((p) => !targetProps.includes(p));

  if (added.length > 0) {
    console.log(chalk.green(`  + New properties: ${added.join(', ')}`));
  }
  if (removed.length > 0) {
    console.log(chalk.red(`  - Removed properties: ${removed.join(', ')}`));
  }
  if (added.length === 0 && removed.length === 0) {
    console.log(chalk.dim('  No schema changes detected'));
  }

  console.log(chalk.yellow(`\n${options.dryRun ? 'Would update' : 'Updating'} all layouts...\n`));

  const layoutFiles = await globby(['**/*.ferroui.json', '**/*-layout.json']);
  const results: MigrationResult[] = [];

  for (const file of layoutFiles) {
    const result = await migrateLayoutFile(file, options.from, options.to, options.dryRun);
    results.push(result);
    printResult(result);
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(chalk.bold(`\n${successCount}/${results.length} files migrated successfully\n`));

  if (!options.dryRun && successCount > 0) {
    console.log(chalk.dim('Remember to test your migrated layouts thoroughly!'));
  }
}

async function migrateLayouts(dir: string, options: MigrationOptions) {
  const pattern = path.join(dir, '**/*.json');
  const files = await globby([pattern]);

  console.log(chalk.bold.blue(`\nMigrating ${files.length} layout(s)\n`));

  const results: MigrationResult[] = [];
  for (const file of files) {
    const result = await autoMigrateLayoutFile(file, options.dryRun);
    results.push(result);
    printResult(result);
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(chalk.bold(`\n${successCount}/${results.length} files migrated successfully\n`));
}

async function migrateLayoutFile(filePath: string, from: string, to: string, dryRun: boolean): Promise<MigrationResult> {
  const result: MigrationResult = { file: filePath, success: false, changes: [] };
  try {
    const content = await fs.readJson(filePath);
    const hasComponent = JSON.stringify(content).includes(`"type":"${from.split('@')[0]}"`);

    if (!hasComponent) {
      result.changes.push('No matching components found');
      result.success = true;
      return result;
    }

    const migrated = migrateComponentInLayout(content, from, to);
    const validation = validateLayout(migrated);

    if (!validation.valid) {
      result.error = `Validation failed: ${validation.errors?.map((e: any) => e.message).join(', ')}`;
      return result;
    }

    result.changes.push(`Migrated ${from} → ${to}`);
    result.success = true;

    if (!dryRun) {
      await fs.writeJson(filePath, migrated, { spaces: 2 });
    }
  } catch (err: any) {
    result.error = err instanceof Error ? err.message : String(err);
  }
  return result;
}

async function autoMigrateLayoutFile(filePath: string, dryRun: boolean): Promise<MigrationResult> {
  const result: MigrationResult = { file: filePath, success: false, changes: [] };
  try {
    const content = await fs.readJson(filePath);
    const deprecatedComponents = findDeprecatedComponents(content);

    if (deprecatedComponents.length === 0) {
      result.changes.push('No deprecated components found');
      result.success = true;
      return result;
    }

    let migrated = content;
    for (const { name, replacement } of deprecatedComponents) {
      if (replacement) {
        migrated = migrateComponentInLayout(migrated, name, replacement);
        result.changes.push(`${name} → ${replacement}`);
      } else {
        result.changes.push(`${name} (no replacement available)`);
      }
    }

    const validation = validateLayout(migrated);
    if (!validation.valid) {
      result.error = `Validation failed: ${validation.errors?.map((e: any) => e.message).join(', ')}`;
      return result;
    }

    result.success = true;
    if (!dryRun) {
      await fs.writeJson(filePath, migrated, { spaces: 2 });
    }
  } catch (err: any) {
    result.error = err instanceof Error ? err.message : String(err);
  }
  return result;
}

function findDeprecatedComponents(layout: any): { name: string; replacement?: string }[] {
  const deprecated: { name: string; replacement?: string }[] = [];
  const seen = new Set<string>();

  function traverse(component: any) {
    if (!component.type) return;

    const entry = registry.getComponentEntry(component.type);
    if (entry?.deprecated && !seen.has(component.type)) {
      seen.add(component.type);
      deprecated.push({
        name: component.type,
        replacement: entry.replacement,
      });
    }

    component.children?.forEach((child: any) => traverse(child));
  }

  traverse(layout.layout);
  return deprecated;
}

function migrateComponentInLayout(layout: any, from: string, to: string) {
  const fromName = from.split('@')[0];
  const toName = to.split('@')[0];
  const jsonStr = JSON.stringify(layout);
  const migrated = jsonStr.replace(
    new RegExp(`"type":\\s*"${fromName}"`, 'g'),
    `"type": "${toName}"`
  );
  return JSON.parse(migrated);
}

function printResult(result: MigrationResult) {
  const icon = result.success ? chalk.green('✓') : chalk.red('✗');
  const file = chalk.dim(result.file);
  console.log(`  ${icon} ${file}`);
  if (result.changes.length > 0) {
    result.changes.forEach((change) => {
      console.log(chalk.dim(`    ${change}`));
    });
  }
  if (result.error) {
    console.log(chalk.red(`    Error: ${result.error}`));
  }
}
