# Monorepo Architecture & Package Governance

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Status:** Approved  
**Owner:** Platform Engineering Team

---

## 1. Overview

This document defines the monorepo structure, package governance policies, and dependency management strategies for the FerroUI UI project. FerroUI UI uses a Turborepo + pnpm monorepo architecture to manage multiple applications and shared packages.

---

## 2. Repository Structure

```
ferroui-ui/
├── apps/                          # Deployable applications
│   ├── web/                       # React web application (SaaS)
│   ├── desktop/                   # Tauri desktop application
│   └── edge/                      # Cloudflare Worker edge runtime
│
├── packages/                      # Shared packages
│   ├── engine/                    # Core orchestration engine
│   ├── registry/                  # Component registry & Atomic library
│   ├── schema/                    # FerroUILayout Zod schemas
│   ├── tools/                     # Tool registration helpers
│   ├── telemetry/                 # OpenTelemetry instrumentation
│   ├── i18n/                      # Internationalization utilities
│   ├── shared/                    # Shared utilities and types
│   └── config/                    # Shared configuration (eslint, tsconfig, etc.)
│
├── ferroui/                         # AI-specific artifacts
│   ├── prompts/                   # Versioned system prompts
│   └── evals/                     # Prompt evaluation suite
│
├── docs/                          # Documentation
├── scripts/                       # Build and automation scripts
├── .github/                       # GitHub workflows and templates
├── turbo.json                     # Turborepo configuration
├── pnpm-workspace.yaml            # pnpm workspace configuration
└── package.json                   # Root package.json
```

---

## 3. Package Categories

### 3.1 Application Packages (`apps/`)

| Package | Purpose | Deployment Target |
|---------|---------|-------------------|
| `web` | React SPA/SSR application | Vercel, AWS, GCP |
| `desktop` | Tauri-based desktop shell | macOS, Windows, Linux |
| `edge` | Cloudflare Worker runtime | Cloudflare Edge |

**Rules:**
- Applications depend on packages, never on other applications
- Applications define their own deployment configuration
- Applications may have environment-specific code

### 3.2 Core Packages (`packages/`)

| Package | Purpose | Dependencies |
|---------|---------|--------------|
| `engine` | Orchestration engine core | `schema`, `telemetry` |
| `registry` | Component registry & Atomic components | `schema`, `shared` |
| `schema` | Zod schemas for FerroUILayout | `shared` |
| `tools` | Tool registration & built-in tools | `schema`, `telemetry` |
| `telemetry` | OpenTelemetry instrumentation | `shared` |
| `i18n` | Locale resolution & string externalization | `shared` |
| `shared` | Shared utilities, types, constants | None (leaf package) |
| `config` | Shared ESLint, TypeScript, Prettier configs | None |

**Rules:**
- Packages form a directed acyclic graph (DAG)
- Leaf packages (`shared`, `config`) have no internal dependencies
- Core packages must be platform-agnostic where possible

---

## 4. Dependency Management

### 4.1 Internal Dependencies

```
shared (leaf)
  ▲
  ├── schema
  │   ▲
  │   ├── engine
  │   ├── registry
  │   └── tools
  │
  ├── telemetry
  │   ▲
  │   ├── engine
  │   └── tools
  │
  └── i18n
      ▲
      └── registry
```

### 4.2 External Dependencies

**Version Pinning Strategy:**

| Category | Strategy | Rationale |
|----------|----------|-----------|
| Runtime dependencies | Latest stable version | Modern feature access & security |
| Dev dependencies | Latest stable version | Modern tooling |
| Peer dependencies | Wide compatible range | Interoperability |

**Key Runtime Dependencies Policy:**

All production-critical dependencies (e.g., `react`, `zod`, `framer-motion`) must be kept at the **latest available stable version**. Version pinning is discouraged unless a specific breaking change requires a temporary hold.

### 4.3 Dependency Update Policy

| Frequency | Action | Owner |
|-----------|--------|-------|
| Continuous | Automated updates via Dependabot / Agentic Audits | Platform Team |
| Weekly | Minor/Patch batch updates | Platform Team |
| Monthly | Major version evaluation and migration | Architecture Team |
| On-demand | Critical security patches | Security Team |

---

## 5. Package Publishing

### 5.1 Versioning Strategy

FerroUI UI follows **Semantic Versioning** (SemVer) for all packages:

```
MAJOR.MINOR.PATCH
```

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking API change | MAJOR | `1.2.3` → `2.0.0` |
| New feature, backward compatible | MINOR | `1.2.3` → `1.3.0` |
| Bug fix, backward compatible | PATCH | `1.2.3` → `1.2.4` |

