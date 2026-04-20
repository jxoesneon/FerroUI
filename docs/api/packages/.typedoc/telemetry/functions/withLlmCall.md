[**@ferroui/telemetry**](../README.md)

***

> **withLlmCall**\<`T`\>(`info`, `fn`): `Promise`\<`T`\>

Defined in: [wrappers.ts:10](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/wrappers.ts#L10)

Wraps an LLM call with instrumentation

## Type Parameters

### T

`T`

## Parameters

### info

[`LlmCallInfo`](../interfaces/LlmCallInfo.md)

### fn

(`span`) => `Promise`\<`T`\>

## Returns

`Promise`\<`T`\>
