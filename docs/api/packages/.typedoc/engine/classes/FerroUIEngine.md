[**@ferroui/engine**](../README.md)

***

Defined in: [engine/src/engine.ts:14](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L14)

## Constructors

### Constructor

> **new FerroUIEngine**(`provider`, `config?`): `FerroUIEngine`

Defined in: [engine/src/engine.ts:18](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L18)

#### Parameters

##### provider

[`LlmProvider`](../interfaces/LlmProvider.md)

##### config?

`Partial`\<[`EngineConfig`](../interfaces/EngineConfig.md)\>

#### Returns

`FerroUIEngine`

## Methods

### process()

> **process**(`prompt`, `context`): `AsyncGenerator`\<[`EngineChunk`](../interfaces/EngineChunk.md), `void`, `undefined`\>

Defined in: [engine/src/engine.ts:81](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L81)

Main entry point for the FerroUI engine.
Processes a user prompt through the Dual-Phase Pipeline.

#### Parameters

##### prompt

`string`

##### context

[`RequestContext`](../interfaces/RequestContext.md)

#### Returns

`AsyncGenerator`\<[`EngineChunk`](../interfaces/EngineChunk.md), `void`, `undefined`\>

***

### setProvider()

> **setProvider**(`provider`): `void`

Defined in: [engine/src/engine.ts:156](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L156)

#### Parameters

##### provider

[`LlmProvider`](../interfaces/LlmProvider.md)

#### Returns

`void`

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [engine/src/engine.ts:160](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L160)

#### Parameters

##### config

`Partial`\<[`EngineConfig`](../interfaces/EngineConfig.md)\>

#### Returns

`void`
