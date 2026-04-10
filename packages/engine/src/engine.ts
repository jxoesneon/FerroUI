import { RequestContext, EngineChunk, EngineConfig } from './types';
import { LlmProvider } from './providers/base';
import { runDualPhasePipeline } from './pipeline/dual-phase';
import { tracer } from '@alloy/telemetry';

export class AlloyEngine {
  private provider: LlmProvider;
  private config: EngineConfig;

  constructor(provider: LlmProvider, config?: Partial<EngineConfig>) {
    this.provider = provider;
    this.config = {
      maxRepairAttempts: 3,
      cacheEnabled: true,
      toolTimeoutMs: 3000,
      ...config,
    };
  }

  /**
   * Main entry point for the Alloy UI engine.
   * Processes a user prompt through the Dual-Phase Pipeline.
   */
  public async *process(
    prompt: string,
    context: RequestContext
  ): AsyncGenerator<EngineChunk, void, undefined> {
    const span = tracer.startSpan('AlloyEngine.process', {
      attributes: {
        'alloy.prompt': prompt,
        'alloy.userId': context.userId,
        'alloy.requestId': context.requestId,
      },
    });

    try {
      yield* runDualPhasePipeline(this.provider, prompt, context, this.config);
    } catch (error) {
      span.recordException(error as Error);
      yield {
        type: 'error',
        error: {
          code: 'ENGINE_FAILURE',
          message: error instanceof Error ? error.message : 'An unexpected error occurred.',
          retryable: false,
        },
      };
    } finally {
      span.end();
    }
  }

  public setProvider(provider: LlmProvider): void {
    this.provider = provider;
  }

  public updateConfig(config: Partial<EngineConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}
