# ADR-002: Semantic Caching Strategy

**Status:** Accepted  
**Date:** 2025-01-22  
**Deciders:** Architecture Team, Platform Team  
**Consulted:** Security Team  

---

## Context

The dual-phase pipeline (ADR-001) introduces additional latency. Many user requests are similar or identical, especially in dashboard and reporting scenarios. We need a caching strategy that:
- Reduces redundant LLM calls
- Respects data privacy and permissions
- Handles volatile vs. stable data appropriately

## Decision

Implement a **semantic cache** keyed on:
```
hash(normalized_prompt + resolved_permissions + tool_output_fingerprints)
```

### Key Design Elements

1. **Cache Key Components:**
   - Normalized user prompt (lowercased, whitespace normalized)
   - Resolved user permissions (permission IDs, not full objects)
   - Tool output fingerprints (hashed results, not raw data)

2. **Per-Tool TTL:**
   - Volatile tools (live sensors): TTL = 0 (no cache)
   - Reference tools (user profiles): TTL = 300s
   - Semi-static tools (product catalog): TTL = 3600s

3. **Session Scoping:**
   - Cache is scoped per user session
   - Prevents cross-contamination of sensitive data

## Consequences

### Positive
- Significant reduction in LLM API costs
- Improved response times for common queries
- Reduced load on downstream data sources

### Negative
- Increased memory/storage requirements
- Cache invalidation complexity
- Potential for stale data if TTL misconfigured

### Mitigations
- Configurable TTL per tool
- Cache hit/miss metrics in observability
- Manual cache purge endpoint for operators

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Simple prompt-based cache | Ignored permission changes and data updates |
| Full response cache | Security risk; PII could leak between users |
| No caching | Unacceptable cost and latency for production |

## Implementation Notes

```typescript
// Cache key generation
function generateCacheKey(
  prompt: string,
  permissions: string[],
  toolResults: ToolResult[]
): string {
  const normalized = prompt.toLowerCase().trim().replace(/\s+/g, ' ');
  const permHash = hashPermissions(permissions);
  const fingerprints = toolResults.map(r => r.fingerprint);
  
  return createHash('sha256')
    .update(JSON.stringify({ normalized, permHash, fingerprints }))
    .digest('hex');
}
```

## Related Decisions

- ADR-001: Dual-Phase Pipeline Architecture
- ADR-006: Session State Management

---

## References

- [Semantic Caching Strategy](../../engineering/backend/Semantic_Caching_Strategy_Invalidation.md)
- [System Architecture Document](../System_Architecture_Document.md)
