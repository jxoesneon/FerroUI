---
title: Security Policy
---

# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | ✅                 |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report security issues by emailing **security@ferroui.dev** (or opening a [GitHub Security Advisory](https://github.com/jxoesneon/FerroUI/security/advisories/new) if you have repository access).

Include:

1. A description of the vulnerability and potential impact.
2. Steps to reproduce or a proof-of-concept.
3. Any known mitigations.

You will receive an acknowledgement within **48 hours** and a resolution update within **7 days**. Critical issues (CVSS ≥ 9.0) are patched within **72 hours**.

## Disclosure Policy

We follow Coordinated Vulnerability Disclosure (CVD). We will:

- Confirm receipt of your report promptly.
- Work with you to understand and validate the issue.
- Keep you informed of our remediation progress.
- Credit you in the release notes (unless you prefer anonymity).
- Aim to publish a public advisory within 90 days of the initial report.

## Security Hardening

FerroUI implements the following controls out of the box:

- **Prompt injection detection** — regex-based pattern matching on all user input.
- **PII redaction** — email, SSN, IBAN, IP, phone, and credit-card patterns scrubbed before LLM calls.
- **XML escaping** — all tool outputs escaped before insertion into system prompts.
- **Permission-scoped tool manifest** — users only see tools they are authorised to call.
- **JWT authentication** with `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
- **OWASP security headers** — CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`.
- **Rate limiting** — configurable per deployment (100 req / 15 min per IP default).
- **Circuit breaker** — automatic safe-mode after 3 consecutive failures.
- **Structured audit logging** — every request and tool call logged with user context.
- **Semantic cache HMAC signing** — tamper detection on every cached entry.

## Known Limitations

- The in-process rate limiter is not shared across multiple engine instances — deploy `rate-limit-redis` for horizontal scaling.
- PII redaction covers common patterns; extend `redactPII()` in the engine pipeline for domain-specific identifiers (e.g. MRN, VIN).

## Related Documents

- [Security Threat Model](/security/Security_Threat_Model)
- [Data Privacy & Compliance Guide](/security/Data_Privacy_Compliance_Guide)
- [Third-Party Security Audit Reports](/security/Third_Party_Security_Audit_Reports)
- [Acceptable Use Policy](/security/Acceptable_Use_Policy)

