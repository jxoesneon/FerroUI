# Semantic Caching Strategy & Invalidation

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Platform Engineering Team  

---

## 1. Overview

The semantic cache reduces LLM API costs and improves response latency by caching generated layouts. Unlike simple key-value caching, semantic caching understands the meaning of requests and can match semantically equivalent prompts.

---

## 2. Cache Architecture

### 2.1 Cache Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│                     REQUEST FLOW                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. NORMALIZE                                                  │
│     • Lowercase prompt                                          │
│     • Remove extra whitespace                                   │
│     • Expand contractions                                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. GENERATE CACHE KEY                                         │
│     • hash(normalized_prompt + permissions + tool_fingerprints) │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. CACHE LOOKUP                                               │
│     • Check if key exists in cache                              │
│     • Verify TTL not expired                                    │
│     • Verify tool results still valid                           │
└─────────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
┌─────────────────────┐         ┌─────────────────────┐
│    CACHE HIT        │         │    CACHE MISS       │
│                     │         │                     │
│ Return cached       │         │ Execute full        │
│ AlloyLayout         │         │ pipeline            │
│                     │         │ Store in cache      │
└─────────────────────┘         │ Return layout       │
                                └─────────────────────┘
```

### 2.2 Cache Key Components

```typescript
interface CacheKeyComponents {
  // Normalized user prompt
  normalizedPrompt: string;
  
  // Resolved user permissions (sorted, hashed)
  permissionHash: string;
  
  // Tool output fingerprints (sorted by tool name)
  toolFingerprints: Array<{
    toolName: string;
    fingerprint: string; // hash of tool result
  }>;
}

