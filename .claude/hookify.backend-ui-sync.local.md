---
name: backend-ui-sync
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: packages/(engine|schema|tools|registry)/src/.*\.(ts|tsx)$
---

## Sync-Hook: Backend → UI Synchronization

A backend package file has been modified. Evaluating frontend impact.

**Automated Assessment:**

1. **Identify the change surface:**
   - What exports, interfaces, types, or data shapes were modified?
   - Were any public API signatures changed (added/removed/renamed)?

2. **Scan frontend consumers:**
   - Check `apps/web/src/` for imports from the modified package
   - Check `apps/desktop/src/` for Tauri-side consumers
   - Search for usage of modified exports across the workspace

3. **If frontend impact is detected:**
   - Activate `ui-ux-pro-max` skill to evaluate visual consistency
   - Generate change summary: "Backend change [X] in `packages/[pkg]` may require adjustment in `apps/[app]/[files]`"
   - Propose specific frontend updates
   - **Wait for user confirmation** before applying UI changes

4. **If no impact:** Log "Sync check passed — no frontend consumers affected" and continue.

**Critical Rule:** Never silently skip this check. Backend-frontend consistency prevents runtime errors and visual regressions.
