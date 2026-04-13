import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs/site');
const API_DIR = path.join(OUTPUT_DIR, 'api');

/**
 * Robust Markdown to HTML converter.
 * Handles code blocks first to prevent nested parsing.
 */
function mdToHtml(md: string): string {
  const codeBlocks: string[] = [];
  
  // 1. Extract and protect code blocks
  let html = md.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, _lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
    return placeholder;
  });

  html = html
    // Headers (only at start of line)
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // Tables
    .replace(/\|(.*)\|/g, (match) => {
      if (match.includes('---')) return ''; 
      const cells = match.split('|').filter(c => c.trim().length > 0);
      const isHeader = match.includes('**') || md.split('\n')[md.split('\n').indexOf(match) + 1]?.includes('---');
      const tag = isHeader ? 'th' : 'td';
      return `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
    })
    // Wrap tables
    .replace(/(<tr>.*<\/tr>)+/gs, (match) => `<table class="api-table">${match}</table>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Lists
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)+/gs, (match) => `<ul class="doc-list">${match}</ul>`)
    // Paragraphs (careful with existing tags)
    .split('\n').map(line => {
      if (line.trim().length === 0) return '';
      if (line.startsWith('<') || line.startsWith('__CODE_')) return line;
      return `<p>${line}</p>`;
    }).join('\n');

  // 2. Restore protected code blocks
  codeBlocks.forEach((block, i) => {
    html = html.replace(`__CODE_BLOCK_${i}__`, block);
  });

  return html;
}

