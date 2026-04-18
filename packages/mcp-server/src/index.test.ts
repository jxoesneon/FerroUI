import { describe, it, expect } from 'vitest';
import { validateLayout } from '@ferroui/schema';
import { COMPONENT_TIER_REGISTRY } from '@ferroui/schema';
import { getToolsForUser } from '@ferroui/tools';

/**
 * MCP server unit tests.
 * The MCP transport layer (stdio) is not instantiated here —
 * these tests validate the underlying logic that the tool handlers call.
 */

describe('ferroui_validate_layout handler logic', () => {
  it('returns valid for a well-formed layout', () => {
    const layout = {
      schemaVersion: '1.1.0',
      requestId: '00000000-0000-4000-a000-000000000099',
      locale: 'en',
      layout: {
        type: 'Dashboard',
        id: 'root',
        aria: { role: 'main', label: 'Test' },
        props: { heading: 'Test' },
      },
    };
    const result = validateLayout(layout);
    expect(result.valid).toBe(true);
  });

  it('returns invalid with errors for a bad layout', () => {
    const layout = {
      schemaVersion: '1.1.0',
      requestId: 'not-a-uuid',
      locale: 'en',
      layout: { type: 'Dashboard', aria: {} },
    };
    const result = validateLayout(layout);
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('returns invalid when root component is not Dashboard', () => {
    const layout = {
      schemaVersion: '1.1.0',
      requestId: '00000000-0000-4000-a000-000000000099',
      locale: 'en',
      layout: {
        type: 'KPIBoard',
        id: 'root',
        aria: { role: 'main', label: 'Test' },
        props: {},
      },
    };
    const result = validateLayout(layout);
    expect(result.valid).toBe(false);
  });
});

describe('ferroui_list_tools handler logic', () => {
  it('returns public tools for empty permissions', () => {
    const tools = getToolsForUser([]);
    expect(Array.isArray(tools)).toBe(true);
  });

  it('returns tools array with name and description fields', () => {
    const tools = getToolsForUser([]);
    for (const tool of tools) {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
    }
  });
});

describe('ferroui_list_components handler logic', () => {
  it('returns a non-empty component registry', () => {
    const entries = Object.entries(COMPONENT_TIER_REGISTRY);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('includes Dashboard as an Organism', async () => {
    const { ComponentTier } = await import('@ferroui/schema');
    expect(COMPONENT_TIER_REGISTRY['Dashboard']).toBe(ComponentTier.ORGANISM);
  });

  it('includes StatBadge as a Molecule', async () => {
    const { ComponentTier } = await import('@ferroui/schema');
    expect(COMPONENT_TIER_REGISTRY['StatBadge']).toBe(ComponentTier.MOLECULE);
  });
});
