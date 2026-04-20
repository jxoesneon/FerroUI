---
title: Documentation Audit — 2026-04-19
---

# Documentation Audit — 2026-04-19

**Audited:** `jxoesneon.github.io/FerroUI` vs `github.com/jxoesneon/FerroUI`
**Auditor:** External Technical Review
**Scope:** Published site fidelity against the `docs/` source tree

## Headline Findings (at time of audit)

| # | Finding | Severity |
|---|---------|----------|
| CRIT-01 | Homepage `#getting-started` anchor dead | Critical |
| CRIT-02 | Quickstart guide not published | Critical |
| CRIT-03 | Tool registry page exposed test fixture data | Critical |
| CRIT-04 | All architecture "Related Documents" links 404 | Critical |
| HIGH-01 | Component prop tables were stub placeholders | High |
| HIGH-02 | No onboarding content on the homepage | High |
| HIGH-03 | Entire `docs/` tree dark / unpublished | High |
| HIGH-04 | Security documentation absent | High |
| HIGH-05 | Observability documentation absent | High |
| MED-01..09 | API hub empty, stale dates, no search, no 404 page, etc. | Medium |
| LOW-01..07 | Misc. best-practice misses | Low |

## Resolution

The site has been fully migrated to **VitePress** with automated API generation from the Zod registries and TypeDoc for package APIs. Every finding above is now either **resolved** (see linked commit) or **structurally prevented** by the new pipeline:

- `lychee` broken-link checker runs in CI before deploy — **no broken internal link can ever ship**.
- `scripts/generate-docs.ts` imports the actual `@ferroui/registry` and `@ferroui/tools` packages and filters non-public entries via a `public: false` flag, preventing test fixtures from reaching the site.
- VitePress reads the entire `docs/` tree directly, eliminating drift between source markdown and published HTML.
- The `docs-deploy.yml` workflow retriggers on any change to `packages/**`, `docs/**`, or the generator, keeping the published API reference synchronized with the running code.

## Structural Changes

1. **New publishing stack:** VitePress + custom FerroUI theme, replacing the hand-authored HTML under `docs/site/`.
2. **New generator:** `scripts/generate-docs.ts` replaces the regex-based scanner in `scripts/generate-api-docs.ts`.
3. **New CI step:** `lychee` link validation in the docs deploy job.
4. **New coverage:** All `docs/**` subdirectories are now routed and navigable; root `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `MONITORING.md`, and `LICENSE` are included via the `/meta/` section.
5. **Relocated artifacts:** `AUDIT_REPORT.md` and `AUDIT_REPORT_v4_ENTERPRISE.md` moved from the repo root to `docs/audit/`.

## See Also

- [Internal Audit Report](/audit/AUDIT_REPORT)
- [Enterprise Audit v4](/audit/AUDIT_REPORT_v4_ENTERPRISE)
- [Enterprise Readiness Plan](/audit/Enterprise_Readiness_Plan)
