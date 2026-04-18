#!/usr/bin/env node
/**
 * FerroUI MCP Server — C5
 *
 * Exposes FerroUI capabilities over the Model Context Protocol (MCP) stdio
 * transport, making them accessible to any MCP-compatible AI client
 * (Claude Desktop, Cursor, Continue, etc.).
 *
 * Exposed tools:
 *   - ferroui_generate_layout   Generate a server-driven UI layout from a prompt
 *   - ferroui_validate_layout   Validate a FerroUI layout JSON against the schema
 *   - ferroui_list_tools        List registered FerroUI tools and their manifests
 *   - ferroui_list_components   List the known component registry + tier info
 *
 * Exposed resources:
 *   - ferroui://schema          The FerroUI JSON schema for layouts
 *   - ferroui://components      Component registry manifest
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { validateLayout } from '@ferroui/schema';
import { COMPONENT_TIER_REGISTRY } from '@ferroui/schema';
import { getToolsForUser } from '@ferroui/tools';
import { AnthropicProvider } from '@ferroui/engine';
import { OpenAIProvider } from '@ferroui/engine';
import { runDualPhasePipeline } from '@ferroui/engine';
import type { RequestContext } from '@ferroui/engine';

const SERVER_NAME = 'ferroui-mcp-server';
const SERVER_VERSION = '0.1.0';

const server = new Server(
  { name: SERVER_NAME, version: SERVER_VERSION },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ── Provider selection ────────────────────────────────────────────────────────

function getProvider() {
  const p = process.env.LLM_PROVIDER ?? 'anthropic';
  return p === 'openai' ? new OpenAIProvider() : new AnthropicProvider();
}

// ── Tool definitions ──────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'ferroui_generate_layout',
      description:
        'Generate a server-driven FerroUI UI layout from a natural-language prompt. Returns a validated FerroUILayout JSON object.',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'Natural language description of the UI to generate (e.g. "Show me a sales dashboard with KPIs").',
          },
          userId: {
            type: 'string',
            description: 'Caller user ID for permission scoping (default: "mcp-user").',
          },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Permission strings that control which tools the pipeline can invoke.',
          },
          locale: {
            type: 'string',
            description: 'BCP-47 locale tag (default: "en").',
          },
        },
        required: ['prompt'],
      },
    },
    {
      name: 'ferroui_validate_layout',
      description: 'Validate a FerroUI layout JSON object against the schema and tier rules. Returns {valid, errors}.',
      inputSchema: {
        type: 'object',
        properties: {
          layout: {
            type: 'object',
            description: 'The FerroUILayout object to validate.',
          },
        },
        required: ['layout'],
      },
    },
    {
      name: 'ferroui_list_tools',
      description: 'List all registered FerroUI backend tools with their descriptions and parameter schemas.',
      inputSchema: {
        type: 'object',
        properties: {
          permissions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter to tools accessible with these permissions (default: all public tools).',
          },
        },
      },
    },
    {
      name: 'ferroui_list_components',
      description: 'List all known FerroUI components with their tier classification (Atom/Molecule/Organism).',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}));

// ── Tool call handler ─────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'ferroui_generate_layout': {
      const parsed = z.object({
        prompt: z.string().min(1),
        userId: z.string().default('mcp-user'),
        permissions: z.array(z.string()).default([]),
        locale: z.string().default('en'),
      }).safeParse(args);

      if (!parsed.success) {
        return {
          content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }],
          isError: true,
        };
      }

      const { prompt, userId, permissions, locale } = parsed.data;
      const context: RequestContext = {
        userId,
        permissions,
        locale,
        requestId: crypto.randomUUID(),
      };

      const provider = getProvider();
      const chunks: string[] = [];
      let layout: unknown = null;

      try {
        const generator = runDualPhasePipeline(provider, prompt, context, {
          maxRepairAttempts: 2,
          cacheEnabled: false,
          toolTimeoutMs: 15_000,
        });

        for await (const chunk of generator) {
          if (chunk.type === 'complete' && chunk.layout) {
            layout = chunk.layout;
          } else if (chunk.type === 'error') {
            return {
              content: [{ type: 'text', text: `Pipeline error: ${chunk.error?.message ?? 'unknown'}` }],
              isError: true,
            };
          } else if (chunk.type === 'layout_chunk' && chunk.content) {
            chunks.push(chunk.content);
          }
        }

        const result = layout ?? JSON.parse(chunks.join(''));
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Generation failed: ${err instanceof Error ? err.message : String(err)}` }],
          isError: true,
        };
      }
    }

    case 'ferroui_validate_layout': {
      const parsed = z.object({ layout: z.unknown() }).safeParse(args);
      if (!parsed.success) {
        return {
          content: [{ type: 'text', text: 'Missing layout argument' }],
          isError: true,
        };
      }

      const result = validateLayout(parsed.data.layout);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }

    case 'ferroui_list_tools': {
      const parsed = z.object({ permissions: z.array(z.string()).optional() }).safeParse(args ?? {});
      const permissions: string[] = parsed.success ? (parsed.data.permissions ?? []) : [];
      const tools = getToolsForUser(permissions);
      return {
        content: [{ type: 'text', text: JSON.stringify(tools, null, 2) }],
      };
    }

    case 'ferroui_list_components': {
      const components = Object.entries(COMPONENT_TIER_REGISTRY).map(([name, tier]) => ({
        name,
        tier,
      }));
      return {
        content: [{ type: 'text', text: JSON.stringify(components, null, 2) }],
      };
    }

    default:
      return {
        content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

// ── Resource definitions ──────────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'ferroui://schema',
      name: 'FerroUI Layout Schema',
      description: 'JSON Schema describing the FerroUILayout object structure and all component types.',
      mimeType: 'application/json',
    },
    {
      uri: 'ferroui://components',
      name: 'FerroUI Component Registry',
      description: 'Full list of registered FerroUI components with tier classifications.',
      mimeType: 'application/json',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'ferroui://schema') {
    const { FerroUILayoutSchema } = await import('@ferroui/schema');
    const { z } = await import('zod');
    const jsonSchema = { title: 'FerroUILayout', ...z.toJSONSchema(FerroUILayoutSchema) };
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(jsonSchema, null, 2),
        },
      ],
    };
  }

  if (uri === 'ferroui://components') {
    const components = Object.entries(COMPONENT_TIER_REGISTRY).map(([name, tier]) => ({
      name,
      tier,
    }));
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(components, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// ── Startup ───────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[FerroUI MCP] Server running on stdio (provider: ${process.env.LLM_PROVIDER ?? 'anthropic'})`);
}

main().catch((err) => {
  console.error('[FerroUI MCP] Fatal error:', err);
  process.exit(1);
});
