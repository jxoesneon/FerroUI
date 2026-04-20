import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { createTenantBudgetMiddleware, getBudgetStatus, setBudgetConfig } from './tenant-budget.js';
import { AuditLogger, AuditEventType } from '../audit/audit-logger.js';

describe('Tenant Budget Middleware', () => {
  let auditLogger: AuditLogger;
  let middleware: ReturnType<typeof createTenantBudgetMiddleware>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonMock: any;

  beforeEach(() => {
    auditLogger = { log: vi.fn() } as unknown as AuditLogger;
    middleware = createTenantBudgetMiddleware(auditLogger);
    req = { headers: {}, ip: '127.0.0.1', context: { requestId: 'test-req' }, auth: { sub: 'test-user' } } as unknown as Partial<Request>;
    jsonMock = vi.fn().mockReturnThis();
    res = { status: vi.fn().mockReturnThis(), json: jsonMock } as unknown as Partial<Response>;
    next = vi.fn();
  });

  it('allows request when within budget', async () => {
    req.headers!['x-tenant-id'] = 'starter-tenant';
    await middleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('tracks usage from response json', async () => {
    req.headers!['x-tenant-id'] = 'track-tenant';
    await middleware(req as Request, res as Response, next);
    
    const jsonBody = { llmUsage: { inputTokens: 1000, outputTokens: 500, model: 'claude-3-sonnet' } };
    (res.json as any)(jsonBody);
    
    const budget = getBudgetStatus('track-tenant');
    expect(budget?.usage.tokens).toBe(1500);
    expect(budget?.usage.requests).toBe(1);
    expect(budget?.usage.costCents).toBeGreaterThan(0);
  });

  it('rejects request when token limit exceeded', async () => {
    req.headers!['x-tenant-id'] = 'limit-tenant';
    setBudgetConfig('limit-tenant', { maxTokensPerDay: 100 });
    
    await middleware(req as Request, res as Response, next);
    (res.json as any)({ llmUsage: { inputTokens: 100, outputTokens: 50 } });
    
    await middleware(req as Request, res as Response, next);
    
    expect(res.status).toHaveBeenCalledWith(429);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'Budget limit exceeded', violations: ['token limit exceeded'] }));
    expect(auditLogger.log).toHaveBeenCalledWith(expect.objectContaining({ type: AuditEventType.RATE_LIMITED }));
  });

  it('rejects request when request limit exceeded', async () => {
    req.headers!['x-tenant-id'] = 'req-limit-tenant';
    setBudgetConfig('req-limit-tenant', { maxRequestsPerDay: 1 });
    
    await middleware(req as Request, res as Response, next);
    (res.json as any)({ llmUsage: { inputTokens: 10, outputTokens: 5 } });
    
    await middleware(req as Request, res as Response, next);
    
    expect(res.status).toHaveBeenCalledWith(429);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'Budget limit exceeded', violations: ['request limit exceeded'] }));
  });

  it('rejects request when cost limit exceeded', async () => {
    req.headers!['x-tenant-id'] = 'cost-limit-tenant';
    setBudgetConfig('cost-limit-tenant', { maxCostPerDay: 10 }); // 10 cents
    
    await middleware(req as Request, res as Response, next);
    (res.json as any)({ llmUsage: { inputTokens: 10000, outputTokens: 10000, model: 'gpt-4' } }); // expensive
    
    await middleware(req as Request, res as Response, next);
    
    expect(res.status).toHaveBeenCalledWith(429);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'Budget limit exceeded', violations: ['cost limit exceeded'] }));
  });

  it('configures budget based on tenant tier', async () => {
    req.headers!['x-tenant-id'] = 'ent-tenant';
    await middleware(req as Request, res as Response, next);
    expect(getBudgetStatus('ent-tenant')?.config.maxTokensPerDay).toBe(1000000);

    req.headers!['x-tenant-id'] = 'growth-tenant';
    await middleware(req as Request, res as Response, next);
    expect(getBudgetStatus('growth-tenant')?.config.maxTokensPerDay).toBe(500000);
    
    req.headers!['x-tenant-id'] = 'starter-tenant-2';
    await middleware(req as Request, res as Response, next);
    expect(getBudgetStatus('starter-tenant-2')?.config.maxTokensPerDay).toBe(100000);
  });
  
  it('estimates cost for different models', async () => {
    req.headers!['x-tenant-id'] = 'cost-tenant';
    await middleware(req as Request, res as Response, next);
    
    (res.json as any)({ llmUsage: { inputTokens: 1000, outputTokens: 1000, model: 'claude-3-opus' } });
    let budget = getBudgetStatus('cost-tenant');
    expect(budget?.usage.costCents).toBe(90); // 15 + 75
    
    (res.json as any)({ llmUsage: { inputTokens: 1000, outputTokens: 1000, model: 'claude-3-haiku' } });
    budget = getBudgetStatus('cost-tenant');
    expect(budget?.usage.costCents).toBe(90 + 2); // 0.25 + 1.25 = 1.5 -> Math.ceil(1.5) = 2
    
    (res.json as any)({ llmUsage: { inputTokens: 1000, outputTokens: 1000, model: 'gpt-3.5-turbo' } });
    budget = getBudgetStatus('cost-tenant');
    expect(budget?.usage.costCents).toBe(92 + 2); // 0.5 + 1.5 = 2 -> Math.ceil(2) = 2
  });

  it('resets budget after a day', async () => {
    req.headers!['x-tenant-id'] = 'reset-tenant';
    await middleware(req as Request, res as Response, next);
    
    const budget = getBudgetStatus('reset-tenant');
    const pastDate = new Date();
    pastDate.setUTCDate(pastDate.getUTCDate() - 1); // Yesterday
    budget!.usage.lastReset = pastDate;
    budget!.usage.tokens = 5000;
    
    // Process a new request, should trigger reset
    await middleware(req as Request, res as Response, next);
    
    const budgetAfter = getBudgetStatus('reset-tenant');
    expect(budgetAfter?.usage.tokens).toBe(0);
  });
});
