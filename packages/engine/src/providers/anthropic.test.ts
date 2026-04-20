import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCreate, mockStream } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockStream: vi.fn(),
}));

vi.mock('@anthropic-ai/sdk', () => {
  function Anthropic() {
    return { messages: { create: mockCreate, stream: mockStream } };
  }
  return { default: Anthropic };
});

import { AnthropicProvider } from './anthropic.js';

function makeUsage(input = 10, output = 5) {
  return { input_tokens: input, output_tokens: output };
}

describe('AnthropicProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has correct id and contextWindow', () => {
    const p = new AnthropicProvider({ apiKey: 'key' });
    expect(p.id).toBe('anthropic');
    expect(p.contextWindowTokens).toBe(200_000);
  });

  it('estimateTokens returns ceil(len/4)', () => {
    const p = new AnthropicProvider({ apiKey: 'k' });
    expect(p.estimateTokens('hello')).toBe(2);
    expect(p.estimateTokens('')).toBe(0);
  });

  describe('completePrompt', () => {
    it('returns text content from non-JSON mode', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'Hello response' }],
        usage: makeUsage(10, 8),
      });
      const p = new AnthropicProvider({ apiKey: 'k' });
      const result = await p.completePrompt({ systemPrompt: 'sys', userPrompt: 'user' });
      expect(result.content).toBe('Hello response');
      expect(result.tokens.input).toBe(10);
      expect(result.tokens.output).toBe(8);
      expect(result.tokens.total).toBe(18);
    });

    it('returns empty string when content has no text block', async () => {
      mockCreate.mockResolvedValue({ content: [], usage: makeUsage() });
      const p = new AnthropicProvider({ apiKey: 'k' });
      const result = await p.completePrompt({ systemPrompt: 's', userPrompt: 'u' });
      expect(result.content).toBe('');
    });

    it('uses tool_use output in JSON mode (via json field)', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'tool_use', name: 'structured_json_output', input: { json: '{"x":1}' } }],
        usage: makeUsage(12, 6),
      });
      const p = new AnthropicProvider({ apiKey: 'k' });
      const result = await p.completePrompt({ systemPrompt: 's', userPrompt: 'u', jsonMode: true });
      expect(result.content).toBe('{"x":1}');
    });

    it('JSON mode falls back to stringified input when no json field', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'tool_use', name: 'structured_json_output', input: { key: 'val' } }],
        usage: makeUsage(5, 3),
      });
      const p = new AnthropicProvider({ apiKey: 'k' });
      const result = await p.completePrompt({ systemPrompt: 's', userPrompt: 'u', jsonMode: true });
      expect(result.content).toContain('key');
    });

    it('JSON mode uses text block when no tool_use', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: '{"fallback":true}' }],
        usage: makeUsage(5, 3),
      });
      const p = new AnthropicProvider({ apiKey: 'k' });
      const result = await p.completePrompt({ systemPrompt: 's', userPrompt: 'u', jsonMode: true });
      expect(result.content).toBe('{"fallback":true}');
    });

    it('JSON mode returns empty string when neither tool_use nor text block exists', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'image' }],
        usage: makeUsage(5, 3),
      });
      const p = new AnthropicProvider({ apiKey: 'k' });
      const result = await p.completePrompt({ systemPrompt: 's', userPrompt: 'u', jsonMode: true });
      expect(result.content).toBe('');
    });

    it('handles conversationContext', async () => {
      mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'reply' }], usage: makeUsage() });
      const p = new AnthropicProvider({ apiKey: 'k' });
      await p.completePrompt({ systemPrompt: 's', userPrompt: 'u', conversationContext: ['prev msg'] });
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ messages: expect.arrayContaining([{ role: 'user', content: 'prev msg' }]) }),
      );
    });

    it('uses enablePromptCache (array system param)', async () => {
      mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }], usage: makeUsage() });
      const p = new AnthropicProvider({ apiKey: 'k' });
      await p.completePrompt({ systemPrompt: 'big sys', userPrompt: 'u', enablePromptCache: true });
      const callArgs = mockCreate.mock.calls[0][0];
      expect(Array.isArray(callArgs.system)).toBe(true);
      expect(callArgs.system[0].cache_control).toBeDefined();
    });
  });

  describe('processPrompt', () => {
    it('streams text chunks and returns final response', async () => {
      const events = [
        { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello ' } },
        { type: 'content_block_delta', delta: { type: 'image_delta' } }, // ignores non-text deltas
        { type: 'content_block_delta', delta: { type: 'text_delta', text: 'World' } },
        { type: 'message_stop' },
      ];
      mockStream.mockReturnValue({
        [Symbol.asyncIterator]: async function* () { yield* events; },
        finalMessage: vi.fn().mockResolvedValue({ usage: makeUsage(10, 4) }),
      });
      const p = new AnthropicProvider({ apiKey: 'k' });
      const gen = p.processPrompt({ systemPrompt: 's', userPrompt: 'u' });
      const chunks: string[] = [];
      let finalResult;
      while (true) {
        const { value, done } = await gen.next();
        if (done) { finalResult = value; break; }
        chunks.push(value as string);
      }
      expect(chunks).toEqual(['Hello ', 'World']);
      expect((finalResult as { content: string }).content).toBe('Hello World');
      expect((finalResult as { tokens: { total: number } }).tokens.total).toBe(14);
    });

    it('JSON mode processPrompt yields content and returns response with total tokens', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'tool_use', name: 'structured_json_output', input: { json: '{}' } }],
        usage: makeUsage(8, 2),
      });
      const p = new AnthropicProvider({ apiKey: 'k' });
      const gen = p.processPrompt({ systemPrompt: 's', userPrompt: 'u', jsonMode: true });
      const chunks: string[] = [];
      let finalResult;
      while (true) {
        const { value, done } = await gen.next();
        if (done) { finalResult = value; break; }
        chunks.push(value as string);
      }
      expect(chunks).toEqual(['{}']);
      expect((finalResult as { tokens: { input: number, total: number } }).tokens.input).toBe(8);
      expect((finalResult as { tokens: { total: number } }).tokens.total).toBe(10);
    });

    it('JSON mode processPrompt falls back when json field missing', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'tool_use', name: 'structured_json_output', input: { key: 'val' } }],
        usage: makeUsage(8, 2),
      });
      const p = new AnthropicProvider({ apiKey: 'k' });
      const gen = p.processPrompt({ systemPrompt: 's', userPrompt: 'u', jsonMode: true });
      const chunks: string[] = [];
      let finalResult;
      while (true) {
        const { value, done } = await gen.next();
        if (done) { finalResult = value; break; }
        chunks.push(value as string);
      }
      expect(chunks).toEqual(['{"key":"val"}']);
      expect((finalResult as { tokens: { input: number, total: number } }).tokens.total).toBe(10);
    });
    
    it('JSON mode processPrompt uses text block if no tool_use', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: '{"fallback":true}' }],
        usage: makeUsage(8, 2),
      });
      const p = new AnthropicProvider({ apiKey: 'k' });
      const gen = p.processPrompt({ systemPrompt: 's', userPrompt: 'u', jsonMode: true });
      const chunks: string[] = [];
      let finalResult;
      while (true) {
        const { value, done } = await gen.next();
        if (done) { finalResult = value; break; }
        chunks.push(value as string);
      }
      expect(chunks).toEqual(['{"fallback":true}']);
    });
  });
});
