[**@ferroui/registry**](../../README.md)

***

Defined in: [types.ts:8](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L8)

Options for registering a component in the registry.

## Extended by

- [`RegistryEntry`](RegistryEntry.md)

## Type Parameters

### P

`P` *extends* `z.ZodTypeAny` = `any`

## Properties

### component

> **component**: `ComponentType`\<`output`\<`P`\>\>

Defined in: [types.ts:27](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L27)

The actual React component implementation.

***

### defaultProps?

> `optional` **defaultProps?**: `Partial`\<`output`\<`P`\>\>

Defined in: [types.ts:37](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L37)

Optional default props.

***

### deprecated?

> `optional` **deprecated?**: `boolean`

Defined in: [types.ts:42](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L42)

Marks the component as deprecated.

***

### name

> **name**: `string`

Defined in: [types.ts:12](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L12)

Unique name for the component (e.g., 'DataCard').

***

### replacement?

> `optional` **replacement?**: `string`

Defined in: [types.ts:47](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L47)

If deprecated, suggests a replacement component name.

***

### schema

> **schema**: `P`

Defined in: [types.ts:32](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L32)

Zod schema for validating the component's props.

***

### tier

> **tier**: `ComponentTier`

Defined in: [types.ts:22](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L22)

Atomic Design tier classification.

***

### version

> **version**: `number`

Defined in: [types.ts:17](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L17)

Version of the component.
