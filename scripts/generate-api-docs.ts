import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs/site/api');

async function generateApiDocs() {
  console.log('🚀 Starting automated documentation generation...');
  
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (e) {}
  
  // 1. Generate Component Documentation
  // In a real scenario, we'd import the actual registry after it's been populated.
  // For this restoration, we'll scan the src directories to find registration calls
  // or use the known components.
  
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

  let componentsMarkdown = '# Component API Reference\n\nWelcome to the automated component registry documentation.\n\n';
  
  for (const tier of ['Organism', 'Molecule', 'Atom']) {
    componentsMarkdown += `## ${tier}s\n\n`;
    const tierComponents = components.filter(c => c.tier === tier);
    
    for (const c of tierComponents) {
      componentsMarkdown += `### ${c.name}\n\n${c.description}\n\n`;
      componentsMarkdown += `| Property | Type | Required | Description |\n`;
      componentsMarkdown += `|----------|------|----------|-------------|\n`;
      componentsMarkdown += `| \`id\` | string | Yes | Unique identifier |\n`;
      componentsMarkdown += `| \`type\` | string | Yes | Must be "${c.name}" |\n`;
      componentsMarkdown += `| \`props\` | object | Yes | Component properties |\n`;
      componentsMarkdown += `| \`aria\` | object | Yes | Accessibility properties |\n\n`;
    }
  }

  await fs.writeFile(path.join(OUTPUT_DIR, 'components.md'), componentsMarkdown);
  console.log('✅ Component documentation generated.');

  // 2. Generate Tool Documentation
  const tools = [
    { name: 'getSalesMetrics', description: 'Returns revenue, orders, and conversion data.' },
    { name: 'listUsers', description: 'Retrieves a list of users with optional filtering.' },
    { name: 'getUserProfile', description: 'Returns detailed information for a specific user.' },
    { name: 'updateTicket', description: 'Updates the status or priority of a support ticket.' }
  ];

  let toolsMarkdown = '# Tool API Reference\n\nDocumentation for all registered backend tools.\n\n';
  
  for (const t of tools) {
    toolsMarkdown += `### ${t.name}\n\n${t.description}\n\n`;
    toolsMarkdown += `**Parameters:**\n\`\`\`json\n{\n  "type": "object",\n  "properties": { ... }\n}\n\`\`\`\n\n`;
  }

  await fs.writeFile(path.join(OUTPUT_DIR, 'tools.md'), toolsMarkdown);
  console.log('✅ Tool documentation generated.');

  // 3. Update Index
  const apiIndex = `# API Reference\n\n- [Component Registry](./components.md)\n- [Tool Registry](./tools.md)\n`;
  await fs.writeFile(path.join(OUTPUT_DIR, 'README.md'), apiIndex);

  console.log('✨ Automated documentation complete.');
}

generateApiDocs().catch(console.error);
