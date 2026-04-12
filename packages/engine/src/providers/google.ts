import { GoogleGenerativeAI } from '@google/generative-ai';
import { LlmProvider } from './base';
import { LlmRequest, LlmResponse } from '../types';

export interface GoogleProviderOptions {
  apiKey?: string;
  model?: string;
}

export class GoogleProvider implements LlmProvider {
  readonly id = 'google';
  readonly contextWindowTokens = 1000000;
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(options: GoogleProviderOptions = {}) {
    this.client = new GoogleGenerativeAI(options.apiKey ?? process.env.GOOGLE_API_KEY ?? '');
    this.model = options.model ?? process.env.GOOGLE_MODEL ?? 'gemini-1.5-pro';
  }

  async *processPrompt(req: LlmRequest): AsyncGenerator<string, LlmResponse, undefined> {
    const genModel = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: req.systemPrompt,
    });

    const result = await genModel.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: req.userPrompt }] }],
      generationConfig: {
        temperature: req.temperature ?? 0.2,
        maxOutputTokens: req.maxTokens,
      },
    });

    let fullContent = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullContent += text;
      yield text;
    }

    const finalResponse = await result.response;
    const usage = finalResponse.usageMetadata;
    return {
      content: fullContent,
      tokens: {
        input: usage?.promptTokenCount ?? this.estimateTokens(req.userPrompt),
        output: usage?.candidatesTokenCount ?? this.estimateTokens(fullContent),
        total: usage?.totalTokenCount ?? this.estimateTokens(req.userPrompt + fullContent),
      },
    };
  }

  async completePrompt(req: LlmRequest): Promise<LlmResponse> {
    const genModel = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: req.systemPrompt,
    });

    const result = await genModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: req.userPrompt }] }],
      generationConfig: {
        temperature: req.temperature ?? 0,
        maxOutputTokens: req.maxTokens,
      },
    });

    const content = result.response.text();
    const usage = result.response.usageMetadata;
    return {
      content,
      tokens: {
        input: usage?.promptTokenCount ?? this.estimateTokens(req.userPrompt),
        output: usage?.candidatesTokenCount ?? this.estimateTokens(content),
        total: usage?.totalTokenCount ?? this.estimateTokens(req.userPrompt + content),
      },
    };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
