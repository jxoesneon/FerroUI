import { describe, it, expect, vi } from 'vitest';
import { fuzzyMatchComponent, repairLayout } from './repair';
import type { LlmProvider } from '../providers/base';
import type { LlmResponse } from '../types';

function makeProvider(responseContent: string): LlmProvider {
  return {
    id: 'mock',
    contextWindowTokens: 128000,
    processPrompt: async function* () { yield responseContent; return { content: responseContent, tokens: { input: 5, output: 5, total: 10 } }; },
    completePrompt: vi.fn().mockResolvedValue({ content: responseContent, tokens: { input: 5, output: 5, total: 10 } } as LlmResponse),
    estimateTokens: (t: string) => Math.ceil(t.length / 4),
  };
}

const ctx = { userId: 'u1', permissions: [], locale: 'en', requestId: 'r1' };

describe('fuzzyMatchComponent', () => {
  it('returns exact case-insensitive match', () => {
    const result = fuzzyMatchComponent('dashboard');
    expect(result?.toLowerCase()).toBe('dashboard');
  });

  it('returns fuzzy match for close name', () => {
    const result = fuzzyMatchComponent('Dashboarrd');
    expect(result).toBeDefined();
  });

  it('returns undefined for totally unrelated name', () => {
    const result = fuzzyMatchComponent('xyzzy_never_exists_abc123');
    expect(result).toBeUndefined();
  });
});

describe('repairLayout', () => {
  it('returns repaired layout on first attempt', async () => {
    const validLayout = {
      schemaVersion: '1.1.0',
      requestId: '00000000-0000-4000-a000-000000000001',
      locale: 'en',
      layout: { type: 'Dashboard', id: 'root', aria: { role: 'main' }, props: {} },
    };
    const provider = makeProvider(JSON.stringify(validLayout));
    const result = await repairLayout(provider, 'original prompt', {}, [
      { path: 'layout.id', message: 'id is missing', code: 'required' },
    ], ctx);
    expect(result).toBeDefined();
  });

  it('throws after maxAttempts exceeded', async () => {
    const provider = makeProvider('not json at all');
    await expect(
      repairLayout(provider, 'prompt', {}, [{ path: 'root', message: 'bad', code: 'bad' }], ctx, 1, 1),
    ).rejects.toThrow(/Failed to repair layout after 1 attempts/);
  });

  it('recursively retries on invalid JSON response', async () => {
    const validLayout = {
      schemaVersion: '1.1.0',
      requestId: '00000000-0000-4000-a000-000000000002',
      locale: 'en',
      layout: { type: 'Dashboard', id: 'root', aria: { role: 'main' }, props: {} },
    };
    let callCount = 0;
    const provider = {
      ...makeProvider(''),
      completePrompt: vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) return { content: 'not-json', tokens: { input: 1, output: 1, total: 2 } };
        return { content: JSON.stringify(validLayout), tokens: { input: 5, output: 5, total: 10 } };
      }),
    };
    const result = await repairLayout(provider, 'prompt', {}, [{ path: 'root', message: 'invalid', code: 'err' }], ctx, 1, 3);
    expect(result).toBeDefined();
    expect(callCount).toBeGreaterThanOrEqual(2);
  });

  it('extracts JSON from response with surrounding text', async () => {
    const validLayout = {
      schemaVersion: '1.1.0',
      requestId: '00000000-0000-4000-a000-000000000003',
      locale: 'en',
      layout: { type: 'Dashboard', id: 'root', aria: { role: 'main' }, props: {} },
    };
    const responseWithSurroundingText = `Here is the fixed layout: ${JSON.stringify(validLayout)} That's it.`;
    const provider = makeProvider(responseWithSurroundingText);
    const result = await repairLayout(provider, 'prompt', {}, [{ path: 'root', message: 'err', code: 'err' }], ctx);
    expect(result).toBeDefined();
  });
});
