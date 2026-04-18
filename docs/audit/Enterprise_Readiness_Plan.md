# FerroUI — Enterprise-Readiness & Apex-in-Niche Program

**Status:** In Progress
**Started:** 2026-04-17
**Owner:** Cascade (driving) + Eduardo (approver)
**Living doc:** Updated after every completed task.

Source audit: [Enterprise_Readiness_Report.md](./Enterprise_Readiness_Report.md) *(this plan is the executable companion)*

---

## Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked / awaiting decision

Each task is atomic (≤1 file scope or 1 concept) and verifiable.

---

## Execution Order (Optimal)

The order minimizes blockers: fix correctness first, then enforce guardrails, then add test depth, then unlock infrastructure, then layer in enterprise features, then the AI-safety moat, then compliance attestation, then DX/polish.

1. **Phase A** — Correctness & Guardrails (no new surface; tighten what exists)
2. **Phase B** — Testing Depth (prove correctness stays)
3. **Phase C** — Infrastructure Maturity (unlock self-host)
4. **Phase D** — AI-Safety Moat (apex differentiator)
5. **Phase E** — Enterprise Commercial Surface
6. **Phase F** — Compliance & Attestation (long-lead)
7. **Phase G** — DX, Docs, Polish

---

## Phase A — Correctness & Guardrails

### A.1 Fix latent `CryptoJS` import bug in engine

- [ ] A.1.1 Add `import CryptoJS from 'crypto-js'` to `packages/engine/src/engine.ts`
- [ ] A.1.2 Verify with `pnpm -F @ferroui/engine test`

### A.2 Remove coverage blindspots in engine

- [ ] A.2.1 Delete `src/engine.ts`, `src/server.ts`, `src/pipeline/dual-phase.ts`, `src/prompts/loader.ts` from vitest `coverage.exclude` in `packages/engine/vitest.config.ts`
- [ ] A.2.2 Keep `ollama.ts`, `llama-cpp.ts`, `providers/base.ts`, `types.ts`, `index.ts` excluded (pure re-exports / optional deps)
- [ ] A.2.3 Run `pnpm -F @ferroui/engine test --coverage` and note any regressions
- [ ] A.2.4 If tests for engine.ts / server.ts / dual-phase.ts are missing, add minimal smoke tests in this phase

### A.3 Raise CI coverage thresholds to governance-standard

- [ ] A.3.1 Update `.github/workflows/ci.yml` coverage gate to statements 80 / branches 70 / functions 80 / lines 80 (monorepo floor)
- [ ] A.3.2 Keep package-specific higher thresholds in each package's `vitest.config.ts` (engine 90/80/85/90 already enforced)
- [ ] A.3.3 Ensure schema package has coverage config set to 95/90/95/95 per governance doc

### A.4 Make security scans blocking

- [ ] A.4.1 Remove `continue-on-error: true` from Snyk step (`.github/workflows/ci.yml:174`)
- [ ] A.4.2 Remove `continue-on-error: true` from `pnpm audit` step (`.github/workflows/ci.yml:259`)
- [ ] A.4.3 Keep SARIF upload with `continue-on-error: true` (only the scan itself should block)
- [ ] A.4.4 Document in `SECURITY.md` what a failing Snyk / audit means for contributors

### A.5 Assert `SKIP_AUTH` is disallowed in production

- [ ] A.5.1 Add startup guard in `packages/engine/src/server.ts` that throws if `NODE_ENV === 'production' && SKIP_AUTH === 'true'`
- [ ] A.5.2 Add regression test in `packages/engine/src/auth/jwt.test.ts` (or new `server-startup.test.ts`)

### A.6 Durable audit logger

- [ ] A.6.1 Switch default `AUDIT_LOG_OUTPUT` to `file` with rotation-ready path when `NODE_ENV=production`
- [ ] A.6.2 Add SQLite backend option `AUDIT_LOG_OUTPUT=sqlite` using existing `better-sqlite3` dep
- [ ] A.6.3 Add HMAC chain signing so tamper is detectable (SOC 2 CC7.2)
- [ ] A.6.4 Add unit tests for SQLite + HMAC chain
- [ ] A.6.5 Document env vars in `docs/ops/Observability_Telemetry_Dictionary.md`

### A.7 Workspace hygiene

