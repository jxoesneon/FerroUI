[**@ferroui/i18n**](../../README.md)

***

> **useTranslation**(`namespace?`): `object`

Defined in: [hooks.ts:19](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/i18n/src/hooks.ts#L19)

Hook for component translation with namespace support

## Parameters

### namespace?

`string`

## Returns

`object`

### direction

> **direction**: [`Direction`](../../types/type-aliases/Direction.md)

### formatCurrency

> **formatCurrency**: (`amount`, `currency`, `options?`) => `string`

#### Parameters

##### amount

`number`

##### currency

`string`

##### options?

`NumberFormatOptions`

#### Returns

`string`

### formatDate

> **formatDate**: (`date`, `options?`) => `string`

#### Parameters

##### date

`Date`

##### options?

`DateTimeFormatOptions`

#### Returns

`string`

### formatNumber

> **formatNumber**: (`num`, `options?`) => `string`

#### Parameters

##### num

`number`

##### options?

`NumberFormatOptions`

#### Returns

`string`

### loadBundle

> **loadBundle**: (`locale`, `namespace`, `bundle`) => `void`

#### Parameters

##### locale

[`SupportedLocale`](../../types/type-aliases/SupportedLocale.md)

##### namespace

`string`

##### bundle

`Record`\<`string`, `string`\>

#### Returns

`void`

### locale

> **locale**: [`SupportedLocale`](../../types/type-aliases/SupportedLocale.md)

### setLocale

> **setLocale**: (`locale`) => `void`

#### Parameters

##### locale

[`SupportedLocale`](../../types/type-aliases/SupportedLocale.md)

#### Returns

`void`

### t

> **t**: (`key`, `options?`) => `string` = `namespacedT`

#### Parameters

##### key

`string`

##### options?

[`TranslationOptions`](../../types/interfaces/TranslationOptions.md)

#### Returns

`string`
