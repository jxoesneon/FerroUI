[**@ferroui/registry**](../../../README.md)

***

Defined in: [theme/manager.ts:6](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/theme/manager.ts#L6)

Manages runtime themes and design token access.

## Constructors

### Constructor

> `private` **new ThemeManager**(): `ThemeManager`

Defined in: [theme/manager.ts:11](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/theme/manager.ts#L11)

#### Returns

`ThemeManager`

## Properties

### currentThemeName

> `private` **currentThemeName**: `string` = `'light'`

Defined in: [theme/manager.ts:9](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/theme/manager.ts#L9)

***

### themes

> `private` **themes**: `Map`\<`string`, [`Theme`](../../types/interfaces/Theme.md)\>

Defined in: [theme/manager.ts:8](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/theme/manager.ts#L8)

***

### instance

> `private` `static` **instance**: `ThemeManager`

Defined in: [theme/manager.ts:7](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/theme/manager.ts#L7)

## Methods

### getCurrentTheme()

> **getCurrentTheme**(): `string`

Defined in: [theme/manager.ts:44](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/theme/manager.ts#L44)

Gets the globally active theme name.

#### Returns

`string`

***

### getTheme()

> **getTheme**(`name`): [`Theme`](../../types/interfaces/Theme.md) \| `undefined`

Defined in: [theme/manager.ts:30](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/theme/manager.ts#L30)

Retrieves a registered theme by name.

#### Parameters

##### name

`string`

#### Returns

[`Theme`](../../types/interfaces/Theme.md) \| `undefined`

***

### getToken()

> **getToken**(`path`, `options?`): `any`

Defined in: [theme/manager.ts:52](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/theme/manager.ts#L52)

Resolves a token value by path.
Path should be like 'color.primary.DEFAULT'.

#### Parameters

##### path

`string`

##### options?

[`TokenOptions`](../../types/interfaces/TokenOptions.md) = `{}`

#### Returns

`any`

***

### registerTheme()

> **registerTheme**(`theme`): `void`

Defined in: [theme/manager.ts:23](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/theme/manager.ts#L23)

Registers a theme definition in the manager.

#### Parameters

##### theme

[`Theme`](../../types/interfaces/Theme.md)

#### Returns

`void`

***

### resolvePath()

> `private` **resolvePath**(`obj`, `path`): `any`

Defined in: [theme/manager.ts:66](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/theme/manager.ts#L66)

#### Parameters

##### obj

`any`

##### path

`string`

#### Returns

`any`

***

### setCurrentTheme()

> **setCurrentTheme**(`name`): `void`

Defined in: [theme/manager.ts:37](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/theme/manager.ts#L37)

Sets the globally active theme name for token access.

#### Parameters

##### name

`string`

#### Returns

`void`

***

### getInstance()

> `static` **getInstance**(): `ThemeManager`

Defined in: [theme/manager.ts:13](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/theme/manager.ts#L13)

#### Returns

`ThemeManager`
