[**@ferroui/telemetry**](../README.md)

***

> **withSpan**\<`T`\>(`name`, `fn`, `options?`, `ctx?`): `Promise`\<`T`\>

Defined in: [tracer.ts:84](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/tracer.ts#L84)

Executes a function within a span

## Type Parameters

### T

`T`

## Parameters

### name

`string`

### fn

(`span`) => `Promise`\<`T`\>

### options?

`SpanOptions`

### ctx?

`Context`

## Returns

`Promise`\<`T`\>
