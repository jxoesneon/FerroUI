import { describe, it, expect } from 'vitest';
import {
  validateTiers,
  syncTiersFromRegistry,
  resolveComponentTier,
  COMPONENT_TIER_REGISTRY,
} from './tiers.js';
import { ComponentTier } from './types.js';
import type { FerroUIComponent } from './types.js';

// validateTiers tolerates untyped component shapes at runtime; cast helper
// keeps tests readable while satisfying TypeScript's stricter expectations.
const asComponent = <T>(c: T): FerroUIComponent => c as unknown as FerroUIComponent;

describe('syncTiersFromRegistry', () => {
  it('writes entries into the registry', () => {
    const original = COMPONENT_TIER_REGISTRY['CustomWidget'];
    syncTiersFromRegistry([{ name: 'CustomWidget', tier: ComponentTier.MOLECULE }]);
    expect(COMPONENT_TIER_REGISTRY['CustomWidget']).toBe(ComponentTier.MOLECULE);
    // Cleanup
    if (original === undefined) delete COMPONENT_TIER_REGISTRY['CustomWidget'];
    else COMPONENT_TIER_REGISTRY['CustomWidget'] = original;
  });

  it('overrides existing entries', () => {
    const original = COMPONENT_TIER_REGISTRY['Text'];
    syncTiersFromRegistry([{ name: 'Text', tier: ComponentTier.ORGANISM }]);
    expect(COMPONENT_TIER_REGISTRY['Text']).toBe(ComponentTier.ORGANISM);
    // Restore
    COMPONENT_TIER_REGISTRY['Text'] = original;
  });
});

describe('resolveComponentTier', () => {
  it('returns the tier for a known component', () => {
    expect(resolveComponentTier('Dashboard')).toBe(ComponentTier.ORGANISM);
    expect(resolveComponentTier('Text')).toBe(ComponentTier.ATOM);
    expect(resolveComponentTier('StatBadge')).toBe(ComponentTier.MOLECULE);
  });

  it('returns undefined for an unknown component', () => {
    expect(resolveComponentTier('NotReal-xyz')).toBeUndefined();
  });
});

describe('validateTiers', () => {
  it('allows valid hierarchy (Organism -> Molecule -> Atom)', () => {
    const component = {
      type: 'Dashboard',
      children: [
        {
          type: 'StatBadge',
          children: [{ type: 'Text' }],
        },
      ],
    };
    const errors = validateTiers(asComponent(component));
    expect(errors).toHaveLength(0);
  });

  it('rejects Atom with children (R008)', () => {
    const component = {
      type: 'Text',
      children: [{ type: 'Icon' }],
    };
    const errors = validateTiers(asComponent(component));
    expect(errors).toContainEqual(expect.objectContaining({ rule: 'R008' }));
  });

  it('rejects Molecule containing Organism (R009)', () => {
    const component = {
      type: 'StatBadge',
      children: [{ type: 'Dashboard' }],
    };
    const errors = validateTiers(asComponent(component));
    expect(errors).toContainEqual(expect.objectContaining({ rule: 'R009' }));
  });

  it('rejects Block child of Inline component (R010)', () => {
    const component = {
      type: 'Text',
      children: [{ type: 'Divider' }],
    };
    const errors = validateTiers(asComponent(component));
    expect(errors).toContainEqual(expect.objectContaining({ rule: 'R010' }));
  });

  it('allows Inline child of Block component', () => {
    const component = {
      type: 'Dashboard',
      children: [{ type: 'Text' }],
    };
    const errors = validateTiers(asComponent(component));
    expect(errors).toHaveLength(0);
  });

  it('rejects Dashboard nested below root (R011)', () => {
    const component = {
      type: 'Dashboard',
      children: [
        { type: 'FormGroup', children: [{ type: 'Dashboard' }] },
      ],
    };
    const errors = validateTiers(asComponent(component));
    expect(errors).toContainEqual(expect.objectContaining({ rule: 'R011' }));
  });

  it('detects circular references without infinite recursion', () => {
    const leaf = { type: 'Text' } as unknown as FerroUIComponent & { children?: FerroUIComponent[] };
    const parent = { type: 'StatBadge', children: [leaf] } as unknown as FerroUIComponent & { children: FerroUIComponent[] };
    // Create a cycle: leaf's only child is the parent.
    leaf.children = [parent];
    const errors = validateTiers(parent);
    expect(errors.some((e) => e.rule === 'CYCLE')).toBe(true);
  });
});
