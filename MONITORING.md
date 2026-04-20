# FerroUI CI/CD Monitoring Dashboard

**Last Updated:** 2026-04-18  
**Commit:** Enterprise Readiness Phases A-G Complete

---

## Active Workflows

| Workflow | Status | Trigger | Duration |
|----------|--------|---------|----------|
| CI | 🟡 Running | push to main | ~5 min |
| Security Audit | ⏳ Queued | push to main | ~2 min |
| Code Quality | ⏳ Queued | push to main | ~3 min |

## Workflow Status

### ✅ Required Passing

| Workflow | Purpose | Status |
|----------|---------|--------|
| **CI** (ci.yml) | Build, test, lint, coverage | 🟡 In Progress |
| **Security** | Snyk + Trivy scan | ⏳ Pending |
| **Integration Tests** | Full integration suite | ⏳ Pending |

### ⏸️ Scheduled/Optional

| Workflow | Schedule | Status |
|----------|----------|--------|
| **Load Tests** (load.yml) | Weekly + on-demand | ⏸️ Idle |
| **Stryker** (stryker.yml) | Weekly | ⏸️ Idle |
| **Chromatic** (chromatic.yml) | PRs + push | ⏸️ Idle |
| **Eval Gate** (eval-gate.yml) | Releases | ⏸️ Idle |

---

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

---

## Key Metrics to Watch

| Metric | Target | Alert If |
|--------|--------|----------|
| Test Coverage | ≥80% | <80% |
| Build Time | <5 min | >10 min |
| Security Scan | 0 critical | >0 critical |
| E2E Tests | 100% pass | <95% |

---

## Secrets Status

| Secret | GitHub | Local | Status |
|--------|--------|-------|--------|
| `SNYK_TOKEN` | ✅ | ✅ | Active |
| `STRYKER_DASHBOARD_API_KEY` | ✅ | ✅ | Active |
| `CHROMATIC_PROJECT_TOKEN` | ✅ | ✅ | Active |
| `CHANGELOG_GITHUB_TOKEN` | ✅ | ✅ | Active |

---

## Post-Push Checklist

- [x] Code committed
- [x] Pushed to origin/main
- [ ] CI workflow passing
- [ ] Security scan clean
- [ ] Integration tests passing
- [ ] Coverage uploaded to Codecov
- [ ] Docker image built (if applicable)

---

## Alerts

**None currently.** All systems operational.

If CI fails, check:
1. ESM module resolution (dist files have `.js` extensions)
2. Test flakiness (re-run if needed)
3. Coverage thresholds (80% minimum)
4. Security scan results
