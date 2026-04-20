[**@ferroui/renderer**](../README.md)

***

Defined in: [FerroUIRenderer.tsx:5](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/renderer/src/FerroUIRenderer.tsx#L5)

## Properties

### fallback?

> `optional` **fallback?**: `ComponentType`\<\{ `props?`: `Record`\<`string`, `unknown`\>; `type`: `string`; \}\>

Defined in: [FerroUIRenderer.tsx:9](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/renderer/src/FerroUIRenderer.tsx#L9)

Optional fallback component when a type is not found in the registry.

***

### layout

> **layout**: `FerroUIComponent`

Defined in: [FerroUIRenderer.tsx:7](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/renderer/src/FerroUIRenderer.tsx#L7)

The FerroUILayout root component tree to render.

***

### overrides?

> `optional` **overrides?**: `Record`\<`string`, `ComponentType`\<`any`\>\>

Defined in: [FerroUIRenderer.tsx:11](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/renderer/src/FerroUIRenderer.tsx#L11)

Optional override map: type → React component (takes priority over registry).
