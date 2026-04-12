# Edge Workers Provisioning Guide

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Platform:** Cloudflare Workers

---

## 1. Overview

This guide covers deploying Alloy UI to Cloudflare Workers for edge computing.
Edge deployment provides:

- Global low latency (<50ms cold start)
- Automatic scaling
- Durable Objects for session state
- KV storage for caching

---

## 2. Prerequisites

- Cloudflare account
- Wrangler CLI installed
- Domain configured in Cloudflare

### 2.1 Install Wrangler

```bash
npm install -g wrangler
```

### 2.2 Authenticate

```bash
wrangler login
```

---

## 3. Configuration

### 3.1 wrangler.toml

```toml
name = "alloy-edge"
main = "src/index.ts"
compatibility_date = "2025-04-10"

# Durable Objects for session state
[[durable_objects.bindings]]
name = "SESSIONS"
class_name = "Session"

[[migrations]]
tag = "v1"
new_classes = ["Session"]

# KV for caching
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

# Environment variables
[vars]
ALLOY_PROMPT_VERSION = "1.0"
ALLOY_DEFAULT_PROVIDER = "openai"

# Secrets (set via wrangler secret)
# OPENAI_API_KEY
# ANTHROPIC_API_KEY
```

### 3.2 Session Durable Object

```typescript
// src/session.ts
export class Session {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    switch (url.pathname) {
      case '/get':
        const data = await this.state.storage.get('session');
        return jsonResponse(data);

      case '/set':
        const body = await request.json();
        await this.state.storage.put('session', body);
        return jsonResponse({ success: true });

      case '/delete':
        await this.state.storage.delete('session');
        return jsonResponse({ success: true });

      default:
        return new Response('Not found', { status: 404 });
    }
  }
}

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### 3.3 Main Worker

```typescript
// src/index.ts
import { Session } from './session';

export { Session };

export interface Env {
  SESSIONS: DurableObjectNamespace;
  CACHE: KVNamespace;
  OPENAI_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route requests
    switch (url.pathname) {
      case '/api/generate':
        return handleGenerate(request, env, corsHeaders);

      case '/health':
        return new Response('OK', { headers: corsHeaders });

      default:
        return new Response('Not found', { status: 404, headers: corsHeaders });
    }
  },
};

async function handleGenerate(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const body = (await request.json()) as GenerateRequest;

  // Get or create session
  const sessionId = body.sessionId || crypto.randomUUID();
  const sessionStub = env.SESSIONS.get(env.SESSIONS.idFromName(sessionId));

  // Check cache
  const cacheKey = generateCacheKey(body);
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
      },
    });
  }

  // Generate layout
  const layout = await generateLayout(body, env);

  // Cache result
  await env.CACHE.put(cacheKey, JSON.stringify(layout), {
    expirationTtl: 300, // 5 minutes
  });

  return new Response(JSON.stringify(layout), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-Cache': 'MISS',
    },
  });
}
```

---

## 4. Deployment

### 4.1 Set Secrets

```bash
wrangler secret put OPENAI_API_KEY
# Enter your OpenAI API key

wrangler secret put ANTHROPIC_API_KEY
# Enter your Anthropic API key (optional)
```

### 4.2 Deploy

```bash
# Development
wrangler dev

# Production
wrangler deploy
```

### 4.3 Verify Deployment

```bash
curl https://alloy-edge.your-subdomain.workers.dev/health
# Should return: OK
```

---

## 5. Performance Optimization

### 5.1 Cold Start Reduction

| Technique             | Implementation                    |
| --------------------- | --------------------------------- |
| Lazy imports          | Import heavy modules on first use |
| Module caching        | Reuse connections across requests |
| Minimize dependencies | Smaller bundle = faster startup   |

### 5.2 Caching Strategy

```typescript
// Multi-tier caching
async function getCachedOrGenerate(
  key: string,
  env: Env
): Promise<AlloyLayout> {
  // L1: Memory (in-worker)
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }

  // L2: KV (edge)
  const kvCached = await env.CACHE.get(key);
  if (kvCached) {
    const layout = JSON.parse(kvCached);
    memoryCache.set(key, layout);
    return layout;
  }

  // Generate and cache
  const layout = await generateLayout(key);
  await env.CACHE.put(key, JSON.stringify(layout));
  memoryCache.set(key, layout);
  return layout;
}
```

---

## 6. Monitoring

### 6.1 Cloudflare Analytics

Monitor in Cloudflare Dashboard:

- Request volume
- Error rates
- CPU time
- KV operations

### 6.2 Custom Metrics

```typescript
// Send metrics to external service
async function recordMetric(name: string, value: number) {
  await fetch('https://metrics.example.com/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      value,
      timestamp: Date.now(),
    }),
  });
}
```

---

## 7. Troubleshooting

| Issue            | Cause             | Solution                   |
| ---------------- | ----------------- | -------------------------- |
| Cold start >50ms | Large bundle      | Reduce dependencies        |
| KV timeout       | High latency      | Use cache API for hot data |
| DO errors        | State conflicts   | Use atomic operations      |
| Rate limited     | Too many requests | Implement client backoff   |

---

## 8. Related Documents

- [Web SaaS Containerization](./Web_SaaS_Containerization.md)
- [Tauri Desktop Packaging](./Tauri_Desktop_Packaging.md)
- [Observability & Telemetry Dictionary](../Observability_Telemetry_Dictionary.md)

---

## 9. Document History

| Version | Date       | Author        | Changes         |
| ------- | ---------- | ------------- | --------------- |
| 1.0     | 2025-04-10 | Platform Team | Initial release |
