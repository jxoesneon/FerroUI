[**@ferroui/engine**](../README.md)

***

Defined in: [engine/src/providers/google.ts:10](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/google.ts#L10)

## Implements

- [`LlmProvider`](../interfaces/LlmProvider.md)

## Constructors

### Constructor

> **new GoogleProvider**(`options?`): `GoogleProvider`

Defined in: [engine/src/providers/google.ts:16](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/google.ts#L16)

#### Parameters

##### options?

`GoogleProviderOptions` = `{}`

#### Returns

`GoogleProvider`

## Properties

### contextWindowTokens

> `readonly` **contextWindowTokens**: `1000000` = `1000000`

Defined in: [engine/src/providers/google.ts:12](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/google.ts#L12)

#### Implementation of

[`LlmProvider`](../interfaces/LlmProvider.md).[`contextWindowTokens`](../interfaces/LlmProvider.md#contextwindowtokens)

***

### id

> `readonly` **id**: `"google"` = `'google'`

Defined in: [engine/src/providers/google.ts:11](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/google.ts#L11)

#### Implementation of

[`LlmProvider`](../interfaces/LlmProvider.md).[`id`](../interfaces/LlmProvider.md#id)

## Methods

### completePrompt()

> **completePrompt**(`req`): `Promise`\<[`LlmResponse`](../interfaces/LlmResponse.md)\>

Defined in: [engine/src/providers/google.ts:54](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/google.ts#L54)

Non-streaming version for simpler tasks like repair or small data generation.

#### Parameters

##### req

[`LlmRequest`](../interfaces/LlmRequest.md)

#### Returns

`Promise`\<[`LlmResponse`](../interfaces/LlmResponse.md)\>

#### Implementation of

[`LlmProvider`](../interfaces/LlmProvider.md).[`completePrompt`](../interfaces/LlmProvider.md#completeprompt)

***

### estimateTokens()

> **estimateTokens**(`text`): `number`

Defined in: [engine/src/providers/google.ts:80](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/google.ts#L80)

Estimates tokens for a given text.

#### Parameters

##### text

`string`

#### Returns

`number`

#### Implementation of

[`LlmProvider`](../interfaces/LlmProvider.md).[`estimateTokens`](../interfaces/LlmProvider.md#estimatetokens)

***

### processPrompt()

> **processPrompt**(`req`): `AsyncGenerator`\<`string`, [`LlmResponse`](../interfaces/LlmResponse.md), `undefined`\>

Defined in: [engine/src/providers/google.ts:21](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/google.ts#L21)

Processes a prompt and returns an AsyncGenerator for streaming content.
Yields content chunks and eventually returns the final response object.

#### Parameters

##### req

[`LlmRequest`](../interfaces/LlmRequest.md)

#### Returns

`AsyncGenerator`\<`string`, [`LlmResponse`](../interfaces/LlmResponse.md), `undefined`\>

#### Implementation of

[`LlmProvider`](../interfaces/LlmProvider.md).[`processPrompt`](../interfaces/LlmProvider.md#processprompt)
