/**
 * FerroUI Documentation Generator
 * --------------------------------
 * Builds the API reference pages for the VitePress site by importing the
 * actual @ferroui/registry and @ferroui/tools packages at build time and
 * walking the Zod schemas of the registered components and tools.
 *
 * Outputs Markdown files under docs/api/ (tracked-in-source so editors can
 * preview the site). The workflow regenerates these on every push to main
 * so the published docs cannot drift from the running code.
 *
 * Run with:  pnpm docs:generate
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { z } from 'zod';
import { ComponentTier } from '@ferroui/schema';
import type { RegistryEntry } from '@ferroui/registry';
import { registry as componentRegistry } from '@ferroui/registry';
import { ToolRegistry } from '@ferroui/tools';
import type { ToolDefinition } from '@ferroui/tools';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const API_DIR = path.join(DOCS_DIR, 'api');

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function esc(str: string): string {
  return str.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function codeInline(value: string): string {
  return '`' + value + '`';
}

type JsonSchemaNode = {
  type?: string | string[];
  description?: string;
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  properties?: Record<string, JsonSchemaNode>;
  required?: string[];
  items?: JsonSchemaNode | JsonSchemaNode[];
  anyOf?: JsonSchemaNode[];
  oneOf?: JsonSchemaNode[];
  allOf?: JsonSchemaNode[];
  $ref?: string;
  format?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
};

// Zod v4 ships with a native JSON Schema exporter — no external converter needed.
function toSchema(input: unknown): JsonSchemaNode {
  return z.toJSONSchema(input as z.ZodType) as unknown as JsonSchemaNode;
}

/**
 * Render a JSON-Schema fragment into a human-readable type label.
 */
