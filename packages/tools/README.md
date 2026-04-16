# @ferroui/tools

Development and utility tools for the FerroUI ecosystem.

## Installation

```bash
pnpm add @ferroui/tools
```

## Usage

```typescript
import { registerTool } from '@ferroui/tools';
registerTool(myTool);
```

## API Reference

- `ToolRegistry`: Registry for backend tools.
- `executeTool`: Safely execute a tool with validation.
- `createMockContext`: Testing helper for tool execution.

## Configuration

Tool-specific timeouts and permissions.

## Examples

```typescript
const result = await executeTool('get-data', { id: '123' }, context);
```
