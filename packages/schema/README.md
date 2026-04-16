# @ferroui/schema

Zod-based schemas and TypeScript types for the FerroUI layout system.

## Installation

```bash
pnpm add @ferroui/schema
```

## Usage

```typescript
import { FerroUILayoutSchema } from '@ferroui/schema';
FerroUILayoutSchema.parse(data);
```

## API Reference

- `FerroUILayoutSchema`: Zod schema for the root layout.
- `FerroUIComponentSchema`: Zod schema for components.
- `ComponentTier`: Enum for Atomic Design tiers.

## Configuration

N/A

## Examples

```typescript
const result = validateLayout(jsonInput);
if (result.valid) { ... }
```
