---
title: Architecture Decision Records
---

# Architecture Decision Records (ADRs)

ADRs capture architecturally significant decisions along with their context, alternatives considered, and consequences. They are **append-only**: once accepted, an ADR is superseded rather than edited.

| ID | Title | Status |
|----|-------|--------|
| [ADR-001](/architecture/ADRs/ADR-001-Dual-Phase-Pipeline) | Dual-Phase LLM Pipeline | Accepted |
| [ADR-002](/architecture/ADRs/ADR-002-Semantic-Caching) | Semantic Caching Strategy | Accepted |
| [ADR-003](/architecture/ADRs/ADR-003-Atomic-Component-Hierarchy) | Atomic Component Hierarchy | Accepted |
| [ADR-004](/architecture/ADRs/ADR-004-Component-Registry-Versioning) | Component Registry Versioning | Accepted |
| [ADR-005](/architecture/ADRs/ADR-005-Streaming-Architecture) | Streaming Architecture | Accepted |
| [ADR-006](/architecture/ADRs/ADR-006-Session-State-Management) | Session State Management | Accepted |
| [ADR-007](/architecture/ADRs/ADR-007-LLM-Provider-Abstraction) | LLM Provider Abstraction | Accepted |
| [ADR-008](/architecture/ADRs/ADR-008-Forward-Compatibility-Strategy) | Forward Compatibility Strategy | Accepted |

## Conventions

- **Filename:** `ADR-XXX-Kebab-Case-Title.md`
- **Status lifecycle:** `Proposed` → `Accepted` → `Superseded` → `Deprecated`
- **Superseded by:** An ADR may list its successor(s) in the `Status` section.
- **RFCs vs ADRs:** RFCs propose direction before implementation. ADRs document decisions after acceptance.
