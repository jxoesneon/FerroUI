[**@ferroui/renderer**](../../README.md)

***

> `const` **FerroUIRenderer**: `React.FC`\<[`FerroUIRendererProps`](../interfaces/FerroUIRendererProps.md)\>

Defined in: [FerroUIRenderer.tsx:134](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/renderer/src/FerroUIRenderer.tsx#L134)

FerroUIRenderer — the core layout renderer.

Takes an FerroUILayout root component and recursively renders it
using the component registry, with optional overrides and fallback.

## Example

```tsx
<FerroUIRenderer layout={ferrouiLayout.layout} />
```