const HTML_TEMPLATE = (title: string, content: string, depth = 0) => {
  const relPath = depth === 0 ? '.' : '..';
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — Alloy UI Docs</title>
    <link rel="stylesheet" href="${relPath}/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
    <style>
        .content-area { max-width: 1000px; margin: 100px auto; padding: 0 2rem; }
        .api-table { width: 100%; border-collapse: collapse; margin: 2rem 0; background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden; }
        .api-table th, .api-table td { padding: 1rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .api-table th { background: rgba(255,255,255,0.05); color: var(--accent-primary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
        code { font-family: 'JetBrains Mono', monospace; background: rgba(56, 189, 248, 0.1); color: var(--accent-primary); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
        pre { background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 12px; overflow-x: auto; margin: 1.5rem 0; border: 1px solid var(--card-border); }
        pre code { background: none; color: #e2e8f0; padding: 0; }
        h2 { margin-top: 4rem; color: var(--accent-secondary); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem; }
        h3 { margin-top: 2.5rem; border-left: 4px solid var(--accent-primary); padding-left: 1rem; }
        .doc-list { margin: 1.5rem 0; padding-left: 1.5rem; }
        .doc-list li { margin-bottom: 0.5rem; color: var(--text-secondary); }
        .back-link { display: inline-block; margin-bottom: 2rem; color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; }
        .back-link:hover { color: var(--text-primary); }
        p { margin: 1.2rem 0; color: var(--text-secondary); }
    </style>
</head>
<body class="dark-theme">
    <div class="background-glow"></div>
    <nav class="glass-nav">
        <div class="nav-content">
            <a href="${relPath}/index.html" class="logo">ALLOY<span>UI</span></a>
            <div class="nav-links">
                <a href="${relPath}/index.html" class="nav-link">Home</a>
                <a href="${relPath}/api/index.html" class="nav-link">API</a>
                <a href="https://github.com/jxoesneon/Alloy" class="nav-link">GitHub</a>
            </div>
        </div>
    </nav>

    <main class="content-area">
        <a href="${relPath}/index.html" class="back-link">&larr; Back to Overview</a>
        <div class="glass-card" style="padding: 4rem; border-radius: 32px;">
            ${content}
        </div>
    </main>

    <footer class="glass-footer">
        <p>&copy; 2026 Alloy Project Team. Built with Liquid Mercury standards.</p>
    </footer>
</body>
</html>
`;
};

async function generateApiDocs() {
  console.log('🚀 Starting automated doc-gen (Unified Portal)...');
  
  await fs.mkdir(API_DIR, { recursive: true });

  // 1. Generate Architecture Page
  console.log('📄 Generating System Architecture page...');
  const archMd = await fs.readFile(path.join(ROOT, 'docs/architecture/System_Architecture_Document.md'), 'utf-8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'architecture.html'), HTML_TEMPLATE('System Architecture', mdToHtml(archMd), 0));

  // 2. Generate CLI Page
  console.log('📄 Generating CLI Usage page...');
  const cliMd = await fs.readFile(path.join(ROOT, 'docs/dev-experience/CLI_Usage_Guide.md'), 'utf-8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'cli.html'), HTML_TEMPLATE('CLI Usage Guide', mdToHtml(cliMd), 0));

  // 3. Generate Component Documentation
  const components = [
    { name: 'Dashboard', tier: 'Organism', description: 'The root container for all Alloy layouts.' },
    { name: 'KPIBoard', tier: 'Organism', description: 'A grid of key performance indicators.' },
    { name: 'DataTable', tier: 'Organism', description: 'A powerful, interactive data table.' },
    { name: 'ChartPanel', tier: 'Organism', description: 'Visualizes data using various chart types.' },
    { name: 'StatBadge', tier: 'Molecule', description: 'Displays a single metric with an optional trend.' },
    { name: 'ActionButton', tier: 'Molecule', description: 'A button that triggers a system action.' },
    { name: 'Text', tier: 'Atom', description: 'Basic text primitive with variant support.' },
    { name: 'Icon', tier: 'Atom', description: 'Renders a design system icon.' },
    { name: 'Badge', tier: 'Atom', description: 'A small visual indicator for status or counts.' }
  ];

  let componentsHtml = '<h1>Component API Reference</h1><p>Welcome to the automated component registry documentation.</p>';
  for (const tier of ['Organism', 'Molecule', 'Atom']) {
    componentsHtml += `<h2>${tier}s</h2>`;
    const tierComponents = components.filter(c => c.tier === tier);
    for (const c of tierComponents) {
      componentsHtml += `<h3>${c.name}</h3><p>${c.description}</p>`;
      componentsHtml += `
        <table class="api-table">
          <thead>
            <tr><th>Property</th><th>Type</th><th>Required</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code>id</code></td><td>string</td><td>Yes</td><td>Unique identifier</td></tr>
            <tr><td><code>type</code></td><td>string</td><td>Yes</td><td>Must be "${c.name}"</td></tr>
            <tr><td><code>props</code></td><td>object</td><td>Yes</td><td>Component properties</td></tr>
            <tr><td><code>aria</code></td><td>object</td><td>Yes</td><td>Accessibility properties</td></tr>
          </tbody>
        </table>
      `;
    }
  }
  await fs.writeFile(path.join(API_DIR, 'components.html'), HTML_TEMPLATE('Components', componentsHtml, 1));

  // 4. Generate Tool Documentation
  const tools = [
    { name: 'getSalesMetrics', description: 'Returns revenue, orders, and conversion data.' },
    { name: 'listUsers', description: 'Retrieves a list of users with optional filtering.' },
    { name: 'getUserProfile', description: 'Returns detailed information for a specific user.' },
    { name: 'updateTicket', description: 'Updates the status or priority of a support ticket.' }
  ];

  let toolsHtml = '<h1>Tool API Reference</h1><p>Documentation for all registered backend tools.</p>';
  for (const t of tools) {
    toolsHtml += `<h3>${t.name}</h3><p>${t.description}</p>`;
    toolsHtml += `<strong>Parameters:</strong><pre><code>{ "type": "object", "properties": { ... } }</code></pre>`;
  }
  await fs.writeFile(path.join(API_DIR, 'tools.html'), HTML_TEMPLATE('Tools', toolsHtml, 1));

  // 5. Update API Index
  const apiIndexHtml = `
    <h1>API Reference</h1>
    <p>Select a registry to explore the Alloy UI ecosystem capabilities.</p>
    <div class="docs-grid" style="margin-top: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <div class="glass-card doc-category" style="padding: 2rem; border-radius: 20px;">
            <h3>Components</h3>
            <p>UI primitives and functional blocks.</p>
            <a href="components.html" class="doc-link">Browse Components &rarr;</a>
        </div>
        <div class="glass-card doc-category" style="padding: 2rem; border-radius: 20px;">
            <h3>Tools</h3>
            <p>Backend integrations and data providers.</p>
            <a href="tools.html" class="doc-link">Explore Tools &rarr;</a>
        </div>
    </div>
  `;
  await fs.writeFile(path.join(API_DIR, 'index.html'), HTML_TEMPLATE('API Index', apiIndexHtml, 1));

  console.log('✨ Automated documentation complete.');
}

generateApiDocs().catch(console.error);
