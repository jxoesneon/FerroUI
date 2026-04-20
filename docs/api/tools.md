---
title: Tool API Reference
outline: deep
---

# Tool API Reference

Auto-generated from `@ferroui/tools` and `@ferroui/engine` on every push. Test-only and internal tools (marked with `public: false`) are filtered.

**Total public tools:** 1

::: tip Execution budget
Each layout generation is capped at `MAX_TOOL_CALLS_PER_REQUEST = 10`. See [Tool Registration API](/engineering/backend/Tool_Registration_API_Reference) for the enforcement rules.
:::

## `ferroui.setProvider`

Changes the active LLM provider for the engine. Privileged tool.

🔒 **Sensitive** (bypasses semantic cache) · 🛡️ Permissions: `system.admin`, `engine.control`

### Parameters

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `providerId` | `"openai"` \| `"anthropic"` \| `"google"` \| `"ollama"` \| `"llama-cpp"` | Yes | — |  |
| `options` | object | No | — |  |


### Returns

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `success` | boolean | Yes | — |  |
| `currentProvider` | string | Yes | — |  |


---
