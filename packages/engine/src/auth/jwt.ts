import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface JwtPayload {
  sub: string;
  userId: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface AuthOptions {
  secret?: string;
  expiresIn?: string | number;
  cookieName?: string;
  skipPaths?: string[];
}

const DEFAULT_SECRET = 'ferroui-dev-secret-CHANGE-IN-PRODUCTION';
const DEFAULT_EXPIRES_IN = '8h';
const DEFAULT_COOKIE_NAME = 'ferroui_session';

const ALWAYS_SKIP = ['/healthz', '/readyz', '/health'];

export function createAuthMiddleware(opts: AuthOptions = {}) {
  const secret = opts.secret ?? process.env.JWT_SECRET ?? DEFAULT_SECRET;
  const cookieName = opts.cookieName ?? DEFAULT_COOKIE_NAME;
  const skipPaths = [...ALWAYS_SKIP, ...(opts.skipPaths ?? [])];

  if (secret === DEFAULT_SECRET && process.env.NODE_ENV === 'production') {
    console.error(
      '[Auth] CRITICAL: JWT_SECRET env var not set! Set a strong secret in production.'
    );
  }

  return function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (skipPaths.some(p => req.path.startsWith(p))) {
      next();
      return;
    }

    const token =
      req.cookies?.[cookieName] ??
      extractBearerToken(req.headers.authorization);

    if (!token) {
      res.status(401).json({ error: 'Unauthorized: missing session token' });
      return;
    }

    try {
      const payload = jwt.verify(token, secret) as JwtPayload;
      (req as Request & { auth: JwtPayload }).auth = payload;
      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Unauthorized: session expired' });
      } else {
        res.status(403).json({ error: 'Forbidden: invalid session token' });
      }
    }
  };
}

function extractBearerToken(authHeader: string | undefined): string | undefined {
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  return authHeader.slice(7).trim();
}

export function signToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  opts: Pick<AuthOptions, 'secret' | 'expiresIn'> = {}
): string {
  const secret = opts.secret ?? process.env.JWT_SECRET ?? DEFAULT_SECRET;
  const expiresIn = opts.expiresIn ?? DEFAULT_EXPIRES_IN;
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function setSessionCookie(
  res: Response,
  token: string,
  opts: Pick<AuthOptions, 'cookieName'> = {}
): void {
  const cookieName = opts.cookieName ?? DEFAULT_COOKIE_NAME;
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(
  res: Response,
  opts: Pick<AuthOptions, 'cookieName'> = {}
): void {
  const cookieName = opts.cookieName ?? DEFAULT_COOKIE_NAME;
  res.clearCookie(cookieName, { path: '/' });
}