- [ ] A.7.1 Remove tracked files that are now gitignored (`git rm --cached` for `*.log`, `.tmp_pup/`, scratch scripts) — **user-approval gated** (I will propose the commands)
- [ ] A.7.2 Remove committed `packages/*/dist/` and `apps/*/dist/` from repo (over 200 files) — **user-approval gated**
- [ ] A.7.3 Populate `.agent/orchestration-manifest.json` with basic workspace metadata or delete it
- [ ] A.7.4 Populate `.agent/rules/workspace.md` with project-specific rules or delete it
- [ ] A.7.5 Remove `.fastembed_cache_bak/` from repo (cache backup, should not be tracked)

### A.8 Populate Docusaurus config to unblock docs site

- [ ] A.8.1 Write minimal valid `docs/site/docusaurus.config.js`
- [ ] A.8.2 Verify `pnpm run docs:generate` still works with the new config
- [ ] A.8.3 Trigger `docs-deploy.yml` via `workflow_dispatch` to validate Pages deploy

### A.9 Attach SBOM to GitHub Releases

- [ ] A.9.1 Update `.github/workflows/release.yml` to generate CycloneDX SBOM before `changeset publish`
- [ ] A.9.2 Attach SBOM as GitHub Release asset when publishing
- [ ] A.9.3 Sign SBOM with GitHub OIDC attestation (`actions/attest-build-provenance`)

### A.10 Containerize security — Trivy in CI

- [ ] A.10.1 Add Docker build step to `ci.yml` for `packages/engine/Dockerfile`, `packages/registry/Dockerfile`, `apps/web/Dockerfile`
- [ ] A.10.2 Run Trivy `fs` and `image` scans with severity threshold HIGH/CRITICAL
- [ ] A.10.3 Upload Trivy SARIF to GitHub Code Scanning
- [ ] A.10.4 Make Trivy blocking on CRITICAL

---

## Phase B — Testing Depth

### B.1 Playwright E2E suite

- [ ] B.1.1 Add `tests/e2e/playwright.config.ts` + install `@playwright/test`
- [ ] B.1.2 Scenario: create layout via prompt → streamed render → refresh action fires → toast shown
- [ ] B.1.3 Scenario: error path renders `ErrorBoundary`
- [ ] B.1.4 Scenario: self-healing repairs invalid tool result
- [ ] B.1.5 Scenario: keyboard-only navigation (Tab, Enter, Space, Esc)
- [ ] B.1.6 Add `e2e` job to `ci.yml` that starts engine + web, runs Playwright headless Chromium + WebKit
- [ ] B.1.7 Upload Playwright report + traces as CI artifact

### B.2 Load tests (k6)

- [ ] B.2.1 Add `tests/load/smoke.js` — 50 VUs × 30s validating `/api/ferroui/process` SSE
- [ ] B.2.2 Add `tests/load/soak.js` — 200 VUs × 10 min for p95 < 5s validation
- [ ] B.2.3 Add GitHub Action workflow `load.yml` triggered weekly + on-demand
- [ ] B.2.4 Store k6 results as `tests/load/baseline.json` + compare drift

### B.3 Mutation testing (StrykerJS)

- [ ] B.3.1 `pnpm -D add -w stryker @stryker-mutator/core @stryker-mutator/vitest-runner`
- [ ] B.3.2 Add `stryker.conf.mjs` scoped to `packages/engine` + `packages/schema`
- [ ] B.3.3 Set mutation-score threshold: engine 70%, schema 85%
- [ ] B.3.4 Add `stryker.yml` workflow on-demand + weekly

### B.4 Visual regression (Chromatic)

- [ ] B.4.1 Bring up Storybook for `packages/registry` (see G.2)
- [ ] B.4.2 Wire Chromatic in `ci.yml` as separate job

### B.5 Contract tests for LLM providers (Pact)

- [ ] B.5.1 Pact consumer tests capturing expected OpenAI/Anthropic/Google request shapes
- [ ] B.5.2 Fixture replay against SDK versions matching `package.json`

### B.6 Chaos basics

- [ ] B.6.1 Add Toxiproxy docker-compose for local chaos
- [ ] B.6.2 Test: provider returns 429 → router failover verified
- [ ] B.6.3 Test: Redis outage → in-memory fallback verified
- [ ] B.6.4 Quarterly chaos drill doc template `docs/ops/chaos-drills/Q2-2026.md`

### B.7 Accessibility E2E

- [ ] B.7.1 Pa11y integration already scripted; wire into `ci.yml`
- [ ] B.7.2 Playwright `@axe-core/playwright` across 5 representative layouts
- [ ] B.7.3 Scripted NVDA narration capture (macOS skip; Windows runner only)

---

## Phase C — Infrastructure Maturity

### C.1 Helm chart for the engine

