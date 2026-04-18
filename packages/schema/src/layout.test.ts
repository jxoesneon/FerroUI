import { describe, it, expect } from 'vitest';
import { validateLayout } from './layout';
import type { FerroUILayout } from './types';

function buildValid(overrides: Partial<FerroUILayout> = {}): unknown {
  return {
    schemaVersion: '1.0',
    requestId: '550e8400-e29b-41d4-a716-446655440000',
    locale: 'en-US',
    layout: {
      type: 'Dashboard',
      id: 'root',
      aria: { label: 'Main dashboard' },
      children: [
        {
          type: 'Heading',
          id: 'title',
          aria: { label: 'Title' },
          props: { level: 1, text: 'Hello' },
        },
      ],
    },
    ...overrides,
  };
}

describe('validateLayout', () => {
  it('accepts a well-formed Dashboard layout', () => {
    const result = validateLayout(buildValid());
    expect(result.valid).toBe(true);
    expect(result.data?.layout.type).toBe('Dashboard');
    expect(result.errors).toBeUndefined();
  });

  it('rejects when requestId is not a UUID', () => {
    const bad = buildValid();
    (bad as { requestId: string }).requestId = 'not-a-uuid';
    const result = validateLayout(bad);
    expect(result.valid).toBe(false);
    expect(result.errors?.some((e) => e.path === 'requestId')).toBe(true);
  });

  it('rejects when locale is not BCP-47', () => {
    const bad = buildValid();
    (bad as { locale: string }).locale = 'English';
    const result = validateLayout(bad);
    expect(result.valid).toBe(false);
    expect(result.errors?.some((e) => e.path === 'locale')).toBe(true);
  });

  it('rejects when root component type is not Dashboard (R005)', () => {
    const bad = buildValid();
    (bad as unknown as FerroUILayout).layout.type = 'Card';
    const result = validateLayout(bad);
    expect(result.valid).toBe(false);
    // Refine-level error from the top-level .refine(...)
    expect(result.errors?.some((e) => e.path === 'layout.type')).toBe(true);
  });

  it('rejects when a nested component has an invalid action payload', () => {
    const bad = buildValid();
    const firstChild = (bad as unknown as { layout: { children: Array<{ action?: unknown; aria: unknown }> } }).layout.children[0];
    firstChild.action = { type: 'SHOW_TOAST', payload: { message: 'x', variant: 'invalid-variant' } };
    const result = validateLayout(bad);
    expect(result.valid).toBe(false);
  });

  it('returns data field when valid, not when invalid', () => {
    const good = validateLayout(buildValid());
    expect(good.data).toBeDefined();
    const bad = validateLayout({});
    expect(bad.data).toBeUndefined();
  });

  it('flags empty payloads with a coherent error set', () => {
    const result = validateLayout({});
    expect(result.valid).toBe(false);
    expect(Array.isArray(result.errors)).toBe(true);
    expect((result.errors ?? []).length).toBeGreaterThan(0);
  });

  it('reports tier-rule violations with code=custom and rule tag set', () => {
    // Structurally valid layout (Dashboard root) that breaks Rule R008
    // (Text is an Atom and cannot have children).
    const bad = {
      schemaVersion: '1.0',
      requestId: '550e8400-e29b-41d4-a716-446655440000',
      locale: 'en-US',
      layout: {
        type: 'Dashboard',
        id: 'root',
        aria: { label: 'Dashboard' },
        children: [
          {
            type: 'Text',
            id: 'title',
            aria: { label: 'Title' },
            children: [
              { type: 'Icon', id: 'i', aria: { label: 'icon' } },
            ],
          },
        ],
      },
    };
    const result = validateLayout(bad);
    expect(result.valid).toBe(false);
    const tierErr = result.errors?.find((e) => e.code === 'custom' && e.rule === 'R008');
    expect(tierErr).toBeDefined();
  });
});
