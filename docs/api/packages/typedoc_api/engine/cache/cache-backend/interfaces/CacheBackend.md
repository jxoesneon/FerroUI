[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/cache/cache-backend.ts:8](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L8)

Cache Backend Abstraction — Semantic Caching spec §4

Provides a common interface for cache storage and implementations
for in-memory, Redis, and SQLite backends.

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [engine/src/cache/cache-backend.ts:13](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L13)

#### Returns

`Promise`\<`void`\>

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in: [engine/src/cache/cache-backend.ts:11](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L11)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`key`): `Promise`\<`string` \| `null`\>

Defined in: [engine/src/cache/cache-backend.ts:9](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L9)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`string` \| `null`\>

***

### keys()

> **keys**(`pattern?`): `Promise`\<`string`[]\>

Defined in: [engine/src/cache/cache-backend.ts:12](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L12)

#### Parameters

##### pattern?

`string`

#### Returns

`Promise`\<`string`[]\>

***

### set()

> **set**(`key`, `value`, `ttlMs`): `Promise`\<`void`\>

Defined in: [engine/src/cache/cache-backend.ts:10](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/cache/cache-backend.ts#L10)

#### Parameters

##### key

`string`

##### value

`string`

##### ttlMs

`number`

#### Returns

`Promise`\<`void`\>
