import { describe, it, expect } from 'vitest';
import { validateLayout } from './index';

describe('AlloyLayoutSchema validation', () => {
  const validBaseLayout = {
    schemaVersion: "1.0",
    requestId: "550e8400-e29b-41d4-a716-446655440000",
    locale: "en-US",
    layout: {
      type: "Dashboard",
      children: []
    }
  };

  it('should validate a correct layout', () => {
    const result = validateLayout(validBaseLayout);
    expect(result.valid).toBe(true);
  });

  it('should fail if root component is not Dashboard (Rule R005)', () => {
    const invalidLayout = {
      ...validBaseLayout,
      layout: {
        type: "StatBadge",
        children: []
      }
    };
    const result = validateLayout(invalidLayout);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.message.includes('Rule R005'))).toBe(true);
  });

  it('should fail if an Atom has children (Rule R008)', () => {
    const invalidLayout = {
      ...validBaseLayout,
      layout: {
        type: "Dashboard",
        children: [
          {
            type: "Text",
            children: [
              { type: "Icon" }
            ]
          }
        ]
      }
    };
    const result = validateLayout(invalidLayout);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.rule === 'R008')).toBe(true);
  });

  it('should fail if a Molecule contains an Organism (Rule R009)', () => {
    const invalidLayout = {
      ...validBaseLayout,
      layout: {
        type: "Dashboard",
        children: [
          {
            type: "StatBadge", // Molecule
            children: [
              { type: "KPIBoard" } // Organism
            ]
          }
        ]
      }
    };
    const result = validateLayout(invalidLayout);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.rule === 'R009')).toBe(true);
  });
});
