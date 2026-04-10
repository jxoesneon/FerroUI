# Tool Registration API Reference

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Backend Engineering Team  

---

## 1. Overview

Tools are the only mechanism through which the LLM accesses real data in Alloy UI. The Tool Registry is the authoritative list of what the LLM is allowed to do. This document provides the complete API reference for registering and using tools.

---

## 2. Tool Registration

### 2.1 Basic Registration

```typescript
import { registerTool } from '@alloy/tools';
import { z } from 'zod';

registerTool({
  name: 'getUserProfile',
  description: 'Returns full profile for a given userId.',
  parameters: z.object({
    userId: z.string().uuid(),
  }),
  returns: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['admin', 'user', 'guest']),
    createdAt: z.string().datetime(),
  }),
  ttl: 300, // Cache for 5 minutes
  requiredPermissions: ['profile:read'],
  execute: async ({ userId }) => {
    const user = await db.users.findById(userId);
    if (!user) {
      throw new ToolError('USER_NOT_FOUND', `User ${userId} not found`);
    }
    return user;
  },
});
```

### 2.2 Registration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | `string` | Yes | Unique tool name (kebab-case) |
| `description` | `string` | Yes | Description for LLM context |
| `parameters` | `ZodSchema` | Yes | Input parameter schema |
| `returns` | `ZodSchema` | Yes | Return value schema |
| `execute` | `function` | Yes | Tool implementation |
| `ttl` | `number` | No | Cache TTL in seconds (0 = no cache) |
| `requiredPermissions` | `string[]` | No | Required user permissions |
| `dataClassification` | `string` | No | `'shared'` or `'user-specific'` |
| `timeout` | `number` | No | Execution timeout in ms (default: 3000) |
| `tags` | `string[]` | No | Categorization tags |

---

## 3. Tool Schema

### 3.1 Parameter Schema

```typescript
// Simple parameters
const SimpleParams = z.object({
  userId: z.string().uuid(),
});

// Complex parameters
const ComplexParams = z.object({
  filters: z.object({
    status: z.enum(['active', 'inactive', 'pending']).optional(),
    dateRange: z.object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    }).optional(),
  }),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),
  sort: z.object({
    field: z.enum(['name', 'createdAt', 'updatedAt']),
    order: z.enum(['asc', 'desc']).default('asc'),
  }).optional(),
});

// With descriptions (for LLM)
const DocumentedParams = z.object({
  query: z.string().describe('Search query string'),
  limit: z.number().int().describe('Maximum number of results to return'),
});
```

### 3.2 Return Schema

```typescript
// Single item return
const UserReturn = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
});

// List return
const UserListReturn = z.object({
  items: z.array(UserReturn),
  total: z.number().int(),
  page: z.number().int(),
  hasMore: z.boolean(),
});

// Union return (success or error)
const ResultReturn = z.union([
  z.object({ success: z.literal(true), data: UserReturn }),
  z.object({ success: z.literal(false), error: z.string() }),
]);
```

---

## 4. Tool Implementation

### 4.1 Basic Implementation

```typescript
registerTool({
  name: 'getCurrentUser',
  description: 'Returns the currently authenticated user.',
  parameters: z.object({}),
  returns: UserSchema,
  execute: async (_params, context) => {
    // Access session context
    const { userId } = context.session;
    
    const user = await db.users.findById(userId);
    return user;
  },
});
```

### 4.2 Context Access

The execute function receives a context object:

```typescript
interface ToolContext {
  session: {
    id: string;
    userId: string;
    permissions: string[];
    locale: string;
  };
  request: {
    id: string;
    prompt: string;
    timestamp: Date;
  };
  logger: Logger;
  telemetry: Telemetry;
}

registerTool({
  name: 'logActivity',
  description: 'Logs user activity.',
  parameters: z.object({ action: z.string() }),
  returns: z.object({ success: z.boolean() }),
  execute: async ({ action }, context) => {
    context.logger.info('User activity', {
      userId: context.session.userId,
      action,
      requestId: context.request.id,
    });
    
    context.telemetry.recordEvent('activity', {
      action,
      userId: context.session.userId,
    });
    
    return { success: true };
  },
});
```

### 4.3 Error Handling