- [ ] C.1.1 `infra/helm/ferroui-engine/Chart.yaml` + `values.yaml`
- [ ] C.1.2 Templates: Deployment, Service, ConfigMap, Secret, HPA, PodDisruptionBudget, NetworkPolicy, ServiceMonitor (Prometheus CR)
- [ ] C.1.3 `values.staging.yaml` + `values.production.yaml`
- [ ] C.1.4 Helm lint + `helm template` in CI
- [ ] C.1.5 Publish chart to GitHub Pages (OCI-compatible)

### C.2 Kustomize overlays

- [ ] C.2.1 `infra/kustomize/base/` (engine + redis + otel-collector)
- [ ] C.2.2 Overlays: `overlays/local`, `overlays/staging`, `overlays/production`

### C.3 Grafana dashboards

- [ ] C.3.1 `infra/grafana/dashboards/ferroui-overview.json` — RPS, error rate, p50/p95/p99, cache hit rate
- [ ] C.3.2 `infra/grafana/dashboards/ferroui-llm.json` — tokens, cost, per-provider latency, circuit state
- [ ] C.3.3 `infra/grafana/dashboards/ferroui-safety.json` — firewall blocks, PII redactions, hallucination rate
- [ ] C.3.4 Provisioning YAML for Grafana sidecar discovery

### C.4 Prometheus alert rules

- [ ] C.4.1 `infra/prometheus/alerts.yml` matching `Observability_Telemetry_Dictionary.md:228-266`
- [ ] C.4.2 Runbook links embedded in alert annotations
- [ ] C.4.3 Promtool lint in CI

### C.5 Container signing

- [ ] C.5.1 Add `cosign sign` step in `release.yml` using Sigstore keyless (OIDC)
- [ ] C.5.2 Publish attestations as OCI references
- [ ] C.5.3 Document verification in `SECURITY.md`

### C.6 SLSA Level 3 provenance

- [ ] C.6.1 Use `slsa-github-generator` for build provenance
- [ ] C.6.2 Attach `in-toto` attestations to releases

### C.7 Status page + uptime

- [ ] C.7.1 Set up `status.ferroui.dev` (Statuspage / Instatus free tier / self-hosted Uptime Kuma)
- [ ] C.7.2 Public component health from `/health` + provider circuits
- [ ] C.7.3 Automated incident opening from Prometheus alerts

### C.8 Multi-region IaC

- [ ] C.8.1 Terraform module `infra/modules/ferroui-region` for AWS + GCP
- [ ] C.8.2 Global routing (CloudFront / Cloud Load Balancer)
- [ ] C.8.3 Redis replication (ElastiCache Global Datastore)
- [ ] C.8.4 Session affinity via JWT (stateless) — verify no sticky routing needed

---

## Phase D — AI-Safety Moat (apex niche)

### D.1 Eval-gated release train

- [ ] D.1.1 Add `pnpm eval` command running `ferroui/evals/default_suite.json`
- [ ] D.1.2 Store baseline scores per prompt version in `ferroui/evals/baselines/<version>.json`
- [ ] D.1.3 CI job `evals.yml` computes delta vs baseline, fails if regression > 2%
- [ ] D.1.4 Publish eval report as PR comment

### D.2 Red-team / adversarial prompt corpus

- [ ] D.2.1 Import curated public corpora: Gandalf, Lakera Garak, PromptBench subset
- [ ] D.2.2 Store under `ferroui/evals/redteam/` with license attribution
- [ ] D.2.3 Score: jailbreak success rate, PII leak rate, tool-call abuse rate
- [ ] D.2.4 Threshold: jailbreak < 1%, PII leak 0%, tool abuse 0% — block release on regression

### D.3 LLM-as-judge harness

- [ ] D.3.1 Add `ferroui/evals/judge.ts` that scores layout quality via Claude 3.7 Sonnet
- [ ] D.3.2 Rubric: schema validity, a11y attribute presence, semantic coherence, component fit
- [ ] D.3.3 Score stored alongside baseline

### D.4 Per-tenant cost + safety budgets

- [ ] D.4.1 Extend `tenant-quota.ts` to include `$budgetCents` and `safetyEvents`
- [ ] D.4.2 Mid-request cost estimation via token pricing table (provider × model)
- [ ] D.4.3 Return 402 on budget exceeded; 429 on safety event budget exceeded
- [ ] D.4.4 Per-tenant admin endpoint to set budgets

### D.5 Model drift canaries

