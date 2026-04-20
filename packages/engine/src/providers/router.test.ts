import { describe, it, expect, vi } from 'vitest';
import { ProviderRouter, RoutedProvider } from './router.js';
import type { LlmProvider } from './base.js';
import type { LlmRequest, LlmResponse } from '../types.js';

function makeReq(overrides: Partial<LlmRequest> = {}): LlmRequest {
  return {
    systemPrompt: 'You are a test assistant.',
    userPrompt: 'hello',
    ...overrides,
  };
}

function makeResponse(content = 'ok'): LlmResponse {
  return { content, tokens: { input: 10, output: 5, total: 15 } };
}

function makeProvider(id: string, overrides: Partial<LlmProvider> = {}): LlmProvider {
  return {
    id,
    contextWindowTokens: 128000,
    processPrompt: async function* () { yield 'chunk'; return makeResponse(); },
    completePrompt: vi.fn().mockResolvedValue(makeResponse()),
    estimateTokens: (text: string) => Math.ceil(text.length / 4),
    ...overrides,
  };
}

function makeRouted(provider: LlmProvider, cost = 0.001, tier: RoutedProvider['tier'] = 'standard'): RoutedProvider {
  return { provider, costPerKToken: cost, tier };
}

describe('ProviderRouter', () => {
  it('constructs with max contextWindow from providers', () => {
    const p1 = makeProvider('p1', { contextWindowTokens: 10_000 });
    const p2 = makeProvider('p2', { contextWindowTokens: 200_000 });
    const router = new ProviderRouter([makeRouted(p1), makeRouted(p2)]);
    expect(router.contextWindowTokens).toBe(200_000);
  });

  it('id is "router"', () => {
    const router = new ProviderRouter([makeRouted(makeProvider('x'))]);
    expect(router.id).toBe('router');
  });

  it('completePrompt uses cheapest provider first', async () => {
    const cheap = makeProvider('cheap');
    const expensive = makeProvider('expensive');
    vi.mocked(cheap.completePrompt).mockResolvedValue(makeResponse('cheap-result'));
    const router = new ProviderRouter([
      makeRouted(expensive, 0.01),
      makeRouted(cheap, 0.001),
    ]);
    const result = await router.completePrompt(makeReq());
    expect(result.content).toBe('cheap-result');
    expect(cheap.completePrompt).toHaveBeenCalledOnce();
    expect(expensive.completePrompt).not.toHaveBeenCalled();
  });

  it('falls back to next provider when first fails', async () => {
    const failing = makeProvider('failing');
    const working = makeProvider('working');
    vi.mocked(failing.completePrompt).mockRejectedValue(new Error('quota exceeded'));
    vi.mocked(working.completePrompt).mockResolvedValue(makeResponse('fallback'));
    const router = new ProviderRouter([makeRouted(failing, 0.001), makeRouted(working, 0.005)]);
    const result = await router.completePrompt(makeReq());
    expect(result.content).toBe('fallback');
  });

  it('throws when all providers fail', async () => {
    const p1 = makeProvider('a');
    const p2 = makeProvider('b');
    vi.mocked(p1.completePrompt).mockRejectedValue(new Error('down'));
    vi.mocked(p2.completePrompt).mockRejectedValue(new Error('also down'));
    const router = new ProviderRouter([makeRouted(p1), makeRouted(p2)]);
    await expect(router.completePrompt(makeReq())).rejects.toThrow(/All providers failed/);
  });

  it('opens circuit after 3 failures and skips the provider', async () => {
    const bad = makeProvider('bad');
    const good = makeProvider('good');
    vi.mocked(bad.completePrompt).mockRejectedValue(new Error('err'));
    vi.mocked(good.completePrompt).mockResolvedValue(makeResponse('ok'));
    const router = new ProviderRouter([makeRouted(bad, 0.001), makeRouted(good, 0.01)]);

    // Trip the circuit
    await router.completePrompt(makeReq()).catch(() => {});
    await router.completePrompt(makeReq()).catch(() => {});
    await router.completePrompt(makeReq()).catch(() => {});

    // 4th call: bad should be circuit-open, only good is tried
    vi.mocked(bad.completePrompt).mockClear();
    await router.completePrompt(makeReq());
    expect(bad.completePrompt).not.toHaveBeenCalled();
  });

  it('throws when all providers unhealthy', async () => {
    const p = makeProvider('sole');
    vi.mocked(p.completePrompt).mockRejectedValue(new Error('down'));
    const router = new ProviderRouter([makeRouted(p)]);
    // Trip circuit
    for (let i = 0; i < 3; i++) await router.completePrompt(makeReq()).catch(() => {});
    await expect(router.completePrompt(makeReq())).rejects.toThrow(/All providers are unhealthy/);
  });

  it('auto-resets circuit breaker after CIRCUIT_RESET_MS', async () => {
    vi.useFakeTimers();
    try {
      const p = makeProvider('auto-reset-provider');
      vi.mocked(p.completePrompt).mockRejectedValue(new Error('down'));
      const router = new ProviderRouter([makeRouted(p)]);
      
      // Trip circuit
      for (let i = 0; i < 3; i++) await router.completePrompt(makeReq()).catch(() => {});
      
      // Verify it's open
      await expect(router.completePrompt(makeReq())).rejects.toThrow(/All providers are unhealthy/);
      expect(router.getHealthSnapshot()['auto-reset-provider'].circuitOpen).toBe(true);

      // Advance time by 61 seconds (CIRCUIT_RESET_MS is 60_000)
      vi.advanceTimersByTime(61000);

      // Make it work again
      vi.mocked(p.completePrompt).mockResolvedValue(makeResponse('recovered'));
      
      const result = await router.completePrompt(makeReq());
      expect(result.content).toBe('recovered');
      expect(router.getHealthSnapshot()['auto-reset-provider'].circuitOpen).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('processPrompt auto-resets circuit breaker after CIRCUIT_RESET_MS', async () => {
    vi.useFakeTimers();
    try {
      const p = makeProvider('auto-reset-provider-stream', {
        processPrompt: async function* () {
          throw new Error('stream down');
          yield '';
        },
      });
      const router = new ProviderRouter([makeRouted(p)]);
      
      // Trip circuit
      for (let i = 0; i < 3; i++) {
        const gen = router.processPrompt(makeReq());
        await expect(async () => { for await (const _ of gen) { /* drain */ } }).rejects.toThrow();
      }
      
      // Verify it's open (all unhealthy)
      const genOpen = router.processPrompt(makeReq());
      await expect(async () => { for await (const _ of genOpen) { /* drain */ } }).rejects.toThrow(/All providers are unhealthy/);

      // Advance time
      vi.advanceTimersByTime(61000);

      // Change mock to working
      p.processPrompt = async function* () {
        yield 'recovered stream';
        return makeResponse('recovered stream');
      };
      
      const genRec = router.processPrompt(makeReq());
      const chunks: string[] = [];
      for await (const chunk of genRec) {
        chunks.push(chunk as string);
      }
      expect(chunks).toEqual(['recovered stream']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('estimateTokens delegates to first provider', () => {
    const p = makeProvider('p1');
    p.estimateTokens = (t: string) => t.length;
    const router = new ProviderRouter([makeRouted(p)]);
    expect(router.estimateTokens('hello')).toBe(5);
  });

  it('estimateTokens falls back to length/4 when no providers', () => {
    const p = makeProvider('p1');
    const router = new ProviderRouter([makeRouted(p)]);
    // Override providers to empty (hacky but avoids complex setup)
    (router as unknown as { providers: RoutedProvider[] }).providers = [];
    expect(router.estimateTokens('hello world')).toBe(Math.ceil('hello world'.length / 4));
  });

  it('getHealthSnapshot returns health for all providers', () => {
    const p1 = makeProvider('alpha');
    const p2 = makeProvider('beta');
    const router = new ProviderRouter([makeRouted(p1), makeRouted(p2)]);
    const snapshot = router.getHealthSnapshot();
    expect(snapshot['alpha']).toBeDefined();
    expect(snapshot['beta']).toBeDefined();
    expect(snapshot['alpha'].failures).toBe(0);
    expect(snapshot['alpha'].circuitOpen).toBe(false);
  });

  it('processPrompt yields chunks from cheapest provider', async () => {
    const p = makeProvider('cheap', {
      processPrompt: async function* () {
        yield 'hello ';
        yield 'world';
        return makeResponse('hello world');
      },
    });
    const router = new ProviderRouter([makeRouted(p)]);
    const gen = router.processPrompt(makeReq());
    const chunks: string[] = [];
    for await (const chunk of gen) {
      chunks.push(chunk);
    }
    expect(chunks).toEqual(['hello ', 'world']);
  });

  it('processPrompt throws when all providers fail', async () => {
    const p = makeProvider('fail', {
      processPrompt: async function* () {
        throw new Error('stream error');
        yield ''; // unreachable, satisfies TS
      },
    });
    const router = new ProviderRouter([makeRouted(p)]);
    const gen = router.processPrompt(makeReq());
    await expect(async () => {
      for await (const _ of gen) { /* drain */ }
    }).rejects.toThrow(/All providers failed/);
  });
});