function generateCacheKey(components: CacheKeyComponents): string {
  const data = JSON.stringify({
    prompt: components.normalizedPrompt,
    permissions: components.permissionHash,
    tools: components.toolFingerprints,
  });
  
  return createHash('sha256').update(data).digest('hex');
}
```

---

## 3. Normalization

### 3.1 Prompt Normalization

```typescript
function normalizePrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')           // Collapse whitespace
    .replace(/[?!.]+$/g, '')        // Remove trailing punctuation
    .replace(/\b(don't|doesn't|didn't)\b/g, 'do not')
    .replace(/\b(won't|wouldn't)\b/g, 'will not')
    .replace(/\b(can't|cannot)\b/g, 'can not')
    .replace(/\b(i'm|you're|we're)\b/g, 'i am')
    .replace(/\b(it's|that's)\b/g, 'it is');
}

// Examples:
// "Show me sales data!" → "show me sales data"
// "Don't show inactive users" → "do not show inactive users"
// "What's the revenue?" → "what is the revenue"
```

### 3.2 Permission Normalization

```typescript
function normalizePermissions(permissions: string[]): string {
  return createHash('sha256')
    .update(permissions.sort().join(','))
    .digest('hex');
}
```

### 3.3 Tool Fingerprinting

```typescript
function fingerprintToolResult(result: unknown): string {
  // Create deterministic fingerprint of tool result
  const canonical = JSON.stringify(result, Object.keys(result as object).sort());
  return createHash('sha256').update(canonical).digest('hex').slice(0, 16);
}
```

---

## 4. Cache Storage

### 4.1 Storage Backends

| Deployment | Backend | Configuration |
|------------|---------|---------------|
| Web SaaS | Redis | `redis://localhost:6379` |
| Desktop | SQLite | `~/.alloy/cache.db` |
| Edge | Cloudflare KV | Namespace: `alloy-cache` |

### 4.2 Cache Entry Structure

```typescript
interface CacheEntry {
  key: string;
  layout: AlloyLayout;
  createdAt: Date;
  expiresAt: Date;
  toolFingerprints: Array<{
    toolName: string;
    fingerprint: string;
    ttl: number;
  }>;
  metadata: {
    prompt: string;
    userId: string;
    sessionId: string;
  };
}
```

### 4.3 Redis Implementation

```typescript
class RedisCache implements SemanticCache {
  private redis: Redis;
  
  async get(key: string): Promise<CacheEntry | null> {
    const data = await this.redis.get(`alloy:cache:${key}`);
    if (!data) return null;
    
    const entry: CacheEntry = JSON.parse(data);
    
    // Check if entry is expired
    if (new Date(entry.expiresAt) < new Date()) {
      await this.delete(key);
      return null;
    }
    
    return entry;
  }
  
  async set(key: string, entry: CacheEntry, ttlSeconds: number): Promise<void> {
    await this.redis.setex(
      `alloy:cache:${key}`,
      ttlSeconds,
      JSON.stringify(entry)
    );
  }
  
  async delete(key: string): Promise<void> {
    await this.redis.del(`alloy:cache:${key}`);
  }
}
```

---

## 5. TTL Strategy

### 5.1 Per-Tool TTL

Tools declare their own TTL based on data volatility:

```typescript
registerTool({
  name: 'getUserProfile',
  description: 'Returns user profile.',
  parameters: z.object({ userId: z.string() }),
  returns: UserProfileSchema,
  ttl: 300, // 5 minutes - user data changes occasionally
  execute: async ({ userId }) => {
    return await db.users.findById(userId);
  },
});

registerTool({
  name: 'getStockPrice',
  description: 'Returns current stock price.',
  parameters: z.object({ symbol: z.string() }),
  returns: StockPriceSchema,
  ttl: 0, // Never cache - real-time data
  execute: async ({ symbol }) => {
    return await fetchStockPrice(symbol);
  },
});

registerTool({
  name: 'getProductCatalog',
  description: 'Returns product catalog.',
  parameters: z.object({}),
  returns: ProductCatalogSchema,
  ttl: 3600, // 1 hour - catalog changes infrequently
  execute: async () => {
    return await db.products.findAll();
  },
});
```

### 5.2 Effective TTL Calculation

```typescript
function calculateEffectiveTTL(toolResults: ToolResult[]): number {
  // If any tool has TTL=0, entire cache entry has TTL=0
  if (toolResults.some(r => r.tool.ttl === 0)) {
    return 0;
  }
  
  // Use minimum TTL of all tools
  const ttls = toolResults.map(r => r.tool.ttl);
  return Math.min(...ttls);
}
```

### 5.3 TTL Categories

| Category | TTL | Examples |
|----------|-----|----------|
| Real-time | 0 | Stock prices, sensor data, live chat |
| Volatile | 60s | User presence, session data |
| Semi-static | 300s | User profiles, permissions |
| Static | 3600s | Product catalog, reference data |
| Immutable | Infinity | Historical data, audit logs |

---

## 6. Cache Invalidation

### 6.1 Invalidation Strategies

| Strategy | When to Use | Implementation |
|----------|-------------|----------------|
| Time-based | Predictable data changes | TTL expiration |
| Event-based | Known data changes | Invalidate on write |
| Manual | Emergency/debugging | Admin API |
| Pattern-based | Bulk invalidation | Key pattern matching |

### 6.2 Event-Based Invalidation

```typescript
// Invalidate cache when user profile is updated
async function updateUserProfile(userId: string, data: UserProfile) {
  await db.users.update(userId, data);
  
  // Invalidate all cache entries that used getUserProfile
  await cache.invalidatePattern(`*getUserProfile*${userId}*`);
}

// Invalidate on product catalog update
async function updateProduct(productId: string, data: Product) {
  await db.products.update(productId, data);
  
  // Invalidate product catalog cache
  await cache.invalidatePattern('*getProductCatalog*');
}
```

### 6.3 Manual Invalidation API

```typescript
// Admin API for manual cache invalidation
app.post('/admin/cache/invalidate', async (req, res) => {
  const { pattern, key } = req.body;
  
  if (key) {
    await cache.delete(key);
    res.json({ invalidated: 1 });
  } else if (pattern) {
    const count = await cache.invalidatePattern(pattern);
    res.json({ invalidated: count });
  } else {
    res.status(400).json({ error: 'key or pattern required' });
  }
});
```

### 6.4 Cache Warming

```typescript
// Pre-populate cache with common queries
async function warmCache() {
  const commonQueries = [
    'show me my dashboard',
    'show sales overview',
    'list recent orders',
  ];
  
  for (const query of commonQueries) {
    // Execute pipeline and cache result
    await executePipeline(query, { cache: true });
  }
}
```

---

## 7. Performance Considerations

### 7.1 Cache Hit Rate Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Overall hit rate | > 40% | Cache metrics |
| p50 lookup time | < 5ms | Performance traces |
| p99 lookup time | < 20ms | Performance traces |
| Memory usage | < 1GB | Monitoring |

### 7.2 Cache Size Management

```typescript
// LRU eviction when cache reaches size limit
class LRUCache {
  private maxSize: number;
  private cache: Map<string, CacheEntry>;
  
  set(key: string, entry: CacheEntry): void {
    if (this.cache.size >= this.maxSize) {
      // Evict least recently used
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, entry);
  }
}
```

### 7.3 Monitoring

```typescript
// Cache metrics
interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  avgLookupTimeMs: number;
  size: number;
  oldestEntry: Date;
}

// Export to Prometheus
const cacheHitCounter = new Counter('alloy_cache_hits_total');
const cacheMissCounter = new Counter('alloy_cache_misses_total');
const cacheLookupHistogram = new Histogram('alloy_cache_lookup_duration_seconds');
```

---

## 8. Security

### 8.1 Session Isolation

Cache entries are scoped to user sessions to prevent data leakage:

```typescript
function generateCacheKey(components: CacheKeyComponents, sessionId: string): string {
  // Include session ID in key to isolate per user
  const data = JSON.stringify({
    ...components,
    sessionId,
  });
  
  return createHash('sha256').update(data).digest('hex');
}
```

### 8.2 PII Handling

Tool results containing PII are never cached:

```typescript
registerTool({
  name: 'getUserSSN',
  description: 'Returns user SSN.',
  parameters: z.object({ userId: z.string() }),
  returns: z.object({ ssn: z.string() }),
  ttl: 0, // Never cache PII
  sensitive: true, // Mark as sensitive
  execute: async ({ userId }) => {
    return await db.users.getSSN(userId);
  },
});
```

---

## 9. Shared Cache (Future)

See [RFC-002: Shared Semantic Cache](../../architecture/RFCs/RFC-002-Shared-Semantic-Cache.md) for planned shared cache across users with identical permissions.

---

## 10. Related Documents

- [Tool Registration API Reference](./Tool_Registration_API_Reference.md)
- [AlloyLayout JSON Schema Specification](./AlloyLayout_JSON_Schema_Specification.md)
- [ADR-002: Semantic Caching](../../architecture/ADRs/ADR-002-Semantic-Caching.md)

---

## 11. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Platform Team | Initial release |
