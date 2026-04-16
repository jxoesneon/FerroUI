import { LlmProvider } from './base';
import { LlmRequest, LlmResponse } from '../types';

export interface LlamaCppProviderOptions {
  baseURL?: string;
  model?: string;
}

interface LlamaCppCompletionResponse {
  content: string;
  generation_settings: any;
  model: string;
  prompt: string;
  stop: boolean;
  stopped_eos: boolean;
  stopped_limit: boolean;
  stopped_word: boolean;
  stopping_word: string;
  timings: {
    predicted_ms: number;
    predicted_n: number;
    predicted_per_second: number;
    predicted_per_token_ms: number;
    prompt_ms: number;
    prompt_n: number;
    prompt_per_second: number;
    prompt_per_token_ms: number;
  };
  tokens_cached: number;
  tokens_evaluated: number;
  tokens_predicted: number;
  truncated: boolean;
}

export class LlamaCppProvider implements LlmProvider {
  readonly id = 'llama-cpp';
  readonly contextWindowTokens = 32768; // Default for many modern GGUF models
  private baseURL: string;

  constructor(options: LlamaCppProviderOptions = {}) {
    this.baseURL = options.baseURL ?? process.env.LLAMA_CPP_BASE_URL ?? 'http://localhost:8080';
  }

  async *processPrompt(req: LlmRequest): AsyncGenerator<string, LlmResponse, undefined> {
    const response = await fetch(`${this.baseURL}/completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `${req.systemPrompt}\n\nUser: ${req.userPrompt}\n\nAssistant:`,
        temperature: req.temperature ?? 0.2,
        n_predict: req.maxTokens ?? 4096,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Llama.cpp request failed: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // llama.cpp server returns data in SSE format: data: {...}
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              yield data.content;
            }
            if (data.stop) {
              // Final chunk might contain timings/token counts
              inputTokens = data.tokens_evaluated ?? this.estimateTokens(req.userPrompt);
              outputTokens = data.tokens_predicted ?? this.estimateTokens(fullContent);
            }
          } catch {
            // Partial JSON or error
          }
        }
      }
    }

    return {
      content: fullContent,
      tokens: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
    };
  }

  async completePrompt(req: LlmRequest): Promise<LlmResponse> {
    const response = await fetch(`${this.baseURL}/completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `${req.systemPrompt}\n\nUser: ${req.userPrompt}\n\nAssistant:`,
        temperature: req.temperature ?? 0,
        n_predict: req.maxTokens ?? 4096,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Llama.cpp request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as LlamaCppCompletionResponse;
    return {
      content: data.content,
      tokens: {
        input: data.tokens_evaluated,
        output: data.tokens_predicted,
        total: data.tokens_evaluated + data.tokens_predicted,
      },
    };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
