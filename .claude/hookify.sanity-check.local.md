---
name: sanity-check
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(ts|tsx|js|jsx|json|css|scss)$
---

## Pre-Hook: Architectural Sanity Check

Before writing to this file, validate the proposed change against the established architecture.

**Mandatory Checks:**

1. **Workspace Rules** — Read `.agent/rules/workspace.md` and verify:
   - Import paths use `workspace:*` specifiers (not relative `../` across packages)
   - File follows the naming convention of its parent package
   - Test files are co-located (`*.test.ts` alongside source)

2. **Package Boundaries** — If this file is inside `packages/*/`:
   - Verify it does NOT import directly from another package's `src/`
   - Verify it uses the package's public API (index.ts exports)
   - Check `package.json` declares the dependency if importing a workspace package

3. **Schema Constraints** — If the file contains `schemaVersion` or `layout`:
   - Run `.claude/hookify.validate-alloy-layout.local.md` validation
   - Ensure the schema version matches the current `@alloy/schema` version

4. **Documentation** — Check `docs/` and relevant `README.md` for:
   - API contracts that the change must respect
   - Architecture decisions (ADRs) that constrain the design

**If a violation is detected:** STOP. Report the constraint, cite the spec file, and propose an alternative.
