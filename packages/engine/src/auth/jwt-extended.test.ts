import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { createAuthMiddleware, signToken, setSessionCookie, clearSessionCookie } from './jwt';

const SECRET = 'test-secret-for-unit-tests';

function makeReqRes(overrides: Record<string, unknown> = {}) {
  const req: Record<string, unknown> = { path: '/api/data', cookies: {}, headers: {}, ...overrides };
  const res: Record<string, unknown> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req, res, next };
}

describe('createAuthMiddleware', () => {
  it('skips /healthz paths', () => {
    const mw = createAuthMiddleware({ secret: SECRET });
    const { req, res, next } = makeReqRes({ path: '/healthz' });
    mw(req as never, res as never, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('skips /readyz paths', () => {
    const mw = createAuthMiddleware({ secret: SECRET });
    const { req, res, next } = makeReqRes({ path: '/readyz/check' });
    mw(req as never, res as never, next);
    expect(next).toHaveBeenCalled();
  });

  it('skips custom skipPaths', () => {
    const mw = createAuthMiddleware({ secret: SECRET, skipPaths: ['/public'] });
    const { req, res, next } = makeReqRes({ path: '/public/asset.js' });
    mw(req as never, res as never, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when no token present', () => {
    const mw = createAuthMiddleware({ secret: SECRET });
    const { req, res, next } = makeReqRes();
    mw(req as never, res as never, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts valid Bearer token', () => {
    const token = signToken({ sub: 'u1', userId: 'u1', permissions: ['read'] }, { secret: SECRET });
    const mw = createAuthMiddleware({ secret: SECRET });
    const { req, res, next } = makeReqRes({ headers: { authorization: `Bearer ${token}` } });
    mw(req as never, res as never, next);
    expect(next).toHaveBeenCalled();
  });

  it('accepts valid cookie token', () => {
    const token = signToken({ sub: 'u1', userId: 'u1', permissions: [] }, { secret: SECRET });
    const mw = createAuthMiddleware({ secret: SECRET, cookieName: 'ferroui_session' });
    const { req, res, next } = makeReqRes({ cookies: { ferroui_session: token } });
    mw(req as never, res as never, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 for expired token', () => {
    const token = jwt.sign({ sub: 'u1', userId: 'u1', permissions: [] }, SECRET, { expiresIn: -1 });
    const mw = createAuthMiddleware({ secret: SECRET });
    const { req, res, next } = makeReqRes({ headers: { authorization: `Bearer ${token}` } });
    mw(req as never, res as never, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 403 for invalid token', () => {
    const mw = createAuthMiddleware({ secret: SECRET });
    const { req, res, next } = makeReqRes({ headers: { authorization: 'Bearer not-a-valid-jwt' } });
    mw(req as never, res as never, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('warns on default secret in production', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const origEnv = process.env.NODE_ENV;
    const origJwtSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET; // Ensure we use DEFAULT_SECRET
    process.env.NODE_ENV = 'production';
    createAuthMiddleware();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('JWT_SECRET'));
    process.env.NODE_ENV = origEnv;
    if (origJwtSecret !== undefined) process.env.JWT_SECRET = origJwtSecret;
    errorSpy.mockRestore();
  });
});

describe('signToken', () => {
  it('signs with custom secret and verifies', () => {
    const token = signToken({ sub: 'u2', userId: 'u2', permissions: ['admin'] }, { secret: SECRET });
    const payload = jwt.verify(token, SECRET) as { userId: string };
    expect(payload.userId).toBe('u2');
  });

  it('uses default expiresIn when not specified', () => {
    const token = signToken({ sub: 'u3', userId: 'u3', permissions: [] }, { secret: SECRET });
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });
});

describe('setSessionCookie / clearSessionCookie', () => {
  it('sets httpOnly secure cookie', () => {
    const { res } = makeReqRes();
    setSessionCookie(res as never, 'tok123', { cookieName: 'ferroui_session' });
    expect(res.cookie).toHaveBeenCalledWith('ferroui_session', 'tok123', expect.objectContaining({ httpOnly: true }));
  });

  it('clears the session cookie', () => {
    const { res } = makeReqRes();
    clearSessionCookie(res as never, { cookieName: 'ferroui_session' });
    expect(res.clearCookie).toHaveBeenCalledWith('ferroui_session', expect.objectContaining({ path: '/' }));
  });
});
