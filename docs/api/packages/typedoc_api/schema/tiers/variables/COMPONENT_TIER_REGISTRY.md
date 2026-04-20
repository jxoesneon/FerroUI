[**@ferroui/schema**](../../README.md)

***

> `const` **COMPONENT\_TIER\_REGISTRY**: `Record`\<`string`, [`ComponentTier`](../../types/enumerations/ComponentTier.md)\>

Defined in: [tiers.ts:23](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/schema/src/tiers.ts#L23)

Static fallback registry of component tier classifications.
Used when the runtime @ferroui/registry is not available.
Prefer calling syncTiersFromRegistry() at startup to populate from runtime.