function describeType(node: JsonSchemaNode | undefined): string {
  if (!node) return 'unknown';
  if (node.$ref) return esc(node.$ref.replace(/^#\/definitions\//, ''));
  if (node.const !== undefined) return codeInline(JSON.stringify(node.const));
  if (Array.isArray(node.enum)) {
    return node.enum.map((v) => codeInline(JSON.stringify(v))).join(' \\| ');
  }
  if (Array.isArray(node.anyOf)) return node.anyOf.map(describeType).join(' \\| ');
  if (Array.isArray(node.oneOf)) return node.oneOf.map(describeType).join(' \\| ');
  if (Array.isArray(node.allOf)) return node.allOf.map(describeType).join(' & ');
  const t = Array.isArray(node.type) ? node.type.join(' \\| ') : node.type;
  if (t === 'array') {
    const items = Array.isArray(node.items) ? node.items[0] : node.items;
    return `${describeType(items)}[]`;
  }
  if (t === 'object' && node.properties) {
    return 'object';
  }
  return t ?? 'unknown';
}

function isRequired(parent: JsonSchemaNode, key: string): boolean {
  return Array.isArray(parent.required) && parent.required.includes(key);
}

function renderPropsTable(schema: unknown): string {
  const node = schema as JsonSchemaNode;
  if (!node.properties) {
    return `> This component has no props beyond the base \`FerroUIComponent\` fields.\n\n`;
  }

  const rows: string[] = [];
  rows.push('| Property | Type | Required | Default | Description |');
  rows.push('|----------|------|----------|---------|-------------|');

  for (const [key, prop] of Object.entries(node.properties)) {
    const req = isRequired(node, key) ? 'Yes' : 'No';
    const def =
      prop.default !== undefined ? codeInline(JSON.stringify(prop.default)) : '—';
    rows.push(
      `| ${codeInline(key)} | ${describeType(prop)} | ${req} | ${def} | ${esc(
        prop.description ?? '',
      )} |`,
    );
  }
  return rows.join('\n') + '\n\n';
}

function renderJsonExample(entry: RegistryEntry): string {
  const definition = toSchema(entry.schema);

  const stub: Record<string, unknown> = {};
  if (definition.properties) {
    for (const [key, prop] of Object.entries(definition.properties) as Array<[string, JsonSchemaNode]>) {
      if (prop.default !== undefined) {
        stub[key] = prop.default;
        continue;
      }
      if (Array.isArray(prop.enum) && prop.enum.length > 0) {
        stub[key] = prop.enum[0];
        continue;
      }
      const t = Array.isArray(prop.type) ? prop.type[0] : prop.type;
      switch (t) {
        case 'string':
          stub[key] = prop.format === 'uuid' ? '00000000-0000-0000-0000-000000000000' : '';
          break;
        case 'number':
        case 'integer':
          stub[key] = 0;
          break;
        case 'boolean':
          stub[key] = false;
          break;
        case 'array':
          stub[key] = [];
          break;
        case 'object':
          stub[key] = {};
          break;
        default:
          stub[key] = null;
      }
    }
  }

  const example = {
    id: 'example-1',
    type: entry.name,
    props: stub,
    aria: { label: `${entry.name} example`, hidden: false },
  };

  return [
    '```json',
    JSON.stringify(example, null, 2),
    '```',
    '',
  ].join('\n');
}

/* -------------------------------------------------------------------------- */
/*  Component registry                                                        */
/* -------------------------------------------------------------------------- */

function tierLabel(tier: ComponentTier): string {
  switch (tier) {
    case ComponentTier.ATOM:
      return 'Atom';
    case ComponentTier.MOLECULE:
      return 'Molecule';
    case ComponentTier.ORGANISM:
      return 'Organism';
    default:
      return String(tier);
  }
}

function tierBadge(tier: ComponentTier): string {
  switch (tier) {
    case ComponentTier.ATOM:
      return '🟢 Atom';
    case ComponentTier.MOLECULE:
      return '🟣 Molecule';
    case ComponentTier.ORGANISM:
      return '🔵 Organism';
    default:
      return String(tier);
  }
}

async function writeComponentsPage(): Promise<void> {
  const entries = componentRegistry.getAllComponents();
  const byTier: Record<string, RegistryEntry[]> = {
    Organism: [],
    Molecule: [],
    Atom: [],
  };
  for (const entry of entries) {
    const label = tierLabel(entry.tier);
    (byTier[label] ??= []).push(entry);
  }
  for (const list of Object.values(byTier)) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const lines: string[] = [];
  lines.push('---');
  lines.push('title: Component API Reference');
  lines.push('outline: deep');
  lines.push('---');
  lines.push('');
  lines.push('# Component API Reference');
  lines.push('');
  lines.push(
    'This reference is **auto-generated** from the Zod schemas in `@ferroui/registry` on every push. Each component entry documents its typed props, allowed enum values, defaults, and a runnable `FerroUILayout` JSON example.',
  );
  lines.push('');
  lines.push(
    '::: tip Nesting rules\n- **Atoms** cannot have children.\n- **Molecules** cannot contain Organisms.\n- A `Dashboard` organism is typically the root of any layout.\n:::',
  );
  lines.push('');
  lines.push(`**Total components registered:** ${entries.length}`);
  lines.push('');

  const tierSummary: string[] = [];
  tierSummary.push('| Tier | Count |');
  tierSummary.push('|------|-------|');
  for (const tier of ['Organism', 'Molecule', 'Atom']) {
    tierSummary.push(`| ${tierBadge(ComponentTier[tier.toUpperCase() as keyof typeof ComponentTier])} | ${byTier[tier]?.length ?? 0} |`);
  }
  lines.push(...tierSummary);
  lines.push('');

  for (const tier of ['Organism', 'Molecule', 'Atom']) {
    const items = byTier[tier];
    if (!items || items.length === 0) continue;
    lines.push(`## ${tier}s`);
    lines.push('');

    for (const entry of items) {
      const definition = toSchema(entry.schema);

      lines.push(`### ${entry.name}`);
      lines.push('');
      if (definition.description) {
        lines.push(definition.description);
        lines.push('');
      }
      lines.push(
        `**Tier:** ${tierBadge(entry.tier)} · **Version:** \`${entry.version}\`${
          entry.deprecated ? ' · 🚫 **Deprecated**' : ''
        }${entry.replacement ? ` (use \`${entry.replacement}\`)` : ''}`,
      );
      lines.push('');
      lines.push('#### Props');
      lines.push('');
      lines.push(renderPropsTable(definition));
      lines.push('#### Example');
      lines.push('');
      lines.push(renderJsonExample(entry));
      lines.push('---');
      lines.push('');
    }
  }

  await fs.mkdir(API_DIR, { recursive: true });
  await fs.writeFile(path.join(API_DIR, 'components.md'), lines.join('\n'));
}

/* -------------------------------------------------------------------------- */
/*  Tool registry                                                             */
/* -------------------------------------------------------------------------- */

function isPublicTool(tool: ToolDefinition): boolean {
  if (tool.public === false) return false;
  // Filter known test-namespaced tools that may leak into the registry.
  const suspicious = [
    /^t\d+$/,
    /^dup_tool$/,
    /^slow_tool$/,
    /^throwing_tool$/,
    /^tool_err$/,
    /^pub\d+$/,
    /^plain$/,
    /^gated$/,
    /^sensitive_no_perms$/,
    /^sensitive_ok$/,
    /^test[-_]/i,
    /^_test/i,
  ];
  if (suspicious.some((re) => re.test(tool.name))) return false;
  if (tool.description === 'd' || tool.description === '') return false;
  return true;
}

async function writeToolsPage(): Promise<void> {
  // Instantiate the engine with a stub provider so its system tools register.
  try {
    const { FerroUIEngine } = await import('@ferroui/engine');
    const stubProvider = {
      id: 'docgen-stub',
      contextWindowTokens: 8192,
      // eslint-disable-next-line require-yield
      async *processPrompt() {
        return { content: '', finishReason: 'stop', tokensUsed: 0 } as never;
      },
      async completePrompt() {
        return { content: '', finishReason: 'stop', tokensUsed: 0 } as never;
      },
      estimateTokens: () => 0,
    };
     
    const _engine = new FerroUIEngine(stubProvider as never);
  } catch (err) {
    console.warn('Could not instantiate engine for tool discovery:', err);
  }

  const all = ToolRegistry.getInstance().getAll();
  const publicTools = all.filter(isPublicTool);
  publicTools.sort((a: ToolDefinition, b: ToolDefinition) => a.name.localeCompare(b.name));

  const lines: string[] = [];
  lines.push('---');
  lines.push('title: Tool API Reference');
  lines.push('outline: deep');
  lines.push('---');
  lines.push('');
  lines.push('# Tool API Reference');
  lines.push('');
  lines.push(
    'Auto-generated from `@ferroui/tools` and `@ferroui/engine` on every push. Test-only and internal tools (marked with `public: false`) are filtered.',
  );
  lines.push('');
  lines.push(`**Total public tools:** ${publicTools.length}`);
  lines.push('');
  lines.push('::: tip Execution budget\nEach layout generation is capped at `MAX_TOOL_CALLS_PER_REQUEST = 10`. See [Tool Registration API](/engineering/backend/Tool_Registration_API_Reference) for the enforcement rules.\n:::');
  lines.push('');

  if (publicTools.length === 0) {
    lines.push(
      '> No public tools are registered in this build. Register tools with `registerTool({ ..., public: true })`.',
    );
    lines.push('');
  }

  for (const tool of publicTools) {
    lines.push(`## \`${tool.name}\``);
    lines.push('');
    lines.push(tool.description);
    lines.push('');

    const badges: string[] = [];
    if (tool.sensitive) badges.push('🔒 **Sensitive** (bypasses semantic cache)');
    if (tool.dataClassification)
      badges.push(`📂 Classification: \`${tool.dataClassification}\``);
    if (typeof tool.ttl === 'number' && tool.ttl > 0)
      badges.push(`⏱️ TTL: \`${tool.ttl}s\``);
    if (typeof tool.timeout === 'number')
      badges.push(`⏳ Timeout: \`${tool.timeout}ms\``);
    if (tool.requiredPermissions?.length) {
      badges.push(
        `🛡️ Permissions: ${tool.requiredPermissions
          .map((p: string) => `\`${p}\``)
          .join(', ')}`,
      );
    }
    if (tool.tags?.length) {
      badges.push(`🏷️ ${tool.tags.map((t: string) => `\`${t}\``).join(', ')}`);
    }
    if (badges.length > 0) {
      lines.push(badges.join(' · '));
      lines.push('');
    }

    const paramsDef = toSchema(tool.parameters);

    lines.push('### Parameters');
    lines.push('');
    lines.push(renderPropsTable(paramsDef));

    try {
      const returnsDef = toSchema(tool.returns);

      lines.push('### Returns');
      lines.push('');
      if (returnsDef.properties) {
        lines.push(renderPropsTable(returnsDef));
      } else {
        lines.push(`\`${describeType(returnsDef)}\``);
        lines.push('');
      }
    } catch {
      // Schema may be too complex to render — skip.
    }

    lines.push('---');
    lines.push('');
  }

  await fs.mkdir(API_DIR, { recursive: true });
  await fs.writeFile(path.join(API_DIR, 'tools.md'), lines.join('\n'));
}

/* -------------------------------------------------------------------------- */
/*  Layout Schema page                                                        */
/* -------------------------------------------------------------------------- */

async function writeSchemaPage(): Promise<void> {
  const mod = await import('@ferroui/schema');
  const rootSchema = mod.FerroUILayoutSchema as unknown as z.ZodType;
  const jsonSchema = z.toJSONSchema(rootSchema);

  const lines: string[] = [];
  lines.push('---');
  lines.push('title: FerroUILayout JSON Schema');
  lines.push('outline: deep');
  lines.push('---');
  lines.push('');
  lines.push('# FerroUILayout JSON Schema');
  lines.push('');
  lines.push(
    'The `FerroUILayout` schema is the root contract between the FerroUI engine and any renderer. Every layout produced by the engine is validated against this schema before the first byte reaches the client.',
  );
  lines.push('');
  lines.push(
    'This page publishes the **canonical JSON Schema** emitted from the live Zod definition in `@ferroui/schema`. For the annotated prose version, see [FerroUILayout Specification](/engineering/backend/FerroUILayout_JSON_Schema_Specification).',
  );
  lines.push('');
  lines.push('## Full Schema');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(jsonSchema, null, 2));
  lines.push('```');
  lines.push('');
  await fs.mkdir(API_DIR, { recursive: true });
  await fs.writeFile(path.join(API_DIR, 'schema.md'), lines.join('\n'));
}

