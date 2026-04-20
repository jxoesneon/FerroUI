[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/providers/anthropic.ts:26](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L26)

## Implements

- [`LlmProvider`](../../base/interfaces/LlmProvider.md)

## Constructors

### Constructor

> **new AnthropicProvider**(`options?`): `AnthropicProvider`

Defined in: [engine/src/providers/anthropic.ts:32](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L32)

#### Parameters

##### options?

[`AnthropicProviderOptions`](../interfaces/AnthropicProviderOptions.md) = `{}`

#### Returns

`AnthropicProvider`

## Properties

### client

> `private` **client**: `Anthropic`

Defined in: [engine/src/providers/anthropic.ts:29](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L29)

***

### contextWindowTokens

> `readonly` **contextWindowTokens**: `200000` = `200000`

Defined in: [engine/src/providers/anthropic.ts:28](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L28)

#### Implementation of

[`LlmProvider`](../../base/interfaces/LlmProvider.md).[`contextWindowTokens`](../../base/interfaces/LlmProvider.md#contextwindowtokens)

***

### id

> `readonly` **id**: `"anthropic"` = `'anthropic'`

Defined in: [engine/src/providers/anthropic.ts:27](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L27)

#### Implementation of

[`LlmProvider`](../../base/interfaces/LlmProvider.md).[`id`](../../base/interfaces/LlmProvider.md#id)

***

### model

> `private` **model**: `string`

Defined in: [engine/src/providers/anthropic.ts:30](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L30)

## Methods

### buildSystemParam()

> `private` **buildSystemParam**(`systemPrompt`, `enablePromptCache?`): `string` \| `ContentBlockParam`[]

Defined in: [engine/src/providers/anthropic.ts:40](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L40)

Builds system param — adds ephemeral cache_control when enablePromptCache is set (B2)

#### Parameters

##### systemPrompt

`string`

##### enablePromptCache?

`boolean`

#### Returns

`string` \| `ContentBlockParam`[]

***

### completePrompt()

> **completePrompt**(`req`): `Promise`\<[`LlmResponse`](../../../types/interfaces/LlmResponse.md)\>

Defined in: [engine/src/providers/anthropic.ts:117](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L117)

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

Defined in: [engine/src/providers/anthropic.ts:169](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L169)

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

Defined in: [engine/src/providers/anthropic.ts:54](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/anthropic.ts#L54)

Processes a prompt and returns an AsyncGenerator for streaming content.
Yields content chunks and eventually returns the final response object.

#### Parameters

##### req

[`LlmRequest`](../../../types/interfaces/LlmRequest.md)

#### Returns

`AsyncGenerator`\<`string`, [`LlmResponse`](../../../types/interfaces/LlmResponse.md), `undefined`\>

#### Implementation of

[`LlmProvider`](../../base/interfaces/LlmProvider.md).[`processPrompt`](../../base/interfaces/LlmProvider.md#processprompt)
