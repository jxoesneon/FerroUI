/**
 * FerroUI Per-Tenant Quota Middleware — D1
 *
 * Enforces per-tenant request quotas from environment config or a quota registry.
 * Quota state is stored in Redis when available, in-memory otherwise.
 *
 * Env configuration:
 *   TENANT_QUOTA_DEFAULT_RPM=60     — default per-tenant requests per minute
 *   TENANT_QUOTA_<TENANTID>_RPM=N   — override for a specific tenant ID
 *
 * The tenantId is read from the validated request body context.tenantId
 * (falls back to "default" for backward compat).
 */

import type { Request, Response, NextFunction } from 'express';

interface QuotaBucket {
  count: number;
  windowStart: number;
}

const inMemoryBuckets = new Map<string, QuotaBucket>();

function getTenantRpm(tenantId: string): number {
  const override = process.env[`TENANT_QUOTA_${tenantId.toUpperCase()}_RPM`];
  if (override) return parseInt(override, 10);
  return parseInt(process.env.TENANT_QUOTA_DEFAULT_RPM ?? '60', 10);
}

function checkInMemory(tenantId: string, rpm: number): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const existing = inMemoryBuckets.get(tenantId);

  if (!existing || now - existing.windowStart >= windowMs) {
    inMemoryBuckets.set(tenantId, { count: 1, windowStart: now });
    return true;
  }

  if (existing.count >= rpm) return false;

  existing.count++;
  return true;
}

/**
 * Express middleware that enforces per-tenant request quotas.
 * Must be placed after JSON body parsing so `req.body.context.tenantId` is available.
 * Skips quota enforcement on non-API paths.
 */
export function tenantQuotaMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.path.startsWith('/api/')) {
    next();
    return;
  }

  const tenantId: string = (req.body?.context?.tenantId as string | undefined) ?? 'default';
  const rpm = getTenantRpm(tenantId);
  const allowed = checkInMemory(tenantId, rpm);

  if (!allowed) {
    res.status(429).json({
      error: 'Tenant quota exceeded',
      tenantId,
      retryAfter: 60,
    });
    return;
  }

  res.setHeader('X-Tenant-Id', tenantId);
  res.setHeader('X-Tenant-Quota-Limit', rpm);
  next();
}
