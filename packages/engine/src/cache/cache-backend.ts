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

export interface MemoryEntry { value: string; expiresAt: number; }

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

import type { Redis } from 'ioredis';

export class RedisCacheBackend implements CacheBackend {
  constructor(private client: Redis) {}

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    await this.client.set(key, value, 'PX', ttlMs);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async keys(pattern?: string): Promise<string[]> {
    return this.client.keys(pattern ?? '*');
  }

  async clear(): Promise<void> {
    await this.client.flushdb();
  }
}

// ─── SQLite Backend ───────────────────────────────────────────────────────────

import type { Database } from 'better-sqlite3';

export class SQLiteCacheBackend implements CacheBackend {
  constructor(private db: Database) {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ferroui_cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `);
    // Create index for expiration cleanup
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_expires ON ferroui_cache(expires_at)`);
  }

  async get(key: string): Promise<string | null> {
    const row = this.db.prepare('SELECT value, expires_at FROM ferroui_cache WHERE key = ?')
      .get(key) as { value: string; expires_at: number } | undefined;

    if (!row) return null;
    if (Date.now() > row.expires_at) {
      this.db.prepare('DELETE FROM ferroui_cache WHERE key = ?').run(key);
      return null;
    }
    return row.value;
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    const expiresAt = Date.now() + ttlMs;
    this.db.prepare(
      'INSERT OR REPLACE INTO ferroui_cache (key, value, expires_at) VALUES (?, ?, ?)'
    ).run(key, value, expiresAt);
  }

  async delete(key: string): Promise<void> {
    this.db.prepare('DELETE FROM ferroui_cache WHERE key = ?').run(key);
  }

  async keys(pattern?: string): Promise<string[]> {
    // Clean up expired entries first
    this.db.prepare('DELETE FROM ferroui_cache WHERE expires_at < ?').run(Date.now());

    if (!pattern) {
      return (this.db.prepare('SELECT key FROM ferroui_cache').all() as Array<{ key: string }>)
        .map(r => r.key);
    }

    const likePattern = pattern.replace(/\*/g, '%');
    return (this.db.prepare('SELECT key FROM ferroui_cache WHERE key LIKE ?').all(likePattern) as Array<{ key: string }>)
      .map(r => r.key);
  }

  async clear(): Promise<void> {
    this.db.prepare('DELETE FROM ferroui_cache').run();
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export type CacheBackendType = 'memory' | 'redis' | 'sqlite';

export interface CacheBackendConfig {
  type: CacheBackendType;
  redisClient?: Redis;
  sqliteDb?: Database;
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
