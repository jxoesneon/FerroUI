[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/providers/llama-cpp.ts:35](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/llama-cpp.ts#L35)

## Implements

- [`LlmProvider`](../../base/interfaces/LlmProvider.md)

## Constructors

### Constructor

> **new LlamaCppProvider**(`options?`): `LlamaCppProvider`

Defined in: [engine/src/providers/llama-cpp.ts:40](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/llama-cpp.ts#L40)

#### Parameters

##### options?

[`LlamaCppProviderOptions`](../interfaces/LlamaCppProviderOptions.md) = `{}`

#### Returns

`LlamaCppProvider`

## Properties

### baseURL

> `private` **baseURL**: `string`

Defined in: [engine/src/providers/llama-cpp.ts:38](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/llama-cpp.ts#L38)

***

### contextWindowTokens

> `readonly` **contextWindowTokens**: `32768` = `32768`

Defined in: [engine/src/providers/llama-cpp.ts:37](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/llama-cpp.ts#L37)

#### Implementation of

[`LlmProvider`](../../base/interfaces/LlmProvider.md).[`contextWindowTokens`](../../base/interfaces/LlmProvider.md#contextwindowtokens)

***

### id

> `readonly` **id**: `"llama-cpp"` = `'llama-cpp'`

Defined in: [engine/src/providers/llama-cpp.ts:36](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/llama-cpp.ts#L36)

#### Implementation of

[`LlmProvider`](../../base/interfaces/LlmProvider.md).[`id`](../../base/interfaces/LlmProvider.md#id)

## Methods

### completePrompt()

> **completePrompt**(`req`): `Promise`\<[`LlmResponse`](../../../types/interfaces/LlmResponse.md)\>

Defined in: [engine/src/providers/llama-cpp.ts:103](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/llama-cpp.ts#L103)

Non-streaming version for simpler tasks like repair or small data generation.

#### Parameters

##### req

[`LlmRequest`](../../../types/interfaces/LlmRequest.md)

#### Returns

`Promise`\<[`LlmResponse`](../../../types/interfaces/LlmResponse.md)\>

#### Implementation of

[`LlmProvider`](../../base/interfaces/LlmProvider.md).[`completePrompt`](../../base/interfaces/LlmProvider.md#completeprompt)

***

### estimateTokens()

> **estimateTokens**(`text`): `number`

Defined in: [engine/src/providers/llama-cpp.ts:130](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/llama-cpp.ts#L130)

Estimates tokens for a given text.

#### Parameters

##### text

`string`

#### Returns

`number`

#### Implementation of

[`LlmProvider`](../../base/interfaces/LlmProvider.md).[`estimateTokens`](../../base/interfaces/LlmProvider.md#estimatetokens)

***

### processPrompt()

> **processPrompt**(`req`): `AsyncGenerator`\<`string`, [`LlmResponse`](../../../types/interfaces/LlmResponse.md), `undefined`\>

Defined in: [engine/src/providers/llama-cpp.ts:44](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/llama-cpp.ts#L44)

Processes a prompt and returns an AsyncGenerator for streaming content.
Yields content chunks and eventually returns the final response object.

#### Parameters

##### req

[`LlmRequest`](../../../types/interfaces/LlmRequest.md)

#### Returns

`AsyncGenerator`\<`string`, [`LlmResponse`](../../../types/interfaces/LlmResponse.md), `undefined`\>

#### Implementation of

[`LlmProvider`](../../base/interfaces/LlmProvider.md).[`processPrompt`](../../base/interfaces/LlmProvider.md#processprompt)
