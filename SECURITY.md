# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report security issues by emailing **security@ferroui.dev** (or opening a [GitHub Security Advisory](https://github.com/ferroui/ferroui/security/advisories/new) if you have repository access).

Include:

1. A description of the vulnerability and potential impact
2. Steps to reproduce or a proof-of-concept
3. Any known mitigations

You will receive an acknowledgement within **48 hours** and a resolution update within **7 days**. Critical issues (CVSS ≥ 9.0) are patched within **72 hours**.

## Disclosure Policy

We follow [Coordinated Vulnerability Disclosure (CVD)](https://vuls.cert.org/confluence/display/CVD). We will:

- Confirm receipt of your report promptly
- Work with you to understand and validate the issue
- Keep you informed of our remediation progress
- Credit you in the release notes (unless you prefer anonymity)
- Aim to publish a public advisory within 90 days of the initial report

## Security Hardening

FerroUI implements the following controls out of the box:

- **Prompt injection detection** — regex-based pattern matching on all user input
- **PII redaction** — email, SSN, and credit card numbers scrubbed before LLM calls
- **XML escaping** — all tool outputs escaped before insertion into system prompts
- **Permission-scoped tool manifest** — users only see tools they are authorised to call
- **JWT authentication** with `HttpOnly`, `Secure`, `SameSite=Strict` cookies
- **OWASP security headers** — CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`
- **Rate limiting** — 100 requests / 15 min per IP; configurable per deployment
- **Circuit breaker** — automatic safe-mode after 3 consecutive failures
- **Structured audit logging** — every request and tool call logged with user context
- **Semantic cache HMAC signing** — tamper detection on every cached entry

## Known Limitations

- In-process rate limiter is not shared across multiple engine instances; deploy `rate-limit-redis` for horizontal scaling (see `AUDIT_REPORT.md` §10)
- PII redaction covers email, SSN, and credit card patterns; extend `redactPII()` in `packages/engine/src/pipeline/dual-phase.ts` for domain-specific identifiers (e.g. MRN, IBAN)

## Related Documents

- [Security Threat Model](./docs/security/Security_Threat_Model.md)
- [Data Privacy & Compliance Guide](./docs/security/Data_Privacy_Compliance_Guide.md)
- [Third-Party Security Audit Reports](./docs/security/Third_Party_Security_Audit_Reports.md)
