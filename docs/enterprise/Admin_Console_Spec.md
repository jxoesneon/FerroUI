# Admin Console Specification (E.2)

The FerroUI Admin Console provides enterprise administrators with comprehensive control over their FerroUI deployment.

## Features

### 1. User Management
- **List Users**: View all users with filtering by tenant, role, status
- **User Details**: View individual user activity, permissions, quota usage
- **Edit User**: Modify roles, permissions, tenant assignment
- **Deactivate/Suspend**: Temporarily disable user access
- **Audit Trail**: View all actions taken by user

### 2. Tenant/Organization Management
- **Create Tenant**: Set up new organizational units
- **Configure SSO**: SAML/OIDC provider setup wizard
- **Set Quotas**: Configure per-tenant limits (tokens, requests, cost)
- **Billing Integration**: Connect to Stripe/custom billing systems
- **Data Residency**: Set geographic region for data storage

### 3. Usage Analytics Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Usage Analytics - Acme Corp                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Total Requests: 1.2M]  [Tokens Used: 45M]  [Cost: $450]  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 Daily Usage Trend                    │  │
│  │   requests/day                                        │  │
│  │  50k ┤                      ╭───╮                    │  │
│  │      │          ╭────╮     ╭╯   ╰──                  │  │
│  │  30k ┤    ╭────╯    ╰────╯                           │  │
│  │      │  ╭╯                                          │  │
│  │  10k ┤──╯                                            │  │
│  │      └────┬────┬────┬────┬────┬────┬────             │  │
│  │          Mon  Tue  Wed  Thu  Fri  Sat  Sun           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Top Users          │  Top Components                       │
│  ─────────────────  │  ───────────────────                  │
│  1. Alice (45K)    │  1. Dashboard (32%)                   │
│  2. Bob (38K)      │  2. Form (28%)                        │
│  3. Carol (22K)    │  3. Table (15%)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4. Audit Log Viewer
- Real-time log streaming
- Filter by: user, tenant, event type, date range
- Export to: CSV, JSON, SIEM formats (Splunk, Datadog)
- HMAC chain verification status

### 5. Configuration Management
- **Rate Limits**: Per-tenant request throttling
- **Provider Settings**: Default LLM, fallback providers
- **Safety Settings**: Hallucination thresholds, firewall rules
- **Cache Settings**: TTL, invalidation rules
- **Notification Settings**: Alert webhooks, email configs

## API Endpoints

```typescript
// Admin API (requires admin JWT scope)

GET  /admin/v1/users                    // List users
GET  /admin/v1/users/:id                // Get user details
PUT  /admin/v1/users/:id                // Update user
DELETE /admin/v1/users/:id              // Deactivate user

GET  /admin/v1/tenants                  // List tenants
POST /admin/v1/tenants                  // Create tenant
PUT  /admin/v1/tenants/:id/quotas       // Update quotas

GET  /admin/v1/audit-logs               // Query audit logs
GET  /admin/v1/audit-logs/stream        // WebSocket stream

GET  /admin/v1/metrics                  // Usage metrics
GET  /admin/v1/metrics/export           // Export reports

GET  /admin/v1/system/health            // System health
POST /admin/v1/cache/invalidate         // Invalidate cache
```

## Implementation

```typescript
// packages/admin/src/server.ts

import express from 'express';
import { requireAdmin } from './auth';
import { UserService } from './services/users';
import { AuditService } from './services/audit';
import { MetricsService } from './services/metrics';

const app = express();

// All routes require admin authentication
app.use(requireAdmin);

app.get('/v1/users', async (req, res) => {
  const users = await UserService.list({
    tenantId: req.query.tenant as string,
    limit: parseInt(req.query.limit as string) || 50,
    offset: parseInt(req.query.offset as string) || 0,
  });
  res.json(users);
});

app.get('/v1/audit-logs', async (req, res) => {
  const logs = await AuditService.query({
    userId: req.query.userId as string,
    tenantId: req.query.tenantId as string,
    eventType: req.query.eventType as string,
    from: new Date(req.query.from as string),
    to: new Date(req.query.to as string),
    limit: 1000,
  });
  res.json(logs);
});

// WebSocket for real-time logs
app.ws('/v1/audit-logs/stream', (ws, req) => {
  const stream = AuditService.stream();
  stream.on('data', (log) => ws.send(JSON.stringify(log)));
});
```

## UI Components

- Built with FerroUI itself (dogfooding)
- Responsive design for mobile admin access
- Dark mode support
- Role-based UI (super-admin vs tenant-admin views)
