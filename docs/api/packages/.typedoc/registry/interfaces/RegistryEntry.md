[**@ferroui/registry**](../README.md)

***

Defined in: [types.ts:53](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L53)

Internal representation of a registered component.

## Extends

- [`RegistrationOptions`](RegistrationOptions.md)\<`P`\>

## Type Parameters

### P

`P` *extends* `z.ZodTypeAny` = `any`

## Properties

### component

> **component**: `ComponentType`\<`output`\<`P`\>\>

Defined in: [types.ts:27](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L27)

The actual React component implementation.

#### Inherited from

[`RegistrationOptions`](RegistrationOptions.md).[`component`](RegistrationOptions.md#component)

***

### defaultProps?

> `optional` **defaultProps?**: `Partial`\<`output`\<`P`\>\>

Defined in: [types.ts:37](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L37)

Optional default props.

#### Inherited from

[`RegistrationOptions`](RegistrationOptions.md).[`defaultProps`](RegistrationOptions.md#defaultprops)

***

### deprecated?

> `optional` **deprecated?**: `boolean`

Defined in: [types.ts:42](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L42)

Marks the component as deprecated.

#### Inherited from

[`RegistrationOptions`](RegistrationOptions.md).[`deprecated`](RegistrationOptions.md#deprecated)

***

### id

> **id**: `string`

Defined in: [types.ts:57](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L57)

Canonical ID string (e.g., 'DataCard@2').

***

### name

> **name**: `string`

Defined in: [types.ts:12](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L12)

Unique name for the component (e.g., 'DataCard').

#### Inherited from

[`RegistrationOptions`](RegistrationOptions.md).[`name`](RegistrationOptions.md#name)

***

### replacement?

> `optional` **replacement?**: `string`

Defined in: [types.ts:47](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L47)

If deprecated, suggests a replacement component name.

#### Inherited from

[`RegistrationOptions`](RegistrationOptions.md).[`replacement`](RegistrationOptions.md#replacement)

***

### schema

> **schema**: `P`

Defined in: [types.ts:32](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L32)

Zod schema for validating the component's props.

#### Inherited from

[`RegistrationOptions`](RegistrationOptions.md).[`schema`](RegistrationOptions.md#schema)

***

### tier

> **tier**: `ComponentTier`

Defined in: [types.ts:22](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L22)

Atomic Design tier classification.

#### Inherited from

[`RegistrationOptions`](RegistrationOptions.md).[`tier`](RegistrationOptions.md#tier)

***

### version

> **version**: `number`

Defined in: [types.ts:17](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/types.ts#L17)

Version of the component.

#### Inherited from

[`RegistrationOptions`](RegistrationOptions.md).[`version`](RegistrationOptions.md#version)
