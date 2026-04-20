[**@ferroui/tools**](../README.md)

***

> **executeToolDirect**\<`TParams`, `TResult`\>(`tool`, `params`, `context?`): `Promise`\<`output`\<`TResult`\>\>

Defined in: [packages/tools/src/testing.ts:43](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/testing.ts#L43)

Executes a tool directly for testing purposes.
Bypasses the registry and performs validation.
Defined in Section 8.2 and 8.3 of the specification.

## Type Parameters

### TParams

`TParams` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

### TResult

`TResult` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### tool

[`ToolDefinition`](../interfaces/ToolDefinition.md)\<`TParams`, `TResult`\>

### params

`unknown`

### context?

`Partial`\<[`ToolContext`](../interfaces/ToolContext.md)\>

## Returns

`Promise`\<`output`\<`TResult`\>\>