```typescript
import { ToolError } from '@alloy/tools';

registerTool({
  name: 'transferFunds',
  description: 'Transfers funds between accounts.',
  parameters: z.object({
    fromAccount: z.string(),
    toAccount: z.string(),
    amount: z.number().positive(),
  }),
  returns: z.object({ transactionId: z.string() }),
  execute: async ({ fromAccount, toAccount, amount }) => {
    // Validate sufficient funds
    const balance = await getBalance(fromAccount);
    if (balance < amount) {
      throw new ToolError(
        'INSUFFICIENT_FUNDS',
        `Account ${fromAccount} has insufficient funds. Balance: ${balance}`,
        { balance, requested: amount }
      );
    }
    
    try {
      const transaction = await executeTransfer(fromAccount, toAccount, amount);
      return { transactionId: transaction.id };
    } catch (error) {
      throw new ToolError(
        'TRANSFER_FAILED',
        'Failed to execute transfer',
        { originalError: error.message }
      );
    }
  },
});
```

### 4.4 Error Types

| Code | Description | Retryable |
|------|-------------|-----------|
| `INVALID_PARAMS` | Parameters failed validation | No |
| `NOT_FOUND` | Requested resource not found | No |
| `UNAUTHORIZED` | User lacks permission | No |
| `TIMEOUT` | Execution timed out | Yes |
| `RATE_LIMITED` | Rate limit exceeded | Yes (with backoff) |
| `DEPENDENCY_ERROR` | External service error | Yes |
| `INTERNAL_ERROR` | Unexpected error | Yes |

---

## 5. Permission Model

### 5.1 Declaring Permissions

```typescript
registerTool({
  name: 'deleteUser',
  description: 'Permanently deletes a user account.',
  parameters: z.object({ userId: z.string().uuid() }),
  returns: z.object({ deleted: z.boolean() }),
  requiredPermissions: ['user:delete', 'user:admin'],
  execute: async ({ userId }) => {
    await db.users.delete(userId);
    return { deleted: true };
  },
});
```

### 5.2 Permission Checking

The engine automatically checks permissions before executing:

```typescript
// Tool manifest is filtered based on user permissions
const userPermissions = ['profile:read', 'user:read'];

// Available tools for this user:
// - getUserProfile ✓ (requires: ['profile:read'])
// - listUsers ✓ (requires: ['user:read'])
// - deleteUser ✗ (requires: ['user:delete', 'user:admin'])
```

### 5.3 Dynamic Permission Checks

```typescript
registerTool({
  name: 'getUserData',
  description: 'Returns user data with field-level permissions.',
  parameters: z.object({ userId: z.string().uuid() }),
  returns: UserDataSchema,
  execute: async ({ userId }, context) => {
    const user = await db.users.findById(userId);
    
    // Filter fields based on permissions
    const canSeeEmail = context.session.permissions.includes('user:email:read');
    const canSeeSalary = context.session.permissions.includes('user:salary:read');
    
    return {
      id: user.id,
      name: user.name,
      email: canSeeEmail ? user.email : undefined,
      salary: canSeeSalary ? user.salary : undefined,
    };
  },
});
```

---

## 6. Caching

### 6.1 Cache Configuration

```typescript
registerTool({
  name: 'getExchangeRates',
  description: 'Returns current exchange rates.',
  parameters: z.object({
    baseCurrency: z.string().length(3),
  }),
  returns: ExchangeRatesSchema,
  ttl: 3600, // Cache for 1 hour
  dataClassification: 'shared', // Can be shared across users
  execute: async ({ baseCurrency }) => {
    const rates = await fetchExchangeRates(baseCurrency);
    return rates;
  },
});
```

### 6.2 Cache Invalidation

```typescript
import { invalidateCache } from '@alloy/tools';

// Invalidate specific tool cache
await invalidateCache('getExchangeRates');

// Invalidate with parameters
await invalidateCache('getUserProfile', { userId: '123' });

// Invalidate by pattern
await invalidateCachePattern('get*');
```

### 6.3 Cache Bypass

```typescript
registerTool({
  name: 'getRealTimeData',
  description: 'Returns real-time sensor data.',
  parameters: z.object({ sensorId: z.string() }),
  returns: SensorDataSchema,
  ttl: 0, // Never cache
  execute: async ({ sensorId }) => {
    const data = await fetchSensorData(sensorId);
    return data;
  },
});
```

