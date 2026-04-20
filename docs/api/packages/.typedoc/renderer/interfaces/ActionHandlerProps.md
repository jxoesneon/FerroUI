[**@ferroui/renderer**](../README.md)

***

Defined in: [ActionHandler.tsx:4](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/renderer/src/ActionHandler.tsx#L4)

## Properties

### children

> **children**: `ReactNode`

Defined in: [ActionHandler.tsx:5](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/renderer/src/ActionHandler.tsx#L5)

***

### onNavigate?

> `optional` **onNavigate?**: (`path`, `params?`) => `void`

Defined in: [ActionHandler.tsx:6](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/renderer/src/ActionHandler.tsx#L6)

#### Parameters

##### path

`string`

##### params?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### onRefresh?

> `optional` **onRefresh?**: (`payload?`) => `void`

Defined in: [ActionHandler.tsx:8](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/renderer/src/ActionHandler.tsx#L8)

#### Parameters

##### payload?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### onStateUpdate?

> `optional` **onStateUpdate?**: (`componentId`, `newState`) => `void`

Defined in: [ActionHandler.tsx:10](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/renderer/src/ActionHandler.tsx#L10)

#### Parameters

##### componentId

`string`

##### newState

`string`

#### Returns

`void`

***

### onToast?

> `optional` **onToast?**: (`message`, `variant`, `duration?`) => `void`

Defined in: [ActionHandler.tsx:7](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/renderer/src/ActionHandler.tsx#L7)

#### Parameters

##### message

`string`

##### variant

`"info"` \| `"success"` \| `"warning"` \| `"error"`

##### duration?

`number`

#### Returns

`void`

***

### onToolCall?

> `optional` **onToolCall?**: (`tool`, `args`) => `void`

Defined in: [ActionHandler.tsx:9](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/renderer/src/ActionHandler.tsx#L9)

#### Parameters

##### tool

`string`

##### args

`Record`\<`string`, `unknown`\>

#### Returns

`void`