- [ ] D.5.1 Golden prompt set with expected-output fingerprints
- [ ] D.5.2 Nightly CI job re-runs golden set, alerts on fingerprint drift
- [ ] D.5.3 Per-provider drift dashboard in Grafana

### D.6 Prompt A/B experiment router

- [ ] D.6.1 Traffic splitter in engine: `promptVersion: A|B` stanza
- [ ] D.6.2 Record experiment assignment in audit + metrics
- [ ] D.6.3 Stats export for offline analysis

### D.7 Content provenance (C2PA)

- [ ] D.7.1 Sign each generated `FerroUILayout` with engine's Ed25519 key
- [ ] D.7.2 Include signature in layout envelope (`schemaVersion: 1.1`)
- [ ] D.7.3 Renderer verifies signature before rendering (optional strict mode)
- [ ] D.7.4 Key rotation doc in `SECURITY.md`

### D.8 Jailbreak / safety telemetry dashboard

- [ ] D.8.1 Metrics: `ferroui.safety.firewall_blocks`, `ferroui.safety.pii_redactions`, `ferroui.safety.policy_violations`
- [ ] D.8.2 Dashboard `infra/grafana/dashboards/ferroui-safety.json` (see C.3.3)

---

## Phase E — Enterprise Commercial Surface

### E.1 SSO / OIDC / SAML

- [ ] E.1.1 Add `packages/engine/src/auth/oidc.ts` using `openid-client`
- [ ] E.1.2 Add SAML via `samlify` or equivalent
- [ ] E.1.3 Admin UI to configure identity providers per tenant
- [ ] E.1.4 Tests for Okta / Azure AD / Google Workspace flows

### E.2 SCIM provisioning

- [ ] E.2.1 Add `packages/engine/src/auth/scim.ts` — SCIM 2.0 Users + Groups endpoints
- [ ] E.2.2 Token-based SCIM admin auth
- [ ] E.2.3 Tests against Okta SCIM compliance suite fixtures

### E.3 Admin console UI

- [ ] E.3.1 New app `apps/admin/` (Vite + React) consuming existing `/admin` endpoints
- [ ] E.3.2 Tenant browser, quota editor, audit log viewer, circuit breaker control
- [ ] E.3.3 RBAC: scope to `system.admin` permission

### E.4 Customer usage dashboard

- [ ] E.4.1 Per-tenant usage in `/api/tenants/:id/usage` (requests, tokens, $)
- [ ] E.4.2 Client-side dashboard component in the atomic registry
- [ ] E.4.3 Export to CSV / Parquet

### E.5 SIEM audit log export

- [ ] E.5.1 Splunk HEC adapter
- [ ] E.5.2 Datadog Logs adapter
- [ ] E.5.3 Sumo Logic HTTP adapter
- [ ] E.5.4 Generic OTLP log export (already partially supported via OTel)
- [ ] E.5.5 Config via `AUDIT_LOG_SIEM=splunk|datadog|sumo|otlp`

### E.6 Pricing / billing / EE split

- [ ] E.6.1 Decide license strategy: BSL 1.1 / Elastic 2.0 / AGPL / keep MIT (user-decision)
- [ ] E.6.2 If EE: move enterprise-only features to `packages/enterprise/` with separate license
- [ ] E.6.3 Stripe-based subscription scaffold under `apps/billing/` (optional)

### E.7 Trademark & commercial policy

- [ ] E.7.1 `TRADEMARK.md` describing logo / name usage
- [ ] E.7.2 Public pricing page scaffold

### E.8 CLA bot

- [ ] E.8.1 Add EasyCLA / CLA Assistant Lite action
- [ ] E.8.2 Draft CLA text in `.github/CLA.md`

---

## Phase F — Compliance & Attestation

### F.1 SOC 2 Type I

- [ ] F.1.1 Select auditor (Vanta / Drata / Secureframe) — user-decision
- [ ] F.1.2 Map controls to existing artifacts (SECURITY.md, runbooks, audit logger, CODEOWNERS, dependabot)
- [ ] F.1.3 Gap-fill: formal access review cadence, vendor risk log, security training log
- [ ] F.1.4 4-week evidence collection
- [ ] F.1.5 Audit window

### F.2 SOC 2 Type II

- [ ] F.2.1 6-month observation window post-Type-I
- [ ] F.2.2 Continuous evidence automation (Vanta/Drata integrations)

### F.3 ISO 27001 controls matrix

- [ ] F.3.1 `compliance/iso27001.yaml` mapping Annex A controls → repo artifacts
- [ ] F.3.2 Risk register `compliance/risk-register.yaml`
- [ ] F.3.3 Management review cadence doc

