import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tenantQuotaMiddleware } from './tenant-quota';
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
  });

  afterEach(() => {
    delete process.env.TENANT_QUOTA_DEFAULT_RPM;
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
});
