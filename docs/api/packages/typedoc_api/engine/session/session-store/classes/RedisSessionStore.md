[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/session/session-store.ts:68](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L68)

## Implements

- [`SessionStore`](../interfaces/SessionStore.md)

## Constructors

### Constructor

> **new RedisSessionStore**(`client`): `RedisSessionStore`

Defined in: [engine/src/session/session-store.ts:71](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L71)

#### Parameters

##### client

[`RedisSessionClientLike`](../interfaces/RedisSessionClientLike.md)

#### Returns

`RedisSessionStore`

## Properties

### client

> `private` **client**: [`RedisSessionClientLike`](../interfaces/RedisSessionClientLike.md)

Defined in: [engine/src/session/session-store.ts:71](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L71)

***

### prefix

> `private` **prefix**: `string` = `'ferroui:session:'`

Defined in: [engine/src/session/session-store.ts:69](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L69)

## Methods

### delete()

> **delete**(`sessionId`): `Promise`\<`void`\>

Defined in: [engine/src/session/session-store.ts:89](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L89)

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

Defined in: [engine/src/session/session-store.ts:73](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L73)

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

Defined in: [engine/src/session/session-store.ts:84](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L84)

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

Defined in: [engine/src/session/session-store.ts:93](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L93)

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`touch`](../interfaces/SessionStore.md#touch)
