---
title: Monitoring & CI/CD Dashboard
---

# FerroUI CI/CD Monitoring Dashboard

## Active Workflows

| Workflow | Purpose | Location |
|----------|---------|----------|
| **CI** | Build, test, lint, coverage | [`ci.yml`](https://github.com/jxoesneon/FerroUI/actions/workflows/ci.yml) |
| **Docs Deploy** | Publish this site | [`docs-deploy.yml`](https://github.com/jxoesneon/FerroUI/actions/workflows/docs-deploy.yml) |
| **Security Audit** | Snyk + Trivy scan | [`ci.yml`](https://github.com/jxoesneon/FerroUI/actions/workflows/ci.yml) |
| **Release** | Changesets + npm publish | [`release.yml`](https://github.com/jxoesneon/FerroUI/actions/workflows/release.yml) |
| **Chromatic** | Visual regression on Storybook | [`chromatic.yml`](https://github.com/jxoesneon/FerroUI/actions/workflows/chromatic.yml) |
| **Stryker** | Mutation testing (weekly) | [`stryker.yml`](https://github.com/jxoesneon/FerroUI/actions/workflows/stryker.yml) |
| **Load Tests** | k6 load profile | [`load.yml`](https://github.com/jxoesneon/FerroUI/actions/workflows/load.yml) |
| **Eval Gate** | Prompt eval suite on release | [`eval-gate.yml`](https://github.com/jxoesneon/FerroUI/actions/workflows/eval-gate.yml) |

## Monitoring Commands

```bash
# Watch current run
gh run watch

# List recent runs
gh run list --limit 10

# View specific workflow
gh run view <run-id>

# View logs
gh run view <run-id> --log

# Download artifacts
gh run download <run-id>
```

## Key Metrics to Watch

| Metric | Target | Alert If |
|--------|--------|----------|
| Test Coverage | ≥ 80% | < 80% |
| Build Time | < 5 min | > 10 min |
| Security Scan | 0 critical | > 0 critical |
| E2E Tests | 100% pass | < 95% |

## Required Secrets

| Secret | Consumer |
|--------|----------|
| `SNYK_TOKEN` | Security scan |
| `STRYKER_DASHBOARD_API_KEY` | Mutation testing dashboard |
| `CHROMATIC_PROJECT_TOKEN` | Visual regression |
| `CHANGELOG_GITHUB_TOKEN` | Release notes |

## Common CI Failure Modes

1. **ESM module resolution** — `dist/` imports must have explicit `.js` extensions.
2. **Flaky tests** — re-run the job; persistent flakes must be filed as issues.
3. **Coverage threshold** — below the per-package target; inspect coverage delta in the run artifacts.
4. **Security scan findings** — review Snyk / Trivy output; update the override list in `package.json` with justification.

