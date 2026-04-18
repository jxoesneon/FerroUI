import { describe, it, expect } from 'vitest';
import {
  AriaPropsSchema,
  ActionSchema,
  NavigateActionSchema,
  ToastActionSchema,
  RefreshActionSchema,
  ToolCallActionSchema,
  StateUpdateActionSchema,
  FerroUIComponentSchema,
  StateMachineDefinitionSchema,
  LayoutMetadataSchema,
  ComponentTier,
} from './types';

describe('AriaPropsSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(AriaPropsSchema.parse({})).toEqual({});
  });

  it('accepts valid aria-live values', () => {
    expect(AriaPropsSchema.parse({ live: 'polite' }).live).toBe('polite');
  });

  it('rejects invalid aria-live values', () => {
    expect(AriaPropsSchema.safeParse({ live: 'scream' }).success).toBe(false);
  });
});

describe('Action discriminated union', () => {
  it('NAVIGATE requires a non-empty path', () => {
    const ok = NavigateActionSchema.safeParse({ type: 'NAVIGATE', payload: { path: '/home' } });
    expect(ok.success).toBe(true);
    const empty = NavigateActionSchema.safeParse({ type: 'NAVIGATE', payload: { path: '' } });
    expect(empty.success).toBe(false);
  });

  it('SHOW_TOAST requires variant from enum', () => {
    const good = ToastActionSchema.safeParse({
      type: 'SHOW_TOAST',
      payload: { message: 'hi', variant: 'success' },
    });
    expect(good.success).toBe(true);
    const bad = ToastActionSchema.safeParse({
      type: 'SHOW_TOAST',
      payload: { message: 'hi', variant: 'mild' },
    });
    expect(bad.success).toBe(false);
  });

  it('REFRESH payload is optional', () => {
    const ok = RefreshActionSchema.safeParse({ type: 'REFRESH' });
    expect(ok.success).toBe(true);
  });

  it('TOOL_CALL requires non-empty tool', () => {
    const bad = ToolCallActionSchema.safeParse({ type: 'TOOL_CALL', payload: { tool: '', args: {} } });
    expect(bad.success).toBe(false);
  });

  it('STATE_UPDATE requires non-empty target id', () => {
    const bad = StateUpdateActionSchema.safeParse({ type: 'STATE_UPDATE', payload: { id: '', state: {} } });
    expect(bad.success).toBe(false);
  });

  it('ActionSchema discriminates correctly', () => {
    const nav = ActionSchema.safeParse({ type: 'NAVIGATE', payload: { path: '/a' } });
    expect(nav.success).toBe(true);
    const unknown = ActionSchema.safeParse({ type: 'UNKNOWN', payload: {} });
    expect(unknown.success).toBe(false);
  });
});

describe('FerroUIComponentSchema', () => {
  it('requires type, aria and allows recursive children', () => {
    const parsed = FerroUIComponentSchema.parse({
      type: 'Dashboard',
      aria: { label: 'Root' },
      children: [
        { type: 'Card', aria: { label: 'Card 1' } },
        { type: 'Card', aria: { label: 'Card 2' }, children: [{ type: 'Text', aria: {} }] },
      ],
    });
    expect(parsed.children).toHaveLength(2);
  });

  it('rejects empty type', () => {
    expect(FerroUIComponentSchema.safeParse({ type: '', aria: {} }).success).toBe(false);
  });
});

describe('StateMachineDefinitionSchema', () => {
  it('accepts minimal state machine', () => {
    const parsed = StateMachineDefinitionSchema.parse({
      initial: 'idle',
      states: {
        idle: { on: { CLICK: { target: 'loading' } } },
        loading: {},
      },
    });
    expect(parsed.initial).toBe('idle');
  });

  it('requires initial', () => {
    expect(StateMachineDefinitionSchema.safeParse({ states: {} }).success).toBe(false);
  });
});

describe('LayoutMetadataSchema', () => {
  it('accepts valid ISO datetime', () => {
    const parsed = LayoutMetadataSchema.parse({ generatedAt: '2025-04-10T12:00:00.000Z' });
    expect(parsed.generatedAt).toBe('2025-04-10T12:00:00.000Z');
  });

  it('rejects bad timestamp', () => {
    expect(LayoutMetadataSchema.safeParse({ generatedAt: 'yesterday' }).success).toBe(false);
  });

  it('rejects negative latency', () => {
    expect(
      LayoutMetadataSchema.safeParse({
        generatedAt: '2025-04-10T12:00:00.000Z',
        latencyMs: -1,
      }).success,
    ).toBe(false);
  });
});

describe('ComponentTier enum', () => {
  it('exposes ATOM/MOLECULE/ORGANISM', () => {
    expect(ComponentTier.ATOM).toBe('ATOM');
    expect(ComponentTier.MOLECULE).toBe('MOLECULE');
    expect(ComponentTier.ORGANISM).toBe('ORGANISM');
  });
});
