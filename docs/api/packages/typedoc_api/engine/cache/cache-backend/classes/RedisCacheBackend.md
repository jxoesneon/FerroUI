[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/cache/cache-backend.ts:57](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L57)

Cache Backend Abstraction — Semantic Caching spec §4

Provides a common interface for cache storage and implementations
for in-memory, Redis, and SQLite backends.

## Implements

- [`CacheBackend`](../interfaces/CacheBackend.md)

## Constructors

### Constructor

> **new RedisCacheBackend**(`client`): `RedisCacheBackend`

Defined in: [engine/src/cache/cache-backend.ts:58](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L58)

#### Parameters

##### client

`Redis`

#### Returns

`RedisCacheBackend`

## Properties

### client

> `private` **client**: `Redis`

Defined in: [engine/src/cache/cache-backend.ts:58](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L58)

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [engine/src/cache/cache-backend.ts:76](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L76)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`CacheBackend`](../interfaces/CacheBackend.md).[`clear`](../interfaces/CacheBackend.md#clear)

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in: [engine/src/cache/cache-backend.ts:68](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L68)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`CacheBackend`](../interfaces/CacheBackend.md).[`delete`](../interfaces/CacheBackend.md#delete)

***

### get()

> **get**(`key`): `Promise`\<`string` \| `null`\>

Defined in: [engine/src/cache/cache-backend.ts:60](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L60)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`string` \| `null`\>

#### Implementation of

[`CacheBackend`](../interfaces/CacheBackend.md).[`get`](../interfaces/CacheBackend.md#get)

***

### keys()

> **keys**(`pattern?`): `Promise`\<`string`[]\>

Defined in: [engine/src/cache/cache-backend.ts:72](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L72)

#### Parameters

##### pattern?

`string`

#### Returns

`Promise`\<`string`[]\>

#### Implementation of

[`CacheBackend`](../interfaces/CacheBackend.md).[`keys`](../interfaces/CacheBackend.md#keys)

***

### set()

> **set**(`key`, `value`, `ttlMs`): `Promise`\<`void`\>

Defined in: [engine/src/cache/cache-backend.ts:64](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L64)

#### Parameters

##### key

`string`

##### value

`string`

##### ttlMs

`number`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`CacheBackend`](../interfaces/CacheBackend.md).[`set`](../interfaces/CacheBackend.md#set)
