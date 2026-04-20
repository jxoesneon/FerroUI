# ADR-005: Streaming Architecture

**Status:** Accepted  
**Date:** 2025-02-15  
**Deciders:** Architecture Team, Frontend Team, Platform Team  
**Consulted:** Performance Team  

---

## Context

LLM responses can take several seconds, especially for complex layouts. Users perceive this as slow if they see a blank screen. We need a streaming architecture that:
- Delivers partial results as soon as possible
- Maintains structural integrity of the layout
- Works across web, desktop, and edge deployments

## Decision

Implement **progressive streaming** with the following elements:

1. **Server-Sent Events (SSE)** for web targets
2. **Tauri Events** for desktop targets
3. **Partial JSON parsing** for incremental tree construction
4. **Optimistic rendering** with Error Boundary protection

## Consequences

### Positive
- Perceived latency significantly reduced
- Users see content appearing progressively
- Better engagement during wait times

### Negative
- Increased complexity in parser and renderer
- Potential for partial rendering errors
- More challenging debugging

### Mitigations
- Robust Error Boundaries around every component
- Lightweight structural validation before emission
- Fallback to full-response mode on parse failures

## Transport Layer Comparison

| Transport | Target | Advantages | Limitations |
|-----------|--------|------------|-------------|
| SSE | Web browsers | Native support, auto-reconnect, HTTP/2 | Unidirectional only |
| WebSocket | Interactive needs | Full duplex, low overhead | Complex lifecycle |
| Tauri Events | Desktop | In-process, zero network, typed | Desktop-only |
| ReadableStream | Edge | WHATWG standard, Fetch API | Requires edge runtime |

## Partial JSON Parsing

```typescript
// Parser operates in two modes
enum ParseMode {
  SAFE,      // Emit only complete subtrees
  OPTIMISTIC // Emit candidate subtrees early
}

class PartialJsonParser {
  private buffer = '';
  private mode: ParseMode = ParseMode.SAFE;
  
  *parse(chunk: string): Generator<PartialLayout> {
    this.buffer += chunk;
    
    if (this.mode === ParseMode.SAFE) {
      // Only emit when all braces match
      while (this.hasCompleteSubtree()) {
        yield this.extractSubtree();
      }
    } else {
      // Emit candidates early
      yield* this.extractCandidates();
    }
  }
}
```

## Stream Filtering

Before emission to client, the engine filters for:
- Malformed JSON fragments
- Hallucinated component names
- Oversized prop values (>64 KB default limit)

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Full-response only | Unacceptable perceived latency |
| Chunked HTTP without SSE | No standard reconnect mechanism |
| GraphQL subscriptions | Overkill; adds unnecessary complexity |

## Related Decisions

- ADR-001: Dual-Phase Pipeline Architecture
- ADR-006: Session State Management

---

## References

- [System Architecture Document](../System_Architecture_Document.md)
- [Observability & Telemetry Dictionary](../../ops/Observability_Telemetry_Dictionary.md)
