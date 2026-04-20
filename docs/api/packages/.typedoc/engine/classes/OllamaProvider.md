[**@ferroui/engine**](../README.md)

***

Defined in: [engine/src/providers/ollama.ts:17](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/ollama.ts#L17)

## Implements

- [`LlmProvider`](../interfaces/LlmProvider.md)

## Constructors

### Constructor

> **new OllamaProvider**(`options?`): `OllamaProvider`

Defined in: [engine/src/providers/ollama.ts:23](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/ollama.ts#L23)

#### Parameters

##### options?

`OllamaProviderOptions` = `{}`

#### Returns

`OllamaProvider`

## Properties

### contextWindowTokens

> `readonly` **contextWindowTokens**: `128000` = `128000`

Defined in: [engine/src/providers/ollama.ts:19](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/ollama.ts#L19)

#### Implementation of

[`LlmProvider`](../interfaces/LlmProvider.md).[`contextWindowTokens`](../interfaces/LlmProvider.md#contextwindowtokens)

***

### id

> `readonly` **id**: `"ollama"` = `'ollama'`

Defined in: [engine/src/providers/ollama.ts:18](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/ollama.ts#L18)

#### Implementation of

[`LlmProvider`](../interfaces/LlmProvider.md).[`id`](../interfaces/LlmProvider.md#id)

## Methods

### completePrompt()

> **completePrompt**(`req`): `Promise`\<[`LlmResponse`](../interfaces/LlmResponse.md)\>

Defined in: [engine/src/providers/ollama.ts:78](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/ollama.ts#L78)

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

Defined in: [engine/src/providers/ollama.ts:105](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/ollama.ts#L105)

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

Defined in: [engine/src/providers/ollama.ts:28](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/ollama.ts#L28)

Processes a prompt and returns an AsyncGenerator for streaming content.
Yields content chunks and eventually returns the final response object.

#### Parameters

##### req

[`LlmRequest`](../interfaces/LlmRequest.md)

#### Returns

`AsyncGenerator`\<`string`, [`LlmResponse`](../interfaces/LlmResponse.md), `undefined`\>

#### Implementation of

[`LlmProvider`](../interfaces/LlmProvider.md).[`processPrompt`](../interfaces/LlmProvider.md#processprompt)
