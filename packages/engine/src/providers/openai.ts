import { LlmProvider } from './base';
import { LlmRequest, LlmResponse } from '../types';

export class OpenAIProvider implements LlmProvider {
  readonly id = 'openai';
  readonly contextWindowTokens = 128000;

  async *processPrompt(req: LlmRequest): AsyncGenerator<string, LlmResponse, undefined> {
    // Simulated OpenAI response
    const mockResponse = `This is a simulated response from OpenAI for: ${req.userPrompt}`;
    const chunks = mockResponse.split(' ');
    
    for (const chunk of chunks) {
      yield chunk + ' ';
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    return {
      content: mockResponse,
      tokens: {
        input: this.estimateTokens(req.userPrompt),
        output: this.estimateTokens(mockResponse),
        total: this.estimateTokens(req.userPrompt) + this.estimateTokens(mockResponse),
      }
    };
  }

  async completePrompt(req: LlmRequest): Promise<LlmResponse> {
    const generator = this.processPrompt(req);
    let result = await generator.next();
    while (!result.done) {
      result = await generator.next();
    }
    return result.value;
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
