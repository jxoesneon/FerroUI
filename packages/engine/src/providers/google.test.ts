import { describe, it, expect } from 'vitest';
import { GoogleProvider } from './google';
import { LlmRequest } from '../types';

describe('GoogleProvider', () => {
  const provider = new GoogleProvider();
  const mockReq: LlmRequest = { userPrompt: 'test prompt' };

  it('should have correct id and context window', () => {
    expect(provider.id).toBe('google');
    expect(provider.contextWindowTokens).toBe(1000000);
  });

  it('should estimate tokens correctly', () => {
    expect(provider.estimateTokens('1234')).toBe(1);
    expect(provider.estimateTokens('12345')).toBe(2);
  });

  it('should stream processPrompt correctly', async () => {
    const generator = provider.processPrompt(mockReq);
    const chunks: string[] = [];
    let response;
    
    let result = await generator.next();
    while (!result.done) {
      chunks.push(result.value);
      result = await generator.next();
    }
    response = result.value;

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join('')).toContain('simulated response from Google Gemini for: test prompt');
    expect(response.content).toBe('This is a simulated response from Google Gemini for: test prompt');
    expect(response.tokens).toBeDefined();
  });

  it('should completePrompt correctly', async () => {
    const response = await provider.completePrompt(mockReq);
    expect(response.content).toBe('This is a simulated response from Google Gemini for: test prompt');
    expect(response.tokens).toBeDefined();
  });
});
