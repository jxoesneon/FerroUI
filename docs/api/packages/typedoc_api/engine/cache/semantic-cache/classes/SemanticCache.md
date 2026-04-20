[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/cache/semantic-cache.ts:24](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L24)

## Constructors

### Constructor

> `private` **new SemanticCache**(): `SemanticCache`

Defined in: [engine/src/cache/semantic-cache.ts:30](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L30)

#### Returns

`SemanticCache`

## Properties

### backend

> `private` **backend**: [`CacheBackend`](../../cache-backend/interfaces/CacheBackend.md)

Defined in: [engine/src/cache/semantic-cache.ts:26](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L26)

***

### maxSize

> `private` **maxSize**: `number` = `1000`

Defined in: [engine/src/cache/semantic-cache.ts:28](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L28)

***

### usageOrder

> `private` **usageOrder**: `Set`\<`string`\>

Defined in: [engine/src/cache/semantic-cache.ts:27](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L27)

***

### instance

> `private` `static` **instance**: `SemanticCache`

Defined in: [engine/src/cache/semantic-cache.ts:25](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L25)

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [engine/src/cache/semantic-cache.ts:227](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L227)

#### Returns

`Promise`\<`void`\>

***

### generateKey()

> `private` **generateKey**(`prompt`, `permissions`, `userId`, `toolOutputs`, `classification`): `string`

Defined in: [engine/src/cache/semantic-cache.ts:190](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L190)

#### Parameters

##### prompt

`string`

##### permissions

`string`[]

##### userId

`string`

##### toolOutputs

`Record`\<`string`, `unknown`\>

##### classification

[`DataClassification`](../type-aliases/DataClassification.md)

#### Returns

`string`

***

### get()

> **get**(`prompt`, `permissions`, `userId`, `toolOutputs`): `Promise`\<\{ `layout`: `FerroUIComponent`; `locale`: `string`; `metadata?`: \{ `cacheHit?`: `boolean`; `generatedAt`: `string`; `latencyMs?`: `number`; `model?`: `string`; `provider?`: `string`; `repairAttempts?`: `number`; \}; `requestId`: `string`; `schemaVersion`: `string`; \} \| `undefined`\>

Defined in: [engine/src/cache/semantic-cache.ts:63](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L63)

#### Parameters

##### prompt

`string`

##### permissions

`string`[]

##### userId

`string`

##### toolOutputs

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<\{ `layout`: `FerroUIComponent`; `locale`: `string`; `metadata?`: \{ `cacheHit?`: `boolean`; `generatedAt`: `string`; `latencyMs?`: `number`; `model?`: `string`; `provider?`: `string`; `repairAttempts?`: `number`; \}; `requestId`: `string`; `schemaVersion`: `string`; \} \| `undefined`\>

***

### invalidate()

> **invalidate**(`toolName`, `params?`): `Promise`\<`void`\>

Defined in: [engine/src/cache/semantic-cache.ts:151](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L151)

#### Parameters

##### toolName

`string`

##### params?

`unknown`

#### Returns

`Promise`\<`void`\>

***

### invalidatePattern()

> **invalidatePattern**(`pattern`): `Promise`\<`void`\>

Defined in: [engine/src/cache/semantic-cache.ts:174](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L174)

#### Parameters

##### pattern

`string`

#### Returns

`Promise`\<`void`\>

***

### resolveClassification()

> `private` **resolveClassification**(`toolOutputs`): [`DataClassification`](../type-aliases/DataClassification.md)

Defined in: [engine/src/cache/semantic-cache.ts:53](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L53)

#### Parameters

##### toolOutputs

`Record`\<`string`, `unknown`\>

#### Returns

[`DataClassification`](../type-aliases/DataClassification.md)

***

### set()

> **set**(`prompt`, `permissions`, `userId`, `toolOutputs`, `layout`, `classification`): `Promise`\<`void`\>

Defined in: [engine/src/cache/semantic-cache.ts:114](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L114)

#### Parameters

##### prompt

`string`

##### permissions

`string`[]

##### userId

`string`

##### toolOutputs

`Record`\<`string`, `unknown`\>

##### layout

###### layout

`FerroUIComponent`

###### locale

`string`

###### metadata?

\{ `cacheHit?`: `boolean`; `generatedAt`: `string`; `latencyMs?`: `number`; `model?`: `string`; `provider?`: `string`; `repairAttempts?`: `number`; \}

###### metadata.cacheHit?

`boolean`

###### metadata.generatedAt

`string`

###### metadata.latencyMs?

`number`

###### metadata.model?

`string`

###### metadata.provider?

`string`

###### metadata.repairAttempts?

`number`

###### requestId

`string`

###### schemaVersion

`string`

##### classification

[`DataClassification`](../type-aliases/DataClassification.md)

#### Returns

`Promise`\<`void`\>

***

### setBackend()

> **setBackend**(`backend`): `void`

Defined in: [engine/src/cache/semantic-cache.ts:39](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L39)

#### Parameters

##### backend

[`CacheBackend`](../../cache-backend/interfaces/CacheBackend.md)

#### Returns

`void`

***

### setMaxSize()

> **setMaxSize**(`size`): `void`

Defined in: [engine/src/cache/semantic-cache.ts:44](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L44)

#### Parameters

##### size

`number`

#### Returns

`void`

***

### signEntry()

> `private` **signEntry**(`layout`, `toolOutputs`, `timestamp`): `string`

Defined in: [engine/src/cache/semantic-cache.ts:104](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L104)

#### Parameters

##### layout

###### layout

`FerroUIComponent`

###### locale

`string`

###### metadata?

\{ `cacheHit?`: `boolean`; `generatedAt`: `string`; `latencyMs?`: `number`; `model?`: `string`; `provider?`: `string`; `repairAttempts?`: `number`; \}

###### metadata.cacheHit?

`boolean`

###### metadata.generatedAt

`string`

###### metadata.latencyMs?

`number`

###### metadata.model?

`string`

###### metadata.provider?

`string`

###### metadata.repairAttempts?

`number`

###### requestId

`string`

###### schemaVersion

`string`

##### toolOutputs

`Record`\<`string`, `unknown`\>

##### timestamp

`number`

#### Returns

`string`

***

### touch()

> `private` **touch**(`key`): `void`

Defined in: [engine/src/cache/semantic-cache.ts:48](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L48)

#### Parameters

##### key

`string`

#### Returns

`void`

***

### verifyEntry()

> `private` **verifyEntry**(`entry`): `boolean`

Defined in: [engine/src/cache/semantic-cache.ts:109](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L109)

#### Parameters

##### entry

[`CacheEntry`](../interfaces/CacheEntry.md)

#### Returns

`boolean`

***

### getInstance()

> `static` **getInstance**(): `SemanticCache`

Defined in: [engine/src/cache/semantic-cache.ts:32](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/semantic-cache.ts#L32)

#### Returns

`SemanticCache`
