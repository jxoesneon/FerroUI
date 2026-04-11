import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentRegistry, registry, registerComponent, getComponentEntry } from './registry';
import { ComponentTier } from '@alloy/schema';
import { z } from 'zod';

describe('ComponentRegistry', () => {
  beforeEach(() => {
    registry.clear();
  });

  it('should register and retrieve a component', () => {
    const mockComponent = () => null;
    const schema = z.object({ title: z.string() });

    registry.registerComponent({
      name: 'TestAtom',
      version: 1,
      tier: ComponentTier.ATOM,
      component: mockComponent as any,
      schema
    });

    const entry = registry.getComponentEntry('TestAtom');
    expect(entry).toBeDefined();
    expect(entry?.name).toBe('TestAtom');
    expect(entry?.version).toBe(1);
  });

  it('should throw if component version is already registered', () => {
    const mockComponent = () => null;
    const schema = z.object({});

    registry.registerComponent({
      name: 'TestAtom',
      version: 1,
      tier: ComponentTier.ATOM,
      component: mockComponent as any,
      schema
    });

    expect(() => {
      registry.registerComponent({
        name: 'TestAtom',
        version: 1,
        tier: ComponentTier.ATOM,
        component: mockComponent as any,
        schema
      });
    }).toThrow("Component 'TestAtom' with version 1 is already registered.");
  });

  it('should handle versioning (latest vs specific version)', () => {
    const mockComponent = () => null;
    const schema = z.object({});

    registry.registerComponent({
      name: 'MultiVersion',
      version: 1,
      tier: ComponentTier.ATOM,
      component: mockComponent as any,
      schema
    });

    registry.registerComponent({
      name: 'MultiVersion',
      version: 2,
      tier: ComponentTier.ATOM,
      component: mockComponent as any,
      schema
    });

    const latest = registry.getComponentEntry('MultiVersion');
    expect(latest?.version).toBe(2);

    const v1 = registry.getComponentEntry('MultiVersion@1');
    expect(v1?.version).toBe(1);

    const v2 = registry.getComponentEntry('MultiVersion@2');
    expect(v2?.version).toBe(2);
  });

  it('should return undefined for unregistered component', () => {
    const entry = registry.getComponentEntry('Unregistered');
    expect(entry).toBeUndefined();
  });

  it('should throw if identifier has invalid version', () => {
    expect(() => {
      registry.getComponentEntry('TestAtom@invalid');
    }).toThrow('Invalid version in identifier: TestAtom@invalid');
  });

  it('should return undefined if component exists but specific version does not', () => {
    registry.registerComponent({
      name: 'TestAtom',
      version: 1,
      tier: ComponentTier.ATOM,
      component: (() => null) as any,
      schema: z.object({})
    });
    
    // It should actually return undefined when we ask for a missing version
    const entry = registry.getComponentEntry('TestAtom@2');
    expect(entry).toBeUndefined();
  });

  it('should get all components', () => {
    const mockComponent = () => null;
    const schema = z.object({});

    registry.registerComponent({
      name: 'Atom1',
      version: 1,
      tier: ComponentTier.ATOM,
      component: mockComponent as any,
      schema
    });

    registry.registerComponent({
      name: 'Atom2',
      version: 1,
      tier: ComponentTier.ATOM,
      component: mockComponent as any,
      schema
    });

    const all = registry.getAllComponents();
    expect(all.length).toBe(2);
    expect(all.map(e => e.name)).toContain('Atom1');
    expect(all.map(e => e.name)).toContain('Atom2');
  });

  it('should clear all components', () => {
    const mockComponent = () => null;
    const schema = z.object({});

    registry.registerComponent({
      name: 'Atom1',
      version: 1,
      tier: ComponentTier.ATOM,
      component: mockComponent as any,
      schema
    });

    expect(registry.getAllComponents().length).toBe(1);
    registry.clear();
    expect(registry.getAllComponents().length).toBe(0);
  });

  it('should throw if validating unregistered component', () => {
    const invalidComponent = {
      type: 'UnregisteredAtom'
    };

    expect(() => registry.validateHierarchy(invalidComponent as any)).toThrow("Component type 'UnregisteredAtom' is not registered.");
  });

  it('should validate hierarchy successfully with children', () => {
    registry.registerComponent({
      name: 'MyOrganism',
      version: 1,
      tier: ComponentTier.ORGANISM,
      component: (() => null) as any,
      schema: z.object({})
    });

    registry.registerComponent({
      name: 'MyMolecule',
      version: 1,
      tier: ComponentTier.MOLECULE,
      component: (() => null) as any,
      schema: z.object({})
    });

    const validComponent = {
      type: 'MyOrganism',
      children: [{ type: 'MyMolecule' }]
    };

    // Should not throw
    expect(() => registry.validateHierarchy(validComponent as any)).not.toThrow();
  });

  it('should validate hierarchy integration (Rule R008)', () => {
    registry.registerComponent({
      name: 'MyAtom',
      version: 1,
      tier: ComponentTier.ATOM,
      component: (() => null) as any,
      schema: z.object({})
    });

    const invalidComponent = {
      type: 'MyAtom',
      children: [{ type: 'Another' }]
    };

    expect(() => registry.validateHierarchy(invalidComponent as any)).toThrow(/Rule R008/);
  });

  it('should validate hierarchy integration (Rule R009)', () => {
    registry.registerComponent({
      name: 'MyMolecule',
      version: 1,
      tier: ComponentTier.MOLECULE,
      component: (() => null) as any,
      schema: z.object({})
    });

    registry.registerComponent({
      name: 'MyOrganism',
      version: 1,
      tier: ComponentTier.ORGANISM,
      component: (() => null) as any,
      schema: z.object({})
    });

    const invalidComponent = {
      type: 'MyMolecule',
      children: [{ type: 'MyOrganism' }]
    };

    expect(() => registry.validateHierarchy(invalidComponent as any)).toThrow(/Rule R009/);
  });

  it('should export functional helpers', () => {
    registry.clear();
    const mockComponent = () => null;
    const schema = z.object({});

    registerComponent({
      name: 'HelperAtom',
      version: 1,
      tier: ComponentTier.ATOM,
      component: mockComponent as any,
      schema
    });

    const entry = getComponentEntry('HelperAtom');
    expect(entry).toBeDefined();
    expect(entry?.name).toBe('HelperAtom');
  });
});