### 5.2 Changeset Workflow

All changes to packages require a changeset:

```bash
# Create a changeset
pnpm changeset

# Select affected packages
# Describe the change
# Commit the generated .changeset/*.md file
```

**Changeset Categories:**
- `major` — Breaking changes requiring migration
- `minor` — New features
- `patch` — Bug fixes and documentation

### 5.3 Release Process

```
1. PR merged with changeset ──▶ 2. Changeset bot aggregates
                                    │
                                    ▼
3. Version Packages PR created ──▶ 4. Review and merge
                                    │
                                    ▼
5. Packages published to npm ──▶ 6. GitHub release created
```

---

## 6. Build System

### 6.1 Turborepo Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 6.2 Build Outputs

| Package | Output Directory | Output Types |
|---------|------------------|--------------|
| `engine` | `dist/` | CJS, ESM, TypeScript declarations |
| `registry` | `dist/` | CJS, ESM, TypeScript declarations |
| `schema` | `dist/` | CJS, ESM, TypeScript declarations |
| `web` | `.next/` | Static export or SSR bundle |
| `desktop` | `src-tauri/target/` | Platform-specific binaries |
| `edge` | `dist/` | Cloudflare Worker bundle |

### 6.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '25'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run lint type-check test build
```

---

## 7. Code Quality Standards

### 7.1 Linting & Formatting

| Tool | Purpose | Configuration |
|------|---------|---------------|
| ESLint | Code linting | `@ferroui/config/eslint` |
| Prettier | Code formatting | `@ferroui/config/prettier` |
| TypeScript | Type checking | `@ferroui/config/typescript` |

### 7.2 Pre-commit Hooks

```yaml
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
```

```json
// lint-staged.config.js
module.exports = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md}': ['prettier --write'],
};
```

### 7.3 Test Coverage Requirements

| Package | Minimum Coverage | Critical Paths |
|---------|------------------|----------------|
| `engine` | 90% | Orchestration pipeline, validation |
| `registry` | 85% | Component rendering, action routing |
| `schema` | 95% | All Zod validators |
| `tools` | 80% | Tool execution, permission checks |
| `telemetry` | 80% | Trace emission, error handling |

---

## 8. Package API Stability

### 8.1 Public API Definition

Public APIs are explicitly exported in package `index.ts`:

```typescript
// packages/engine/src/index.ts
export { OrchestrationEngine } from './engine';
export { createPipeline } from './pipeline';
export type { PipelineConfig, PipelineResult } from './types';

// Internal utilities NOT exported
// export { internalHelper } from './internal'; // ❌ Not exported
```

### 8.2 API Deprecation Policy

1. **Deprecation Notice:** Mark with `@deprecated` JSDoc tag
2. **Migration Guide:** Document in CHANGELOG.md
3. **Grace Period:** Minimum 1 major version before removal
4. **Runtime Warning:** Optional console warning in development

```typescript
/**
 * @deprecated Use `createPipeline` instead. Will be removed in v3.0.0
 * @see {@link createPipeline}
 */
export function oldPipeline(): void {
  // ...
}
```

---

## 9. Security & Compliance

### 9.1 Dependency Scanning

| Tool | Purpose | Integration |
|------|---------|-------------|
| Snyk | Vulnerability scanning | CI pipeline, weekly reports |
| npm audit | Built-in audit | Pre-commit hook |
| License checker | License compliance | CI pipeline |

### 9.2 Prohibited Dependencies

The following are prohibited in production code:

- Packages with GPL/AGPL licenses in dependencies
- Unmaintained packages (no updates in 2+ years)
- Packages with known critical vulnerabilities
- Packages not in the npm registry (git URLs allowed with approval)

---

## 10. Documentation Requirements

### 10.1 Package README Requirements

Every package must include:

```markdown
# @ferroui/[package-name]

## Installation
## Usage
## API Reference
## Configuration
## Examples
```

### 10.2 Inline Documentation

- All public APIs must have JSDoc comments
- Complex algorithms must have inline comments
- Type definitions must be documented

---

## 11. Related Documents

- [System Architecture Document](./System_Architecture_Document.md)
- [Component Development Guidelines](../engineering/frontend/Component_Development_Guidelines.md)
- [Tool Registration API Reference](../engineering/backend/Tool_Registration_API_Reference.md)
- [Security Threat Model](../security/Security_Threat_Model.md)

---

## 12. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Platform Team | Initial release |
