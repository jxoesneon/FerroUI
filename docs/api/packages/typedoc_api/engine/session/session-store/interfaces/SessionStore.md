[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/session/session-store.ts:13](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L13)

## Methods

### delete()

> **delete**(`sessionId`): `Promise`\<`void`\>

Defined in: [engine/src/session/session-store.ts:16](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L16)

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`sessionId`): `Promise`\<[`SessionState`](SessionState.md) \| `undefined`\>

Defined in: [engine/src/session/session-store.ts:14](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L14)

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<[`SessionState`](SessionState.md) \| `undefined`\>

***

### set()

> **set**(`sessionId`, `session`): `Promise`\<`void`\>

Defined in: [engine/src/session/session-store.ts:15](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L15)

#### Parameters

##### sessionId

`string`

##### session

[`SessionState`](SessionState.md)

#### Returns

`Promise`\<`void`\>

***

### touch()

> **touch**(`sessionId`): `Promise`\<`void`\>

Defined in: [engine/src/session/session-store.ts:17](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/session/session-store.ts#L17)

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`void`\>
