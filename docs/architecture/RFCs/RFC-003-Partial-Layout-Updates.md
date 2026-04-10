# RFC-003: Partial Layout Updates

**Status:** Draft  
**Date:** 2025-03-25  
**Author:** Frontend Team  
**Stakeholders:** Architecture Team, AI Engineering Team  

---

## Summary

This RFC proposes extending the streaming architecture to support **partial layout updates** — targeted modifications to an existing layout rather than full replacement. This addresses the limitation identified in the whitepaper regarding always-full-layout replacement.

## Motivation

Current behavior always replaces the entire layout, causing:
- Loss of client-side state (scroll position, form inputs)
- Unnecessary re-rendering of unchanged components
- Jarring visual transitions
- Poor performance for large layouts

## Proposal

### 1. Update Types

```typescript
type LayoutUpdate = 
  | { type: 'replace'; target: string; component: AlloyComponent }
  | { type: 'insert'; target: string; position: 'before' | 'after' | 'child'; component: AlloyComponent }
  | { type: 'remove'; target: string }
  | { type: 'patch'; target: string; props: Partial<AlloyComponentProps> }
  | { type: 'reorder'; target: string; children: string[] };
```

### 2. Component Addressing

Each component in the layout gets a stable ID:

```json
{
  "type": "Dashboard",
  "id": "dashboard-root",
  "children": [
    {
      "type": "KPIBoard",
      "id": "main-kpis",
      "props": { "metrics": [...] }
    },
    {
      "type": "DataTable",
      "id": "recent-orders",
      "props": { "rows": [...] }
    }
  ]
}
```

### 3. Example: Live Data Update

```json
{
  "updateType": "patch",
  "target": "main-kpis",
  "props": {
    "metrics": [
      { "label": "Revenue", "value": "$125,000", "change": "+5%" }
    ]
  }
}
```

### 4. Update Stream Format

```
DATA: {"schemaVersion": "1.0", "requestId": "uuid", "layout": {...}}

UPDATE: {"updateType": "patch", "target": "main-kpis", "props": {...}}
UPDATE: {"updateType": "insert", "target": "recent-orders", "position": "child", "component": {...}}

COMPLETE: {"requestId": "uuid", "status": "complete"}
```

## Design Considerations

### State Preservation

When a component is patched (not replaced):
- Internal React state is preserved
- DOM state (scroll, focus) is preserved
- Form input values are preserved

When a component is replaced:
- State is reset (as expected)
- Animation transitions can be applied

### Animation

Framer Motion's `layoutId` prop enables automatic animations for:
- Reordered items
- Resized containers
- Moved components

### AI Generation

The AI must be instructed to:
1. Prefer `patch` over `replace` for data updates
2. Use stable IDs for components that should persist
3. Only `replace` when the component structure changes

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Full layout diffing | Too expensive on client |
| Manual update specification | Burden on developers |
| GraphQL-style subscriptions | Too complex for our use case |

## Implementation Plan

| Phase | Deliverable | Timeline |
|-------|-------------|----------|
| 1 | Component ID system | Q2 2025 |
| 2 | Update type implementation | Q2 2025 |
| 3 | Renderer update handling | Q3 2025 |
| 4 | AI prompt updates | Q3 2025 |

## Open Questions

1. Should IDs be AI-generated or developer-assigned?
2. How do we handle ID collisions?
3. What's the maximum update frequency before full replacement is better?

## Feedback

Please comment on:
- Update type coverage (are we missing common patterns?)
- ID generation strategy
- Performance concerns

---

**Discussion Period:** 2025-03-25 to 2025-04-25  
**Target Decision:** 2025-05-30
