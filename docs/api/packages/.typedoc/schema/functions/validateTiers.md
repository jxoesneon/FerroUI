[**@ferroui/schema**](../README.md)

***

> **validateTiers**(`component`, `path?`, `visited?`): [`TierValidationError`](../interfaces/TierValidationError.md)[]

Defined in: [tiers.ts:83](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/schema/src/tiers.ts#L83)

Validates a component tree against architectural tier rules.
Implements Rules R008, R009, and R005 from the specification.

## Parameters

### component

[`FerroUIComponent`](../type-aliases/FerroUIComponent.md)

### path?

`string` = `'layout'`

### visited?

`Set`\<[`FerroUIComponent`](../type-aliases/FerroUIComponent.md)\> = `...`

## Returns

[`TierValidationError`](../interfaces/TierValidationError.md)[]
