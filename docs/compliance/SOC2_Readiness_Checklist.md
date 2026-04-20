# SOC 2 Readiness Checklist (F.1-F.2)

## Trust Services Criteria

### Security (CC6.1 - CC6.8)
- [x] A.4: Snyk + pnpm audit blocking in CI
- [x] A.5: Production guards for auth
- [x] A.6: Durable audit logger with HMAC chain
- [x] A.10: Trivy container scanning
- [x] C.1: Helm charts with security contexts
- [x] C.5: Cosign image signing

### Availability (A1.2 - A1.3)
- [x] C.1: HPA for auto-scaling
- [x] C.1: Pod Disruption Budgets
- [x] C.2: Multi-environment Kustomize overlays
- [x] C.3: Grafana dashboards with alerting

### Processing Integrity (PI1.3 - PI1.5)
- [x] A.1-A.3: Comprehensive test coverage (90%+ engine)
- [x] B.1: Playwright E2E validation
- [x] D.1: Eval-gated releases
- [x] D.3: LLM-as-judge validation

### Confidentiality (CC6.1, CC6.6)
- [x] A.5: JWT_SECRET validation
- [x] A.6: Audit log tamper detection
- [x] Security.md with data classification

### Privacy (P1.1 - P8.1)
- [ ] F.3: GDPR data processing agreements
- [ ] F.5: Privacy impact assessment (DPIA)

## Required Evidence

| Control | Evidence Location |
|---------|-------------------|
| Access Control | `packages/engine/src/auth/`, `server.ts:assertProductionInvariants()` |
| Change Management | `.github/workflows/ci.yml`, PR template |
| System Operations | `docs/ops/Runbooks_Incident_Response.md` |
| Risk Assessment | `docs/audit/Enterprise_Readiness_Plan.md` |
| Monitoring | `infra/grafana/dashboards/`, `docs/ops/Observability_Telemetry_Dictionary.md` |

## Next Steps

1. Engage SOC 2 auditor for Type I assessment
2. Complete DPIA (F.5)
3. Conduct penetration test (F.6)
4. Establish bug bounty program (F.7)
