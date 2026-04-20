[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/cache/cache-backend.ts:20](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L20)

Cache Backend Abstraction — Semantic Caching spec §4

Provides a common interface for cache storage and implementations
for in-memory, Redis, and SQLite backends.

## Implements

- [`CacheBackend`](../interfaces/CacheBackend.md)

## Constructors

### Constructor

> **new InMemoryCacheBackend**(): `InMemoryCacheBackend`

#### Returns

`InMemoryCacheBackend`

## Properties

### store

> `private` **store**: `Map`\<`string`, [`MemoryEntry`](../interfaces/MemoryEntry.md)\>

Defined in: [engine/src/cache/cache-backend.ts:21](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L21)

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [engine/src/cache/cache-backend.ts:48](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L48)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`CacheBackend`](../interfaces/CacheBackend.md).[`clear`](../interfaces/CacheBackend.md#clear)

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in: [engine/src/cache/cache-backend.ts:37](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L37)

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

Defined in: [engine/src/cache/cache-backend.ts:23](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L23)

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

Defined in: [engine/src/cache/cache-backend.ts:41](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L41)

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

Defined in: [engine/src/cache/cache-backend.ts:33](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L33)

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
