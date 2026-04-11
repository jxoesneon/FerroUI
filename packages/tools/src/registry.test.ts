import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { z } from 'zod';
import { ToolRegistry, registerTool, getToolsForUser, executeTool, invalidateCache, invalidateCachePattern, registerCacheHandler } from './registry';
import { ToolContext, ToolDefinition } from './types';
import { ToolError } from './errors';

describe('ToolRegistry', () => {
  beforeEach(() => {
    ToolRegistry.getInstance().clear();
  });

  it('should register and retrieve tools with Zod schemas', () => {
    const testTool: ToolDefinition = {
      name: 'test_tool',
      description: 'A test tool',
      parameters: z.object({
        input: z.string()
      }),
      returns: z.object({
        output: z.string()
      }),
      execute: async (args) => ({ output: `Hello, ${args.input}!` })
    };

    registerTool(testTool);
    const retrieved = ToolRegistry.getInstance().get('test_tool');
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('test_tool');
  });

  it('should prevent duplicate tool registration', () => {
    const testTool: ToolDefinition = {
      name: 'duplicate_tool',
      description: 'A test tool',
      parameters: z.object({}),
      returns: z.object({}),
      execute: async () => ({})
    };

    registerTool(testTool);
    expect(() => registerTool(testTool)).toThrow('Tool with name "duplicate_tool" is already registered.');
  });
});

describe('Permission Gating', () => {
  const adminTool: ToolDefinition = {
    name: 'admin_tool',
    description: 'Only for admins',
    requiredPermissions: ['admin'],
    parameters: z.object({}),
    returns: z.object({}),
    execute: async () => ({ success: true })
  };

  const publicTool: ToolDefinition = {
    name: 'public_tool',
    description: 'For everyone',
    parameters: z.object({}),
    returns: z.object({}),
    execute: async () => ({ success: true })
  };

  beforeEach(() => {
    ToolRegistry.getInstance().clear();
    registerTool(adminTool);
    registerTool(publicTool);
  });

  it('getToolsForUser should filter tools based on permissions', () => {
    const adminTools = getToolsForUser(['admin']);
    expect(adminTools.map(t => t.name)).toContain('admin_tool');
    expect(adminTools.map(t => t.name)).toContain('public_tool');

    const userTools = getToolsForUser(['user']);
    expect(userTools.map(t => t.name)).not.toContain('admin_tool');
    expect(userTools.map(t => t.name)).toContain('public_tool');
  });

  it('getToolsForUser should return all tools if no requiredPermissions are set', () => {
    const allTools = getToolsForUser([]);
    expect(allTools.map(t => t.name)).toContain('public_tool');
    expect(allTools.map(t => t.name)).not.toContain('admin_tool');
  });

  it('executeTool should enforce permissions', async () => {
    const context: ToolContext = {
      session: { userId: '1', permissions: ['user'] },
      request: { id: 'req1' },
      logger: { 
        info: vi.fn(), 
        error: vi.fn(), 
        warn: vi.fn(), 
        debug: vi.fn() 
      } as any
    };

    // Should succeed for public tool
    await expect(executeTool('public_tool', {}, context)).resolves.toEqual({});

    // Should fail for admin tool
    await expect(executeTool('admin_tool', {}, context)).rejects.toThrow('User lacks required permissions for tool "admin_tool"');
    
    // Should succeed for admin tool if user has permission
    context.session.permissions = ['admin'];
    await expect(executeTool('admin_tool', {}, context)).resolves.toEqual({});
  });
});

describe('Execution Timeout', () => {
  beforeEach(() => {
    ToolRegistry.getInstance().clear();
  });

  it('should timeout if execution takes too long', async () => {
    const slowTool: ToolDefinition = {
      name: 'slow_tool',
      description: 'Takes a while',
      timeout: 10, // 10ms
      parameters: z.object({}),
      returns: z.object({}),
      execute: async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return {};
      }
    };

    registerTool(slowTool);

    const context: ToolContext = {
      session: { userId: '1', permissions: [] },
      request: { id: 'req1' },
      logger: { 
        info: vi.fn(), 
        error: vi.fn(), 
        warn: vi.fn(), 
        debug: vi.fn() 
      } as any
    };

    await expect(executeTool('slow_tool', {}, context)).rejects.toThrow('Tool "slow_tool" execution timed out.');
  });
});

