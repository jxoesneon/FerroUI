import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');

const EXCLUDED_DIRS = ['.vitepress', 'node_modules'];
const EXCLUDED_PATHS = ['api/packages/typedoc_api', 'api/packages/.typedoc'];
const EXCLUDED_FILES = ['404.md', 'index.md'];

function getAllMdFiles(dir: string, allFiles: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(DOCS_DIR, fullPath);

    if (EXCLUDED_DIRS.some(d => relativePath === d || relativePath.startsWith(d + '/'))) continue;
    if (EXCLUDED_PATHS.some(p => relativePath === p || relativePath.startsWith(p + '/'))) continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      getAllMdFiles(fullPath, allFiles);
    } else if (file.endsWith('.md')) {
      if (EXCLUDED_FILES.includes(file)) continue;
      // Convert to VitePress link format (no .md, leading slash)
      let link = '/' + relativePath.replace(/\.md$/, '');
      allFiles.push(link);
    }
  }
  return allFiles;
}

async function main() {
  console.log('> Auditing documentation navigation coverage...');

  const mdFiles = getAllMdFiles(DOCS_DIR);
  
  // Read nav and sidebar
  const navTs = fs.readFileSync(path.join(DOCS_DIR, '.vitepress', 'nav.ts'), 'utf-8');
  const sidebarTs = fs.readFileSync(path.join(DOCS_DIR, '.vitepress', 'sidebar.ts'), 'utf-8');

  const orphaned = [];

  for (const file of mdFiles) {
    // Basic string search for the link in nav or sidebar
    const foundInNav = navTs.includes(`link: '${file}'`) || navTs.includes(`link: "${file}"`);
    const foundInSidebar = sidebarTs.includes(`link: '${file}'`) || sidebarTs.includes(`link: "${file}"`);

    if (!foundInNav && !foundInSidebar) {
      orphaned.push(file);
    }
  }

  if (orphaned.length > 0) {
    console.error(`\n❌ Found ${orphaned.length} orphaned markdown files (not in nav.ts or sidebar.ts):`);
    orphaned.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  }

  console.log(`\n✅ All ${mdFiles.length} authored markdown files are correctly wired into navigation.`);
}

main().catch(console.error);
