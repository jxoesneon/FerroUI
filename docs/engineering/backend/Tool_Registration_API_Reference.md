# Tool Registration API Reference

## 1. Overview
The Tool Registration API provides a centralized mechanism for defining, registering, and executing backend tools that can be invoked by the LLM during the UI generation pipeline.

## 2. Core API

### `registerTool`
Registers a new tool in the global registry.
- **Returns:** The `ToolDefinition` object passed as an argument.
- **Logic:** Prevents duplicate registrations by tool name.

```typescript
import { registerTool } from '@ferroui/tools';

const myTool = registerTool({
  name: 'get-data',
  description: 'Fetches data',
  parameters: z.object({ id: z.string() }),
  returns: z.object({ value: z.number() }),
  execute: async (params, context) => {
    return { value: 42 };
  }
});
```

### `executeTool` (Registry)
Safely executes a registered tool after performing:
1. **Permission Checks:** Verifies the session contains ALL `requiredPermissions` using `.every()` logic.
2. **Parameter Validation:** Validates input against the `parameters` Zod schema.
3. **Timeout Enforcement:** Limits execution time (default 3000ms).
4. **Return Validation:** Validates the tool's output against the `returns` Zod schema.

## 3. Tool Schemas
Tools are defined using the `ToolDefinition` interface:

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Unique kebab-case identifier. |
| `description` | `string` | Natural language description for the LLM. |
| `parameters` | `z.ZodTypeAny` | Zod schema for input. |
| `returns` | `z.ZodTypeAny` | Zod schema for output. |
| `sensitive` | `boolean` | **Security Flag:** If true, bypasses semantic cache (PII protection). |
| `dataClassification`| `'shared' \| 'user-specific'` | **Classification:** Determines caching scope. |
| `requiredPermissions`| `string[]` | Permissions checked via `.every()` before execution. |

> **Audit Note:** While the engine's internal cache uses `PUBLIC/INTERNAL/RESTRICTED` classifications, the tool registration level uses `shared/user-specific` to control cache key scoping.

## 4. Execution Budget
To prevent runaway tool execution and potential DoS or high-latency scenarios, the pipeline enforces a strict budget:
- **`MAX_TOOL_CALLS_PER_REQUEST`**: 10
- **Behavior:** If the LLM requests more than 10 tool calls, the list is truncated and an error is logged to the output stream.

## 5. Testing Infrastructure
The `@ferroui/tools/testing` module (exposed from `packages/tools/src/testing.ts`) provides utilities for unit testing tools in isolation.

### `createMockContext`
Generates a full `ToolContext` with default test values. Can be partially overridden.

### `executeTool` (Testing)
Directly executes a tool definition, bypassing the global registry but still performing Zod validation on inputs and outputs.

```typescript
import { executeTool, createMockContext } from '@ferroui/tools/testing';

const result = await executeTool(myTool, { id: '123' });
```

## 6. Security & Permissions
Permission enforcement is implemented in `packages/tools/src/registry.ts` using strict "all-or-nothing" logic:

```typescript
const hasPermission = tool.requiredPermissions.every(perm => 
  context.session.permissions.includes(perm)
);
```
This ensures that a user must possess EVERY permission listed in `requiredPermissions` to invoke the tool.
