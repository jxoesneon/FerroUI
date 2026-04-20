[**@ferroui/registry**](../README.md)

***

Defined in: [registry.ts:8](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L8)

The core Component Registry runtime for FerroUI.
Responsible for component registration, versioning, and hierarchy validation.

## Methods

### clear()

> **clear**(): `void`

Defined in: [registry.ts:193](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L193)

Clears all registered components (primarily for testing).

#### Returns

`void`

***

### getAllComponents()

> **getAllComponents**(): [`RegistryEntry`](../interfaces/RegistryEntry.md)\<`any`\>[]

Defined in: [registry.ts:117](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L117)

Returns all registered components.

#### Returns

[`RegistryEntry`](../interfaces/RegistryEntry.md)\<`any`\>[]

***

### getComponentEntry()

> **getComponentEntry**(`identifier`): [`RegistryEntry`](../interfaces/RegistryEntry.md)\<`any`\> \| `undefined`

Defined in: [registry.ts:99](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L99)

Retrieves a component by identifier (e.g., 'DataCard' or 'DataCard@2').
If no version is specified, returns the STABLE version (Governance R012).

#### Parameters

##### identifier

`string`

#### Returns

[`RegistryEntry`](../interfaces/RegistryEntry.md)\<`any`\> \| `undefined`

***

### registerComponent()

> **registerComponent**\<`_P`\>(`options`): `void`

Defined in: [registry.ts:35](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L35)

Registers a component with the registry.

#### Type Parameters

##### _P

`_P` = `any`

#### Parameters

##### options

[`RegistrationOptions`](../interfaces/RegistrationOptions.md)\<`any`\> & `object`

#### Returns

`void`

***

### unregisterComponent()

> **unregisterComponent**(`identifier`): `void`

Defined in: [registry.ts:73](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L73)

Unregisters a component.

#### Parameters

##### identifier

`string`

#### Returns

`void`

***

### validateHierarchy()

> **validateHierarchy**(`component`, `visited?`): `void`

Defined in: [registry.ts:131](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L131)

Validates a component hierarchy according to Atomic Design rules.
Throws if validation fails.

#### Parameters

##### component

`FerroUIComponent`

##### visited?

`Set`\<`FerroUIComponent`\> = `...`

#### Returns

`void`

***

### getInstance()

> `static` **getInstance**(): `ComponentRegistry`

Defined in: [registry.ts:25](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L25)

Returns the singleton instance of the registry.

#### Returns

`ComponentRegistry`
