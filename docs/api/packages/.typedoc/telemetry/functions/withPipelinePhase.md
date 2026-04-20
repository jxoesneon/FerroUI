[**@ferroui/telemetry**](../README.md)

***

> **withPipelinePhase**\<`T`\>(`phase`, `fn`, `requestId?`): `Promise`\<`T`\>

Defined in: [wrappers.ts:83](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/wrappers.ts#L83)

Wraps a pipeline phase with instrumentation

## Type Parameters

### T

`T`

## Parameters

### phase

[`PipelinePhase`](../enumerations/PipelinePhase.md)

### fn

(`span`) => `Promise`\<`T`\>

### requestId?

`string`

## Returns

`Promise`\<`T`\>