---

## 7. Tool Categories

### 7.1 Data Fetch Tools

```typescript
registerTool({
  name: 'listOrders',
  description: 'Returns a paginated list of orders.',
  parameters: z.object({
    status: z.enum(['pending', 'shipped', 'delivered', 'cancelled']).optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),
  returns: PaginatedOrdersSchema,
  ttl: 60,
  requiredPermissions: ['orders:read'],
  execute: async ({ status, page, limit }) => {
    return await db.orders.findMany({
      where: status ? { status } : undefined,
      skip: (page - 1) * limit,
      take: limit,
    });
  },
});
```

### 7.2 Computation Tools

```typescript
registerTool({
  name: 'calculateMetrics',
  description: 'Calculates aggregate metrics from data.',
  parameters: z.object({
    data: z.array(z.number()),
    operation: z.enum(['sum', 'average', 'median', 'stddev']),
  }),
  returns: z.object({ result: z.number() }),
  ttl: 0, // Computations not cached
  execute: async ({ data, operation }) => {
    const result = await calculate(operation, data);
    return { result };
  },
});
```

### 7.3 External API Tools

```typescript
registerTool({
  name: 'sendSlackNotification',
  description: 'Sends a notification to Slack.',
  parameters: z.object({
    channel: z.string(),
    message: z.string(),
  }),
  returns: z.object({ sent: z.boolean() }),
  ttl: 0,
  requiredPermissions: ['notifications:send'],
  execute: async ({ channel, message }) => {
    await slackClient.chat.postMessage({
      channel,
      text: message,
    });
    return { sent: true };
  },
});
```

### 7.4 System Tools

```typescript
registerTool({
  name: 'alloy.setProvider',
  description: 'Changes the active LLM provider.',
  parameters: z.object({
    provider: z.enum(['openai', 'anthropic', 'ollama']),
  }),
  returns: z.object({ success: z.boolean() }),
  requiredPermissions: ['alloy:admin'],
  execute: async ({ provider }, context) => {
    await context.engine.setProvider(provider);
    return { success: true };
  },
});
```

---

## 8. Testing Tools

### 8.1 Mock Implementation

```typescript
// tools/__mocks__/getUserProfile.ts
export const mockGetUserProfile = {
  name: 'getUserProfile',
  mock: async ({ userId }: { userId: string }) => {
    return {
      id: userId,
      name: 'Mock User',
      email: 'mock@example.com',
      role: 'user',
      createdAt: new Date().toISOString(),
    };
  },
};
```

### 8.2 Unit Testing

```typescript
// tools/getUserProfile.test.ts
import { executeTool } from '@alloy/tools/testing';
import { getUserProfile } from './getUserProfile';

describe('getUserProfile', () => {
  it('returns user profile', async () => {
    const result = await executeTool(getUserProfile, {
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('email');
  });

  it('throws for invalid userId', async () => {
    await expect(
      executeTool(getUserProfile, { userId: 'invalid' })
    ).rejects.toThrow('Invalid uuid');
  });
});
```

---

## 9. Tool Manifest

The engine generates a tool manifest for the LLM:

```json
{
  "tools": [
    {
      "name": "getUserProfile",
      "description": "Returns full profile for a given userId.",
      "parameters": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "format": "uuid"
          }
        },
        "required": ["userId"]
      }
    },
    {
      "name": "listOrders",
      "description": "Returns a paginated list of orders.",
      "parameters": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "enum": ["pending", "shipped", "delivered", "cancelled"]
          },
          "page": { "type": "integer", "minimum": 1, "default": 1 },
          "limit": { "type": "integer", "minimum": 1, "maximum": 100, "default": 20 }
        }
      }
    }
  ]
}
```

---

## 10. Related Documents

- [AlloyLayout JSON Schema Specification](./AlloyLayout_JSON_Schema_Specification.md)
- [Semantic Caching Strategy](./Semantic_Caching_Strategy_Invalidation.md)
- [System Architecture Document](../../architecture/System_Architecture_Document.md)

---

## 11. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Backend Team | Initial release |
