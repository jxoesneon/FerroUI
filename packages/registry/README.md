# @ferroui/registry

The Component Registry is the central authority for all FerroUI components. It manages registration, versioning, and hierarchy validation based on Atomic Design principles.

## Architecture

```mermaid
graph TD
    A[Layout JSON] --> B[Renderer]
    B --> C[Registry]
    C --> D[Atoms]
    C --> E[Molecules]
    C --> F[Organisms]
    C -.-> G[Hierarchy Validator]
```

## Features

- **Versioned Registration**: Supports multiple versions of the same component.
- **Atomic Design Enforcement**: Validates that Atoms don't have children and Molecules don't contain Organisms.
- **Inspector Support**: Provides metadata for the Registry Inspector UI.

## Installation

```bash
pnpm add @ferroui/registry
```

## Usage

### Registering a Component

```typescript
import { registerComponent } from '@ferroui/registry';
import { ComponentTier } from '@ferroui/schema';
import { z } from 'zod';

const MyButtonSchema = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary']).default('primary')
});

registerComponent({
  name: 'MyButton',
  version: 1,
  tier: ComponentTier.ATOM,
  component: MyButton,
  schema: MyButtonSchema
});
```

### Retrieving a Component

```typescript
import { registry } from '@ferroui/registry';

const entry = registry.getComponentEntry('MyButton@1');
// or get latest
const latest = registry.getComponentEntry('MyButton');
```

## API Reference

- `ComponentRegistry`: Core singleton class.
- `registerComponent(options)`: Registers a new component.
- `getComponentEntry(identifier)`: Retrieves a component entry.
- `validateHierarchy(layout)`: Checks if a layout follows atomic rules.
