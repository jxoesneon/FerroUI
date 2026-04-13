/**
 * Cache Backend Abstraction — Semantic Caching spec §4
 *
 * Provides a common interface for cache storage and implementations
 * for in-memory, Redis, and SQLite backends.
 */

export interface CacheBackend {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlMs: number): Promise<void>;
  delete(key: string): Promise<void>;
  keys(pattern?: string): Promise<string[]>;
  clear(): Promise<void>;
}

// ─── In-Memory Backend ────────────────────────────────────────────────────────

interface MemoryEntry { value: string; expiresAt: number; }

export class InMemoryCacheBackend implements CacheBackend {
  private store = new Map<string, MemoryEntry>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async keys(pattern?: string): Promise<string[]> {
    const all = Array.from(this.store.keys());
    if (!pattern) return all;
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return all.filter(k => regex.test(k));
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

// ─── Redis Backend ────────────────────────────────────────────────────────────

export interface RedisClientLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { PX?: number }): Promise<string | null>;
  del(key: string | string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  flushDb?(): Promise<string>;
}

export class RedisCacheBackend implements CacheBackend {
  constructor(private client: RedisClientLike) {}

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    await this.client.set(key, value, { PX: ttlMs });
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async keys(pattern?: string): Promise<string[]> {
    return this.client.keys(pattern ?? '*');
  }

  async clear(): Promise<void> {
    if (this.client.flushDb) {
      await this.client.flushDb();
    }
  }
}

// ─── SQLite Backend ───────────────────────────────────────────────────────────

export interface SQLiteDBLike {
  run(sql: string, ...params: unknown[]): void;
  get(sql: string, ...params: unknown[]): { value: string; expires_at: number } | undefined;
  all(sql: string, ...params: unknown[]): Array<{ key: string }>;
}

export class SQLiteCacheBackend implements CacheBackend {
  constructor(private db: SQLiteDBLike) {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS alloy_cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `);
    // Create index for expiration cleanup
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_expires ON alloy_cache(expires_at)`);
  }

  async get(key: string): Promise<string | null> {
    const row = this.db.get('SELECT value, expires_at FROM alloy_cache WHERE key = ?', key);
    if (!row) return null;
    if (Date.now() > row.expires_at) {
      this.db.run('DELETE FROM alloy_cache WHERE key = ?', key);
      return null;
    }
    return row.value;
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    const expiresAt = Date.now() + ttlMs;
    this.db.run(
      'INSERT OR REPLACE INTO alloy_cache (key, value, expires_at) VALUES (?, ?, ?)',
      key, value, expiresAt,
    );
  }

  async delete(key: string): Promise<void> {
    this.db.run('DELETE FROM alloy_cache WHERE key = ?', key);
  }

  async keys(pattern?: string): Promise<string[]> {
    // Clean up expired entries first
    this.db.run('DELETE FROM alloy_cache WHERE expires_at < ?', Date.now());
    if (!pattern) {
      return this.db.all('SELECT key FROM alloy_cache').map(r => r.key);
    }
    const likePattern = pattern.replace(/\*/g, '%');
    return this.db.all('SELECT key FROM alloy_cache WHERE key LIKE ?', likePattern).map(r => r.key);
  }

  async clear(): Promise<void> {
    this.db.run('DELETE FROM alloy_cache');
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export type CacheBackendType = 'memory' | 'redis' | 'sqlite';

export interface CacheBackendConfig {
  type: CacheBackendType;
  redisClient?: RedisClientLike;
  sqliteDb?: SQLiteDBLike;
}

export function createCacheBackend(config: CacheBackendConfig): CacheBackend {
  switch (config.type) {
    case 'redis':
      if (!config.redisClient) throw new Error('Redis client is required for redis cache backend');
      return new RedisCacheBackend(config.redisClient);
    case 'sqlite':
      if (!config.sqliteDb) throw new Error('SQLite DB is required for sqlite cache backend');
      return new SQLiteCacheBackend(config.sqliteDb);
    case 'memory':
    default:
      return new InMemoryCacheBackend();
  }
}
