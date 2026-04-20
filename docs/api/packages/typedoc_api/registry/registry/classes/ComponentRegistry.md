[**@ferroui/registry**](../../README.md)

***

Defined in: [registry.ts:8](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L8)

The core Component Registry runtime for FerroUI.
Responsible for component registration, versioning, and hierarchy validation.

## Constructors

### Constructor

> `private` **new ComponentRegistry**(): `ComponentRegistry`

Defined in: [registry.ts:20](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L20)

#### Returns

`ComponentRegistry`

## Properties

### components

> `private` **components**: `Map`\<`string`, `Map`\<`number`, [`RegistryEntry`](../../types/interfaces/RegistryEntry.md)\<`any`\>\>\>

Defined in: [registry.ts:12](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L12)

***

### latestVersions

> `private` **latestVersions**: `Map`\<`string`, `number`\>

Defined in: [registry.ts:15](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L15)

***

### stableVersions

> `private` **stableVersions**: `Map`\<`string`, `number`\>

Defined in: [registry.ts:18](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L18)

***

### instance

> `private` `static` **instance**: `ComponentRegistry`

Defined in: [registry.ts:9](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L9)

## Methods

### clear()

> **clear**(): `void`

Defined in: [registry.ts:193](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L193)

Clears all registered components (primarily for testing).

#### Returns

`void`

***

### getAllComponents()

> **getAllComponents**(): [`RegistryEntry`](../../types/interfaces/RegistryEntry.md)\<`any`\>[]

Defined in: [registry.ts:117](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L117)

Returns all registered components.

#### Returns

[`RegistryEntry`](../../types/interfaces/RegistryEntry.md)\<`any`\>[]

***

### getComponentEntry()

> **getComponentEntry**(`identifier`): [`RegistryEntry`](../../types/interfaces/RegistryEntry.md)\<`any`\> \| `undefined`

Defined in: [registry.ts:99](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L99)

Retrieves a component by identifier (e.g., 'DataCard' or 'DataCard@2').
If no version is specified, returns the STABLE version (Governance R012).

#### Parameters

##### identifier

`string`

#### Returns

[`RegistryEntry`](../../types/interfaces/RegistryEntry.md)\<`any`\> \| `undefined`

***

### parseIdentifier()

> `private` **parseIdentifier**(`identifier`): `object`

Defined in: [registry.ts:176](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/registry.ts#L176)

Parses a component identifier into its name and version components.

#### Parameters

##### identifier

`string`

#### Returns

`object`

##### name

> **name**: `string`

##### version?

> `optional` **version?**: `number`

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

[`RegistrationOptions`](../../types/interfaces/RegistrationOptions.md)\<`any`\> & `object`

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
