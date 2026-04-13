import { describe, it, expect } from 'vitest';
import { ToolRegistry } from './registry';
import { z } from 'zod';

describe('ToolRegistry', () => {
  it('should register tools with Zod schemas', () => {
    const registry = new ToolRegistry();
    
    registry.register({
      name: 'testTool',
      description: 'A test tool',
      parameters: z.object({ input: z.string() }),
      execute: async ({ input }) => `Hello ${input}`
    });
    
    const tool = registry.get('testTool');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('testTool');
  });
});
