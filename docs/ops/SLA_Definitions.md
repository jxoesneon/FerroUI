# SLA Definitions

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Product & Platform Teams  

---

## 1. Service Level Agreement (SLA)

### 1.1 Uptime Commitment

| Tier | Uptime | Downtime/Month | Credit |
|------|--------|----------------|--------|
| Standard | 99.9% | 43 minutes | 10% |
| Premium | 99.95% | 22 minutes | 15% |
| Enterprise | 99.99% | 4 minutes | 25% |

### 1.2 Service Credits

| Monthly Uptime | Credit |
|----------------|--------|
| < 99.9% | 10% |
| < 99.0% | 25% |
| < 95.0% | 50% |

---

## 2. Performance SLAs

### 2.1 Response Time

| Metric | Target | Measurement |
|--------|--------|-------------|
| p50 latency | < 2s | End-to-end request |
| p95 latency | < 5s | End-to-end request |
| p99 latency | < 10s | End-to-end request |

### 2.2 Throughput

| Metric | Target |
|--------|--------|
| Requests/second | 1000+ |
| Concurrent users | 10,000+ |

---

## 3. Support SLAs

### 3.1 Response Times

| Priority | Response | Resolution |
|----------|----------|------------|
| P1 (Critical) | 1 hour | 4 hours |
| P2 (High) | 4 hours | 24 hours |
| P3 (Medium) | 24 hours | 72 hours |
| P4 (Low) | 72 hours | 1 week |

### 3.2 Support Channels

| Channel | Availability | Response |
|---------|--------------|----------|
| Email | 24/7 | Per SLA above |
| Chat | Business hours | < 5 minutes |
| Phone | Enterprise only | < 15 minutes |

---

## 4. Exclusions

The SLA does not cover:
- Scheduled maintenance (with 7-day notice)
- Force majeure events
- Customer-caused issues
- Third-party outages (LLM providers)
- Beta/alpha features

---

## 5. Reporting

### 5.1 Uptime Calculation

```
Uptime = (Total Time - Downtime) / Total Time × 100%

Downtime = Time when service returns errors > 5%
           AND health checks fail
```

### 5.2 Monthly Report

Customers receive monthly SLA reports including:
- Uptime percentage
- Incident summary
- Performance metrics
- Credit calculations

---

## 6. Related Documents

- [Runbooks & Incident Response](./Runbooks_Incident_Response.md)
- [Observability & Telemetry Dictionary](./Observability_Telemetry_Dictionary.md)

---

## 7. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Product Team | Initial release |
