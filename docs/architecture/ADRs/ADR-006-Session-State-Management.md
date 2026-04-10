# ADR-006: Session State Management

**Status:** Accepted  
**Date:** 2025-02-22  
**Deciders:** Architecture Team, Platform Team  
**Consulted:** Security Team  

---

## Context

The orchestration engine needs to maintain state across the dual-phase pipeline and multiple requests within a session. This includes:
- Conversation context for follow-up requests
- Semantic cache for the session
- User permissions and identity
- Circuit breaker state

## Decision

Implement **session state** using deployment-appropriate storage:

| Deployment | Storage | Rationale |
|------------|---------|-----------|
| Web SaaS | Redis | Fast, scalable, TTL support |
| Desktop (Tauri) | SQLite | Embedded, zero external deps |
| Edge (Cloudflare) | Durable Objects | Colocated with compute, edge-native |

### Session Lifecycle

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CREATE    │───▶│   ACTIVE    │───▶│   EXPIRE    │───▶│   DESTROY   │
│  (first req)│    │ (requests)  │    │ (TTL/idle)  │    │ (cleanup)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Session Data Structure

```typescript
interface SessionState {
  id: string;
  userId: string;
  permissions: string[];
  conversationContext?: ConversationContext;
  cache: SemanticCache;
  circuitBreaker: CircuitBreakerState;
  createdAt: Date;
  lastActivityAt: Date;
  ttlSeconds: number;
}
```

## Consequences

### Positive
- Consistent user experience across requests
- Efficient caching per user
- Proper isolation between users

### Negative
- Additional infrastructure complexity
- Session affinity requirements for some deployments
- Potential for session hijacking if not secured

### Mitigations
- Cryptographically random session IDs
- HTTPS-only session cookies
- Automatic session expiration
- Session invalidation on permission changes

## Security Considerations

| Threat | Mitigation |
|--------|------------|
| Session fixation | Regenerate ID on privilege change |
| Session hijacking | Secure, HttpOnly, SameSite cookies |
| Session replay | Include timestamp validation |
| Data leakage | Per-session cache isolation |

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Stateless (JWT only) | Too large for conversation context |
| Client-side state | Security risk; client can tamper |
| Database only | Too slow for cache operations |

## Related Decisions

- ADR-002: Semantic Caching Strategy
- ADR-005: Streaming Architecture
- [Security Threat Model](../../security/Security_Threat_Model.md)

---

## References

- [System Architecture Document](../System_Architecture_Document.md)
- [Data Privacy Compliance Guide](../../security/Data_Privacy_Compliance_Guide.md)
