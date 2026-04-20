import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { executeTool, createMockContext } from './testing.js';
import { ToolDefinition } from './types.js';

describe('testing utilities', () => {
  const sumTool: ToolDefinition = {
    name: 'sum',
    description: 'Adds two numbers',
    parameters: z.object({
      a: z.number(),
      b: z.number(),
    }),
    returns: z.number(),
    execute: async ({ a, b }) => a + b,
  };

  describe('executeTool', () => {
    it('should execute a tool correctly', async () => {
      const result = await executeTool(sumTool, { a: 5, b: 10 });
      expect(result).toBe(15);
    });

    it('should validate parameters correctly', async () => {
      await expect(executeTool(sumTool, { a: '5', b: 10 })).rejects.toThrow();
    });

    it('should validate return value correctly', async () => {
      const invalidReturnTool: ToolDefinition = {
        name: 'invalidReturn',
        description: 'Returns wrong type',
        parameters: z.object({}),
        returns: z.string(),
        execute: async () => (123 as any),
      };

      await expect(executeTool(invalidReturnTool, {})).rejects.toThrow();
    });

    it('should allow overriding context', async () => {
      const contextTool: ToolDefinition = {
        name: 'contextTool',
        description: 'Uses context',
        parameters: z.object({}),
        returns: z.string(),
        execute: async (_, context) => context.session.userId,
      };

      const result = await executeTool(contextTool, {}, {
        session: { userId: 'custom-user' } as any
      });
      expect(result).toBe('custom-user');
    });
  });

  describe('createMockContext', () => {
    it('should provide default values', () => {
      const context = createMockContext();
      expect(context.session.id).toBe('test-session');
      expect(context.request.id).toBe('test-request');
      expect(context.logger).toBeDefined();
      expect(context.telemetry).toBeDefined();
      
      // Cover default no-op implementations
      expect(() => {
        context.logger.debug('test');
        context.logger.info('test');
        context.logger.warn('test');
        context.logger.error('test');
        context.telemetry.recordEvent('test-event');
        context.telemetry.recordMetric('test-metric', 1);
      }).not.toThrow();
    });

    it('should merge overrides correctly', () => {
      const context = createMockContext({
        session: { userId: 'overridden-user' } as any
      });
      expect(context.session.userId).toBe('overridden-user');
      expect(context.session.id).toBe('test-session');
    });
  });
});
