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

export interface TenantBudget {
  dailyCostLimitCents: number;
  maxSafetyEventsPerDay: number;
}

export const PROVIDER_PRICING: Record<string, { input: number; output: number }> = {
  'anthropic': { input: 0.003, output: 0.015 }, // per 1K tokens
  'openai': { input: 0.005, output: 0.015 },
  'google': { input: 0.0035, output: 0.0105 },
  'ollama': { input: 0, output: 0 },
  'llama-cpp': { input: 0, output: 0 },
};

interface QuotaBucket {
  count: number;
  windowStart: number;
}

interface BudgetUsage {
  cents: number;
  safetyEvents: number;
  lastReset: number;
}

const inMemoryBuckets = new Map<string, QuotaBucket>();

/**
 * DailyBudgetStore tracks per-tenant cost (in cents) and safety events.
 * Reset is triggered when a request comes in on a new calendar day.
 */
export class DailyBudgetStore {
  private usage = new Map<string, BudgetUsage>();

  getUsage(tenantId: string): BudgetUsage {
    const now = Date.now();
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    let current = this.usage.get(tenantId);

    if (!current || current.lastReset < startOfDay) {
      current = { cents: 0, safetyEvents: 0, lastReset: now };
      this.usage.set(tenantId, current);
    }
    return current;
  }

  incrementCents(tenantId: string, cents: number): void {
    const usage = this.getUsage(tenantId);
    usage.cents += cents;
  }

  checkBudget(tenantId: string, estimatedCents: number): boolean {
    const budget = getTenantBudget(tenantId);
    const usage = this.getUsage(tenantId);
    return (usage.cents + estimatedCents) <= budget.dailyCostLimitCents;
  }

  recordSafetyEvent(tenantId: string): void {
    const usage = this.getUsage(tenantId);
    usage.safetyEvents += 1;
    
    const budget = getTenantBudget(tenantId);
    if (usage.safetyEvents >= budget.maxSafetyEventsPerDay) {
      console.error(`[Safety] Daily safety event limit exceeded for tenant ${tenantId}. Further requests will be blocked.`);
    }
  }

  isSafetyBlocked(tenantId: string): boolean {
    const budget = getTenantBudget(tenantId);
    const usage = this.getUsage(tenantId);
    return usage.safetyEvents >= budget.maxSafetyEventsPerDay;
  }

  incrementSafetyEvents(tenantId: string): void {
    this.recordSafetyEvent(tenantId);
  }

  /**
   * Clears all usage data. Primarily for testing.
   */
  resetAll(): void {
    this.usage.clear();
  }
}

export const dailyBudgetStore = new DailyBudgetStore();

function getTenantRpm(tenantId: string): number {
  const override = process.env[`TENANT_QUOTA_${tenantId.toUpperCase()}_RPM`];
  if (override) return parseInt(override, 10);
  return parseInt(process.env.TENANT_QUOTA_DEFAULT_RPM ?? '60', 10);
}

export function getTenantBudget(tenantId: string): TenantBudget {
  const costLimit = process.env[`TENANT_BUDGET_${tenantId.toUpperCase()}_DAILY_COST_CENTS`];
  const safetyLimit = process.env[`TENANT_BUDGET_${tenantId.toUpperCase()}_MAX_SAFETY_EVENTS`];

  return {
    dailyCostLimitCents: costLimit ? parseInt(costLimit, 10) : parseInt(process.env.TENANT_BUDGET_DEFAULT_DAILY_COST_CENTS ?? '1000', 10),
    maxSafetyEventsPerDay: safetyLimit ? parseInt(safetyLimit, 10) : parseInt(process.env.TENANT_BUDGET_DEFAULT_MAX_SAFETY_EVENTS ?? '5', 10),
  };
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
 * Express middleware that enforces per-tenant request quotas and budgets.
 * Must be placed after JSON body parsing so `req.body.context.tenantId` is available.
 * Skips quota enforcement on non-API paths.
 */
export function tenantQuotaMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.path.startsWith('/api/')) {
    next();
    return;
  }

  const tenantId: string = (req.body?.context?.tenantId as string | undefined) ?? 'default';

  // 1. Check Daily Cost Budget
  const budget = getTenantBudget(tenantId);
  const usage = dailyBudgetStore.getUsage(tenantId);

  if (usage.cents >= budget.dailyCostLimitCents) {
    res.status(402).json({
      error: 'Daily cost budget exceeded',
      tenantId,
      limit: budget.dailyCostLimitCents,
      current: usage.cents,
    });
    return;
  }

  // 2. Check Daily Safety Event Limit
  if (dailyBudgetStore.isSafetyBlocked(tenantId)) {
    console.warn(`[Metric] ferroui.safety.budget_exceeded tenant=${tenantId}`);
    res.status(429).json({
      error: 'Daily safety event limit exceeded',
      tenantId,
      limit: budget.maxSafetyEventsPerDay,
    });
    return;
  }

  // 3. Check Request Rate (RPM)
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
  res.setHeader('X-Tenant-Daily-Budget-Limit', budget.dailyCostLimitCents);
  res.setHeader('X-Tenant-Daily-Budget-Usage', usage.cents);
  next();
}
