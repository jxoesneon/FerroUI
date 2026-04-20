import { LlmRequest, LlmResponse } from '../types.js';

export interface LlmProvider {
  readonly id: string;
  readonly contextWindowTokens: number;
  
  /**
   * Processes a prompt and returns an AsyncGenerator for streaming content.
   * Yields content chunks and eventually returns the final response object.
   */
  processPrompt(req: LlmRequest): AsyncGenerator<string, LlmResponse, undefined>;
  
  /**
   * Non-streaming version for simpler tasks like repair or small data generation.
   */
  completePrompt(req: LlmRequest): Promise<LlmResponse>;
  
  /**
   * Estimates tokens for a given text.
   */
  estimateTokens(text: string): number;

  /**
   * Estimates cost (in cents) for a given token count.
   */
  estimateCost(tokens: { input: number; output: number }): number;
}