/* -------------------------------------------------------------------------- */
/*  Package stub pages (when TypeDoc output is absent)                        */
/* -------------------------------------------------------------------------- */

const PACKAGE_METADATA: Array<{
  pkg: string;
  title: string;
  description: string;
  path: string;
}> = [
  { pkg: 'engine', title: '@ferroui/engine', description: 'Dual-phase LLM pipeline, partial streaming, tool orchestration, semantic cache.', path: 'packages/engine' },
  { pkg: 'schema', title: '@ferroui/schema', description: 'The FerroUILayout Zod schema, component tiers, and action router.', path: 'packages/schema' },
  { pkg: 'registry', title: '@ferroui/registry', description: 'Atom / Molecule / Organism component registry with Zod schemas.', path: 'packages/registry' },
  { pkg: 'tools', title: '@ferroui/tools', description: 'Tool registration, permission scopes, budgets, and sensitivity flags.', path: 'packages/tools' },
  { pkg: 'i18n', title: '@ferroui/i18n', description: 'Locale resolution, RTL mirroring, and translation provider.', path: 'packages/i18n' },
  { pkg: 'telemetry', title: '@ferroui/telemetry', description: 'OpenTelemetry tracing, metrics, and PII redaction pipelines.', path: 'packages/telemetry' },
  { pkg: 'tokens', title: '@ferroui/tokens', description: 'Design token pipeline with Style Dictionary outputs.', path: 'packages/tokens' },
  { pkg: 'renderer', title: '@ferroui/renderer', description: 'React renderer with action router and state machine bridge.', path: 'packages/renderer' },
  { pkg: 'cli', title: '@ferroui/cli', description: 'Command-line tool for scaffolding, evaluation, dev, and doctor.', path: 'packages/cli' },
  { pkg: 'shared', title: '@ferroui/shared', description: 'Internal utilities shared across FerroUI packages.', path: 'packages/shared' },
  { pkg: 'mcp-server', title: '@ferroui/mcp-server', description: 'Model Context Protocol server exposing FerroUI capabilities.', path: 'packages/mcp-server' },
  { pkg: 'vscode-extension', title: '@ferroui/vscode-extension', description: 'VS Code editor integration with live layout preview.', path: 'packages/vscode-extension' },
];

