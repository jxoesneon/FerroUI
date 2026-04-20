[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/cache/cache-backend.ts:85](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L85)

Cache Backend Abstraction — Semantic Caching spec §4

Provides a common interface for cache storage and implementations
for in-memory, Redis, and SQLite backends.

## Implements

- [`CacheBackend`](../interfaces/CacheBackend.md)

## Constructors

### Constructor

> **new SQLiteCacheBackend**(`db`): `SQLiteCacheBackend`

Defined in: [engine/src/cache/cache-backend.ts:86](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L86)

#### Parameters

##### db

`Database`

#### Returns

`SQLiteCacheBackend`

## Properties

### db

> `private` **db**: `Database`

Defined in: [engine/src/cache/cache-backend.ts:86](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L86)

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [engine/src/cache/cache-backend.ts:135](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L135)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`CacheBackend`](../interfaces/CacheBackend.md).[`clear`](../interfaces/CacheBackend.md#clear)

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in: [engine/src/cache/cache-backend.ts:117](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L117)

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

Defined in: [engine/src/cache/cache-backend.ts:98](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L98)

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

Defined in: [engine/src/cache/cache-backend.ts:121](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L121)

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

Defined in: [engine/src/cache/cache-backend.ts:110](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L110)

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
