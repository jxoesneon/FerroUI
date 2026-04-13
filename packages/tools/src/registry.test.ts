import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry } from './registry';
import { z } from 'zod';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = ToolRegistry.getInstance();
    registry.clear();
  });

  it('should register tools with Zod schemas', () => {
    registry.register({
      name: 'testTool',
      description: 'A test tool',
      parameters: z.object({ input: z.string() }),
      returns: z.string(),
      execute: async ({ input }) => `Hello ${input}`
    });
    
    const tool = registry.get('testTool');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('testTool');
  });
});
