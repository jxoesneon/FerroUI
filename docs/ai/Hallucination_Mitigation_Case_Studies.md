---
title: Hallucination Mitigation Case Studies
---

# Hallucination Mitigation Case Studies

> **Status:** 📝 Planned. This page will collect real examples of layout-generation failures and the mitigations deployed against them.

Each case study will include:

- **The reproduction prompt** and provider/model that produced the failure.
- **The malformed layout** (raw JSON).
- **The schema violation** or semantic defect detected.
- **The mitigation** — prompt change, schema tightening, eval addition, or repair rule.
- **Regression coverage** — the eval harness test that locks the fix in place.

Until this page ships, see the [System Prompt SOP](/ai/System_Prompt_SOP) and the [Prompt Evaluation Rubric](/ai/Prompt_Evaluation_Rubric_Testing_Playbook).
