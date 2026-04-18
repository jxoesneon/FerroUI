import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import {
  registry,
  registerComponent,
  unregisterComponent,
  getComponentEntry,
} from './registry';
import { ComponentTier } from '@ferroui/schema';

const noop = () => null;

beforeEach(() => registry.clear());

describe('ComponentRegistry — versioning', () => {
  it('registers multiple versions of the same component', () => {
    registerComponent({ name: 'Card', version: 1, tier: ComponentTier.MOLECULE, component: noop, schema: z.object({}) });
    registerComponent({ name: 'Card', version: 2, tier: ComponentTier.MOLECULE, component: noop, schema: z.object({}) });
    expect(getComponentEntry('Card@1')).toBeDefined();
    expect(getComponentEntry('Card@2')).toBeDefined();
  });

  it('returns stable version by default', () => {
    registerComponent({ name: 'Card', version: 1, tier: ComponentTier.MOLECULE, component: noop, schema: z.object({}), stable: true });
    registerComponent({ name: 'Card', version: 2, tier: ComponentTier.MOLECULE, component: noop, schema: z.object({}) });
    expect(getComponentEntry('Card')?.id).toBe('Card@1');
  });

  it('returns latest after force-upgrade', () => {
    registerComponent({ name: 'Widget', version: 1, tier: ComponentTier.ATOM, component: noop, schema: z.object({}) });
    registerComponent({ name: 'Widget', version: 1, tier: ComponentTier.ATOM, component: noop, schema: z.object({}), force: true });
    expect(getComponentEntry('Widget')).toBeDefined();
  });

  it('returns undefined for unregistered component', () => {
    expect(getComponentEntry('NonExistent')).toBeUndefined();
  });

  it('throws on invalid version in identifier', () => {
    expect(() => getComponentEntry('Card@abc')).toThrow(/Invalid version/);
  });
});

describe('ComponentRegistry — unregister', () => {
  it('unregisters a specific version', () => {
    registerComponent({ name: 'Btn', version: 1, tier: ComponentTier.ATOM, component: noop, schema: z.object({}) });
    registerComponent({ name: 'Btn', version: 2, tier: ComponentTier.ATOM, component: noop, schema: z.object({}) });
    unregisterComponent('Btn@1');
    expect(getComponentEntry('Btn@1')).toBeUndefined();
    expect(getComponentEntry('Btn@2')).toBeDefined();
  });

  it('unregisters all versions when no version specified', () => {
    registerComponent({ name: 'Icon', version: 1, tier: ComponentTier.ATOM, component: noop, schema: z.object({}) });
    unregisterComponent('Icon');
    expect(getComponentEntry('Icon')).toBeUndefined();
  });

  it('is a no-op for nonexistent component', () => {
    expect(() => unregisterComponent('Ghost')).not.toThrow();
  });

  it('updates latestVersion after removing the latest', () => {
    registerComponent({ name: 'Tile', version: 1, tier: ComponentTier.ATOM, component: noop, schema: z.object({}) });
    registerComponent({ name: 'Tile', version: 2, tier: ComponentTier.ATOM, component: noop, schema: z.object({}) });
    unregisterComponent('Tile@2');
    expect(getComponentEntry('Tile@1')).toBeDefined();
  });
});

describe('ComponentRegistry — getAllComponents', () => {
  it('returns all entries across versions', () => {
    registerComponent({ name: 'A', version: 1, tier: ComponentTier.ATOM, component: noop, schema: z.object({}) });
    registerComponent({ name: 'B', version: 1, tier: ComponentTier.MOLECULE, component: noop, schema: z.object({}) });
    registerComponent({ name: 'B', version: 2, tier: ComponentTier.MOLECULE, component: noop, schema: z.object({}) });
    expect(registry.getAllComponents()).toHaveLength(3);
  });
});

describe('ComponentRegistry — validateHierarchy', () => {
  beforeEach(() => {
    registerComponent({ name: 'AtomComp', version: 1, tier: ComponentTier.ATOM, component: noop, schema: z.object({}) });
    registerComponent({ name: 'MolComp', version: 1, tier: ComponentTier.MOLECULE, component: noop, schema: z.object({}) });
    registerComponent({ name: 'OrgComp', version: 1, tier: ComponentTier.ORGANISM, component: noop, schema: z.object({}) });
  });

  it('passes valid molecule with atom child', () => {
    expect(() => registry.validateHierarchy({
      type: 'MolComp',
      props: {},
      aria: { role: 'group' },
      children: [{ type: 'AtomComp', props: {}, aria: { role: 'img' } }],
    })).not.toThrow();
  });

  it('throws when molecule contains organism', () => {
    expect(() => registry.validateHierarchy({
      type: 'MolComp',
      props: {},
      aria: { role: 'group' },
      children: [{ type: 'OrgComp', props: {}, aria: { role: 'main' } }],
    })).toThrow(/R009/);
  });

  it('throws for unknown component type', () => {
    expect(() => registry.validateHierarchy({ type: 'UnknownXYZ', props: {}, aria: {} })).toThrow(/not registered/);
  });

  it('validates organism with molecule child (allowed)', () => {
    expect(() => registry.validateHierarchy({
      type: 'OrgComp',
      props: {},
      aria: { role: 'main' },
      children: [{ type: 'MolComp', props: {}, aria: { role: 'group' } }],
    })).not.toThrow();
  });
});
