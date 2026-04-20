[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/session/session-store.ts:24](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L24)

## Implements

- [`SessionStore`](../interfaces/SessionStore.md)

## Constructors

### Constructor

> **new InMemorySessionStore**(`options?`): `InMemorySessionStore`

Defined in: [engine/src/session/session-store.ts:28](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L28)

#### Parameters

##### options?

[`InMemorySessionStoreOptions`](../interfaces/InMemorySessionStoreOptions.md) = `{}`

#### Returns

`InMemorySessionStore`

## Properties

### defaultTtlMs

> `private` **defaultTtlMs**: `number`

Defined in: [engine/src/session/session-store.ts:26](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L26)

***

### sessions

> `private` **sessions**: `Map`\<`string`, \{ `expiresAt`: `number`; `session`: [`SessionState`](../interfaces/SessionState.md); \}\>

Defined in: [engine/src/session/session-store.ts:25](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L25)

## Methods

### delete()

> **delete**(`sessionId`): `Promise`\<`void`\>

Defined in: [engine/src/session/session-store.ts:47](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L47)

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`delete`](../interfaces/SessionStore.md#delete)

***

### get()

> **get**(`sessionId`): `Promise`\<[`SessionState`](../interfaces/SessionState.md) \| `undefined`\>

Defined in: [engine/src/session/session-store.ts:32](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L32)

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<[`SessionState`](../interfaces/SessionState.md) \| `undefined`\>

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`get`](../interfaces/SessionStore.md#get)

***

### set()

> **set**(`sessionId`, `session`): `Promise`\<`void`\>

Defined in: [engine/src/session/session-store.ts:42](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L42)

#### Parameters

##### sessionId

`string`

##### session

[`SessionState`](../interfaces/SessionState.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`set`](../interfaces/SessionStore.md#set)

***

### touch()

> **touch**(`sessionId`): `Promise`\<`void`\>

Defined in: [engine/src/session/session-store.ts:51](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L51)

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`touch`](../interfaces/SessionStore.md#touch)
