import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fuzzyMatchComponent, repairLayout } from './repair';
import { LlmProvider } from '../providers/base';
import { ValidationIssue } from '@alloy/schema';
import { RequestContext } from '../types';

// Mock the registry
vi.mock('@alloy/registry', () => ({
  registry: {
    getAllComponents: vi.fn(() => [
      { name: 'Button' },
      { name: 'Card' },
      { name: 'StatusBanner' },
      { name: 'UserProfile' },
      { name: 'HeroSection' }
    ])
  }
}));

// Mock the schema validator
const mockValidateLayout = vi.fn();
vi.mock('@alloy/schema', () => ({
  validateLayout: (...args: any[]) => mockValidateLayout(...args)
}));

class MockProvider implements LlmProvider {
  id = 'mock';
  contextWindowTokens = 1000;
  
  async completePrompt() {
    return { content: '{"type":"Card","id":"c1"}', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }
  
  async *processPrompt() {
    yield 'mock';
    return { content: 'mock', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }

  estimateTokens(text: string) {
    return text.length;
  }
}

describe('repair.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fuzzyMatchComponent', () => {
    it('should find exact match case-insensitive', () => {
      expect(fuzzyMatchComponent('button')).toBe('Button');
      expect(fuzzyMatchComponent('CARD')).toBe('Card');
    });

    it('should find closest match above threshold', () => {
      // "StatBanner" is close to "StatusBanner"
      expect(fuzzyMatchComponent('StatBanner')).toBe('StatusBanner');
      // "UserProfl" is close to "UserProfile"
      expect(fuzzyMatchComponent('UserProfl')).toBe('UserProfile');
    });

    it('should return undefined if no close match found', () => {
      // "XYZA" is totally different
      expect(fuzzyMatchComponent('XYZA')).toBeUndefined();
    });
  });

  describe('repairLayout', () => {
    let mockProvider: LlmProvider;
    let mockContext: RequestContext;
    let mockErrors: ValidationIssue[];

    beforeEach(() => {
      mockProvider = new MockProvider();
      mockContext = { userId: '1', requestId: '1', locale: 'en' };
      mockErrors = [{ path: 'root', message: 'Test error', code: 'test' }];
    });

    it('should successfully repair layout if LLM returns valid JSON that passes validation', async () => {
      mockValidateLayout.mockReturnValueOnce({ valid: true, data: { type: 'Card', id: 'c1' } });
      
      const result = await repairLayout(mockProvider, 'prompt', { bad: 'data' }, mockErrors, mockContext);
      
      expect(result).toEqual({ type: 'Card', id: 'c1' });
      expect(mockValidateLayout).toHaveBeenCalledWith({ type: 'Card', id: 'c1' });
    });

    it('should throw error if max attempts exceeded', async () => {
      await expect(
        repairLayout(mockProvider, 'prompt', { bad: 'data' }, mockErrors, mockContext, 4, 3)
      ).rejects.toThrow('Failed to repair layout after 3 attempts.');
    });

    it('should retry if validation fails after LLM response', async () => {
      // First attempt: validation fails
      mockValidateLayout.mockReturnValueOnce({ valid: false, errors: [{ path: 'x', message: 'err' }] });
      // Second attempt: validation passes
      mockValidateLayout.mockReturnValueOnce({ valid: true, data: { type: 'Button', id: 'b1' } });

      const completePromptSpy = vi.spyOn(mockProvider, 'completePrompt');
      
      const result = await repairLayout(mockProvider, 'prompt', { bad: 'data' }, mockErrors, mockContext);
      
      expect(result).toEqual({ type: 'Button', id: 'b1' });
      expect(completePromptSpy).toHaveBeenCalledTimes(2);
      expect(mockValidateLayout).toHaveBeenCalledTimes(2);
    });

    it('should retry if JSON parsing fails', async () => {
      // LLM returns invalid JSON first time
      vi.spyOn(mockProvider, 'completePrompt')
        .mockResolvedValueOnce({ content: 'I fixed it: { bad json', usage: { promptTokens:0, completionTokens:0, totalTokens:0 } })
        .mockResolvedValueOnce({ content: '{"type":"Card","id":"c1"}', usage: { promptTokens:0, completionTokens:0, totalTokens:0 } });
        
      mockValidateLayout.mockReturnValueOnce({ valid: true, data: { type: 'Card', id: 'c1' } });

      const result = await repairLayout(mockProvider, 'prompt', { bad: 'data' }, mockErrors, mockContext);
      
      expect(result).toEqual({ type: 'Card', id: 'c1' });
    });
  });
});