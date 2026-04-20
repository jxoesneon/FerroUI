[**@ferroui/renderer**](../../README.md)

***

> **useFerroUIStream**(`options?`): `object`

Defined in: [useFerroUIStream.ts:36](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/renderer/src/useFerroUIStream.ts#L36)

React hook for streaming FerroUILayout from the engine SSE endpoint.

## Parameters

### options?

[`UseFerroUIStreamOptions`](../interfaces/UseFerroUIStreamOptions.md) = `{}`

## Returns

### abort

> **abort**: () => `void`

#### Returns

`void`

### cacheHit

> **cacheHit**: `boolean`

Cache hit indicator.

### error

> **error**: `string` \| `null`

Error from the stream or pipeline.

### layout

> **layout**: `FerroUIComponent` \| `null`

Current layout tree (may be partial during streaming).

### loading

> **loading**: `boolean`

Whether the stream is actively receiving data.

### phase

> **phase**: `1` \| `2` \| `null`

Phase currently in progress (1 = data gathering, 2 = UI generation).

### send

> **send**: (`prompt`, `context`) => `Promise`\<`void`\>

#### Parameters

##### prompt

`string`

##### context

###### locale

`string`

###### permissions

`string`[]

###### requestId

`string`

###### userId

`string`

#### Returns

`Promise`\<`void`\>

### toolCalls

> **toolCalls**: `object`[]

Tool calls made during Phase 1.

## Example

```tsx
const { layout, loading, error, send } = useFerroUIStream();
send('Show me a dashboard of recent tickets', context);
```
