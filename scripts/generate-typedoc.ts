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
  console.log('> Generating TypeDoc for all packages...');
  
  for (const pkg of packages) {
    const pkgPath = path.join(ROOT, 'packages', pkg);
    if (!fs.existsSync(pkgPath)) {
      console.warn(`! Package ${pkg} not found at ${pkgPath}, skipping.`);
      continue;
    }

    const outDir = path.join(ROOT, 'docs', 'api', 'packages', '.typedoc', pkg);
    console.log(`  - @ferroui/${pkg} -> ${outDir}`);

    try {
      // Try common entry points
      const entries = [
        path.join(pkgPath, 'src', 'index.ts'),
        path.join(pkgPath, 'src', 'extension.ts'),
        path.join(pkgPath, 'src', 'main.ts'),
      ];
      
      const entry = entries.find(e => fs.existsSync(e));
      
      if (!entry) {
        console.warn(`    ! No valid entry point found for ${pkg}, skipping.`);
        continue;
      }

      const tsconfig = path.join(pkgPath, 'tsconfig.json');
      const tsconfigArg = fs.existsSync(tsconfig) ? `--tsconfig ${tsconfig.split(path.sep).join('/')}` : '';

      const posixEntry = entry.split(path.sep).join('/');
      const posixOutDir = outDir.split(path.sep).join('/');

      execSync(`pnpm exec typedoc --out ${posixOutDir} --plugin typedoc-plugin-markdown ${posixEntry} ${tsconfigArg} --hidePageTitle --hideBreadcrumbs --entryPointStrategy resolve --cleanOutputDir true`, {
        stdio: 'inherit',
        cwd: ROOT
      });
    } catch (err) {
      console.error(`    x Failed to generate TypeDoc for ${pkg}:`, err);
    }
  }
  console.log('OK TypeDoc generation complete.');
}

main().catch(console.error);
