# ADR-001: Dual-Phase Pipeline Architecture

**Status:** Accepted  
**Date:** 2025-01-15  
**Deciders:** Architecture Team, AI Engineering Team  
**Consulted:** Frontend Team, Platform Team  

---

## Context

Early prototypes of FerroUI UI used a single LLM call that mixed data gathering with UI generation. This approach led to:
- Layouts rendered with fabricated data when tools failed
- Inconsistent UI states due to stale data
- Difficult debugging of data vs. presentation issues

## Decision

We will enforce a strict **dual-phase pipeline** that separates:
1. **Phase 1: Data Gathering** — LLM makes tool calls, collects real data
2. **Phase 2: UI Generation** — With all data in context, LLM produces ONLY FerroUILayout JSON

## Consequences

### Positive
- Eliminates hallucinated data in layouts
- Clear separation of concerns enables better testing
- Loading states can be shown during Phase 1
- Easier debugging with distinct failure modes

### Negative
- Increased latency (two LLM calls vs. one)
- Higher token usage
- More complex orchestration logic

### Mitigations
- Semantic caching reduces redundant Phase 1 calls
- Streaming delivery minimizes perceived latency
- Edge deployment option for low-latency scenarios

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Single-phase with tool results in context | Still allowed LLM to "improvise" missing data |
| Pre-fetch all possible data | Not scalable; most data is request-specific |
| Client-side data fetching | Violates server-driven UI principle |

## Related Decisions

- ADR-002: Semantic Caching Strategy
- ADR-005: Streaming Architecture

---

## References

- [System Architecture Document](../System_Architecture_Document.md)
- [Semantic Caching Strategy](../../engineering/backend/Semantic_Caching_Strategy_Invalidation.md)
