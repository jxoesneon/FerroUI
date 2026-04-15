# @ferroui/renderer

FerroUI UI layout renderer — maps FerroUILayout JSON to React components via the component registry.

## Installation

```bash
pnpm add @ferroui/renderer
```

## Usage

```tsx
import { FerroUIRenderer } from '@ferroui/renderer';
<FerroUIRenderer layout={layout} />
```

## API Reference

- `FerroUIRenderer`: Main React component for rendering layouts.
- `ActionHandler`: Handles component actions (NAVIGATE, TOOL_CALL, etc.).

## Configuration

N/A

## Examples

```tsx
<FerroUIRenderer layout={myLayoutJson} />
```
