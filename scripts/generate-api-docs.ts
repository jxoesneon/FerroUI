import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs/site');
const API_DIR = path.join(OUTPUT_DIR, 'api');

/**
 * High-fidelity Markdown to HTML converter.
 * Handles headers, tables, lists, code blocks, and horizontal rules.
 */
function mdToHtml(md: string): string {
  const codeBlocks: string[] = [];
  
  // 1. Extract and protect code blocks (ASCII art & code)
  let html = md.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, _lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    codeBlocks.push(`<pre><code>${escapedCode}</code></pre>`);
    return placeholder;
  });

  // 2. Process Horizontal Rules BEFORE paragraph wrapping
  html = html.replace(/^---$/gm, '<hr class="doc-hr">');

  // 3. Process Tables
  const lines = html.split('\n');
  const processedLines = [];
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      // Improved table separator detection (--- with pipes)
      if (!line.match(/^\|?\s*[:\-|\s]+\s*\|?$/)) {
        const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        const tag = tableRows.length === 0 ? 'th' : 'td';
        tableRows.push(`<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`);
      }
    } else {
      if (inTable) {
        processedLines.push(`<div class="table-wrapper"><table class="api-table">${tableRows.join('')}</table></div>`);
        inTable = false;
      }
      processedLines.push(lines[i]);
    }
  }
  if (inTable) processedLines.push(`<div class="table-wrapper"><table class="api-table">${tableRows.join('')}</table></div>`);
  
  html = processedLines.join('\n');

  html = html
    // Headers
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold & Italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="doc-inline-link">$1</a>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Lists
    .replace(/^\s*- (.*$)/gm, '<li>$1</li>')
    // Paragraphs
    .split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<') || trimmed.startsWith('__CODE_')) return line;
      return `<p>${line}</p>`;
    }).join('\n');

  // Wrap contiguous <li> elements in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul class="doc-list">${match}</ul>`);
  // Wrap blockquotes
  html = html.replace(/(<blockquote>.*<\/blockquote>\n?)+/g, (match) => `<div class="quote-wrapper">${match}</div>`);

  // 4. Restore protected code blocks
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
        .content-area { max-width: 1100px; margin: 100px auto; padding: 0 2rem; }
        .table-wrapper { overflow-x: auto; margin: 2.5rem 0; border-radius: 16px; border: 1px solid var(--card-border); background: rgba(255,255,255,0.02); }
        .api-table { width: 100%; border-collapse: collapse; table-layout: auto; }
        .api-table th, .api-table td { padding: 1.25rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .api-table th { background: rgba(255,255,255,0.05); color: var(--accent-primary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }
        .api-table tr:last-child td { border-bottom: none; }
        code { font-family: 'JetBrains Mono', monospace; background: rgba(56, 189, 248, 0.1); color: var(--accent-primary); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.85em; }
        pre { background: #0f172a; padding: 2rem; border-radius: 16px; overflow-x: auto; margin: 2rem 0; border: 1px solid var(--card-border); box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); }
        pre code { background: none; color: #cbd5e1; padding: 0; font-size: 0.9rem; line-height: 1.5; white-space: pre; }
        h1 { font-size: 3rem; margin-bottom: 2rem; letter-spacing: -0.02em; }
        h2 { margin-top: 5rem; color: var(--text-primary); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.75rem; font-size: 1.75rem; }
        h3 { margin-top: 3rem; color: var(--accent-primary); font-size: 1.25rem; }
        .doc-list { margin: 1.5rem 0; padding-left: 1.5rem; list-style-type: none; }
        .doc-list li { margin-bottom: 0.75rem; color: var(--text-secondary); position: relative; padding-left: 1.5rem; }
        .doc-list li::before { content: "→"; position: absolute; left: 0; color: var(--accent-primary); font-weight: bold; }
        .doc-hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 4rem 0; }
        .quote-wrapper { border-left: 4px solid var(--accent-secondary); background: rgba(129, 140, 248, 0.05); padding: 1rem 2rem; margin: 2rem 0; border-radius: 0 12px 12px 0; }
        blockquote { color: var(--text-secondary); font-style: italic; font-size: 1.1rem; }
        .back-link { display: inline-block; margin-bottom: 3rem; color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
        .back-link:hover { color: var(--accent-primary); }
        .doc-inline-link { color: var(--accent-primary); text-decoration: none; border-bottom: 1px solid rgba(56, 189, 248, 0.2); transition: all 0.2s; }
        .doc-inline-link:hover { border-bottom-color: var(--accent-primary); background: rgba(56, 189, 248, 0.05); }
        p { margin: 1.2rem 0; color: var(--text-secondary); font-size: 1.05rem; line-height: 1.7; }
        strong { color: var(--text-primary); font-weight: 600; }
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
        <div class="glass-card" style="padding: 5rem; border-radius: 40px; border: 1px solid rgba(255,255,255,0.08);">
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
  console.log('🚀 Starting high-fidelity portal generation (Artifact Clean-up)...');
  
  await fs.mkdir(API_DIR, { recursive: true });

  // 1. Generate Architecture Page
  console.log('📄 Parsing System Architecture...');
  const archMd = await fs.readFile(path.join(ROOT, 'docs/architecture/System_Architecture_Document.md'), 'utf-8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'architecture.html'), HTML_TEMPLATE('System Architecture', mdToHtml(archMd), 0));

  // 2. Generate CLI Page
  console.log('📄 Parsing CLI Usage Guide...');
  const cliMd = await fs.readFile(path.join(ROOT, 'docs/dev-experience/CLI_Usage_Guide.md'), 'utf-8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'cli.html'), HTML_TEMPLATE('CLI Usage Guide', mdToHtml(cliMd), 0));

  // 3. API Documentation
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
        <div class="table-wrapper"><table class="api-table">
          <thead>
            <tr><th>Property</th><th>Type</th><th>Required</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code>id</code></td><td>string</td><td>Yes</td><td>Unique identifier</td></tr>
            <tr><td><code>type</code></td><td>string</td><td>Yes</td><td>Must be "${c.name}"</td></tr>
            <tr><td><code>props</code></td><td>object</td><td>Yes</td><td>Component properties</td></tr>
            <tr><td><code>aria</code></td><td>object</td><td>Yes</td><td>Accessibility properties</td></tr>
          </tbody>
        </table></div>
      `;
    }
  }
  await fs.writeFile(path.join(API_DIR, 'components.html'), HTML_TEMPLATE('Components', componentsHtml, 1));

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

  const apiIndexHtml = `
    <h1>API Reference</h1>
    <p>Select a registry to explore the Alloy UI ecosystem capabilities.</p>
    <div class="docs-grid" style="margin-top: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <div class="glass-card doc-category" style="padding: 2rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05);">
            <h3>Components</h3>
            <p>UI primitives and functional blocks.</p>
            <a href="components.html" class="doc-link">Browse Components &rarr;</a>
        </div>
        <div class="glass-card doc-category" style="padding: 2rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05);">
            <h3>Tools</h3>
            <p>Backend integrations and data providers.</p>
            <a href="tools.html" class="doc-link">Explore Tools &rarr;</a>
        </div>
    </div>
  `;
  await fs.writeFile(path.join(API_DIR, 'index.html'), HTML_TEMPLATE('API Index', apiIndexHtml, 1));

  console.log('✨ Unified high-fidelity portal complete.');
}

generateApiDocs().catch(console.error);
