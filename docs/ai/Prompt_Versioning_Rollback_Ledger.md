---
title: Prompt Versioning & Rollback Ledger
---

# Prompt Versioning & Rollback Ledger

This ledger tracks production system-prompt revisions, their eval performance, and the rollback fingerprints used by the CLI.

## Current Production Version: `v1.2.4` (Active)

| Version | Date | Changes | Eval Pass Rate | Rollback ID |
|---------|------|---------|----------------|-------------|
| **v1.2.4** | 2026-04-18 | Optimized tool-selection logic for multi-modal inputs | 98.4% | `p_8f2d9e` |
| **v1.2.3** | 2026-04-10 | Fixed edge case in RTL locale resolution | 97.2% | `p_3c1a2b` |
| **v1.2.0** | 2026-03-25 | Major refactor: introduced Dual-Phase chain-of-thought | 94.5% | `p_0e9f8a` |
| **v1.1.8** | 2026-03-12 | Added WCAG 2.1 AA compliance requirements to system prompt | 92.1% | `p_d4c3b2` |

## How to Rollback

If a new prompt version causes regressions in production, use the `ferroui prompt rollback` command. This updates the `PromptRegistry` in the shared configuration without requiring a redeploy of the engine.

```bash
# Rollback to the previous stable version
ferroui prompt rollback v1.2.3

# Rollback using a specific fingerprint
ferroui prompt rollback --id p_3c1a2b
```

## Continuous Evaluation

Every PR that modifies `packages/engine/prompts/` must run the full eval suite:

```bash
pnpm run test:evals
```

A passing rate of **>95%** on the `Core-v4` dataset is required for promotion to production.

---
Resources:
- [Prompt Evaluation Rubric](/ai/Prompt_Evaluation_Rubric_Testing_Playbook)
- [System Prompt SOP](/ai/System_Prompt_SOP)
