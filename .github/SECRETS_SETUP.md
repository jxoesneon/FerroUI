# GitHub Secrets Setup Guide

This document lists all required GitHub secrets for CI/CD workflows.

## Required Secrets

### Release & Publishing

| Secret | Purpose | Workflow |
|--------|---------|----------|
| `CHANGELOG_GITHUB_TOKEN` | GitHub token for creating releases | `release.yml` |

### Security Scanning

| Secret | Purpose | Workflow |
|--------|---------|----------|
| `SNYK_TOKEN` | Snyk API token for vulnerability scanning | `ci.yml` |

### Testing

| Secret | Purpose | Workflow | Optional |
|--------|---------|----------|----------|
| `STRYKER_DASHBOARD_API_KEY` | Stryker dashboard upload | `stryker.yml` | Yes |
| `CHROMATIC_PROJECT_TOKEN` | Chromatic visual regression | `chromatic.yml` | Yes |

### Deployment (Optional)

| Secret | Purpose | Target |
|--------|---------|--------|
| `VERCEL_TOKEN` | Vercel deployment | Production web |
| `CLOUDFLARE_API_TOKEN` | Wrangler deployment | Edge workers |
| `DOCKER_USERNAME` | Docker Hub push | Container registry |
| `DOCKER_PASSWORD` | Docker Hub auth | Container registry |

## Setup Instructions

### 1. Navigate to Repository Settings

```
GitHub UI → Repository → Settings → Secrets and variables → Actions
```

### 2. Add Repository Secrets

Click "New repository secret" and add each secret:

**CHANGELOG_GITHUB_TOKEN:**
- Generate: GitHub Settings → Developer settings → Personal access tokens
- Scopes: `repo`, `write:packages`

**SNYK_TOKEN:**
- Get from: https://app.snyk.io/account
- Navigate to API Token section

**STRYKER_DASHBOARD_API_KEY** (Optional):
- Get from: https://dashboard.stryker-mutator.io
- Required only if using Stryker cloud dashboard

**CHROMATIC_PROJECT_TOKEN** (Optional):
- Get from: https://www.chromatic.com/start
- Required only for visual regression testing

### 3. Verify Secrets

The workflows have built-in validation that will warn if secrets are missing:

```yaml
- name: Check required secrets
  run: |
    if [ -z "${{ secrets.REQUIRED_SECRET }}" ]; then
      echo "::warning::REQUIRED_SECRET not set"
    fi
```

## Local Development

For local testing, create a `.env` file (never commit):

```bash
# .env
ANTHROPIC_API_KEY=your_key_here
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
```

## Security Notes

- Never commit secrets to the repository
- Rotate secrets quarterly
- Use GitHub Environments for production-specific secrets
- Enable "Require approval for all outside collaborators" in workflow permissions

## Verification

Run the `doctor` command to check local environment:

```bash
pnpm exec ferroui doctor
```
