import { describe, it, expect } from 'vitest';
import { validateTiers } from './tiers';

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
    const errors = validateTiers(component);
    expect(errors).toHaveLength(0);
  });

  it('rejects Atom with children (R008)', () => {
    const component = {
      type: 'Text',
      children: [{ type: 'Icon' }],
    };
    const errors = validateTiers(component);
    expect(errors).toContainEqual(expect.objectContaining({ rule: 'R008' }));
  });

  it('rejects Molecule containing Organism (R009)', () => {
    const component = {
      type: 'StatBadge',
      children: [{ type: 'Dashboard' }],
    };
    const errors = validateTiers(component);
    expect(errors).toContainEqual(expect.objectContaining({ rule: 'R009' }));
  });

  it('rejects Block child of Inline component (R010)', () => {
    const component = {
      type: 'Text',
      children: [{ type: 'Divider' }],
    };
    const errors = validateTiers(component);
    expect(errors).toContainEqual(expect.objectContaining({ rule: 'R010' }));
  });

  it('allows Inline child of Block component', () => {
    const component = {
      type: 'Dashboard',
      children: [{ type: 'Text' }],
    };
    const errors = validateTiers(component);
    expect(errors).toHaveLength(0);
  });
});
