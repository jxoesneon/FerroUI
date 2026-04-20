[**@ferroui/tools**](../README.md)

***

Defined in: [packages/tools/src/types.ts:56](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L56)

Configuration options for tool registration

## Type Parameters

### TParams

`TParams` *extends* `z.ZodTypeAny` = `any`

### TResult

`TResult` *extends* `z.ZodTypeAny` = `any`

## Properties

### dataClassification?

> `optional` **dataClassification?**: `"shared"` \| `"user-specific"`

Defined in: [packages/tools/src/types.ts:64](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L64)

***

### description

> **description**: `string`

Defined in: [packages/tools/src/types.ts:58](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L58)

***

### execute

> **execute**: (`params`, `context`) => `Promise`\<`output`\<`TResult`\>\>

Defined in: [packages/tools/src/types.ts:68](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L68)

#### Parameters

##### params

`output`\<`TParams`\>

##### context

[`ToolContext`](ToolContext.md)

#### Returns

`Promise`\<`output`\<`TResult`\>\>

***

### name

> **name**: `string`

Defined in: [packages/tools/src/types.ts:57](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L57)

***

### parameters

> **parameters**: `TParams`

Defined in: [packages/tools/src/types.ts:59](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L59)

***

### public?

> `optional` **public?**: `boolean`

Defined in: [packages/tools/src/types.ts:67](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L67)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [packages/tools/src/types.ts:63](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L63)

***

### returns

> **returns**: `TResult`

Defined in: [packages/tools/src/types.ts:60](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L60)

***

### sensitive?

> `optional` **sensitive?**: `boolean`

Defined in: [packages/tools/src/types.ts:62](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L62)

***

### tags?

> `optional` **tags?**: `string`[]

Defined in: [packages/tools/src/types.ts:66](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L66)

***

### timeout?

> `optional` **timeout?**: `number`

Defined in: [packages/tools/src/types.ts:65](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L65)

***

### ttl?

> `optional` **ttl?**: `number`

Defined in: [packages/tools/src/types.ts:61](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L61)
