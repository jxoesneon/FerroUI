# ADR-004: Component Registry Versioning

**Status:** Accepted  
**Date:** 2025-02-08  
**Deciders:** Architecture Team, Frontend Team  
**Consulted:** Platform Team  

---

## Context

As the component registry evolves, breaking changes are inevitable. We need a versioning strategy that:
- Prevents silent regressions when components change
- Allows gradual migration of layouts to new component versions
- Maintains backward compatibility where possible

## Decision

Implement **explicit component versioning** in the registry:

1. **Version Suffix:** Components are registered with version suffix: `DataCard@1`, `DataCard@2`
2. **Schema Reference:** FerroUILayout JSON includes `schemaVersion` field
3. **Resolution:** Renderer resolves correct version from schema
4. **Deprecation:** Old versions marked deprecated but remain available for N releases

## Consequences

### Positive
- Breaking changes don't break existing layouts
- Gradual migration path for consumers
- Clear contract between AI-generated layouts and components

### Negative
- Registry bloat from multiple versions
- Increased complexity in component resolution
- Need for version migration tooling

### Mitigations
- Automated cleanup of deprecated versions after grace period
- CLI tool for bulk layout migration
- Version usage analytics to identify obsolete versions

## Version Lifecycle

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DRAFT     │───▶│   ACTIVE    │───▶│ DEPRECATED  │───▶│   REMOVED   │
│  (unstable) │    │  (default)  │    │  (warning)  │    │  (error)    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                    │                  │
     │                    │                  │
     ▼                    ▼                  ▼
  Internal only      AI generates      Migration guide
  No AI access       with this ver     Grace period: 90 days
```

## Implementation

```typescript
// Registry entry
interface RegistryEntry {
  name: string;
  version: number;
  status: 'draft' | 'active' | 'deprecated' | 'removed';
  component: React.ComponentType<FerroUIComponentProps>;
  schema: ZodSchema;
  deprecatedSince?: string;
  migrationPath?: string;
}

// Resolution
function resolveComponent(
  registry: ComponentRegistry,
  type: string,
  schemaVersion: string
): RegistryEntry {
  const [name, version] = type.includes('@') 
    ? type.split('@')
    : [type, getDefaultVersion(type)];
    
  return registry.get(`${name}@${version}`);
}
```

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Semantic versioning per component | Too complex; major/minor not meaningful for UI |
| Single global schema version | Too coarse; forces unnecessary migrations |
| No versioning | Breaking changes would break production layouts |

## Related Decisions

- ADR-003: Atomic Component Hierarchy
- [Component Development Guidelines](../../engineering/frontend/Component_Development_Guidelines.md)

---

## References

- [System Architecture Document](../System_Architecture_Document.md)
