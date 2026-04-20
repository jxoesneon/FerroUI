[**@ferroui/i18n**](../../README.md)

***

Defined in: [types.ts:22](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/i18n/src/types.ts#L22)

## Properties

### direction

> **direction**: [`Direction`](../type-aliases/Direction.md)

Defined in: [types.ts:24](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/i18n/src/types.ts#L24)

***

### formatCurrency

> **formatCurrency**: (`amount`, `currency`, `options?`) => `string`

Defined in: [types.ts:28](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/i18n/src/types.ts#L28)

#### Parameters

##### amount

`number`

##### currency

`string`

##### options?

`NumberFormatOptions`

#### Returns

`string`

***

### formatDate

> **formatDate**: (`date`, `options?`) => `string`

Defined in: [types.ts:26](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/i18n/src/types.ts#L26)

#### Parameters

##### date

`Date`

##### options?

`DateTimeFormatOptions`

#### Returns

`string`

***

### formatNumber

> **formatNumber**: (`num`, `options?`) => `string`

Defined in: [types.ts:27](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/i18n/src/types.ts#L27)

#### Parameters

##### num

`number`

##### options?

`NumberFormatOptions`

#### Returns

`string`

***

### loadBundle

> **loadBundle**: (`locale`, `namespace`, `bundle`) => `void`

Defined in: [types.ts:30](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/i18n/src/types.ts#L30)

#### Parameters

##### locale

[`SupportedLocale`](../type-aliases/SupportedLocale.md)

##### namespace

`string`

##### bundle

`Record`\<`string`, `string`\>

#### Returns

`void`

***

### locale

> **locale**: [`SupportedLocale`](../type-aliases/SupportedLocale.md)

Defined in: [types.ts:23](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/i18n/src/types.ts#L23)

***

### setLocale

> **setLocale**: (`locale`) => `void`

Defined in: [types.ts:29](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/i18n/src/types.ts#L29)

#### Parameters

##### locale

[`SupportedLocale`](../type-aliases/SupportedLocale.md)

#### Returns

`void`

***

### t

> **t**: (`key`, `options?`) => `string`

Defined in: [types.ts:25](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/i18n/src/types.ts#L25)

#### Parameters

##### key

`string`

##### options?

[`TranslationOptions`](TranslationOptions.md)

#### Returns

`string`
