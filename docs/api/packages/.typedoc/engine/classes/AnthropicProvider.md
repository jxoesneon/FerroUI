[**@ferroui/engine**](../README.md)

***

Defined in: [engine/src/providers/anthropic.ts:26](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L26)

## Implements

- [`LlmProvider`](../interfaces/LlmProvider.md)

## Constructors

### Constructor

> **new AnthropicProvider**(`options?`): `AnthropicProvider`

Defined in: [engine/src/providers/anthropic.ts:32](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L32)

#### Parameters

##### options?

`AnthropicProviderOptions` = `{}`

#### Returns

`AnthropicProvider`

## Properties

### contextWindowTokens

> `readonly` **contextWindowTokens**: `200000` = `200000`

Defined in: [engine/src/providers/anthropic.ts:28](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L28)

#### Implementation of

[`LlmProvider`](../interfaces/LlmProvider.md).[`contextWindowTokens`](../interfaces/LlmProvider.md#contextwindowtokens)

***

### id

> `readonly` **id**: `"anthropic"` = `'anthropic'`

Defined in: [engine/src/providers/anthropic.ts:27](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L27)

#### Implementation of

[`LlmProvider`](../interfaces/LlmProvider.md).[`id`](../interfaces/LlmProvider.md#id)

## Methods

### completePrompt()

> **completePrompt**(`req`): `Promise`\<[`LlmResponse`](../interfaces/LlmResponse.md)\>

Defined in: [engine/src/providers/anthropic.ts:117](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L117)

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

Defined in: [engine/src/providers/anthropic.ts:169](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L169)

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

Defined in: [engine/src/providers/anthropic.ts:54](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L54)

Processes a prompt and returns an AsyncGenerator for streaming content.
Yields content chunks and eventually returns the final response object.

#### Parameters

##### req

[`LlmRequest`](../interfaces/LlmRequest.md)

#### Returns

`AsyncGenerator`\<`string`, [`LlmResponse`](../interfaces/LlmResponse.md), `undefined`\>

#### Implementation of

[`LlmProvider`](../interfaces/LlmProvider.md).[`processPrompt`](../interfaces/LlmProvider.md#processprompt)
