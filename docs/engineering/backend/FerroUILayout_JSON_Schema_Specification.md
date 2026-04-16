# FerroUILayout JSON Schema Specification

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Engineering Team  
**Schema Version:** 1.0  

---

## 1. Overview

The FerroUILayout schema defines the structure of JSON documents produced by the AI orchestration engine and consumed by the client renderer. This specification provides the complete schema definition, validation rules, and examples.

---

## 2. Schema Structure

### 2.1 Root Object

```typescript
interface FerroUILayout {
  schemaVersion: string;      // Schema version (e.g., "1.0")
  requestId: string;          // Unique request identifier (UUID)
  locale: string;             // BCP 47 locale tag (e.g., "en-US")
  layout: FerroUIComponent;     // Root component (must be Dashboard)
  metadata?: LayoutMetadata;  // Optional metadata
}
```

### 2.2 Component Structure

```typescript
interface FerroUIComponent {
  type: string;                    // Component type from registry
  id?: string;                     // Optional stable identifier
  props?: Record<string, unknown>; // Component properties
  children?: FerroUIComponent[];     // Child components
  action?: Action;                 // Optional interaction handler
  aria?: AriaProps;                // Accessibility properties
}
```

### 2.3 Action Structure

```typescript
interface Action {
  type: 'NAVIGATE' | 'SHOW_TOAST' | 'REFRESH' | 'TOOL_CALL';
  payload: unknown;
}

// NAVIGATE
interface NavigateAction extends Action {
  type: 'NAVIGATE';
  payload: {
    path: string;
    params?: Record<string, unknown>;
  };
}

// SHOW_TOAST
interface ToastAction extends Action {
  type: 'SHOW_TOAST';
  payload: {
    message: string;
    variant: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
  };
}

// REFRESH
interface RefreshAction extends Action {
  type: 'REFRESH';
  payload?: Record<string, never>;
}

// TOOL_CALL
interface ToolCallAction extends Action {
  type: 'TOOL_CALL';
  payload: {
    tool: string;
    args: Record<string, unknown>;
  };
}
```

### 2.4 ARIA Properties

```typescript
interface AriaProps {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  hidden?: boolean;
  live?: 'off' | 'polite' | 'assertive';
  role?: string;
}
```

### 2.5 Metadata

```typescript
interface LayoutMetadata {
  generatedAt: string;           // ISO 8601 timestamp
  model?: string;                // LLM model used
  provider?: string;             // LLM provider
  latencyMs?: number;            // Generation latency
  repairAttempts?: number;       // Number of repair attempts
  cacheHit?: boolean;            // Whether served from cache
}
```

---

