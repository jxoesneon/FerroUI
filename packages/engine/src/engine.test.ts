import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FerroUIEngine } from './engine';
import { LlmProvider } from './providers/base';
import { LlmRequest, LlmResponse } from './types';
import { ToolRegistry } from '@ferroui/tools';

// Minimal stub provider that records what was asked of it.
class StubProvider implements LlmProvider {
  public readonly id: string = 'stub';
  public readonly contextWindowTokens = 128_000;
  public completePromptCalls: LlmRequest[] = [];
  public processPromptCalls: LlmRequest[] = [];

  async completePrompt(request: LlmRequest): Promise<LlmResponse> {
    this.completePromptCalls.push(request);
    return { content: '{}', tokens: { input: 0, output: 0, total: 0 } };
  }

  async *processPrompt(request: LlmRequest): AsyncGenerator<string, LlmResponse, undefined> {
    this.processPromptCalls.push(request);
    yield '{}';
    return { content: '{}', tokens: { input: 0, output: 0, total: 0 } };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

describe('FerroUIEngine', () => {
  let provider: StubProvider;

  beforeEach(() => {
    // ToolRegistry is a process-wide singleton; reset so each FerroUIEngine
    // can re-register its system tools without colliding.
    ToolRegistry.getInstance().clear();
    provider = new StubProvider();
  });

  it('constructs with default config when none provided', () => {
    const engine = new FerroUIEngine(provider);
    expect(engine).toBeInstanceOf(FerroUIEngine);
  });

  it('merges partial config with defaults', () => {
    const engine = new FerroUIEngine(provider, { maxRepairAttempts: 5 });
    // @ts-expect-error - private field read for assertion
    expect(engine.config.maxRepairAttempts).toBe(5);
    // @ts-expect-error - private field read for assertion
    expect(engine.config.cacheEnabled).toBe(true);
    // @ts-expect-error - private field read for assertion
    expect(engine.config.toolTimeoutMs).toBe(3000);
  });

  it('setProvider swaps the active provider', () => {
    const engine = new FerroUIEngine(provider);
    class OtherStub extends StubProvider {
      public readonly id = 'stub-2';
    }
    const next = new OtherStub();
    engine.setProvider(next);
    // @ts-expect-error - private field read for assertion
    expect(engine.provider.id).toBe('stub-2');
  });

  it('updateConfig merges new values without losing existing ones', () => {
    const engine = new FerroUIEngine(provider, { maxRepairAttempts: 2 });
    engine.updateConfig({ cacheEnabled: false });
    // @ts-expect-error - private field read for assertion
    expect(engine.config.maxRepairAttempts).toBe(2);
    // @ts-expect-error - private field read for assertion
    expect(engine.config.cacheEnabled).toBe(false);
  });

  it('registerSystemTools registers ferroui.setProvider on construction', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _engine = new FerroUIEngine(provider);
    const { ToolRegistry } = await import('@ferroui/tools');
    const tool = ToolRegistry.getInstance().get('ferroui.setProvider');
    expect(tool).toBeDefined();
    expect(tool?.requiredPermissions).toContain('system.admin');
    expect(tool?.sensitive).toBe(true);
  });

  it('ferroui.setProvider system tool swaps to known provider ids', async () => {
    const engine = new FerroUIEngine(provider);
    const { ToolRegistry } = await import('@ferroui/tools');
    const tool = ToolRegistry.getInstance().get('ferroui.setProvider');
    expect(tool).toBeDefined();

    const result = await (tool!.execute as (params: unknown) => Promise<{ success: boolean; currentProvider: string }>)({
      providerId: 'openai',
      options: { apiKey: 'test' },
    });

    expect(result.success).toBe(true);
    expect(result.currentProvider).toBe('openai');
    // @ts-expect-error - private field read for assertion
    expect(engine.provider.id).toBe('openai');
  });

  it('ferroui.setProvider rejects unknown providerId via zod validation', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _engine = new FerroUIEngine(provider);
    const { ToolRegistry } = await import('@ferroui/tools');
    const tool = ToolRegistry.getInstance().get('ferroui.setProvider');
    expect(tool).toBeDefined();

    // The zod schema restricts to a fixed enum; bypassing the type-check
    // simulates what would happen if the LLM returned an invalid value.
    const bogus = tool!.parameters.safeParse({ providerId: 'unknown-vendor' });
    expect(bogus.success).toBe(false);
  });

  it('process yields safe-mode layout on unrecoverable repair failure', async () => {
    // Inject a failing pipeline by making completePrompt throw with REPAIR_FAILED
    provider.completePrompt = vi.fn(async () => {
      const err = new Error('max attempts reached — repair failed');
      (err as Error & { code: string }).code = 'REPAIR_FAILED';
      throw err;
    });

    const engine = new FerroUIEngine(provider, { maxRepairAttempts: 1, cacheEnabled: false });
    const chunks: unknown[] = [];
    for await (const chunk of engine.process('test prompt', {
      userId: 'user-1',
      requestId: 'req-1',
      permissions: [],
      locale: 'en-US',
    })) {
      chunks.push(chunk);
    }

    // Must emit a safe-mode layout and then complete (fallback flow)
    const hasLayout = chunks.some(
      (c) => (c as { type?: string }).type === 'layout_chunk' &&
             JSON.stringify(c).includes('safe-mode-dashboard'),
    );
    const hasComplete = chunks.some((c) => (c as { type?: string }).type === 'complete');
    expect(hasLayout).toBe(true);
    expect(hasComplete).toBe(true);
  });

  it('process emits a generic error chunk when the failure is recoverable', async () => {
    provider.completePrompt = vi.fn(async () => {
      throw new Error('transient network blip');
    });

    const engine = new FerroUIEngine(provider, { maxRepairAttempts: 3, cacheEnabled: false });
    const chunks: unknown[] = [];
    for await (const chunk of engine.process('prompt', {
      userId: 'u',
      requestId: 'r',
      permissions: [],
      locale: 'en-US',
    })) {
      chunks.push(chunk);
    }

    const errorChunk = chunks.find((c) => (c as { type?: string }).type === 'error');
    expect(errorChunk).toBeDefined();
    expect((errorChunk as { error: { code: string } }).error.code).toBe('ENGINE_FAILURE');
  });
});
