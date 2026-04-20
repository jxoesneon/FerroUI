---
name: quality-gate
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(ts|tsx|js|jsx)$
---

## Post-Hook: Quality Gate

A source file has been written. Running mandatory quality checks.

**Procedure:**

1. **Lint Check:**
   ```bash
   pnpm eslint --max-warnings 0 <modified-file>
   ```

2. **Type Check:**
   ```bash
   pnpm tsc --noEmit
   ```

3. **On Success:** Continue normally. Log "Quality gate passed ✓"

4. **On Failure:**
   - Capture the exact error messages
   - **Revert** the file: `git checkout -- <modified-file>`
   - Report: "Quality gate FAILED: [specific errors]"
   - Re-attempt with corrections:
     a. Fix the specific lint/type errors in the proposed change
     b. Re-apply the corrected version
     c. Re-run the quality gate
   - **Maximum retries: 2** (original attempt + 1 retry)
   - If retry fails: STOP and escalate to the user with full error context

**Critical:** The user's workspace rule states: "the user doesn't like even info messages." Ensure ALL linting issues (including info-level) are resolved before declaring success.