describe('Execution Edge Cases', () => {
  const context: ToolContext = {
    session: { userId: '1', permissions: [] },
    request: { id: 'req1' },
    logger: { 
      info: vi.fn(), 
      error: vi.fn(), 
      warn: vi.fn(), 
      debug: vi.fn() 
    } as any
  };

  beforeEach(() => {
    ToolRegistry.getInstance().clear();
    vi.clearAllMocks();
  });

  it('should throw NOT_FOUND when tool does not exist', async () => {
    await expect(executeTool('nonexistent_tool', {}, context)).rejects.toThrow('Tool "nonexistent_tool" not found in registry.');
  });

  it('should throw INVALID_PARAMS for zod validation errors', async () => {
    const tool: ToolDefinition = {
      name: 'param_tool',
      description: 'needs params',
      parameters: z.object({ requiredField: z.string() }),
      returns: z.object({}),
      execute: async () => ({})
    };
    registerTool(tool);

    await expect(executeTool('param_tool', {}, context)).rejects.toThrow('Parameters failed validation.');
  });

  it('should throw INVALID_PARAMS for generic validation errors', async () => {
    // We simulate a non-ZodError being thrown by parse
    const mockParameters = {
      parse: () => { throw new Error('Generic validation error'); }
    };
    const tool: ToolDefinition = {
      name: 'generic_param_tool',
      description: 'generic errors',
      parameters: mockParameters as any,
      returns: z.object({}),
      execute: async () => ({})
    };
    registerTool(tool);

    await expect(executeTool('generic_param_tool', {}, context)).rejects.toThrow('Parameters failed validation.');
  });

  it('should pass through ToolError thrown by tool execute', async () => {
    const tool: ToolDefinition = {
      name: 'tool_error_tool',
      description: 'throws tool error',
      parameters: z.object({}),
      returns: z.object({}),
      execute: async () => {
        throw new ToolError('DEPENDENCY_ERROR', 'External API failed');
      }
    };
    registerTool(tool);

    await expect(executeTool('tool_error_tool', {}, context)).rejects.toThrow('External API failed');
    // Ensure logger.error was not called because it's a known ToolError
    expect(context.logger.error).not.toHaveBeenCalled();
  });

  it('should wrap generic errors thrown by tool execute in ToolError(INTERNAL_ERROR)', async () => {
    const tool: ToolDefinition = {
      name: 'internal_error_tool',
      description: 'throws generic error',
      parameters: z.object({}),
      returns: z.object({}),
      execute: async () => {
        throw new Error('Something exploded');
      }
    };
    registerTool(tool);

    await expect(executeTool('internal_error_tool', {}, context)).rejects.toThrow('Something exploded');
    expect(context.logger.error).toHaveBeenCalledWith('Execution error in tool "internal_error_tool"', expect.objectContaining({
      error: 'Something exploded',
      toolName: 'internal_error_tool'
    }));
  });

  it('should handle non-Error objects thrown by tool execute', async () => {
    const tool: ToolDefinition = {
      name: 'string_error_tool',
      description: 'throws string',
      parameters: z.object({}),
      returns: z.object({}),
      execute: async () => {
        throw 'String error';
      }
    };
    registerTool(tool);

    await expect(executeTool('string_error_tool', {}, context)).rejects.toThrow('Unexpected internal error.');
  });
});

describe('Cache Invalidation', () => {
  let originalWarn: any;

  beforeEach(() => {
    originalWarn = console.warn;
    console.warn = vi.fn();
  });

  afterEach(() => {
    console.warn = originalWarn;
    // reset handlers
    registerCacheHandler({ invalidate: null as any, invalidatePattern: null as any });
  });

  it('should call registered invalidation handlers', async () => {
    const invalidateSpy = vi.fn();
    const invalidatePatternSpy = vi.fn();

    registerCacheHandler({
      invalidate: invalidateSpy,
      invalidatePattern: invalidatePatternSpy,
    });

    await invalidateCache('test_tool', { id: '123' });
    expect(invalidateSpy).toHaveBeenCalledWith('test_tool', { id: '123' });

    await invalidateCachePattern('test_*');
    expect(invalidatePatternSpy).toHaveBeenCalledWith('test_*');
  });

  it('should log warning if no invalidation handler registered', async () => {
    // Explicitly null them out
    registerCacheHandler({ invalidate: null as any, invalidatePattern: null as any });

    await invalidateCache('missing_handler');
    expect(console.warn).toHaveBeenCalledWith('invalidateCache called for "missing_handler" but no cache layer is registered.');
  });

  it('should log warning if no pattern invalidation handler registered', async () => {
    registerCacheHandler({ invalidate: null as any, invalidatePattern: null as any });

    await invalidateCachePattern('missing_handler_*');
    expect(console.warn).toHaveBeenCalledWith('invalidateCachePattern called for "missing_handler_*" but no cache layer is registered.');
  });
});