export interface SessionState {
  id: string;
  userId: string;
  permissions: string[];
  conversationContext: string[];
  createdAt: Date;
  lastActivityAt: Date;
  ttlSeconds: number;
}

export interface SessionStore {
  get(sessionId: string): Promise<SessionState | undefined>;
  set(sessionId: string, session: SessionState): Promise<void>;
  delete(sessionId: string): Promise<void>;
  touch(sessionId: string): Promise<void>;
}

export interface InMemorySessionStoreOptions {
  ttlSeconds?: number;
}

export class InMemorySessionStore implements SessionStore {
  private sessions: Map<string, { session: SessionState; expiresAt: number }> = new Map();
  private defaultTtlMs: number;

  constructor(options: InMemorySessionStoreOptions = {}) {
    this.defaultTtlMs = (options.ttlSeconds ?? 3600) * 1000;
  }

  async get(sessionId: string): Promise<SessionState | undefined> {
    const entry = this.sessions.get(sessionId);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.sessions.delete(sessionId);
      return undefined;
    }
    return entry.session;
  }

  async set(sessionId: string, session: SessionState): Promise<void> {
    const ttlMs = session.ttlSeconds > 0 ? session.ttlSeconds * 1000 : this.defaultTtlMs;
    this.sessions.set(sessionId, { session, expiresAt: Date.now() + ttlMs });
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async touch(sessionId: string): Promise<void> {
    const entry = this.sessions.get(sessionId);
    if (!entry) return;
    entry.session.lastActivityAt = new Date();
    const ttlMs = entry.session.ttlSeconds > 0 ? entry.session.ttlSeconds * 1000 : this.defaultTtlMs;
    entry.expiresAt = Date.now() + ttlMs;
  }
}

export function createSessionStore(): SessionStore {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    console.log('[Session] REDIS_URL detected — extend with ioredis adapter for production use');
  }
  return new InMemorySessionStore({
    ttlSeconds: parseInt(process.env.SESSION_TTL_SECONDS ?? '3600', 10),
  });
}

export const sessionStore = createSessionStore();
