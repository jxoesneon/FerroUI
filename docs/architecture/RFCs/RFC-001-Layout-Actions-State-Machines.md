# RFC-001: Layout Actions & State Machines

**Status:** Draft  
**Date:** 2025-03-15  
**Author:** Architecture Team  
**Stakeholders:** Frontend Team, AI Engineering Team  

---

## Summary

This RFC proposes an extension to the FerroUILayout schema to support **Layout Actions** — client-side state machines that enable imperative UI patterns not expressible in static JSON. This addresses the limitation identified in the whitepaper regarding multi-step wizards and drag-and-drop reordering.

## Motivation

The current FerroUILayout model is purely declarative. While this works well for dashboards and forms, it cannot express:
- Multi-step wizards with validation between steps
- Drag-and-drop list reordering
- Expandable/collapsible sections with state
- Complex form interactions (conditional fields)

## Proposal

### 1. State Machine Definition

Introduce a `stateMachine` property to Organisms:

```typescript
interface StateMachineDefinition {
  id: string;
  initialState: string;
  states: Record<string, StateDefinition>;
  context?: Record<string, unknown>;
}

interface StateDefinition {
  on?: Record<string, Transition>;
  actions?: string[];
  render: FerroUIComponent;
}

interface Transition {
  target: string;
  condition?: string; // JSONata expression
  actions?: string[];
}
```

### 2. Action Registry

Client-side actions registered separately from tools:

```typescript
registerLayoutAction({
  name: 'expandSection',
  execute: (context, params) => {
    return { ...context, expandedSection: params.sectionId };
  }
});
```

### 3. Example: Multi-Step Wizard

```json
{
  "type": "Wizard",
  "props": { "title": "Onboarding" },
  "stateMachine": {
    "id": "onboarding-wizard",
    "initialState": "personal-info",
    "states": {
      "personal-info": {
        "on": {
          "NEXT": { "target": "company-info", "condition": "$.formValid" }
        },
        "render": { "type": "PersonalInfoForm", "props": {} }
      },
      "company-info": {
        "on": {
          "BACK": { "target": "personal-info" },
          "NEXT": { "target": "review" }
        },
        "render": { "type": "CompanyInfoForm", "props": {} }
      },
      "review": {
        "on": {
          "BACK": { "target": "company-info" },
          "SUBMIT": { 
            "target": "success",
            "actions": ["submitOnboarding"]
          }
        },
        "render": { "type": "ReviewStep", "props": {} }
      }
    }
  }
}
```

## Design Considerations

### Scope Limitation

State machines are **scoped to a single Organism**. They cannot:
- Modify parent or sibling component state
- Access global application state
- Make direct API calls (must use TOOL_CALL actions)

### Serialization

State machine state must be serializable for:
- Hydration after SSR
- Persistence across sessions
- Debugging and replay

### AI Generation

The AI will generate state machine definitions in Phase 2 alongside the layout. Validation ensures:
- All referenced states exist
- All transitions have valid targets
- Actions are registered in the action registry

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Full Turing-complete scripting | Security risk; too complex |
| React components with state | Violates server-driven principle |
| XState directly | Too heavy; XState is implementation detail |

## Implementation Plan

| Phase | Deliverable | Timeline |
|-------|-------------|----------|
| 1 | Core state machine runtime | Q2 2026 |
| 2 | Action registry and validation | Q2 2026 |
| 3 | AI prompt updates for generation | Q3 2026 |
| 4 | Developer documentation | Q3 2026 |

## Open Questions

1. Should state machines support parallel states (XState-style)?
2. How should history states work for "back" navigation?
3. What's the performance impact of many concurrent state machines?

## Feedback

Please comment on:
- Is the scope limitation too restrictive?
- Are there common patterns not covered by this proposal?
- Concerns about AI-generated state machines

---

**Discussion Period:** 2025-03-15 to 2025-04-15  
**Target Decision:** 2025-04-30
