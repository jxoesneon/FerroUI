import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  InMemoryCacheBackend,
  RedisCacheBackend,
  SQLiteCacheBackend,
  createCacheBackend,
} from './cache-backend.js';

// ── InMemoryCacheBackend ──────────────────────────────────────────────────────

describe('InMemoryCacheBackend', () => {
  let backend: InMemoryCacheBackend;

  beforeEach(() => {
    backend = new InMemoryCacheBackend();
  });

  it('set and get a value', async () => {
    await backend.set('k1', 'hello', 60_000);
    expect(await backend.get('k1')).toBe('hello');
  });

  it('returns null for missing key', async () => {
    expect(await backend.get('missing')).toBeNull();
  });

  it('expires entries after TTL', async () => {
    await backend.set('k2', 'bye', 10);
    await new Promise(r => setTimeout(r, 30));
    expect(await backend.get('k2')).toBeNull();
  });

  it('delete removes a key', async () => {
    await backend.set('k3', 'val', 60_000);
    await backend.delete('k3');
    expect(await backend.get('k3')).toBeNull();
  });

  it('keys returns all stored keys', async () => {
    await backend.set('a:1', 'x', 60_000);
    await backend.set('a:2', 'y', 60_000);
    const keys = await backend.keys();
    expect(keys).toContain('a:1');
    expect(keys).toContain('a:2');
  });

  it('keys with pattern filters results', async () => {
    await backend.set('cache:foo', 'x', 60_000);
    await backend.set('other:bar', 'y', 60_000);
    const keys = await backend.keys('cache:*');
    expect(keys).toContain('cache:foo');
    expect(keys).not.toContain('other:bar');
  });

  it('clear removes all entries', async () => {
    await backend.set('x1', 'a', 60_000);
    await backend.set('x2', 'b', 60_000);
    await backend.clear();
    expect(await backend.keys()).toHaveLength(0);
  });
});

// ── RedisCacheBackend ─────────────────────────────────────────────────────────

describe('RedisCacheBackend', () => {
  function makeRedisClient() {
    return {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
      del: vi.fn().mockResolvedValue(1),
      keys: vi.fn().mockResolvedValue([]),
      flushdb: vi.fn().mockResolvedValue('OK'),
    };
  }

  it('get delegates to redis client', async () => {
    const client = makeRedisClient();
    client.get.mockResolvedValue('cached');
    const b = new RedisCacheBackend(client as never);
    expect(await b.get('k')).toBe('cached');
    expect(client.get).toHaveBeenCalledWith('k');
  });

  it('set calls SET PX with TTL', async () => {
    const client = makeRedisClient();
    const b = new RedisCacheBackend(client as never);
    await b.set('k', 'v', 5000);
    expect(client.set).toHaveBeenCalledWith('k', 'v', 'PX', 5000);
  });

  it('delete calls del', async () => {
    const client = makeRedisClient();
    const b = new RedisCacheBackend(client as never);
    await b.delete('k');
    expect(client.del).toHaveBeenCalledWith('k');
  });

  it('keys with pattern delegates to redis', async () => {
    const client = makeRedisClient();
    client.keys.mockResolvedValue(['a', 'b']);
    const b = new RedisCacheBackend(client as never);
    const result = await b.keys('a*');
    expect(client.keys).toHaveBeenCalledWith('a*');
    expect(result).toEqual(['a', 'b']);
  });

  it('keys without pattern uses wildcard', async () => {
    const client = makeRedisClient();
    const b = new RedisCacheBackend(client as never);
    await b.keys();
    expect(client.keys).toHaveBeenCalledWith('*');
  });

  it('clear calls flushdb', async () => {
    const client = makeRedisClient();
    const b = new RedisCacheBackend(client as never);
    await b.clear();
    expect(client.flushdb).toHaveBeenCalled();
  });
});

// ── SQLiteCacheBackend ────────────────────────────────────────────────────────

describe('SQLiteCacheBackend', () => {
  function makeDb() {
    const stmt = { get: vi.fn(), run: vi.fn(), all: vi.fn().mockReturnValue([]) };
    return { exec: vi.fn(), prepare: vi.fn().mockReturnValue(stmt), _stmt: stmt };
  }

  it('creates table on construction', () => {
    const db = makeDb();
    new SQLiteCacheBackend(db as never);
    expect(db.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS'));
  });

  it('get returns null for missing row', async () => {
    const db = makeDb();
    db._stmt.get.mockReturnValue(undefined);
    const b = new SQLiteCacheBackend(db as never);
    expect(await b.get('missing')).toBeNull();
  });

  it('get returns null for expired row and deletes it', async () => {
    const db = makeDb();
    db._stmt.get.mockReturnValue({ value: 'v', expires_at: Date.now() - 1000 });
    const b = new SQLiteCacheBackend(db as never);
    expect(await b.get('expired')).toBeNull();
    expect(db._stmt.run).toHaveBeenCalled();
  });

  it('get returns value for valid row', async () => {
    const db = makeDb();
    db._stmt.get.mockReturnValue({ value: 'hello', expires_at: Date.now() + 60_000 });
    const b = new SQLiteCacheBackend(db as never);
    expect(await b.get('k')).toBe('hello');
  });

  it('set inserts row with correct TTL', async () => {
    const db = makeDb();
    const b = new SQLiteCacheBackend(db as never);
    await b.set('k', 'v', 5000);
    expect(db._stmt.run).toHaveBeenCalledWith('k', 'v', expect.any(Number));
  });

  it('delete removes row', async () => {
    const db = makeDb();
    const b = new SQLiteCacheBackend(db as never);
    await b.delete('k');
    expect(db._stmt.run).toHaveBeenCalled();
  });

  it('keys without pattern returns all', async () => {
    const db = makeDb();
    db._stmt.all.mockReturnValue([{ key: 'a' }, { key: 'b' }]);
    const b = new SQLiteCacheBackend(db as never);
    const keys = await b.keys();
    expect(keys).toEqual(['a', 'b']);
  });

  it('keys with pattern uses LIKE', async () => {
    const db = makeDb();
    db._stmt.all.mockReturnValue([{ key: 'foo:1' }]);
    const b = new SQLiteCacheBackend(db as never);
    const keys = await b.keys('foo:*');
    expect(keys).toEqual(['foo:1']);
  });

  it('clear deletes all rows', async () => {
    const db = makeDb();
    const b = new SQLiteCacheBackend(db as never);
    await b.clear();
    expect(db._stmt.run).toHaveBeenCalled();
  });
});

// ── createCacheBackend factory ─────────────────────────────────────────────────

describe('createCacheBackend', () => {
  it('creates InMemory backend by default', () => {
    const b = createCacheBackend({ type: 'memory' });
    expect(b).toBeInstanceOf(InMemoryCacheBackend);
  });

  it('throws when redis selected without client', () => {
    expect(() => createCacheBackend({ type: 'redis' })).toThrow(/Redis client is required/);
  });

  it('throws when sqlite selected without db', () => {
    expect(() => createCacheBackend({ type: 'sqlite' })).toThrow(/SQLite DB is required/);
  });

  it('creates RedisCacheBackend when client provided', () => {
    const mockClient = { get: vi.fn(), set: vi.fn(), del: vi.fn(), keys: vi.fn(), flushdb: vi.fn() };
    const b = createCacheBackend({ type: 'redis', redisClient: mockClient as never });
    expect(b).toBeInstanceOf(RedisCacheBackend);
  });
});