const APP_METADATA: Array<{ app: string; title: string; description: string; path: string }> = [
  { app: 'web', title: 'Web (Reference Renderer)', description: 'React reference renderer used for Storybook, E2E, and demos.', path: 'apps/web' },
  { app: 'edge', title: 'Edge (Cloudflare Worker)', description: 'Cloudflare Worker packaging of the FerroUI engine.', path: 'apps/edge' },
  { app: 'desktop', title: 'Desktop', description: 'Tauri-based desktop shell for offline FerroUI runtimes (experimental).', path: 'apps/desktop' },
  { app: 'playground', title: 'Playground', description: 'Interactive layout playground (experimental).', path: 'apps/playground' },
];

async function writePackageStub(pkg: typeof PACKAGE_METADATA[number]): Promise<void> {
  const target = path.join(API_DIR, 'packages', `${pkg.pkg}.md`);
  const generatedDir = path.join(API_DIR, 'packages', 'typedoc_api', pkg.pkg);
  let typedocBlock: string;
  try {
    const readme = path.join(generatedDir, 'README.md');
    let content = await fs.readFile(readme, 'utf-8');
    
    // Rewrite relative Markdown links to point to the subfolder
    // [Text](path/file.md) -> [Text](typedoc_api/pkgname/path/file.md)
    content = content.replace(/\[([^\]]+)\]\((?!https?:\/\/|\/)([^)]+)\)/g, `[$1](typedoc_api/${pkg.pkg}/$2)`);
    
    typedocBlock = `\n\n## Generated API\n\n${content}\n`;
  } catch {
    typedocBlock = '\n\n> TypeDoc output is not yet available for this package. Run `pnpm docs:typedoc` or consult the source in the repository.\n';
  }

  const body = `---
title: "${pkg.title}"
---

# ${pkg.title}

${pkg.description}

- **Source:** [\`${pkg.path}\`](https://github.com/jxoesneon/FerroUI/tree/main/${pkg.path})
- **package.json:** [view on GitHub](https://github.com/jxoesneon/FerroUI/blob/main/${pkg.path}/package.json)
${typedocBlock}`;

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, body);
}

async function writeAppStub(app: typeof APP_METADATA[number]): Promise<void> {
  const target = path.join(API_DIR, 'apps', `${app.app}.md`);
  const body = `---
title: ${app.title}
---

# ${app.title}

${app.description}

- **Source:** [\`${app.path}\`](https://github.com/jxoesneon/FerroUI/tree/main/${app.path})
- **package.json:** [view on GitHub](https://github.com/jxoesneon/FerroUI/blob/main/${app.path}/package.json)
`;
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, body);
}

/* -------------------------------------------------------------------------- */
/*  Entry point                                                               */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  console.log('> Generating Component API reference...');
  await writeComponentsPage();
  console.log('> Generating Tool API reference...');
  await writeToolsPage();
  console.log('> Generating FerroUILayout schema page...');
  await writeSchemaPage();
  console.log('> Writing package and app stubs...');
  await Promise.all([
    ...PACKAGE_METADATA.map((pkg) => writePackageStub(pkg)),
    ...APP_METADATA.map((app) => writeAppStub(app)),
  ]);
  console.log('OK Documentation generation complete.');
}

main().catch((err) => {
  console.error('X Documentation generation failed.');
  console.error(err);
  process.exit(1);
});
