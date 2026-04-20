import Anthropic from '@anthropic-ai/sdk';
import { LlmProvider } from './base.js';
import { LlmRequest, LlmResponse } from '../types.js';
import { PROVIDER_PRICING } from '../middleware/tenant-quota.js';

export interface AnthropicProviderOptions {
  apiKey?: string;
  model?: string;
}

/** Tool definition used to force structured JSON output (B1) */
const JSON_OUTPUT_TOOL: Anthropic.Tool = {
  name: 'structured_json_output',
  description: 'Output a valid JSON object. You MUST call this tool with the result.',
  input_schema: {
    type: 'object',
    properties: {
      json: {
        type: 'string',
        description: 'The complete, valid JSON string to return.',
      },
    },
    required: ['json'],
  },
};

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

  /** Builds system param — adds ephemeral cache_control when enablePromptCache is set (B2) */
  private buildSystemParam(
    systemPrompt: string,
    enablePromptCache?: boolean
  ): Anthropic.MessageParam['content'] | string {
    if (!enablePromptCache) return systemPrompt;
    return [
      {
        type: 'text' as const,
        text: systemPrompt,
        cache_control: { type: 'ephemeral' as const },
      },
    ];
  }

  async *processPrompt(req: LlmRequest): AsyncGenerator<string, LlmResponse, undefined> {
    let fullContent = '';

    if (req.jsonMode) {
      // Non-streaming path when JSON mode is requested — use tool_use to guarantee JSON
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: req.maxTokens ?? 4096,
        temperature: req.temperature ?? 0.2,
        system: this.buildSystemParam(req.systemPrompt, req.enablePromptCache) as string,
        tools: [JSON_OUTPUT_TOOL],
        tool_choice: { type: 'any' },
        messages: [
          ...(req.conversationContext?.map(c => ({ role: 'user' as const, content: c })) ?? []),
          { role: 'user', content: req.userPrompt },
        ],
      });

      const toolUse = response.content.find(b => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined;
      fullContent = toolUse
        ? (toolUse.input as Record<string, string>).json ?? JSON.stringify(toolUse.input)
        : (response.content.find(b => b.type === 'text') as Anthropic.TextBlock | undefined)?.text ?? '';

      yield fullContent;
      return {
        content: fullContent,
        tokens: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
          total: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    }

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: req.maxTokens ?? 4096,
      temperature: req.temperature ?? 0.2,
      system: this.buildSystemParam(req.systemPrompt, req.enablePromptCache) as string,
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
    if (req.jsonMode) {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: req.maxTokens ?? 4096,
        temperature: req.temperature ?? 0,
        system: this.buildSystemParam(req.systemPrompt, req.enablePromptCache) as string,
        tools: [JSON_OUTPUT_TOOL],
        tool_choice: { type: 'any' },
        messages: [
          ...(req.conversationContext?.map(c => ({ role: 'user' as const, content: c })) ?? []),
          { role: 'user', content: req.userPrompt },
        ],
      });

      const toolUse = response.content.find(b => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined;
      const content = toolUse
        ? (toolUse.input as Record<string, string>).json ?? JSON.stringify(toolUse.input)
        : (response.content.find(b => b.type === 'text') as Anthropic.TextBlock | undefined)?.text ?? '';

      return {
        content,
        tokens: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
          total: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    }

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: req.maxTokens ?? 4096,
      temperature: req.temperature ?? 0,
      system: this.buildSystemParam(req.systemPrompt, req.enablePromptCache) as string,
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

  estimateCost(tokens: { input: number; output: number }): number {
    const pricing = PROVIDER_PRICING[this.id];
    if (!pricing) return 0;
    return (tokens.input * pricing.input + tokens.output * pricing.output) * 0.1;
  }
}
