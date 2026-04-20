[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/security/prompt-firewall.ts:14](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/security/prompt-firewall.ts#L14)

FerroUI Prompt Firewall — Security spec §2.1 / OWASP LLM Top 10 LLM01

Provider-agnostic integration point for external prompt guard services.
Supports three backends, selected via PROMPT_GUARD_PROVIDER env var:

  - "lakera"  → Lakera Guard API  (requires LAKERA_GUARD_API_KEY)
  - "nemo"    → NVIDIA NeMo Guardrails HTTP endpoint  (requires NEMO_GUARD_ENDPOINT)
  - "none"    → Falls through to FerroUI built-in regex detection only (default)

The built-in detector always runs regardless of backend, providing defence-in-depth.

## Properties

### blocked

> **blocked**: `boolean`

Defined in: [engine/src/security/prompt-firewall.ts:15](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/security/prompt-firewall.ts#L15)

***

### provider

> **provider**: `"builtin"` \| `"lakera"` \| `"nemo"` \| `"none"`

Defined in: [engine/src/security/prompt-firewall.ts:18](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/security/prompt-firewall.ts#L18)

***

### reason?

> `optional` **reason?**: `string`

Defined in: [engine/src/security/prompt-firewall.ts:16](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/security/prompt-firewall.ts#L16)

***

### score?

> `optional` **score?**: `number`

Defined in: [engine/src/security/prompt-firewall.ts:17](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/security/prompt-firewall.ts#L17)
