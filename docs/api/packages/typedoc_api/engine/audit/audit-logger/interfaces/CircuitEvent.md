[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/audit/audit-logger.ts:59](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L59)

## Extends

- `BaseAuditEvent`

## Properties

### consecutiveFailures

> **consecutiveFailures**: `number`

Defined in: [engine/src/audit/audit-logger.ts:61](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L61)

***

### requestId

> **requestId**: `string`

Defined in: [engine/src/audit/audit-logger.ts:19](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L19)

#### Inherited from

`BaseAuditEvent.requestId`

***

### timestamp?

> `optional` **timestamp?**: `string`

Defined in: [engine/src/audit/audit-logger.ts:21](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L21)

#### Inherited from

`BaseAuditEvent.timestamp`

***

### type

> **type**: [`CIRCUIT_OPEN`](../enumerations/AuditEventType.md#circuit_open) \| [`CIRCUIT_RESET`](../enumerations/AuditEventType.md#circuit_reset)

Defined in: [engine/src/audit/audit-logger.ts:60](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L60)

#### Overrides

`BaseAuditEvent.type`

***

### userId

> **userId**: `string`

Defined in: [engine/src/audit/audit-logger.ts:20](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/audit/audit-logger.ts#L20)

#### Inherited from

`BaseAuditEvent.userId`
