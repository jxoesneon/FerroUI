# @ferroui/registry

Component registry for FerroUI UI, managing the mapping of FerroUILayout JSON to React components.

## Installation

```bash
pnpm add @ferroui/registry
```

## Usage

```typescript
import { registry } from '@ferroui/registry';
registry.registerComponent(options);
```

## API Reference

- `ComponentRegistry`: Core registry class.
- `registerComponent`: Helper function for registration.
- `getComponentEntry`: Retrieve a component by ID or name.

## Configuration

N/A

## Examples

```typescript
registerComponent({
  name: 'MyButton',
  version: 1,
  tier: ComponentTier.ATOM,
  component: MyButton,
  schema: MyButtonSchema
});
```
