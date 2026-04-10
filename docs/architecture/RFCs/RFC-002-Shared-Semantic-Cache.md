# RFC-002: Shared Semantic Cache Across Users

**Status:** Draft  
**Date:** 2025-03-20  
**Author:** Platform Team  
**Stakeholders:** Architecture Team, Security Team  

---

## Summary

This RFC proposes extending the semantic cache (ADR-002) to support **shared caching across users** when they have identical permissions and prompts. This addresses the limitation identified in the whitepaper regarding per-user cache isolation.

## Motivation

Current semantic cache is per-user, meaning:
- 1000 users asking "Show my dashboard" generates 1000 cache misses
- Significant redundant LLM calls and costs
- Unnecessary latency for common queries

## Proposal

### 1. Cache Tiering

```
┌─────────────────────────────────────────────────────────────┐
│                    SHARED CACHE TIER                         │
│  - Key: hash(normalized_prompt + permission_hash)           │
│  - Contains no user-specific data                           │
│  - TTL: Longer (1 hour default)                             │
├─────────────────────────────────────────────────────────────┤
│                    USER CACHE TIER                           │
│  - Key: hash(normalized_prompt + user_id + tool_fingerprints)│
│  - Contains user-specific data                              │
│  - TTL: Shorter (5 minutes default)                         │
└─────────────────────────────────────────────────────────────┘
```

### 2. Data Classification

Tools must declare data classification:

```typescript
registerTool({
  name: "getCompanyMetrics",
  dataClassification: 'shared', // Same result for all users with same permissions
  // ...
});

registerTool({
  name: "getUserProfile",
  dataClassification: 'user-specific', // Different per user
  // ...
});
```

### 3. Cache Key Generation

```typescript
function generateCacheKey(
  prompt: string,
  userPermissions: string[],
  toolResults: ToolResult[],
  userId: string
): CacheKey {
  const normalized = normalizePrompt(prompt);
  const permHash = hashPermissions(userPermissions);
  
  // Check if all tools are shared
  const allShared = toolResults.every(r => r.tool.dataClassification === 'shared');
  
  if (allShared) {
    return {
      tier: 'shared',
      key: hash({ normalized, permHash }),
    };
  }
  
  return {
    tier: 'user',
    key: hash({ normalized, permHash, userId }),
  };
}
```

### 4. PII Boundary Analysis

Before enabling shared cache for a tool:

| Check | Description |
|-------|-------------|
| Static analysis | Tool code reviewed for PII access |
| Runtime audit | Log all data returned by shared-cache tools |
| Differential testing | Compare outputs across users with same permissions |

## Security Considerations

### Threat Model

| Threat | Mitigation |
|--------|------------|
| Cache poisoning | Cryptographic cache key includes permission hash |
| Permission escalation | Revalidate permissions on cache hit |
| Timing attacks | Constant-time cache lookup |
| Data leakage | Strict data classification required |

### Rollback Plan

If shared cache causes data leakage:
1. Immediate: Disable shared cache via feature flag
2. Short-term: Invalidate all shared cache entries
3. Long-term: Root cause analysis and fix

## Performance Impact

| Metric | Current (Per-User) | Proposed (Shared) |
|--------|-------------------|-------------------|
| Cache hit rate | ~15% | ~60% (estimated) |
| LLM API calls | 1000/hour | 400/hour (estimated) |
| Average latency | 2.5s | 1.2s (estimated) |

## Implementation Plan

| Phase | Deliverable | Timeline |
|-------|-------------|----------|
| 1 | Data classification schema | Q2 2025 |
| 2 | Shared cache implementation | Q2 2025 |
| 3 | Security audit and testing | Q3 2025 |
| 4 | Gradual rollout with monitoring | Q3 2025 |

## Open Questions

1. Should we support organization-level cache (same company, different users)?
2. How do we handle tools that return mixed data (some shared, some user-specific)?
3. What's the right balance between cache hit rate and security?

## Feedback

Please comment on:
- Security concerns with shared caching
- Data classification approach
- Performance expectations

---

**Discussion Period:** 2025-03-20 to 2025-04-20  
**Target Decision:** 2025-05-15
