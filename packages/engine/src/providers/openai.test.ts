import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIProvider } from './openai';

vi.mock('openai', () => {
  const mockStream = {
    [Symbol.asyncIterator]: async function* () {
      yield { choices: [{ delta: { content: 'Hello' } }] };
      yield { choices: [{ delta: { content: ' world' } }] };
    },
    finalChatCompletion: vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'Hello world' } }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    }),
  };

  const mockNonStreamResponse = {
    choices: [{ message: { content: 'Hello world' } }],
    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
  };

  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          stream: vi.fn().mockReturnValue(mockStream),
          create: vi.fn().mockResolvedValue(mockNonStreamResponse),
        },
      };
    },
  };
});

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider({ apiKey: 'test-key', model: 'gpt-4o' });
  });

  it('has id "openai"', () => {
    expect(provider.id).toBe('openai');
  });

  it('streams content chunks from processPrompt', async () => {
    const chunks: string[] = [];
    const gen = provider.processPrompt({ systemPrompt: 'sys', userPrompt: 'hi' });
    for await (const chunk of gen) {
      if (typeof chunk === 'string') chunks.push(chunk);
    }
    expect(chunks).toEqual(['Hello', ' world']);
  });

  it('completePrompt returns full response with tokens', async () => {
    const result = await provider.completePrompt({ systemPrompt: 'sys', userPrompt: 'hi' });
    expect(result.content).toBe('Hello world');
    expect(result.tokens.total).toBe(15);
  });

  it('estimateTokens approximates length/4', () => {
    expect(provider.estimateTokens('1234')).toBe(1);
    expect(provider.estimateTokens('12345678')).toBe(2);
  });
});