## 3. Complete JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://ferroui.dev/schemas/layout/v1.0.json",
  "title": "FerroUILayout",
  "type": "object",
  "required": ["schemaVersion", "requestId", "locale", "layout"],
  "properties": {
    "schemaVersion": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+$",
      "description": "Schema version in semver format"
    },
    "requestId": {
      "type": "string",
      "format": "uuid",
      "description": "Unique request identifier"
    },
    "locale": {
      "type": "string",
      "pattern": "^[a-z]{2}(-[A-Z]{2})?$",
      "description": "BCP 47 locale tag"
    },
    "layout": {
      "$ref": "#/definitions/component"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "generatedAt": {
          "type": "string",
          "format": "date-time"
        },
        "model": {
          "type": "string"
        },
        "provider": {
          "type": "string"
        },
        "latencyMs": {
          "type": "number",
          "minimum": 0
        },
        "repairAttempts": {
          "type": "number",
          "minimum": 0
        },
        "cacheHit": {
          "type": "boolean"
        }
      }
    }
  },
  "definitions": {
    "component": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": {
          "type": "string",
          "description": "Component type from registry"
        },
        "id": {
          "type": "string",
          "description": "Stable component identifier"
        },
        "props": {
          "type": "object",
          "description": "Component properties"
        },
        "children": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/component"
          }
        },
        "action": {
          "$ref": "#/definitions/action"
        },
        "aria": {
          "$ref": "#/definitions/ariaProps"
        }
      }
    },
    "action": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["NAVIGATE", "SHOW_TOAST", "REFRESH", "TOOL_CALL"]
        },
        "payload": {}
      }
    },
    "ariaProps": {
      "type": "object",
      "properties": {
        "label": {
          "type": "string"
        },
        "labelledBy": {
          "type": "string"
        },
        "describedBy": {
          "type": "string"
        },
        "hidden": {
          "type": "boolean"
        },
        "live": {
          "type": "string",
          "enum": ["off", "polite", "assertive"]
        },
        "role": {
          "type": "string"
        }
      }
    }
  }
}
```

---

## 4. Validation Rules

### 4.1 Structural Rules

| Rule | Severity | Description |
|------|----------|-------------|
| R001 | Error | `schemaVersion` must be present and valid |
| R002 | Error | `requestId` must be a valid UUID |
| R003 | Error | `locale` must be a valid BCP 47 tag |
| R004 | Error | `layout` must be present |
| R005 | Error | Root component must be `Dashboard` |
| R006 | Error | `Dashboard` must appear exactly once |
| R007 | Error | Component `type` must be in registry |
| R008 | Error | Atoms must not have children |
| R009 | Error | Molecules must not contain Organisms |
| R010 | Error | Block components must not be children of inline components |

### 4.2 ARIA Rules

| Rule | Severity | Description |
|------|----------|-------------|
| A001 | Error | Interactive components must have `aria.label` or `aria.labelledBy` |
| A002 | Warning | Live regions should have `aria.live` |
| A003 | Error | `aria.hidden` must not be used on focusable elements |

### 4.3 Action Rules

| Rule | Severity | Description |
|------|----------|-------------|
| C001 | Error | `NAVIGATE` actions must have `payload.path` |
| C002 | Error | `TOOL_CALL` actions must have `payload.tool` and `payload.args` |
| C003 | Warning | `TOOL_CALL` tool name should exist in registry |

---

## 5. Examples

### 5.1 Simple Dashboard

```json
{
  "schemaVersion": "1.0",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "locale": "en-US",
  "layout": {
    "type": "Dashboard",
    "props": {
      "title": "Sales Overview"
    },
    "children": [
      {
        "type": "KPIBoard",
        "props": {
          "title": "Key Metrics",
          "kpis": [
            {
              "label": "Revenue",
              "value": "$125,000",
              "trend": "up",
              "trendValue": "12%"
            },
            {
              "label": "Orders",
              "value": "1,234",
              "trend": "up",
              "trendValue": "8%"
            }
          ]
        },
        "aria": {
          "label": "Key performance indicators"
        }
      },
      {
        "type": "DataTable",
        "props": {
          "columns": [
            { "key": "id", "header": "Order ID" },
            { "key": "customer", "header": "Customer" },
            { "key": "amount", "header": "Amount" },
            { "key": "status", "header": "Status" }
          ],
          "rows": [
            {
              "id": "ORD-001",
              "customer": "Acme Corp",
              "amount": "$5,000",
              "status": "Delivered"
            }
          ]
        },
        "action": {
          "type": "TOOL_CALL",
          "payload": {
            "tool": "exportOrders",
            "args": {}
          }
        },
        "aria": {
          "label": "Recent orders"
        }
      }
    ]
  },
  "metadata": {
    "generatedAt": "2025-04-10T12:00:00Z",
    "model": "gpt-4",
    "provider": "openai",
    "latencyMs": 1250,
    "repairAttempts": 0,
    "cacheHit": false
  }
}
```

### 5.2 Form Layout

```json
{
  "schemaVersion": "1.0",
  "requestId": "550e8400-e29b-41d4-a716-446655440001",
  "locale": "en-US",
  "layout": {
    "type": "Dashboard",
    "props": {
      "title": "Create User"
    },
    "children": [
      {
        "type": "FormGroup",
        "props": {
          "title": "User Information"
        },
        "children": [
          {
            "type": "FormField",
            "props": {
              "label": "Name",
              "name": "name",
              "type": "text",
              "required": true,
              "placeholder": "Enter full name"
            },
            "aria": {
              "label": "Full name input"
            }
          },
          {
            "type": "FormField",
            "props": {
              "label": "Email",
              "name": "email",
              "type": "email",
              "required": true,
              "placeholder": "Enter email address"
            },
            "aria": {
              "label": "Email address input"
            }
          },
          {
            "type": "ActionButton",
            "props": {
              "label": "Create User",
              "variant": "primary"
            },
            "action": {
              "type": "TOOL_CALL",
              "payload": {
                "tool": "createUser",
                "args": {}
              }
            },
            "aria": {
              "label": "Create user button"
            }
          }
        ]
      }
    ]
  }
}
```

### 5.3 Error Layout

```json
{
  "schemaVersion": "1.0",
  "requestId": "550e8400-e29b-41d4-a716-446655440002",
  "locale": "en-US",
  "layout": {
    "type": "Dashboard",
    "props": {
      "title": "Error"
    },
    "children": [
      {
        "type": "StatusBanner",
        "props": {
          "variant": "error",
          "title": "Unable to Complete Request",
          "message": "We encountered an error while generating your layout. Please try again."
        },
        "action": {
          "type": "REFRESH"
        },
        "aria": {
          "label": "Error message",
          "live": "assertive"
        }
      }
    ]
  }
}
```

---

## 6. Schema Evolution

### 6.1 Versioning Strategy

| Version | Changes | Migration |
|---------|---------|-----------|
| 1.0 | Initial release | N/A |
| 1.1 (planned) | Partial updates | Backward compatible |
| 2.0 (planned) | Layout actions | Breaking changes |

### 6.2 Backward Compatibility

- New optional fields can be added in minor versions
- Required fields cannot be added in minor versions
- Deprecated fields are removed in major versions
- The engine supports multiple schema versions simultaneously

---

## 7. Validation Implementation

### 7.1 Zod Schema

```typescript
import { z } from 'zod';

export const FerroUILayoutSchema = z.object({
  schemaVersion: z.string().regex(/^\d+\.\d+$/),
  requestId: z.string().uuid(),
  locale: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/),
  layout: FerroUIComponentSchema,
  metadata: LayoutMetadataSchema.optional(),
});

export const FerroUIComponentSchema: z.ZodType = z.lazy(() =>
  z.object({
    type: z.string(),
    id: z.string().optional(),
    props: z.record(z.unknown()).optional(),
    children: z.array(FerroUIComponentSchema).optional(),
    action: ActionSchema.optional(),
    aria: AriaPropsSchema.optional(),
  })
);

export type FerroUILayout = z.infer<typeof FerroUILayoutSchema>;
export type FerroUIComponent = z.infer<typeof FerroUIComponentSchema>;
```

### 7.2 Validation Function

```typescript
import { FerroUILayoutSchema } from './schema';

export function validateLayout(layout: unknown): ValidationResult {
  const result = FerroUILayoutSchema.safeParse(layout);
  
  if (result.success) {
    return { valid: true, data: result.data };
  }
  
  return {
    valid: false,
    errors: result.error.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
      code: e.code,
    })),
  };
}
```

---

## 8. Related Documents

- [Tool Registration API Reference](./Tool_Registration_API_Reference.md)
- [Semantic Caching Strategy](./Semantic_Caching_Strategy_Invalidation.md)
- [Component Development Guidelines](../frontend/Component_Development_Guidelines.md)

---

## 9. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Engineering Team | Initial release |
