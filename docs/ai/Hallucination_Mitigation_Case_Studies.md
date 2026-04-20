---
title: Hallucination Mitigation Case Studies
---

# Hallucination Mitigation Case Studies

This page collects real-world examples of layout-generation failures (hallucinations) and the mitigations deployed in FerroUI to prevent them.

## Case Study 1: Non-Existent Component Request

- **The Problem:** A prompt for a "Sales Heatmap" resulted in the LLM generating a `<Heatmap />` component that was not in the registry.
- **The Failure:** The renderer crashed when trying to resolve the component identifier.
- **The Mitigation:** 
    - **Schema Tightening:** Updated `FerroUIComponentSchema` to use an `enum` of registered component names instead of a generic string.
    - **Repair Rule:** Added a "Component Substitution" rule to the Dual-Phase Pipeline that maps unknown visualization types to the nearest available `Atom` (e.g., `Card` with `Table`).
- **Regression Coverage:** Added `tests/evals/visualization-fallback.test.ts` to ensure prompts for unsupported charts return valid fallbacks.

## Case Study 2: State Machine Logic Loop

- **The Problem:** An LLM generated a state machine where two states transitioned to each other on the same event, creating an infinite render loop in the client.
- **The Failure:** Client browser hanging/OOM.
- **The Mitigation:**
    - **Validation:** Added a cycle-detection check in `validateLayout` that throws a `StateMachineCycleError` if a direct or indirect loop is detected without a user-action trigger.
    - **Pipeline Repair:** The pipeline now runs a "Logic Pass" to verify that every transition results in a unique state or requires explicit interaction.
- **Regression Coverage:** `packages/schema/src/logic/cycle-detection.test.ts`.

## Case Study 3: Data Type Mismatch in Tools

- **The Problem:** LLM passed a string `"100"` to a tool expecting a `number`, and the tool didn't handle the cast, leading to raw SQL errors.
- **The Failure:** Backend 500 error exposed to user.
- **The Mitigation:**
    - **Zod Enforcement:** All tools now REQUIRE a Zod schema for inputs. The pipeline uses `z.coerce` to safely cast types before execution.
    - **Error Redaction:** Telemetry now redacts raw SQL errors before they reach the layout generation phase.
- **Regression Coverage:** `packages/engine/src/tools/type-coercion.test.ts`.

---
See also:
- [System Prompt SOP](/ai/System_Prompt_SOP)
- [Prompt Evaluation Rubric](/ai/Prompt_Evaluation_Rubric_Testing_Playbook)
