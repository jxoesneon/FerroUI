import { describe, it, expect, beforeEach } from 'vitest';
import { registry } from './registry.js';
import { ComponentTier } from '@ferroui/schema';
import { z } from 'zod';

describe('ComponentRegistry', () => {
  beforeEach(() => {
    registry.clear();
  });

  it('should allow registering and retrieving components', () => {
    const mockComponent = () => null;
    
    registry.registerComponent({
      name: 'TestAtom',
      version: 1,
      tier: ComponentTier.ATOM,
      component: mockComponent,
      schema: z.object({})
    });
    
    const entry = registry.getComponentEntry('TestAtom');
    expect(entry).toBeDefined();
    expect(entry?.name).toBe('TestAtom');
    expect(entry?.tier).toBe(ComponentTier.ATOM);
  });

  it('silently ignores duplicate version registration without force', () => {
    registry.registerComponent({ name: 'Dup', version: 1, tier: ComponentTier.ATOM, component: () => null, schema: z.object({}) });
    registry.registerComponent({ name: 'Dup', version: 1, tier: ComponentTier.ATOM, component: () => null, schema: z.object({}) });
    expect(registry.getComponentEntry('Dup')?.version).toBe(1);
  });

  it('updates latest version when the current latest is unregistered', () => {
    registry.registerComponent({ name: 'Multi', version: 1, tier: ComponentTier.ATOM, component: () => null, schema: z.object({}) });
    registry.registerComponent({ name: 'Multi', version: 2, tier: ComponentTier.ATOM, component: () => null, schema: z.object({}) });
    registry.unregisterComponent('Multi@2');
    expect((registry as any).latestVersions.get('Multi')).toBe(1);
  });

  it('should enforce Atomic Design rules during validation', () => {
    registry.registerComponent({
      name: 'TestAtom',
      version: 1,
      tier: ComponentTier.ATOM,
      component: () => null,
      schema: z.object({})
    });

    const invalidAtom = {
      type: 'TestAtom',
      props: {},
      children: [{ type: 'SomeOther', props: {} }]
    };

    expect(() => registry.validateHierarchy(invalidAtom as any)).toThrow(/must not have children/);
  });

  it('throws on circular dependency', () => {
    registry.registerComponent({ name: 'Circle', version: 1, tier: ComponentTier.MOLECULE, component: () => null, schema: z.object({}) });
    const comp: any = { type: 'Circle', props: {}, children: [] };
    comp.children.push(comp);
    expect(() => registry.validateHierarchy(comp)).toThrow(/Circular dependency/);
  });
});
