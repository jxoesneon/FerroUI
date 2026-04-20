import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const packages = [
  'engine', 'schema', 'registry', 'tools', 'i18n', 'telemetry', 
  'tokens', 'renderer', 'cli', 'shared', 'mcp-server', 'vscode-extension'
];

async function main() {
  console.log('▶ Generating TypeDoc for all packages...');
  
  for (const pkg of packages) {
    const pkgPath = path.join(ROOT, 'packages', pkg);
    if (!fs.existsSync(pkgPath)) {
      console.warn(`⚠️ Package ${pkg} not found at ${pkgPath}, skipping.`);
      continue;
    }

    const outDir = path.join(ROOT, 'docs', 'api', 'packages', '.typedoc', pkg);
    console.log(`  - Generating for @ferroui/${pkg} -> ${outDir}`);

    try {
      // We use src/index.ts as entry point. Some packages might not have it.
      const entry = path.join(pkgPath, 'src', 'index.ts');
      if (!fs.existsSync(entry)) {
        console.warn(`    ⚠️ Entry point ${entry} not found, skipping.`);
        continue;
      }

      const posixEntry = entry.split(path.sep).join('/');
      const posixOutDir = outDir.split(path.sep).join('/');

      execSync(`pnpm exec typedoc --out ${posixOutDir} --plugin typedoc-plugin-markdown ${posixEntry} --hidePageTitle --hideBreadcrumbs --entryPointStrategy resolve --cleanOutputDir true`, {
        stdio: 'inherit',
        cwd: ROOT
      });
    } catch (err) {
      console.error(`    ❌ Failed to generate TypeDoc for ${pkg}:`, err);
    }
  }
  console.log('✓ TypeDoc generation complete.');
}

main().catch(console.error);
