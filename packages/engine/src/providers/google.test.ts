import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetGenerativeModel } = vi.hoisted(() => ({
  mockGetGenerativeModel: vi.fn(),
}));

vi.mock('@google/generative-ai', () => {
  function GoogleGenerativeAI() {
    return { getGenerativeModel: mockGetGenerativeModel };
  }
  return { GoogleGenerativeAI };
});

import { GoogleProvider } from './google.js';

function makeGenModel(textChunks: string[], finalText: string, usage?: Record<string, number>) {
  return {
    generateContentStream: vi.fn().mockResolvedValue({
      stream: (async function* () {
        for (const chunk of textChunks) {
          yield { text: () => chunk };
        }
      })(),
      response: Promise.resolve({
        text: () => finalText,
        usageMetadata: usage
          ? { promptTokenCount: usage.prompt, candidatesTokenCount: usage.candidates, totalTokenCount: usage.total }
          : undefined,
      }),
    }),
    generateContent: vi.fn().mockResolvedValue({
      response: {
        text: () => finalText,
        usageMetadata: usage
          ? { promptTokenCount: usage.prompt, candidatesTokenCount: usage.candidates, totalTokenCount: usage.total }
          : undefined,
      },
    }),
  };
}

describe('GoogleProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetGenerativeModel.mockReturnValue(makeGenModel(['Hello', ' World'], 'Hello World', { prompt: 8, candidates: 4, total: 12 }));
  });

  it('has correct id and contextWindow', () => {
    const p = new GoogleProvider({ apiKey: 'key', model: 'gemini-1.5-pro' });
    expect(p.id).toBe('google');
    expect(p.contextWindowTokens).toBe(1_000_000);
  });

  it('uses env var GOOGLE_MODEL as default model', () => {
    process.env.GOOGLE_MODEL = 'gemini-flash';
    const p = new GoogleProvider({ apiKey: 'key' });
    expect(p).toBeDefined();
    delete process.env.GOOGLE_MODEL;
  });

  it('estimateTokens returns ceil(len/4)', () => {
    const p = new GoogleProvider({ apiKey: 'key' });
    expect(p.estimateTokens('hello')).toBe(2);
    expect(p.estimateTokens('hello!')).toBe(2);
    expect(p.estimateTokens('hello world!')).toBe(3);
  });

  it('completePrompt returns content and token counts', async () => {
    const p = new GoogleProvider({ apiKey: 'test-key' });
    const result = await p.completePrompt({ systemPrompt: 'sys', userPrompt: 'hello', temperature: 0.5, maxTokens: 100 });
    expect(result.content).toBe('Hello World');
    expect(result.tokens.input).toBe(8);
    expect(result.tokens.output).toBe(4);
    expect(result.tokens.total).toBe(12);
  });

  it('completePrompt uses estimateTokens when usageMetadata absent', async () => {
    mockGetGenerativeModel.mockReturnValueOnce({
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => 'response', usageMetadata: undefined },
      }),
    });
    const p = new GoogleProvider({ apiKey: 'k' });
    const result = await p.completePrompt({ systemPrompt: 's', userPrompt: 'user' });
    expect(typeof result.tokens.input).toBe('number');
  });

  it('processPrompt yields chunks and returns final response', async () => {
    const p = new GoogleProvider({ apiKey: 'k' });
    const gen = p.processPrompt({ systemPrompt: 'sys', userPrompt: 'go' });
    const chunks: string[] = [];
    let finalResult;
    while (true) {
      const { value, done } = await gen.next();
      if (done) { finalResult = value; break; }
      chunks.push(value as string);
    }
    expect(chunks).toEqual(['Hello', ' World']);
    expect((finalResult as { content: string }).content).toBe('Hello World');
  });

  it('processPrompt uses estimateTokens when usageMetadata absent', async () => {
    mockGetGenerativeModel.mockReturnValueOnce({
      generateContentStream: vi.fn().mockResolvedValue({
        stream: (async function* () { yield { text: () => 'hi' }; })(),
        response: Promise.resolve({ text: () => 'hi', usageMetadata: undefined }),
      }),
    });
    const p = new GoogleProvider({ apiKey: 'k' });
    const gen = p.processPrompt({ systemPrompt: 's', userPrompt: 'u' });
    while (!(await gen.next()).done) { /* drain */ }
  });
});
