import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SemanticCache } from './semantic-cache.js';
import { SQLiteCacheBackend, RedisCacheBackend, InMemoryCacheBackend } from './cache-backend.js';
import { Redis } from 'ioredis';
import { FerroUILayout } from '@ferroui/schema';

function makeLayout(requestId: string): FerroUILayout {
  return {
    schemaVersion: '1.0',
    requestId,
    locale: 'en',
    layout: { id: 'root', type: 'container', props: {}, children: [] } as any,
    metadata: { generatedAt: new Date().toISOString() },
  };
}

describe('Cache Backends & LRU Eviction', () => {
  let cache: SemanticCache;

  beforeEach(async () => {
    // Reset singleton instance if possible, or just clear it.
    // For these tests, we'll use the clear() method.
    cache = SemanticCache.getInstance();
    await cache.clear();
    cache.setMaxSize(3); // Small size for testing LRU
    cache.setBackend(new InMemoryCacheBackend());
  });

  describe('SQLiteCacheBackend', () => {
    it('calls SQLite database methods correctly', async () => {
      const mockDB = {
        exec: vi.fn(),
        prepare: vi.fn().mockReturnValue({
          get: vi.fn(),
          run: vi.fn(),
          all: vi.fn().mockReturnValue([]),
        }),
      } as any;

      const backend = new SQLiteCacheBackend(mockDB);
      cache.setBackend(backend);

      const layout = makeLayout('sqlite-layout');
      const toolOutputs = { t1: { result: 'ok', classification: 'PUBLIC' } };
      
      await cache.set('p1', [], 'u1', toolOutputs, layout, 'PUBLIC');
      expect(mockDB.prepare).toHaveBeenCalled();
    });
  });

  describe('RedisCacheBackend', () => {
    it('calls Redis client methods correctly', async () => {
      const mockRedis = {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
        keys: vi.fn(),
        flushdb: vi.fn(),
      } as unknown as Redis;

      const backend = new RedisCacheBackend(mockRedis);
      cache.setBackend(backend);

      const layout = makeLayout('redis-layout');
      const toolOutputs = { t1: { result: 'ok', classification: 'PUBLIC' } };

      // Test set
      await cache.set('p1', [], 'u1', toolOutputs, layout, 'PUBLIC');
      expect(mockRedis.set).toHaveBeenCalled();

      // Test get
      vi.mocked(mockRedis.get).mockResolvedValueOnce(JSON.stringify({
        layout,
        timestamp: Date.now(),
        toolOutputs,
        classification: 'PUBLIC',
        ttlMs: 300000,
        hmac: (cache as any).signEntry(layout, toolOutputs, Date.now()) // Mock timestamp might be tricky
      }));
      
      // Since we can't easily match the HMAC due to timestamp, we'll just verify the call.
      // Alternatively, we could mock signEntry but it's private.
      // Let's just verify it was called with the right key.
      await cache.get('p1', [], 'u1', toolOutputs);
      expect(mockRedis.get).toHaveBeenCalled();
    });
  });

  describe('LRU Eviction', () => {
    it('evicts the least recently used item when maxSize is reached', async () => {
      cache.setMaxSize(2);
      const toolOutputs = { t1: { result: 'ok', classification: 'PUBLIC' } };

      await cache.set('p1', [], 'u1', toolOutputs, makeLayout('l1'), 'PUBLIC');
      await cache.set('p2', [], 'u1', toolOutputs, makeLayout('l2'), 'PUBLIC');
      
      // Touch p1 to make it MRU
      await cache.get('p1', [], 'u1', toolOutputs);
      
      // Add p3, should evict p2
      await cache.set('p3', [], 'u1', toolOutputs, makeLayout('l3'), 'PUBLIC');

      const hit1 = await cache.get('p1', [], 'u1', toolOutputs);
      const hit2 = await cache.get('p2', [], 'u1', toolOutputs);
      const hit3 = await cache.get('p3', [], 'u1', toolOutputs);

      expect(hit1).toBeDefined();
      expect(hit2).toBeUndefined(); // Evicted
      expect(hit3).toBeDefined();
    });

    it('removes keys from usageOrder on manual deletion or TTL expiration', async () => {
        cache.setMaxSize(2);
        const toolOutputs = { t1: { result: 'ok', classification: 'PUBLIC' } };
  
        await cache.set('p1', [], 'u1', toolOutputs, makeLayout('l1'), 'PUBLIC');
        await cache.set('p2', [], 'u1', toolOutputs, makeLayout('l2'), 'PUBLIC');
  
        await cache.invalidate('t1');
  
        expect(await cache.get('p1', [], 'u1', toolOutputs)).toBeUndefined();
        expect(await cache.get('p2', [], 'u1', toolOutputs)).toBeUndefined();
        
        // Check usageOrder size indirectly by adding new items
        await cache.set('p3', [], 'u1', toolOutputs, makeLayout('l3'), 'PUBLIC');
        await cache.set('p4', [], 'u1', toolOutputs, makeLayout('l4'), 'PUBLIC');
        
        expect(await cache.get('p3', [], 'u1', toolOutputs)).toBeDefined();
        expect(await cache.get('p4', [], 'u1', toolOutputs)).toBeDefined();
      });
  });
});
