[**@ferroui/i18n**](../README.md)

***

> **shouldMirrorIcon**(`iconName`, `direction`): `boolean`

Defined in: [hooks.ts:69](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/i18n/src/hooks.ts#L69)

Determines if an icon should be mirrored for RTL layouts.
Per i18n Guide §4.4

## Parameters

### iconName

`string`

The icon identifier

### direction

`"ltr"` \| `"rtl"`

The current text direction ('ltr' | 'rtl')

## Returns

`boolean`

true if the icon should be CSS-mirrored (transform: scaleX(-1))
