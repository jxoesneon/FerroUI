[**@ferroui/engine**](../../README.md)

***

Defined in: [engine/src/engine.ts:14](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L14)

## Constructors

### Constructor

> **new FerroUIEngine**(`provider`, `config?`): `FerroUIEngine`

Defined in: [engine/src/engine.ts:18](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L18)

#### Parameters

##### provider

[`LlmProvider`](../../providers/base/interfaces/LlmProvider.md)

##### config?

`Partial`\<[`EngineConfig`](../../types/interfaces/EngineConfig.md)\>

#### Returns

`FerroUIEngine`

## Properties

### config

> `private` **config**: [`EngineConfig`](../../types/interfaces/EngineConfig.md)

Defined in: [engine/src/engine.ts:16](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L16)

***

### provider

> `private` **provider**: [`LlmProvider`](../../providers/base/interfaces/LlmProvider.md)

Defined in: [engine/src/engine.ts:15](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L15)

## Methods

### getSafeModeLayout()

> `private` **getSafeModeLayout**(`requestId`, `locale`): `any`

Defined in: [engine/src/engine.ts:133](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L133)

Generates a static, pre-built layout for use in Safe Mode.

#### Parameters

##### requestId

`string`

##### locale

`string`

#### Returns

`any`

***

### process()

> **process**(`prompt`, `context`): `AsyncGenerator`\<[`EngineChunk`](../../types/interfaces/EngineChunk.md), `void`, `undefined`\>

Defined in: [engine/src/engine.ts:81](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L81)

Main entry point for the FerroUI engine.
Processes a user prompt through the Dual-Phase Pipeline.

#### Parameters

##### prompt

`string`

##### context

[`RequestContext`](../../types/interfaces/RequestContext.md)

#### Returns

`AsyncGenerator`\<[`EngineChunk`](../../types/interfaces/EngineChunk.md), `void`, `undefined`\>

***

### registerSystemTools()

> `private` **registerSystemTools**(): `void`

Defined in: [engine/src/engine.ts:33](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L33)

Registers privileged system tools for engine control.

#### Returns

`void`

***

### setProvider()

> **setProvider**(`provider`): `void`

Defined in: [engine/src/engine.ts:156](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L156)

#### Parameters

##### provider

[`LlmProvider`](../../providers/base/interfaces/LlmProvider.md)

#### Returns

`void`

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [engine/src/engine.ts:160](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/engine.ts#L160)

#### Parameters

##### config

`Partial`\<[`EngineConfig`](../../types/interfaces/EngineConfig.md)\>

#### Returns

`void`
