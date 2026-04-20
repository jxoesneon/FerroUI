# ADR-003: Atomic Component Hierarchy

**Status:** Accepted  
**Date:** 2025-02-01  
**Deciders:** Architecture Team, Frontend Team  
**Consulted:** Design Team, AI Engineering Team  

---

## Context

The AI needs structured guidance on how to compose UI components. Without clear rules, the LLM produces inconsistent layouts with improper nesting (e.g., putting a Grid inside a Button). We needed a hierarchical model that:
- Guides the AI's layout decisions
- Is machine-validatable
- Aligns with design system best practices

## Decision

Adopt a **three-tier Atomic Design hierarchy** with strict nesting rules:

### Tier 1 — Atoms (Foundations)
- Irreducible UI primitives
- Cannot contain children
- Design tokens baked in at compile time

### Tier 2 — Molecules (Compositions)
- Compose Atoms into reusable patterns
- Can contain Atoms and other Molecules
- Cannot contain Organisms

### Tier 3 — Organisms (Functional Blocks)
- Fully functional, data-rich sections
- Can contain Atoms, Molecules, and other Organisms
- Primary building blocks for AI-generated layouts

## Consequences

### Positive
- Clear mental model for AI layout generation
- Enforceable via automated validation
- Consistent with established design system patterns
- Enables progressive enhancement (Atoms → Molecules → Organisms)

### Negative
- Learning curve for component authors
- Some UI patterns don't fit neatly into the hierarchy
- Additional validation overhead

### Mitigations
- CLI scaffolding tools enforce hierarchy
- Comprehensive documentation and examples
- Validation errors include helpful suggestions

## Nesting Rules

| Parent | Allowed Children |
|--------|------------------|
| Atoms | None (leaf nodes) |
| Molecules | Atoms, Molecules |
| Organisms | Atoms, Molecules, Organisms |
| Dashboard | Organisms only (root) |

### Block vs. Inline Enforcement

```
Block-level (Column, Row, Grid, Dashboard, Card, Panel)
  └── MUST NOT appear as children of inline-level (Text, Button, Link, Badge)
```

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Flat component list | No guidance for AI composition |
| CSS-based constraints | Runtime-only, not machine-validatable |
| Custom hierarchy | Would diverge from industry standard |

## Implementation

```typescript
// Validation function
function validateNesting(parent: Component, child: Component): boolean {
  const rules = {
    Atom: [], // No children allowed
    Molecule: ['Atom', 'Molecule'],
    Organism: ['Atom', 'Molecule', 'Organism'],
    Dashboard: ['Organism'],
  };
  
  return rules[parent.tier]?.includes(child.tier) ?? false;
}
```

## Related Decisions

- ADR-004: Component Registry Versioning
- [Component Development Guidelines](../../engineering/frontend/Component_Development_Guidelines.md)

---

## References

- [System Architecture Document](../System_Architecture_Document.md)
- Atomic Design by Brad Frost (industry reference)
