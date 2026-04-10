# Runbooks & Incident Response

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Site Reliability Engineering Team  

---

## 1. Incident Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| SEV1 | Critical - Service down | 15 min | Complete outage, data loss |
| SEV2 | High - Major degradation | 1 hour | High error rate, slow responses |
| SEV3 | Medium - Minor impact | 4 hours | Partial feature failure |
| SEV4 | Low - Minimal impact | 24 hours | Cosmetic issues, monitoring gaps |

---

## 2. Incident Response Process

### 2.1 Detection

- Automated alerts (PagerDuty)
- Manual reports (support tickets)
- Monitoring dashboards

### 2.2 Response Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DETECT    │───▶│   RESPOND   │───▶│   RESOLVE   │───▶│   REVIEW    │
│   (Alert)   │    │  (Mitigate) │    │   (Fix)     │    │ (Post-mortem)│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │
      │                  │                  │                  │
      ▼                  ▼                  ▼                  ▼
  On-call paged    War room opened    Root cause fixed   Document learnings
  Incident created   Mitigation applied  Verification      Action items
```

---

## 3. Runbooks

### 3.1 SEV1: Complete Service Outage

**Symptoms:**
- 0% success rate
- Health checks failing
- Users cannot access service

**Immediate Actions:**

1. **Page on-call engineer** (if not auto-paged)
2. **Open war room** (Slack #incidents)
3. **Check status page** for external issues

```bash
# Check pod status
kubectl get pods -n alloy-ui

# Check logs
kubectl logs -n alloy-ui deployment/alloy-ui --tail=100

# Check events
kubectl get events -n alloy-ui --sort-by='.lastTimestamp'
```

4. **Enable circuit breaker** (if not already)

```bash
kubectl set env deployment/alloy-ui ALLOY_CIRCUIT_BREAKER=OPEN
```

5. **Scale up** if resource constrained

```bash
kubectl scale deployment/alloy-ui --replicas=10 -n alloy-ui
```

6. **Rollback** if recent deployment

```bash
kubectl rollout undo deployment/alloy-ui -n alloy-ui
```

**Communication:**
- Status page: Investigating
- Slack #incidents: Updates every 15 min
- Stakeholders: Email when identified

---

### 3.2 SEV2: High Error Rate

**Symptoms:**
- Error rate > 5%
- Latency p95 > 5s
- Multiple user complaints

**Immediate Actions:**

1. **Identify error type**

```bash
# Check error logs
kubectl logs -n alloy-ui deployment/alloy-ui | grep ERROR

# Check specific error patterns
kubectl logs -n alloy-ui deployment/alloy-ui | grep -i "timeout\|validation\|hallucination"
```

2. **Check LLM provider status**

```bash
curl https://status.openai.com/api/v2/status.json
```

3. **Switch provider** if needed

```bash
kubectl set env deployment/alloy-ui ALLOY_DEFAULT_PROVIDER=anthropic
```

4. **Increase cache TTL** to reduce LLM calls

```bash
kubectl set env deployment/alloy-ui ALLOY_CACHE_TTL=600
```

---

### 3.3 SEV2: High Latency

**Symptoms:**
- p95 latency > 5s
- User complaints about slowness

**Immediate Actions:**

1. **Check resource usage**

```bash
kubectl top pods -n alloy-ui
```

2. **Check Redis performance**

```bash
redis-cli -h redis info stats
```

3. **Enable optimistic streaming**

```bash
kubectl set env deployment/alloy-ui ALLOY_STREAM_MODE=OPTIMISTIC
```

4. **Scale horizontally**

```bash
kubectl scale deployment/alloy-ui --replicas=10 -n alloy-ui
```

---

### 3.4 SEV3: LLM Provider Issues

**Symptoms:**
- Provider-specific errors
- Timeout errors

**Immediate Actions:**

1. **Check provider status page**
2. **Switch to backup provider**

```bash
kubectl set env deployment/alloy-ui ALLOY_DEFAULT_PROVIDER=anthropic
```

3. **Enable local LLM** (if configured)

```bash
kubectl set env deployment/alloy-ui ALLOY_DEFAULT_PROVIDER=ollama
```

---

### 3.5 SEV3: Cache Issues

**Symptoms:**
- High cache miss rate
- Redis connection errors

**Immediate Actions:**

1. **Check Redis health**

```bash
kubectl exec -it redis-0 -n alloy-ui -- redis-cli ping
```

2. **Restart Redis** (if needed)

```bash
kubectl rollout restart deployment/redis -n alloy-ui
```

3. **Disable cache temporarily**

```bash
kubectl set env deployment/alloy-ui ALLOY_CACHE_ENABLED=false
```

---

## 4. Communication Templates

### 4.1 Incident Started

```
🚨 INCIDENT: [SEV1/2/3] - [Brief Description]

Impact: [What's affected]
Started: [Time]
Detected by: [Alert/User report]
On-call: [Engineer name]
War room: [Slack link]

Updates in #incidents
```

### 4.2 Status Update

```
📊 UPDATE: [Incident ID]

Status: [Investigating/Mitigating/Monitoring/Resolved]
Time elapsed: [X minutes]

Current understanding:
- [What's happening]
- [What we know]
- [What we're doing]

Next update in [X] minutes
```

### 4.3 Incident Resolved

```
✅ RESOLVED: [Incident ID]

Duration: [X minutes]
Resolution: [What fixed it]

Post-mortem will be scheduled within 48 hours.
```

---

## 5. Post-Mortem Template

### 5.1 Document Structure

```markdown
# Post-Mortem: [Incident Title]

## Summary
- Date: [Date]
- Duration: [Duration]
- Severity: [SEV level]
- Impact: [Users affected, data lost, etc.]

## Timeline
| Time | Event |
|------|-------|
| 09:00 | Incident detected |
| 09:05 | On-call paged |
| 09:15 | War room opened |
| 09:30 | Root cause identified |
| 10:00 | Mitigation applied |
| 10:30 | Service restored |

## Root Cause
[Detailed explanation]

## Impact
- Users affected: [Number]
- Data loss: [Yes/No, details]
- Revenue impact: [If applicable]

## What Went Well
- [List]

## What Went Poorly
- [List]

## Action Items
| ID | Action | Owner | Due Date |
|----|--------|-------|----------|
| 1 | [Action] | [Name] | [Date] |

## Lessons Learned
[Key takeaways]
```

---

## 6. Related Documents

- [Observability & Telemetry Dictionary](./Observability_Telemetry_Dictionary.md)
- [SLA Definitions](./SLA_Definitions.md)
- [Disaster Recovery & Business Continuity](./Disaster_Recovery_Business_Continuity.md)

---

## 7. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | SRE Team | Initial release |
