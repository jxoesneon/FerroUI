[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/audit/audit-logger.ts:24](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L24)

## Extends

- `BaseAuditEvent`

## Properties

### args

> **args**: `Record`\<`string`, `unknown`\>

Defined in: [engine/src/audit/audit-logger.ts:27](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L27)

***

### durationMs

> **durationMs**: `number`

Defined in: [engine/src/audit/audit-logger.ts:29](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L29)

***

### error?

> `optional` **error?**: `string`

Defined in: [engine/src/audit/audit-logger.ts:30](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L30)

***

### requestId

> **requestId**: `string`

Defined in: [engine/src/audit/audit-logger.ts:19](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L19)

#### Inherited from

`BaseAuditEvent.requestId`

***

### success

> **success**: `boolean`

Defined in: [engine/src/audit/audit-logger.ts:28](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L28)

***

### timestamp?

> `optional` **timestamp?**: `string`

Defined in: [engine/src/audit/audit-logger.ts:21](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L21)

#### Inherited from

`BaseAuditEvent.timestamp`

***

### toolName

> **toolName**: `string`

Defined in: [engine/src/audit/audit-logger.ts:26](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L26)

***

### type

> **type**: [`TOOL_CALL`](../enumerations/AuditEventType.md#tool_call)

Defined in: [engine/src/audit/audit-logger.ts:25](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L25)

#### Overrides

`BaseAuditEvent.type`

***

### userId

> **userId**: `string`

Defined in: [engine/src/audit/audit-logger.ts:20](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L20)

#### Inherited from

`BaseAuditEvent.userId`
