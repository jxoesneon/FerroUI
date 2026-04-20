---
title: Knowledge Base Article Templates
---

# Knowledge Base Article Templates

Use these templates when creating new internal or external Knowledge Base (KB) articles for FerroUI. Consistency helps users and support agents find information faster.

## Template 1: Integration & Setup

**Goal:** Help users connect FerroUI to their LLM providers.

- **Title:** Connecting [Provider Name] to FerroUI
- **Overview:** Brief description of what this integration enables.
- **Prerequisites:** API keys, ENV variables, minimum package versions.
- **Steps:**
    1. Configure `FERROUI_PROVIDER` environment variable.
    2. Add [Provider] to `LlmProviderRegistry`.
    3. Run `ferroui doctor` to verify connection.
- **Common Gotchas:** Token limits, rate limiting headers, specific region requirements.

## Template 2: Troubleshooting Schema Failures

**Goal:** Guide developers through the repair trace of a failed layout.

- **Title:** Fix: [Error Code] - [Brief Error Description]
- **Symptoms:** How does the UI look? What does the console say?
- **Root Cause:** Explanation of why the LLM produced a malformed layout for this prompt.
- **Resolution:**
    - Example of the failing JSON.
    - The corrected JSON / Schema rule.
    - How to update the component `Atom` to be more resilient.
- **Validation:** Command to run the local eval for this specific case.

## Template 3: Permission Auditing

**Goal:** Resolve "Permission Denied" errors during tool execution.

- **Title:** Troubleshooting Tool Permission Denials
- **Scenario:** User requests a feature, LLM tries to call a tool, but the request context lacks the scope.
- **Verification:** How to use `ferroui tools list --user <id>` to see allowed tools.
- **Fix:** Updating the JWT payload or modifying the `ToolRegistry` permission gate.

---
Resources:
- [End-User FAQ](/support/End_User_FAQ)
- [Known Issues](/support/Known_Issues_Troubleshooting)
- [Support Escalation Paths](/support/Support_Escalation_Paths)
