import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthMiddleware, signToken, JwtPayload } from './jwt';
import type { Request, Response, NextFunction } from 'express';

function makeReq(overrides: Partial<Request> = {}): Request & { auth?: JwtPayload } {
  return {
    path: '/api/alloy/process',
    headers: {},
    cookies: {},
    ...overrides,
  } as unknown as Request & { auth?: JwtPayload };
}

function makeRes(): Response & { statusCode: number; body: unknown } {
  const res: Partial<Response> & { statusCode: number; body: unknown } = {
    statusCode: 200,
    body: null,
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockImplementation((b: unknown) => { res.body = b; return res as Response; }),
  };
  return res as Response & { statusCode: number; body: unknown };
}

const SECRET = 'test-secret-123';

describe('JWT auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls next() for skip paths (/healthz)', () => {
    const middleware = createAuthMiddleware({ secret: SECRET });
    const req = makeReq({ path: '/healthz' });
    const res = makeRes();
    const next = vi.fn() as NextFunction;
    middleware(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('returns 401 when no token provided', () => {
    const middleware = createAuthMiddleware({ secret: SECRET });
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn() as NextFunction;
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches payload and calls next() for valid Bearer token', () => {
    const token = signToken({ sub: 'u1', userId: 'u1', permissions: ['read'] }, { secret: SECRET });
    const middleware = createAuthMiddleware({ secret: SECRET });
    const req = makeReq({ headers: { authorization: `Bearer ${token}` } });
    const res = makeRes();
    const next = vi.fn() as NextFunction;
    middleware(req as Request, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect((req as Request & { auth: JwtPayload }).auth?.userId).toBe('u1');
  });

  it('attaches payload from cookie', () => {
    const token = signToken({ sub: 'u2', userId: 'u2', permissions: ['admin'] }, { secret: SECRET });
    const middleware = createAuthMiddleware({ secret: SECRET, cookieName: 'alloy_session' });
    const req = makeReq({ cookies: { alloy_session: token } });
    const res = makeRes();
    const next = vi.fn() as NextFunction;
    middleware(req as Request, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect((req as Request & { auth: JwtPayload }).auth?.permissions).toContain('admin');
  });

  it('returns 403 for tampered token', () => {
    const middleware = createAuthMiddleware({ secret: SECRET });
    const req = makeReq({ headers: { authorization: 'Bearer invalid.token.here' } });
    const res = makeRes();
    const next = vi.fn() as NextFunction;
    middleware(req as Request, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for expired token', async () => {
    const token = signToken(
      { sub: 'u3', userId: 'u3', permissions: [] },
      { secret: SECRET, expiresIn: -1 }
    );
    const middleware = createAuthMiddleware({ secret: SECRET });
    const req = makeReq({ headers: { authorization: `Bearer ${token}` } });
    const res = makeRes();
    const next = vi.fn() as NextFunction;
    middleware(req as Request, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
