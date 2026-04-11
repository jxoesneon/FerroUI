import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlloyEngine } from './engine';
import { LlmProvider } from './providers/base';
import { RequestContext, EngineChunk } from './types';
import * as dualPhasePipeline from './pipeline/dual-phase';

// Mock dependencies
vi.mock('./pipeline/dual-phase', () => ({
  runDualPhasePipeline: vi.fn(),
}));

vi.mock('@alloy/telemetry', () => ({
  tracer: {
    startSpan: vi.fn(() => ({
      recordException: vi.fn(),
      end: vi.fn(),
    })),
  },
}));

class MockProvider implements LlmProvider {
  id = 'mock-provider';
  contextWindowTokens = 8192;

  async completePrompt() {
    return { content: 'mock-response', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }

  async *processPrompt() {
    yield 'mock';
    return { content: 'mock', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }

  estimateTokens(text: string) {
    return text.length;
  }
}

describe('AlloyEngine', () => {
  let engine: AlloyEngine;
  let mockProvider: LlmProvider;
  let mockContext: RequestContext;

  beforeEach(() => {
    vi.clearAllMocks();
    mockProvider = new MockProvider();
    engine = new AlloyEngine(mockProvider, { maxRepairAttempts: 2 });
    mockContext = {
      userId: 'user-1',
      requestId: 'req-1',
      locale: 'en-US',
    };
  });

  it('should initialize with provided config and merge defaults', () => {
    // We can't access private fields directly, but we can verify behavior
    // through public methods or constructor effects.
    expect(engine).toBeInstanceOf(AlloyEngine);
  });

  it('should allow updating config', () => {
    engine.updateConfig({ maxRepairAttempts: 5 });
    // Config update doesn't throw, hard to observe without getters.
  });

  it('should allow setting provider', () => {
    const newProvider = new MockProvider();
    engine.setProvider(newProvider);
    // Again, no getter, but shouldn't throw.
  });

  describe('process', () => {
    it('should yield chunks from runDualPhasePipeline', async () => {
      const mockChunks: EngineChunk[] = [
        { type: 'text_chunk', content: 'chunk 1' },
        { type: 'text_chunk', content: 'chunk 2' },
      ];

      vi.spyOn(dualPhasePipeline, 'runDualPhasePipeline').mockImplementation(async function* () {
        for (const chunk of mockChunks) {
          yield chunk;
        }
      });

      const chunks = [];
      for await (const chunk of engine.process('test prompt', mockContext)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(mockChunks);
      expect(dualPhasePipeline.runDualPhasePipeline).toHaveBeenCalledWith(
        mockProvider,
        'test prompt',
        mockContext,
        expect.objectContaining({ maxRepairAttempts: 2 })
      );
    });

    it('should handle unrecoverable errors and yield safe mode layout', async () => {
      vi.spyOn(dualPhasePipeline, 'runDualPhasePipeline').mockImplementation(async function* () {
        throw new Error('repair failed after max attempts');
      });

      const chunks = [];
      for await (const chunk of engine.process('test prompt', mockContext)) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBe(2);
      expect(chunks[0].type).toBe('layout_chunk');
      expect((chunks[0] as any).layout.requestId).toBe('req-1');
      expect(chunks[1]).toEqual({ type: 'complete', content: 'Fallback: Safe Mode Active' });
    });

    it('should handle regular errors and yield error chunk', async () => {
      vi.spyOn(dualPhasePipeline, 'runDualPhasePipeline').mockImplementation(async function* () {
        throw new Error('Some random error');
      });

      const chunks = [];
      for await (const chunk of engine.process('test prompt', mockContext)) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBe(1);
      expect(chunks[0]).toEqual({
        type: 'error',
        error: {
          code: 'ENGINE_FAILURE',
          message: 'Some random error',
          retryable: false,
        },
      });
    });

    it('should handle non-Error objects thrown', async () => {
      vi.spyOn(dualPhasePipeline, 'runDualPhasePipeline').mockImplementation(async function* () {
        throw 'String error';
      });

      const chunks = [];
      for await (const chunk of engine.process('test prompt', mockContext)) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBe(1);
      expect(chunks[0].type).toBe('error');
      expect((chunks[0] as any).error.message).toBe('An unexpected error occurred.');
    });
  });
});
