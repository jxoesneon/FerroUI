import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tenantQuotaMiddleware, dailyBudgetStore } from './tenant-quota.js';
import type { Request, Response, NextFunction } from 'express';

function makeReq(path = '/api/generate', tenantId?: string): Partial<Request> {
  return {
    path,
    body: tenantId ? { context: { tenantId } } : {},
  };
}

function makeRes(): { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn>; setHeader: ReturnType<typeof vi.fn> } {
  const res = { status: vi.fn(), json: vi.fn(), setHeader: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('tenantQuotaMiddleware', () => {
  const next: NextFunction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.TENANT_QUOTA_DEFAULT_RPM;
    delete process.env['TENANT_QUOTA_DEFAULT_RPM'];
    dailyBudgetStore.resetAll();
  });

  afterEach(() => {
    delete process.env.TENANT_QUOTA_DEFAULT_RPM;
    vi.useRealTimers();
  });

  it('calls next() for non-API paths', () => {
    const req = makeReq('/health');
    const res = makeRes();
    tenantQuotaMiddleware(req as Request, res as unknown as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('allows request within quota', () => {
    const req = makeReq('/api/generate', 'tenant-allow-test');
    const res = makeRes();
    tenantQuotaMiddleware(req as Request, res as unknown as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('X-Tenant-Id', 'tenant-allow-test');
  });

  it('defaults tenantId to "default" when missing', () => {
    const req = makeReq('/api/generate');
    const res = makeRes();
    tenantQuotaMiddleware(req as Request, res as unknown as Response, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-Tenant-Id', 'default');
  });

  it('uses per-tenant RPM override from env', () => {
    process.env.TENANT_QUOTA_ACME_RPM = '1';
    const req = makeReq('/api/generate', 'acme');
    const res = makeRes();
    // First request: allowed
    tenantQuotaMiddleware(req as Request, res as unknown as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
    // Second request: quota exceeded (RPM=1)
    vi.clearAllMocks();
    tenantQuotaMiddleware(req as Request, res as unknown as Response, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(next).not.toHaveBeenCalled();
    delete process.env.TENANT_QUOTA_ACME_RPM;
  });

  it('returns 429 with correct body when quota exceeded', () => {
    process.env['TENANT_QUOTA_QUOTA429TEST_RPM'] = '1';
    const req = makeReq('/api/generate', 'quota429test');
    const res1 = makeRes();
    // First request: allowed
    tenantQuotaMiddleware(req as Request, res1 as unknown as Response, next);
    // Second request: 429
    const res2 = makeRes();
    tenantQuotaMiddleware(req as Request, res2 as unknown as Response, next);
    expect(res2.status).toHaveBeenCalledWith(429);
    expect(res2.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Tenant quota exceeded', retryAfter: 60 }));
    delete process.env['TENANT_QUOTA_QUOTA429TEST_RPM'];
  });

  describe('Daily Budget Enforcements', () => {
    it('returns 402 when daily cost budget exceeded', () => {
      const tenantId = 'budget-exceeded-tenant';
      process.env[`TENANT_BUDGET_${tenantId.toUpperCase()}_DAILY_COST_CENTS`] = '100';
      
      // Manually set usage to 100
      dailyBudgetStore.incrementCents(tenantId, 100);

      const req = makeReq('/api/generate', tenantId);
      const res = makeRes();
      tenantQuotaMiddleware(req as Request, res as unknown as Response, next);

      expect(res.status).toHaveBeenCalledWith(402);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Daily cost budget exceeded',
        limit: 100,
        current: 100
      }));
      
      delete process.env[`TENANT_BUDGET_${tenantId.toUpperCase()}_DAILY_COST_CENTS`];
    });

    it('returns 429 when daily safety event limit exceeded', () => {
      const tenantId = 'safety-exceeded-tenant';
      process.env[`TENANT_BUDGET_${tenantId.toUpperCase()}_MAX_SAFETY_EVENTS`] = '2';
      
      const spy = vi.spyOn(console, 'warn');

      // Manually set usage to 2 safety events
      dailyBudgetStore.recordSafetyEvent(tenantId);
      dailyBudgetStore.recordSafetyEvent(tenantId);

      const req = makeReq('/api/generate', tenantId);
      const res = makeRes();
      tenantQuotaMiddleware(req as Request, res as unknown as Response, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Daily safety event limit exceeded',
        limit: 2
      }));
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('ferroui.safety.budget_exceeded'));
      
      delete process.env[`TENANT_BUDGET_${tenantId.toUpperCase()}_MAX_SAFETY_EVENTS`];
    });

    it('checkBudget returns false if budget is exceeded with estimation', () => {
      const tenantId = 'check-budget-tenant';
      process.env[`TENANT_BUDGET_${tenantId.toUpperCase()}_DAILY_COST_CENTS`] = '100';
      dailyBudgetStore.incrementCents(tenantId, 80);

      expect(dailyBudgetStore.checkBudget(tenantId, 10)).toBe(true);
      expect(dailyBudgetStore.checkBudget(tenantId, 30)).toBe(false);
      
      delete process.env[`TENANT_BUDGET_${tenantId.toUpperCase()}_DAILY_COST_CENTS`];
    });

    it('isSafetyBlocked returns true when limit reached', () => {
      const tenantId = 'is-safety-blocked-tenant';
      process.env[`TENANT_BUDGET_${tenantId.toUpperCase()}_MAX_SAFETY_EVENTS`] = '1';
      
      expect(dailyBudgetStore.isSafetyBlocked(tenantId)).toBe(false);
      dailyBudgetStore.recordSafetyEvent(tenantId);
      expect(dailyBudgetStore.isSafetyBlocked(tenantId)).toBe(true);
      
      delete process.env[`TENANT_BUDGET_${tenantId.toUpperCase()}_MAX_SAFETY_EVENTS`];
    });

    it('allows request when within budgets and sets headers', () => {
      const tenantId = 'within-budget-tenant';
      process.env[`TENANT_BUDGET_${tenantId.toUpperCase()}_DAILY_COST_CENTS`] = '1000';
      dailyBudgetStore.incrementCents(tenantId, 500);

      const req = makeReq('/api/generate', tenantId);
      const res = makeRes();
      tenantQuotaMiddleware(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith('X-Tenant-Daily-Budget-Usage', 500);
      expect(res.setHeader).toHaveBeenCalledWith('X-Tenant-Daily-Budget-Limit', 1000);
      
      delete process.env[`TENANT_BUDGET_${tenantId.toUpperCase()}_DAILY_COST_CENTS`];
    });

    it('resets budget when a new day starts', () => {
      const tenantId = 'reset-test-tenant';
      vi.useFakeTimers();
      
      // Set to today 10:00 AM
      const today = new Date(2026, 3, 20, 10, 0, 0);
      vi.setSystemTime(today);
      
      dailyBudgetStore.incrementCents(tenantId, 500);
      expect(dailyBudgetStore.getUsage(tenantId).cents).toBe(500);
      
      // Move to next day 01:00 AM
      const tomorrow = new Date(2026, 3, 21, 1, 0, 0);
      vi.setSystemTime(tomorrow);
      
      expect(dailyBudgetStore.getUsage(tenantId).cents).toBe(0);
    });
  });
});
