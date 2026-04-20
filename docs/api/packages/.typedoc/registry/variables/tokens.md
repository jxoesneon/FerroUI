[**@ferroui/registry**](../README.md)

***

> `const` **tokens**: `object`

Defined in: [theme/manager.ts:104](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/theme/manager.ts#L104)

Runtime token access API.

## Type Declaration

### get

> **get**: (`path`, `options?`) => `any`

Retrieves a token value.

#### Parameters

##### path

`string`

Dot-separated path to the token (e.g., 'color.primary.DEFAULT')

##### options?

`TokenOptions`

Optional overrides (e.g., { theme: 'dark' })

#### Returns

`any`
