[**@ferroui/tools**](../README.md)

***

Defined in: [packages/tools/src/registry.ts:9](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/registry.ts#L9)

Central registry for all backend tools

## Methods

### clear()

> **clear**(): `void`

Defined in: [packages/tools/src/registry.ts:63](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/registry.ts#L63)

Clears the registry (useful for testing)

#### Returns

`void`

***

### get()

> **get**(`name`): [`ToolDefinition`](../interfaces/ToolDefinition.md)\<`any`, `any`\> \| `undefined`

Defined in: [packages/tools/src/registry.ts:49](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/registry.ts#L49)

Gets a tool by its name

#### Parameters

##### name

`string`

#### Returns

[`ToolDefinition`](../interfaces/ToolDefinition.md)\<`any`, `any`\> \| `undefined`

***

### getAll()

> **getAll**(): [`ToolDefinition`](../interfaces/ToolDefinition.md)\<`any`, `any`\>[]

Defined in: [packages/tools/src/registry.ts:56](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/registry.ts#L56)

Returns all registered tools

#### Returns

[`ToolDefinition`](../interfaces/ToolDefinition.md)\<`any`, `any`\>[]

***

### register()

> **register**\<`TParams`, `TResult`\>(`tool`): [`ToolDefinition`](../interfaces/ToolDefinition.md)\<`TParams`, `TResult`\>

Defined in: [packages/tools/src/registry.ts:28](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/registry.ts#L28)

Registers a new tool in the system

#### Type Parameters

##### TParams

`TParams` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

##### TResult

`TResult` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

#### Parameters

##### tool

[`ToolDefinition`](../interfaces/ToolDefinition.md)\<`TParams`, `TResult`\>

#### Returns

[`ToolDefinition`](../interfaces/ToolDefinition.md)\<`TParams`, `TResult`\>

***

### getInstance()

> `static` **getInstance**(): `ToolRegistry`

Defined in: [packages/tools/src/registry.ts:18](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/registry.ts#L18)

Singleton accessor for the registry

#### Returns

`ToolRegistry`
