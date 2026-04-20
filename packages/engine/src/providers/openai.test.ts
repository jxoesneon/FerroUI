import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIProvider } from './openai.js';

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

  it('streams content chunks and handles jsonMode in processPrompt', async () => {
    const chunks: string[] = [];
    const gen = provider.processPrompt({ systemPrompt: 'sys', userPrompt: 'hi', jsonMode: true });
    for await (const chunk of gen) {
      if (typeof chunk === 'string') chunks.push(chunk);
    }
    expect(chunks).toEqual(['Hello', ' world']);
  });

  it('handles missing delta content in stream gracefully and uses estimated tokens', async () => {
    // Override the mock for this specific test
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { choices: [{ delta: {} }] }; // no content
        yield { choices: [{ delta: { content: 'test' } }] };
      },
      finalChatCompletion: vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'test' } }],
        usage: undefined // Test fallback usage estimation
      }),
    };
    (provider as any).client.chat.completions.stream = vi.fn().mockReturnValue(mockStream);
    
    const chunks: string[] = [];
    const gen = provider.processPrompt({ systemPrompt: 'sys', userPrompt: 'hi' });
    let finalResult;
    while (true) {
      const { value, done } = await gen.next();
      if (done) { finalResult = value; break; }
      chunks.push(value as string);
    }
    expect(chunks).toEqual(['test']);
    expect((finalResult as any).tokens.total).toBeGreaterThan(0);
  });

  it('completePrompt returns full response and handles jsonMode', async () => {
    const result = await provider.completePrompt({ systemPrompt: 'sys', userPrompt: 'hi', jsonMode: true });
    expect(result.content).toBe('Hello world');
    expect(result.tokens.total).toBe(15);
  });

  it('completePrompt uses estimated tokens when usage is undefined', async () => {
    const mockNonStreamResponse = {
      choices: [{ message: { content: 'Hello world' } }],
      usage: undefined,
    };
    (provider as any).client.chat.completions.create = vi.fn().mockResolvedValue(mockNonStreamResponse);
    
    const result = await provider.completePrompt({ systemPrompt: 'sys', userPrompt: 'hi' });
    expect(result.content).toBe('Hello world');
    expect(result.tokens.total).toBeGreaterThan(0);
  });

  it('estimateTokens approximates length/4', () => {
    expect(provider.estimateTokens('1234')).toBe(1);
    expect(provider.estimateTokens('12345678')).toBe(2);
  });
});
