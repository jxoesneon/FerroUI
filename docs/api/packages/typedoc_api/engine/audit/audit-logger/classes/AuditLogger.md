[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/audit/audit-logger.ts:100](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L100)

## Constructors

### Constructor

> **new AuditLogger**(`options?`): `AuditLogger`

Defined in: [engine/src/audit/audit-logger.ts:112](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L112)

#### Parameters

##### options?

[`AuditLoggerOptions`](../interfaces/AuditLoggerOptions.md) = `{}`

#### Returns

`AuditLogger`

## Properties

### db?

> `private` `optional` **db?**: `any`

Defined in: [engine/src/audit/audit-logger.ts:107](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L107)

***

### events

> `private` **events**: [`AuditEvent`](../type-aliases/AuditEvent.md)[] = `[]`

Defined in: [engine/src/audit/audit-logger.ts:105](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L105)

***

### filePath?

> `private` `optional` **filePath?**: `string`

Defined in: [engine/src/audit/audit-logger.ts:102](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L102)

***

### hmacSecret?

> `private` `optional` **hmacSecret?**: `string`

Defined in: [engine/src/audit/audit-logger.ts:104](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L104)

***

### lastHash

> `private` **lastHash**: `string` \| `null` = `null`

Defined in: [engine/src/audit/audit-logger.ts:108](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L108)

***

### output

> `private` **output**: `"memory"` \| `"sqlite"` \| `"console"` \| `"file"`

Defined in: [engine/src/audit/audit-logger.ts:101](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L101)

***

### ROTATE\_AFTER\_LINES

> `private` `readonly` **ROTATE\_AFTER\_LINES**: `10000` = `10_000`

Defined in: [engine/src/audit/audit-logger.ts:110](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L110)

***

### sqlitePath?

> `private` `optional` **sqlitePath?**: `string`

Defined in: [engine/src/audit/audit-logger.ts:103](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L103)

***

### writeCount

> `private` **writeCount**: `number` = `0`

Defined in: [engine/src/audit/audit-logger.ts:109](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L109)

***

### instance?

> `private` `static` `optional` **instance?**: `AuditLogger`

Defined in: [engine/src/audit/audit-logger.ts:106](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L106)

## Methods

### clear()

> **clear**(): `void`

Defined in: [engine/src/audit/audit-logger.ts:254](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L254)

#### Returns

`void`

***

### computeHmac()

> `private` **computeHmac**(`data`): `string`

Defined in: [engine/src/audit/audit-logger.ts:147](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L147)

#### Parameters

##### data

`string`

#### Returns

`string`

***

### getEvents()

> **getEvents**(`limit?`): [`AuditEvent`](../type-aliases/AuditEvent.md)[]

Defined in: [engine/src/audit/audit-logger.ts:245](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L245)

#### Parameters

##### limit?

`number`

#### Returns

[`AuditEvent`](../type-aliases/AuditEvent.md)[]

***

### initSqlite()

> `private` **initSqlite**(): `void`

Defined in: [engine/src/audit/audit-logger.ts:123](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L123)

#### Returns

`void`

***

### log()

> **log**(`event`): `void`

Defined in: [engine/src/audit/audit-logger.ts:189](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L189)

#### Parameters

##### event

[`AuditEvent`](../type-aliases/AuditEvent.md)

#### Returns

`void`

***

### rotateFileIfNeeded()

> `private` **rotateFileIfNeeded**(): `void`

Defined in: [engine/src/audit/audit-logger.ts:155](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L155)

#### Returns

`void`

***

### toJsonLines()

> **toJsonLines**(): `string`[]

Defined in: [engine/src/audit/audit-logger.ts:250](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L250)

#### Returns

`string`[]

***

### verifyChain()

> **verifyChain**(): `object`

Defined in: [engine/src/audit/audit-logger.ts:226](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L226)

#### Returns

`object`

##### reason?

> `optional` **reason?**: `string`

##### tamperedAt?

> `optional` **tamperedAt?**: `number`

##### valid

> **valid**: `boolean`

***

### getInstance()

> `static` **getInstance**(): `AuditLogger`

Defined in: [engine/src/audit/audit-logger.ts:172](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L172)

#### Returns

`AuditLogger`

***

### resetInstance()

> `static` **resetInstance**(): `void`

Defined in: [engine/src/audit/audit-logger.ts:185](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L185)

#### Returns

`void`
