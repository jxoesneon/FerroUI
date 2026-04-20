import { LlmProvider } from './base.js';
import { LlmRequest, LlmResponse } from '../types.js';
import { PROVIDER_PRICING } from '../middleware/tenant-quota.js';

export interface OllamaProviderOptions {
  baseURL?: string;
  model?: string;
}

interface OllamaChunk {
  model: string;
  response: string;
  done: boolean;
  prompt_eval_count?: number;
  eval_count?: number;
}

export class OllamaProvider implements LlmProvider {
  readonly id = 'ollama';
  readonly contextWindowTokens = 128000;
  private baseURL: string;
  private model: string;

  constructor(options: OllamaProviderOptions = {}) {
    this.baseURL = options.baseURL ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
    this.model = options.model ?? process.env.OLLAMA_MODEL ?? 'llama3';
  }

  async *processPrompt(req: LlmRequest): AsyncGenerator<string, LlmResponse, undefined> {
    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: `${req.systemPrompt}\n\n${req.userPrompt}`,
        temperature: req.temperature ?? 0.2,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const raw = decoder.decode(value, { stream: true });
      for (const line of raw.split('\n').filter(Boolean)) {
        try {
          const chunk: OllamaChunk = JSON.parse(line);
          if (chunk.response) {
            fullContent += chunk.response;
            yield chunk.response;
          }
          if (chunk.done) {
            inputTokens = chunk.prompt_eval_count ?? this.estimateTokens(req.userPrompt);
            outputTokens = chunk.eval_count ?? this.estimateTokens(fullContent);
          }
        } catch {
          // partial or non-JSON line — skip
        }
      }
    }

    return {
      content: fullContent,
      tokens: { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens },
    };
  }

  async completePrompt(req: LlmRequest): Promise<LlmResponse> {
    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: `${req.systemPrompt}\n\n${req.userPrompt}`,
        temperature: req.temperature ?? 0,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as OllamaChunk;
    return {
      content: data.response,
      tokens: {
        input: data.prompt_eval_count ?? this.estimateTokens(req.userPrompt),
        output: data.eval_count ?? this.estimateTokens(data.response),
        total: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
      },
    };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  estimateCost(tokens: { input: number; output: number }): number {
    const pricing = PROVIDER_PRICING[this.id];
    if (!pricing) return 0;
    return (tokens.input * pricing.input + tokens.output * pricing.output) * 0.1;
  }
}
