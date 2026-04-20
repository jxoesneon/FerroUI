[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/providers/router.ts:41](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L41)

## Implements

- [`LlmProvider`](../../base/interfaces/LlmProvider.md)

## Constructors

### Constructor

> **new ProviderRouter**(`providers`): `ProviderRouter`

Defined in: [engine/src/providers/router.ts:47](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L47)

#### Parameters

##### providers

[`RoutedProvider`](../interfaces/RoutedProvider.md)[]

#### Returns

`ProviderRouter`

## Properties

### contextWindowTokens

> `readonly` **contextWindowTokens**: `number`

Defined in: [engine/src/providers/router.ts:43](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L43)

#### Implementation of

[`LlmProvider`](../../base/interfaces/LlmProvider.md).[`contextWindowTokens`](../../base/interfaces/LlmProvider.md#contextwindowtokens)

***

### health

> `private` **health**: `Map`\<`string`, [`ProviderHealth`](../interfaces/ProviderHealth.md)\>

Defined in: [engine/src/providers/router.ts:45](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L45)

***

### id

> `readonly` **id**: `"router"` = `'router'`

Defined in: [engine/src/providers/router.ts:42](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L42)

#### Implementation of

[`LlmProvider`](../../base/interfaces/LlmProvider.md).[`id`](../../base/interfaces/LlmProvider.md#id)

***

### providers

> `private` `readonly` **providers**: [`RoutedProvider`](../interfaces/RoutedProvider.md)[]

Defined in: [engine/src/providers/router.ts:47](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L47)

## Methods

### completePrompt()

> **completePrompt**(`req`): `Promise`\<[`LlmResponse`](../../../types/interfaces/LlmResponse.md)\>

Defined in: [engine/src/providers/router.ts:115](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L115)

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

Defined in: [engine/src/providers/router.ts:136](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L136)

Estimates tokens for a given text.

#### Parameters

##### text

`string`

#### Returns

`number`

#### Implementation of

[`LlmProvider`](../../base/interfaces/LlmProvider.md).[`estimateTokens`](../../base/interfaces/LlmProvider.md#estimatetokens)

***

### getHealth()

> `private` **getHealth**(`providerId`): [`ProviderHealth`](../interfaces/ProviderHealth.md)

Defined in: [engine/src/providers/router.ts:54](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L54)

#### Parameters

##### providerId

`string`

#### Returns

[`ProviderHealth`](../interfaces/ProviderHealth.md)

***

### getHealthSnapshot()

> **getHealthSnapshot**(): `Record`\<`string`, [`ProviderHealth`](../interfaces/ProviderHealth.md) & `object`\>

Defined in: [engine/src/providers/router.ts:141](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L141)

Returns a snapshot of current provider health for observability

#### Returns

`Record`\<`string`, [`ProviderHealth`](../interfaces/ProviderHealth.md) & `object`\>

***

### isHealthy()

> `private` **isHealthy**(`providerId`): `boolean`

Defined in: [engine/src/providers/router.ts:76](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L76)

#### Parameters

##### providerId

`string`

#### Returns

`boolean`

***

### processPrompt()

> **processPrompt**(`req`): `AsyncGenerator`\<`string`, [`LlmResponse`](../../../types/interfaces/LlmResponse.md), `undefined`\>

Defined in: [engine/src/providers/router.ts:97](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L97)

Processes a prompt and returns an AsyncGenerator for streaming content.
Yields content chunks and eventually returns the final response object.

#### Parameters

##### req

[`LlmRequest`](../../../types/interfaces/LlmRequest.md)

#### Returns

`AsyncGenerator`\<`string`, [`LlmResponse`](../../../types/interfaces/LlmResponse.md), `undefined`\>

#### Implementation of

[`LlmProvider`](../../base/interfaces/LlmProvider.md).[`processPrompt`](../../base/interfaces/LlmProvider.md#processprompt)

***

### recordFailure()

> `private` **recordFailure**(`providerId`): `void`

Defined in: [engine/src/providers/router.ts:65](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L65)

#### Parameters

##### providerId

`string`

#### Returns

`void`

***

### recordSuccess()

> `private` **recordSuccess**(`providerId`): `void`

Defined in: [engine/src/providers/router.ts:58](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L58)

#### Parameters

##### providerId

`string`

#### Returns

`void`

***

### selectCandidates()

> `private` **selectCandidates**(): [`RoutedProvider`](../interfaces/RoutedProvider.md)[]

Defined in: [engine/src/providers/router.ts:91](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/providers/router.ts#L91)

Returns providers sorted cheapest-first, filtered to healthy ones

#### Returns

[`RoutedProvider`](../interfaces/RoutedProvider.md)[]
