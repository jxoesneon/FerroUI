[**@ferroui/engine**](../../README.md)

***

Defined in: [engine/src/types.ts:49](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L49)

## Properties

### content?

> `optional` **content?**: `string`

Defined in: [engine/src/types.ts:52](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L52)

***

### error?

> `optional` **error?**: `object`

Defined in: [engine/src/types.ts:62](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L62)

#### code

> **code**: `string`

#### message

> **message**: `string`

#### retryable

> **retryable**: `boolean`

***

### layout?

> `optional` **layout?**: `Partial`\<\{ `layout`: `FerroUIComponent`; `locale`: `string`; `metadata?`: \{ `cacheHit?`: `boolean`; `generatedAt`: `string`; `latencyMs?`: `number`; `model?`: `string`; `provider?`: `string`; `repairAttempts?`: `number`; \}; `requestId`: `string`; `schemaVersion`: `string`; \}\>

Defined in: [engine/src/types.ts:61](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L61)

***

### phase?

> `optional` **phase?**: `1` \| `2`

Defined in: [engine/src/types.ts:51](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L51)

***

### toolCall?

> `optional` **toolCall?**: `object`

Defined in: [engine/src/types.ts:53](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L53)

#### args

> **args**: `any`

#### name

> **name**: `string`

***

### toolOutput?

> `optional` **toolOutput?**: `object`

Defined in: [engine/src/types.ts:57](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L57)

#### name

> **name**: `string`

#### result

> **result**: `any`

***

### type

> **type**: `"phase"` \| `"tool_call"` \| `"tool_output"` \| `"layout_chunk"` \| `"complete"` \| `"error"`

Defined in: [engine/src/types.ts:50](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L50)
