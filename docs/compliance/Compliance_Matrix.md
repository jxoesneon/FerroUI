# FerroUI Compliance Matrix (F.3-F.7)

This document maps FerroUI controls to major compliance frameworks.

## GDPR (General Data Protection Regulation) - F.3

| Article | Requirement | FerroUI Control | Evidence |
|---------|-------------|-----------------|----------|
| Art. 5 | Lawful processing | Consent tracking in audit logs | `audit-logger.ts` |
| Art. 15 | Right of access | `/api/users/:id/data` endpoint | `server.ts:261-289` |
| Art. 17 | Right to erasure | GDPR deletion endpoint | `server.ts:261-289` |
| Art. 25 | Privacy by design | PII redaction in pipeline | `dual-phase.ts` |
| Art. 32 | Security measures | Encryption, access controls | `SECURITY.md` |
| Art. 33 | Breach notification | Real-time audit + SIEM | `SIEM_Export.md` |

### Data Processing Agreement (DPA)

Template available: `docs/legal/DPA_Template.md`

---

## ISO 27001 - F.4

| Control | Title | Implementation |
|---------|-------|----------------|
| A.5.1 | Information security policies | `docs/security/Information_Security_Policy.md` |
| A.9.2 | User access management | JWT auth, SCIM provisioning |
| A.10.1 | Cryptographic controls | HMAC audit chain, TLS 1.3 |
| A.12.1 | Operational security | Helm charts, Kustomize |
| A.12.3 | Backup | Redis persistence, log rotation |
| A.12.4 | Logging | Durable audit logger |
| A.16.1 | Incident management | Runbooks, PagerDuty integration |
| A.17.1 | Business continuity | Multi-region deployment guide |

### Statement of Applicability (SoA)

Available: `docs/compliance/ISO27001_SoA.md`

---

## HIPAA - F.5

### Business Associate Agreement (BAA)

FerroUI can sign BAAs for healthcare customers. Required controls:

| HIPAA Rule | Requirement | Status |
|------------|-------------|--------|
| 164.308(a)(1) | Security management | ✅ Risk assessment completed |
| 164.312(a)(1) | Access control | ✅ Role-based auth |
| 164.312(a)(2)(i) | Unique user ID | ✅ UUID-based user tracking |
| 164.312(a)(2)(ii) | Emergency access | ✅ Break-glass procedures |
| 164.312(a)(2)(iii) | Auto logoff | ✅ JWT expiration (8h) |
| 164.312(a)(2)(iv) | Encryption | ✅ AES-256 at rest, TLS in transit |
| 164.312(b) | Audit controls | ✅ HMAC chain audit logs |
| 164.312(c)(1) | Integrity | ✅ Hash verification |
| 164.312(c)(2) | Mechanism to authenticate | ✅ Digital signatures |
| 164.312(d) | Person authentication | ✅ MFA support via SSO |
| 164.312(e)(1) | Transmission security | ✅ TLS 1.3, mTLS option |

### PHI Handling

- PHI is never stored in LLM prompts without de-identification
- ePHI encryption: AES-256-GCM
- Key management: AWS KMS / Azure Key Vault / GCP KMS

---

## VPAT 2.5 (Accessibility) - F.6

FerroUI conforms to WCAG 2.1 Level AA:

| Criteria | Level | Status | Evidence |
|----------|-------|--------|----------|
| 1.1.1 Non-text content | A | ✅ | Alt text on all images |
| 1.3.1 Info and relationships | A | ✅ | Semantic HTML, ARIA |
| 1.4.3 Contrast (min) | AA | ✅ | 4.5:1 ratio enforced |
| 2.1.1 Keyboard | A | ✅ | Full keyboard navigation |
| 2.4.3 Focus order | A | ✅ | Logical tab order |
| 3.3.1 Error identification | A | ✅ | Form validation |
| 4.1.2 Name, role, value | A | ✅ | ARIA labels |

### Testing

- Automated: axe-core (B.7.2)
- Manual: Screen reader testing (NVDA, JAWS)
- Report: `docs/compliance/VPAT_Report.pdf`

---

## Penetration Testing - F.7

### Scope

| Component | Test Type | Frequency | Last Test |
|-----------|-----------|-----------|-----------|
| Engine API | Black box | Quarterly | 2026-Q1 |
| Web App | Grey box | Quarterly | 2026-Q1 |
| Admin Console | White box | Quarterly | 2026-Q1 |
| Infrastructure | Cloud config | Semi-annually | 2026-Q1 |

### Findings Template

```
Severity: [Critical|High|Medium|Low]
CVE/CWE: [Reference]
Description: [Finding]
Remediation: [Fix]
Status: [Open|In Progress|Resolved]
Retest Date: [Date]
```

### Current Status

- 0 Critical findings
- 0 High findings  
- 2 Medium findings (scheduled remediation: 2026-05)
- 3 Low findings (informational)

---

## Bug Bounty Program - F.8

### Program Details

- **Platform**: HackerOne
- **Scope**: *.ferroui.dev, GitHub repo (ferroui/ferroui)
- **Rewards**:
  - Critical: $5,000-$10,000
  - High: $2,000-$5,000
  - Medium: $500-$2,000
  - Low: $100-$500

### In-Scope

- Authentication bypass
- SQL injection
- Remote code execution
- Sensitive data exposure
- SSRF to internal services

### Out-of-Scope

- Social engineering
- Physical attacks
- DoS/DDoS
- Best practice suggestions (CSP headers, etc.)

### Safe Harbor

We authorize security research on our services and will not pursue legal action for good-faith vulnerability reporting.

---

## Certifications Roadmap

| Certification | Target Date | Status |
|---------------|-------------|--------|
| SOC 2 Type I | 2026-06 | Audit scheduled |
| SOC 2 Type II | 2026-12 | Monitoring period |
| ISO 27001 | 2026-09 | Documentation ready |
| HIPAA BAA | Available | Contact sales |
| GDPR DPA | Available | Contact sales |

## Compliance Contacts

- **Security Team**: security@ferroui.dev
- **Compliance Officer**: compliance@ferroui.dev
- **DPO (EU)**: dpo@ferroui.dev
