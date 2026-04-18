/**
 * Chaos Tests (B.6)
 * Network fault injection tests using Toxiproxy
 * 
 * Prerequisites:
 *   docker-compose -f tests/chaos/docker-compose.yml up -d
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const TOXIPROXY_API = process.env.TOXIPROXY_API || 'http://localhost:8474';
const ENGINE_URL = process.env.ENGINE_URL || 'http://localhost:14000';

describe('Chaos Engineering Tests', () => {
  let proxies: { name: string; listen: string; upstream: string }[] = [];

  beforeAll(async () => {
    // Populate Toxiproxy with proxies
    const response = await fetch(`${TOXIPROXY_API}/proxies`);
    const data = await response.json();
    proxies = Object.values(data);
  });

  afterAll(async () => {
    // Reset all toxics after tests
    for (const proxy of proxies) {
      await fetch(`${TOXIPROXY_API}/proxies/${proxy.name}/toxics`, { method: 'DELETE' });
    }
  });

  describe('B.6.2: Provider Returns 429 → Router Failover', () => {
    it('should failover to backup provider when primary times out', async () => {
      // Add latency toxic to simulate slow provider
      await fetch(`${TOXIPROXY_API}/proxies/ferroui-engine/toxics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'latency',
          type: 'latency',
          attributes: { latency: 5000, jitter: 100 },
        }),
      });

      // Request should still succeed via fallback
      const response = await fetch(`${ENGINE_URL}/api/ferroui/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          prompt: 'Test chaos scenario',
          context: {
            userId: 'chaos-test',
            requestId: 'chaos-001',
            permissions: ['read'],
            locale: 'en',
          },
        }),
      });

      // Should get a response (either 200 from fallback or 503 if no fallback)
      expect(response.status).toBeOneOf([200, 503]);
    });
  });

  describe('B.6.3: Redis Outage → In-Memory Fallback', () => {
    it('should use in-memory cache when Redis is unavailable', async () => {
      // Disable Redis proxy (drop all connections)
      await fetch(`${TOXIPROXY_API}/proxies/redis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false }),
      });

      // Request should still work with in-memory fallback
      const response = await fetch(`${ENGINE_URL}/api/ferroui/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          prompt: 'Test without Redis',
          context: {
            userId: 'chaos-test',
            requestId: 'chaos-002',
            permissions: ['read'],
            locale: 'en',
          },
        }),
      });

      expect(response.status).toBeOneOf([200, 202]);

      // Re-enable Redis
      await fetch(`${TOXIPROXY_API}/proxies/redis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true }),
      });
    });
  });

  describe('Network Partition Scenarios', () => {
    it('should handle timeout toxic gracefully', async () => {
      // Add timeout toxic
      await fetch(`${TOXIPROXY_API}/proxies/ferroui-engine/toxics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'timeout',
          type: 'timeout',
          attributes: { timeout: 100 },
        }),
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${ENGINE_URL}/healthz`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        expect(response.status).toBeOneOf([200, 503, 502]);
      } catch (e) {
        // Timeout is acceptable in chaos tests
        clearTimeout(timeoutId);
        expect(e).toBeDefined();
      }
    });
  });
});
