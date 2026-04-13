import { describe, it, expect, beforeEach } from 'vitest';
import { registry } from './registry';
import { ComponentTier } from '@alloy/schema';
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
});
