---
title: Prompt Versioning & Rollback Ledger
---

# Prompt Versioning & Rollback Ledger

> **Status:** 📝 Planned. The prompt versioning and rollback ledger captures every production system-prompt revision and its rollback fingerprint.

Every prompt change will be versioned via Changesets and linked to:

- The diff against the previous version.
- The eval harness pass rate at time of promotion.
- The rollback command (`ferroui prompt rollback <version>`).

Until this ledger is published, consult [`ferroui/prompts/`](https://github.com/jxoesneon/FerroUI/tree/main/ferroui/prompts) and the [System Prompt SOP](/ai/System_Prompt_SOP).
