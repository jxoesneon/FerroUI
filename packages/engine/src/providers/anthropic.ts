import Anthropic from '@anthropic-ai/sdk';
import { LlmProvider } from './base';
import { LlmRequest, LlmResponse } from '../types';

export interface AnthropicProviderOptions {
  apiKey?: string;
  model?: string;
}

export class AnthropicProvider implements LlmProvider {
  readonly id = 'anthropic';
  readonly contextWindowTokens = 200000;
  private client: Anthropic;
  private model: string;

  constructor(options: AnthropicProviderOptions = {}) {
    this.client = new Anthropic({
      apiKey: options.apiKey ?? process.env.ANTHROPIC_API_KEY,
    });
    this.model = options.model ?? process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022';
  }

  async *processPrompt(req: LlmRequest): AsyncGenerator<string, LlmResponse, undefined> {
    let fullContent = '';
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: req.maxTokens ?? 4096,
      temperature: req.temperature ?? 0.2,
      system: req.systemPrompt,
      messages: [
        ...(req.conversationContext?.map(c => ({ role: 'user' as const, content: c })) ?? []),
        { role: 'user', content: req.userPrompt },
      ],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const text = event.delta.text;
        fullContent += text;
        yield text;
      }
    }

    const finalMsg = await stream.finalMessage();
    const inputTokens = finalMsg.usage.input_tokens;
    const outputTokens = finalMsg.usage.output_tokens;

    return {
      content: fullContent,
      tokens: { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens },
    };
  }

  async completePrompt(req: LlmRequest): Promise<LlmResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: req.maxTokens ?? 4096,
      temperature: req.temperature ?? 0,
      system: req.systemPrompt,
      messages: [
        ...(req.conversationContext?.map(c => ({ role: 'user' as const, content: c })) ?? []),
        { role: 'user', content: req.userPrompt },
      ],
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    return {
      content,
      tokens: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        total: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
