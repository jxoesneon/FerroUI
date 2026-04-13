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

// ─── Redis Session Store ────────────────────────────────────────────────────

export interface RedisSessionClientLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { PX?: number }): Promise<string | null>;
  del(key: string | string[]): Promise<number>;
}

export class RedisSessionStore implements SessionStore {
  private prefix = 'alloy:session:';

  constructor(private client: RedisSessionClientLike) {}

  async get(sessionId: string): Promise<SessionState | undefined> {
    const raw = await this.client.get(this.prefix + sessionId);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      lastActivityAt: new Date(parsed.lastActivityAt),
    };
  }

  async set(sessionId: string, session: SessionState): Promise<void> {
    const ttlMs = session.ttlSeconds > 0 ? session.ttlSeconds * 1000 : 3600000;
    await this.client.set(this.prefix + sessionId, JSON.stringify(session), { PX: ttlMs });
  }

  async delete(sessionId: string): Promise<void> {
    await this.client.del(this.prefix + sessionId);
  }

  async touch(sessionId: string): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;
    session.lastActivityAt = new Date();
    await this.set(sessionId, session);
  }
}

// ─── Factory ────────────────────────────────────────────────────────────────

let _redisClient: RedisSessionClientLike | undefined;

/**
 * Optionally inject a Redis client before the session store is created.
 * Call this during server startup if REDIS_URL is set.
 */
export function setRedisClient(client: RedisSessionClientLike): void {
  _redisClient = client;
}

export function createSessionStore(): SessionStore {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl && _redisClient) {
    console.log('[Session] Using RedisSessionStore');
    return new RedisSessionStore(_redisClient);
  }
  if (redisUrl) {
    console.warn('[Session] REDIS_URL set but no Redis client injected — falling back to InMemorySessionStore');
  }
  return new InMemorySessionStore({
    ttlSeconds: parseInt(process.env.SESSION_TTL_SECONDS ?? '3600', 10),
  });
}

export const sessionStore = createSessionStore();
