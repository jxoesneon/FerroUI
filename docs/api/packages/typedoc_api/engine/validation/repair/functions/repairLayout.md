[**@ferroui/engine**](../../../README.md)

***

> **repairLayout**(`provider`, `originalPrompt`, `invalidLayout`, `errors`, `context`, `attempt?`, `maxAttempts?`): `Promise`\<\{ `layout`: `FerroUIComponent`; `locale`: `string`; `metadata?`: \{ `cacheHit?`: `boolean`; `generatedAt`: `string`; `latencyMs?`: `number`; `model?`: `string`; `provider?`: `string`; `repairAttempts?`: `number`; \}; `requestId`: `string`; `schemaVersion`: `string`; \}\>

Defined in: [engine/src/validation/repair.ts:62](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/validation/repair.ts#L62)

Self-healing repair loop

## Parameters

### provider

[`LlmProvider`](../../../providers/base/interfaces/LlmProvider.md)

### originalPrompt

`string`

### invalidLayout

`any`

### errors

`ValidationIssue`[]

### context

[`RequestContext`](../../../types/interfaces/RequestContext.md)

### attempt?

`number` = `1`

### maxAttempts?

`number` = `3`

## Returns

`Promise`\<\{ `layout`: `FerroUIComponent`; `locale`: `string`; `metadata?`: \{ `cacheHit?`: `boolean`; `generatedAt`: `string`; `latencyMs?`: `number`; `model?`: `string`; `provider?`: `string`; `repairAttempts?`: `number`; \}; `requestId`: `string`; `schemaVersion`: `string`; \}\>