### F.4 HIPAA BAA template

- [ ] F.4.1 `compliance/hipaa/BAA_TEMPLATE.md`
- [ ] F.4.2 PHI-specific deployment guide in `docs/ops/deployment-guides/HIPAA_Deployment.md`
- [ ] F.4.3 Extend PII redaction to MRN (`\b[A-Z]{0,3}\d{5,10}\b` with context), NPI (10-digit), ICD-10, dates of service

### F.5 VPAT 2.5

- [ ] F.5.1 `compliance/accessibility/VPAT_2.5.md` — WCAG 2.2 AA + Section 508 conformance claims
- [ ] F.5.2 Evidence links to axe test output, keyboard E2E, manual SR review notes

### F.6 GDPR DPIA template

- [ ] F.6.1 `compliance/gdpr/DPIA_TEMPLATE.md`
- [ ] F.6.2 Customer-facing sub-processor list auto-generated from `compliance/sub-processors.yaml`

### F.7 Third-party pen test

- [ ] F.7.1 Select firm (user-decision)
- [ ] F.7.2 Scope: engine API + admin surface + auth flow
- [ ] F.7.3 Publish remediation report (redacted)

### F.8 Public bug bounty

- [ ] F.8.1 HackerOne / Intigriti program scoping
- [ ] F.8.2 `SECURITY.md` updated with bounty policy + payout table

---

## Phase G — DX, Docs, Polish

### G.1 Public docs site (Docusaurus)

- [ ] G.1.1 Switch `docs/site/` from hand-rolled HTML to Docusaurus
- [ ] G.1.2 Import all `docs/**/*.md` as pages
- [ ] G.1.3 Algolia DocSearch
- [ ] G.1.4 Versioned docs per release

### G.2 Storybook for registry

- [ ] G.2.1 `packages/registry` add Storybook 9
- [ ] G.2.2 Stories for every atom, molecule, organism
- [ ] G.2.3 Chromatic integration (B.4.2)
- [ ] G.2.4 Deploy Storybook to GitHub Pages alongside docs

### G.3 VS Code extension

- [ ] G.3.1 New top-level `vscode-extension/` with `package.json` manifest
- [ ] G.3.2 JSON schema for FerroUILayout surfaced via `*.ferroui.json` association
- [ ] G.3.3 Live preview panel running renderer
- [ ] G.3.4 Prompt-file diff view

### G.4 Playground / examples

- [ ] G.4.1 Public playground at `play.ferroui.dev`
- [ ] G.4.2 Example gallery with 10+ production-shaped templates
- [ ] G.4.3 `create-ferroui-app` CLI published to npm

### G.5 CLI publish

- [ ] G.5.1 Flip `packages/cli` `private: false` when ready
- [ ] G.5.2 First publish with provenance via Changesets
- [ ] G.5.3 Install docs in README

### G.6 `ENTERPRISE.md`

- [ ] G.6.1 Root-level `ENTERPRISE.md` linking SLA, SSO roadmap, support tiers, BAA availability

### G.7 `llms.txt`

- [ ] G.7.1 Promote `docs/site/llms.txt` to repo root `llms.txt`
- [ ] G.7.2 Keep canonical per `llmstxt.org` format

---

## Decision Log

| Date | Decision | Rationale | Owner |
|---|---|---|---|
| 2026-04-17 | Begin with Phase A (correctness & guardrails) before any new surface | Fixing latent bug + tightening existing CI has highest ratio of risk-reduction to effort | Cascade |
| 2026-04-17 | Keep single plan doc `Enterprise_Readiness_Plan.md` as living source of truth | Avoid recap-doc proliferation | Cascade |

---

## Open Questions for Eduardo

- **E.6.1** — License strategy: stay MIT, or move enterprise features behind BSL / Elastic 2.0?
- **E.1** — SSO/SCIM priority vendor support order (Okta, Azure AD, Google, Ping, OneLogin?)
- **F.1.1** — SOC 2 auditor choice (Vanta vs Drata vs Secureframe)?
- **F.7.1** — Pen test firm (Trail of Bits, NCC, Cure53, Include Security?)
- **A.7.1 / A.7.2** — Approve `git rm --cached` of committed `dist/`, log files, scratch scripts?
- **C.7** — Status page host (Statuspage = $, Instatus = $, Uptime Kuma = self-host, cStatus = GitHub)?
- **E.6.3** — Build billing infra in-house (Stripe) or use Lago / Metronome / Orb?
