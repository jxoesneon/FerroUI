# ADR-008: Forward Compatibility Strategy

**Status:** Accepted  
**Date:** 2025-04-12  
**Deciders:** Architecture Team, DevOps Team  
**Consulted:** Frontend Team, Platform Team, Security Team  

---

## Context

Following a critical git failure and dependency corruption incident, the FerroUI monorepo underwent a complete restoration. This event highlighted the fragility of our dependency management and build pipeline. Key issues encountered:

- TypeScript 6.0 breaking changes (`esModuleInterop` removal, `ignoreDeprecations` requirement)
- ESM/CommonJS interop failures with `execa` and other dual-mode packages
- Workspace dependency resolution failures using `"*"` vs `"workspace:*"`
- Node.js version incompatibilities (v24 → v25 migration required)
- Build tool encoding issues and terminal corruption
- Cloudflare Workers `nodejs_compat` flag requirements for built-in modules

## Decision

We will establish a **Forward Compatibility Policy** with the following pillars:

### 1. Dependency Version Pinning Strategy

| Category | Strategy | Example |
|----------|----------|---------|
| Runtime (Node.js) | Pin to LTS or Current stable | `v25.x` (Current) |
| TypeScript | Pin to latest stable minor | `^6.0.0` |
| Critical build tools | Pin exact versions | `pnpm@10.33.0` |
| Internal packages | Always use `workspace:*` | `"@ferroui/schema": "workspace:*"` |
| External runtime deps | Caret for patch updates only | `"^18.2.0"` → `"^18.2.0"` |

### 2. Workspace Protocol Enforcement

All internal monorepo dependencies MUST use `workspace:*` protocol:

```json
{
  "dependencies": {
    "@ferroui/schema": "workspace:*",
    "@ferroui/engine": "workspace:*"
  }
}
```

This prevents:
- 404 fetch errors from npm registry for unpublished packages
- Version drift between workspace packages
- Dependency resolution ambiguity

### 3. TypeScript Compatibility Mode

All `tsconfig.json` files MUST include:

```json
{
  "compilerOptions": {
    "ignoreDeprecations": "6.0",
    "types": ["node"]
  }
}
```

Rationale:
- TypeScript 6.0 deprecates `esModuleInterop`, `baseUrl`, `paths`
- `ignoreDeprecations` buys time for gradual migration
- Explicit `types` prevents "Cannot find type definition file for 'node'" errors

### 4. Node.js Version Management

Standardize on **nvm** (or nvm-windows) with `.nvmrc`:

```
25.9.0
```

CI/CD and local development must respect this version.

### 5. Lockfile Policy

- **Primary:** `pnpm-lock.yaml` (pnpm is the mandated package manager)
- **Forbidden:** `package-lock.json` (npm), `yarn.lock` (Yarn)
- **Commit:** Lockfiles must be committed for reproducible builds

### 6. Edge Runtime Compatibility

Cloudflare Workers require explicit Node.js compatibility:

```toml
# wrangler.toml
compatibility_date = "2025-04-11"
compatibility_flags = ["nodejs_compat"]
```

This enables built-in modules (`url`, `path`, `util`, `stream`) in the Workers runtime.

## Consequences

### Positive

- **Reproducible builds** across all environments
- **Clear upgrade paths** with documented compatibility layers
- **Reduced build failures** from version drift
- **Faster recovery** from future dependency corruption
- **Unified tooling** (pnpm, nvm, TypeScript 6.x)

### Negative

- **Explicit migration work** required for each major TypeScript/Node.js release
- `ignoreDeprecations` is technical debt that must eventually be resolved
- **Rigidity** may slow adoption of bleeding-edge features

### Mitigations

- Quarterly review of `ignoreDeprecations` flags
- Automated CI matrix testing against next Node.js version
- Documented migration guides for major version bumps

## Related Decisions

- ADR-001: Dual-Phase Pipeline Architecture
- ADR-004: Component Registry Versioning

## References

- [Node.js Release Schedule](https://nodejs.org/en/about/previous-releases)
- [TypeScript 6.0 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
- [pnpm Workspace Protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)
- [Cloudflare Workers Node.js Compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)

---

## Migration Checklist

- [x] Delete `package-lock.json`
- [x] Update all workspace deps to `workspace:*`
- [x] Add `ignoreDeprecations: "6.0"` to all tsconfigs
- [x] Add `types: ["node"]` to all tsconfigs
- [x] Create `.nvmrc` with `25.9.0`
- [x] Add `nodejs_compat` to edge wrangler.toml
- [x] Commit `pnpm-workspace.yaml`
- [ ] Update CI/CD to enforce Node.js version
- [ ] Add pre-commit hook to reject `package-lock.json`
