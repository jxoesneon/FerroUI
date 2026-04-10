# Observability & Telemetry Dictionary

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Platform Engineering Team  

---

## 1. Overview

This document defines the observability and telemetry standards for Alloy UI. All components must emit structured telemetry compatible with OpenTelemetry (OTel).

---

## 2. Telemetry Types

### 2.1 Traces

Distributed tracing for request flows.

### 2.2 Metrics

Numerical measurements over time.

### 2.3 Logs

Structured event records.

---

## 3. Trace Structure

### 3.1 Span Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│  REQUEST (root span)                                            │
│  ├── context_resolution (resolve user, permissions)             │
│  ├── phase1_data_gathering                                      │
│  │   ├── llm_call                                               │
│  │   ├── tool_call (getUserProfile)                             │
│  │   ├── tool_call (getOrders)                                  │
│  │   └── llm_call (continue)                                    │
│  ├── phase2_ui_generation                                       │
│  │   └── llm_call                                               │
│  ├── validation                                                 │
│  │   ├── schema_validation                                      │
│  │   └── nesting_validation                                     │
│  ├── self_healing (if needed)                                   │
│  │   ├── repair_attempt_1                                       │
│  │   └── validation                                             │
│  └── stream_delivery                                            │
│      └── chunk_emission                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Span Attributes

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `request.id` | string | Request identifier | `550e8400-e29b-41d4-a716-446655440000` |
| `user.id` | string | Anonymized user ID | `anon_abc123` |
| `prompt.hash` | string | SHA-256 of normalized prompt | `a1b2c3...` |
| `schema.version` | string | AlloyLayout schema version | `1.0` |
| `provider.id` | string | LLM provider | `openai` |
| `provider.model` | string | LLM model | `gpt-4` |
| `phase.latency_ms` | number | Phase duration | `1250` |
| `repair.attempts` | number | Number of repair attempts | `1` |
| `cache.hit` | boolean | Whether cache was used | `false` |
| `tool.name` | string | Tool name | `getUserProfile` |
| `tool.duration_ms` | number | Tool execution time | `150` |
| `tool.success` | boolean | Tool success | `true` |
| `component.count` | number | Number of components | `12` |
| `token.input` | number | Input tokens | `3250` |
| `token.output` | number | Output tokens | `1500` |

---

## 4. Metrics

### 4.1 System Metrics

| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `alloy.requests.total` | Counter | requests | Total requests |
| `alloy.requests.duration` | Histogram | milliseconds | Request duration |
| `alloy.requests.errors` | Counter | errors | Error count |
| `alloy.cache.hits` | Counter | hits | Cache hits |
| `alloy.cache.misses` | Counter | misses | Cache misses |
| `alloy.cache.hit_rate` | Gauge | ratio | Cache hit rate |

### 4.2 LLM Metrics

| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `alloy.llm.calls` | Counter | calls | LLM API calls |
| `alloy.llm.duration` | Histogram | milliseconds | LLM response time |
| `alloy.llm.tokens.input` | Counter | tokens | Input tokens |
| `alloy.llm.tokens.output` | Counter | tokens | Output tokens |
| `alloy.llm.cost` | Counter | dollars | Estimated cost |

### 4.3 Tool Metrics

| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `alloy.tools.calls` | Counter | calls | Tool executions |
| `alloy.tools.duration` | Histogram | milliseconds | Tool execution time |
| `alloy.tools.errors` | Counter | errors | Tool errors |
| `alloy.tools.timeout` | Counter | timeouts | Tool timeouts |

### 4.4 Validation Metrics

| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `alloy.validation.total` | Counter | validations | Total validations |
| `alloy.validation.failed` | Counter | failures | Failed validations |
| `alloy.validation.repairs` | Counter | repairs | Repair attempts |
| `alloy.validation.hallucinations` | Counter | hallucinations | Component hallucinations |

---

## 5. Log Schema

### 5.1 Structured Log Format

```json
{
  "timestamp": "2025-04-10T12:00:00.000Z",
  "level": "info",
  "message": "Layout generated successfully",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "anon_abc123",
  "service": "alloy-engine",
  "version": "1.0.0",
  "attributes": {
    "promptHash": "a1b2c3...",
    "schemaVersion": "1.0",
    "providerId": "openai",
    "providerModel": "gpt-4",
    "latencyMs": 1250,
    "repairAttempts": 0,
    "cacheHit": false,
    "componentCount": 12,
    "tokenInput": 3250,
    "tokenOutput": 1500
  }
}
```

### 5.2 Log Levels

| Level | Usage |
|-------|-------|
| `debug` | Detailed debugging info |
| `info` | Normal operations |
| `warn` | Warning conditions |
| `error` | Error conditions |
| `fatal` | Critical failures |

---

## 6. Health Endpoints

### 6.1 Liveness Probe

```
GET /health/live

Response:
200 OK
{
  "status": "alive",
  "timestamp": "2025-04-10T12:00:00.000Z"
}
```

### 6.2 Readiness Probe

```
GET /health/ready

Response (ready):
200 OK
{
  "status": "ready",
  "checks": {
    "llm_provider": "connected",
    "component_registry": "loaded",
    "cache": "connected"
  }
}

Response (not ready):
503 Service Unavailable
{
  "status": "not_ready",
  "checks": {
    "llm_provider": "disconnected",
    "component_registry": "loaded",
    "cache": "connected"
  }
}
```

### 6.3 Circuit State

```
GET /health/circuit

Response:
200 OK
{
  "state": "CLOSED",
  "failures": 0,
  "threshold": 3,
  "lastFailure": null
}
```

---

## 7. Alerting Rules

### 7.1 Prometheus Alert Rules

```yaml
# alerts.yml
groups:
  - name: alloy-ui
    rules:
      - alert: HighErrorRate
        expr: rate(alloy.requests.errors[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(alloy.requests.duration_bucket[5m])) > 5000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          
      - alert: LLMProviderDown
        expr: alloy.llm.calls == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "LLM provider appears down"
          
      - alert: HighHallucinationRate
        expr: rate(alloy.validation.hallucinations[5m]) > 0.02
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High hallucination rate detected"
```

---

## 8. Dashboards

### 8.1 Grafana Dashboard

Key panels:
- Request rate (RPS)
- Error rate
- Latency percentiles (p50, p95, p99)
- Cache hit rate
- LLM token usage
- Cost per request
- Component distribution

---

## 9. Related Documents

- [Runbooks & Incident Response](./Runbooks_Incident_Response.md)
- [SLA Definitions](./SLA_Definitions.md)

---

## 10. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Platform Team | Initial release |
