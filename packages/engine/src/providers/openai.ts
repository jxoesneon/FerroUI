import OpenAI from 'openai';
import { LlmProvider } from './base';
import { LlmRequest, LlmResponse } from '../types';

export interface OpenAIProviderOptions {
  apiKey?: string;
  model?: string;
  baseURL?: string;
}

export class OpenAIProvider implements LlmProvider {
  readonly id = 'openai';
  readonly contextWindowTokens = 128000;
  private client: OpenAI;
  private model: string;

  constructor(options: OpenAIProviderOptions = {}) {
    this.client = new OpenAI({
      apiKey: options.apiKey ?? process.env.OPENAI_API_KEY,
      baseURL: options.baseURL,
    });
    this.model = options.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o';
  }

  async *processPrompt(req: LlmRequest): AsyncGenerator<string, LlmResponse, undefined> {
    const stream = this.client.chat.completions.stream({
      model: this.model,
      temperature: req.temperature ?? 0.2,
      max_tokens: req.maxTokens,
      ...(req.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
      messages: [
        { role: 'system', content: req.systemPrompt },
        ...(req.conversationContext?.map(c => ({ role: 'user' as const, content: c })) ?? []),
        { role: 'user', content: req.userPrompt },
      ],
    });

    let fullContent = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      if (delta) {
        fullContent += delta;
        yield delta;
      }
    }

    const final = await stream.finalChatCompletion();
    return {
      content: fullContent,
      tokens: {
        input: final.usage?.prompt_tokens ?? this.estimateTokens(req.userPrompt),
        output: final.usage?.completion_tokens ?? this.estimateTokens(fullContent),
        total: final.usage?.total_tokens ?? this.estimateTokens(req.userPrompt + fullContent),
      },
    };
  }

  async completePrompt(req: LlmRequest): Promise<LlmResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: req.temperature ?? 0,
      max_tokens: req.maxTokens,
      stream: false,
      ...(req.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
      messages: [
        { role: 'system', content: req.systemPrompt },
        ...(req.conversationContext?.map(c => ({ role: 'user' as const, content: c })) ?? []),
        { role: 'user', content: req.userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content ?? '';
    return {
      content,
      tokens: {
        input: response.usage?.prompt_tokens ?? this.estimateTokens(req.userPrompt),
        output: response.usage?.completion_tokens ?? this.estimateTokens(content),
        total: response.usage?.total_tokens ?? this.estimateTokens(req.userPrompt + content),
      },
    };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
