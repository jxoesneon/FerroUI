import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import {
  ToolRegistry,
  registerTool,
  getToolsForUser,
  executeTool,
  isToolSensitive,
  registerCacheHandler,
  invalidateCache,
  invalidateCachePattern,
} from './registry.js';
import { ToolError } from './errors.js';

function freshRegistry() {
  // Reset the singleton between tests via the private map
  const instance = ToolRegistry.getInstance();
  (instance as unknown as { tools: Map<string, unknown> }).tools = new Map();
  return instance;
}

function makeContext(permissions: string[] = ['read']) {
  return {
    session: { id: 'sess-1', userId: 'u1', permissions, locale: 'en-US' },
    request: { id: 'req-1', prompt: 'test prompt', timestamp: new Date() },
    logger: { debug: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    telemetry: { recordEvent: vi.fn(), recordMetric: vi.fn() },
  };
}

describe('ToolError', () => {
  it('has correct code and message', () => {
    const err = new ToolError('NOT_FOUND', 'missing tool');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('missing tool');
    expect(err.name).toBe('ToolError');
    expect(err instanceof ToolError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });

  it('stores optional data', () => {
    const err = new ToolError('INVALID_PARAMS', 'bad', [{ path: 'x', message: 'required' }]);
    expect(err.data).toEqual([{ path: 'x', message: 'required' }]);
  });
});

describe('ToolRegistry', () => {
  beforeEach(() => freshRegistry());

  it('is a singleton', () => {
    expect(ToolRegistry.getInstance()).toBe(ToolRegistry.getInstance());
  });

  it('registers and retrieves a tool', () => {
    const tool = registerTool({
      name: 'get_user',
      description: 'Gets a user',
      parameters: z.object({ id: z.string() }),
      returns: z.object({ name: z.string() }),
      execute: async () => ({ name: 'Alice' }),
    });
    expect(ToolRegistry.getInstance().get('get_user')).toBe(tool);
  });

  it('throws on duplicate registration', () => {
    registerTool({
      name: 'dup_tool',
      description: 'd',
      parameters: z.object({}),
      returns: z.object({}),
      execute: async () => ({}),
    });
    expect(() =>
      registerTool({
        name: 'dup_tool',
        description: 'd',
        parameters: z.object({}),
        returns: z.object({}),
        execute: async () => ({}),
      })
    ).toThrow(/already registered/);
  });

  it('throws governance error for sensitive tool without permissions', () => {
    expect(() =>
      registerTool({
        name: 'sensitive_no_perms',
        description: 'd',
        sensitive: true,
        parameters: z.object({}),
        returns: z.object({}),
        execute: async () => ({}),
      })
    ).toThrow(/Governance Violation/);
  });

  it('registers sensitive tool with permissions', () => {
    registerTool({
      name: 'sensitive_ok',
      description: 'd',
      sensitive: true,
      requiredPermissions: ['admin'],
      parameters: z.object({}),
      returns: z.object({}),
      execute: async () => ({}),
    });
    expect(isToolSensitive('sensitive_ok')).toBe(true);
  });

  it('getAll returns all tools', () => {
    registerTool({ name: 't1', description: 'd', parameters: z.object({}), returns: z.object({}), execute: async () => ({}) });
    registerTool({ name: 't2', description: 'd', parameters: z.object({}), returns: z.object({}), execute: async () => ({}) });
    expect(ToolRegistry.getInstance().getAll()).toHaveLength(2);
  });
});

describe('getToolsForUser', () => {
  beforeEach(() => freshRegistry());

  it('returns all public tools for any user', () => {
    registerTool({ name: 'pub1', description: 'd', parameters: z.object({}), returns: z.object({}), execute: async () => ({}) });
    registerTool({ name: 'pub2', description: 'd', parameters: z.object({}), returns: z.object({}), execute: async () => ({}) });
    expect(getToolsForUser([])).toHaveLength(2);
  });

  it('hides tools the user lacks permissions for', () => {
    registerTool({
      name: 'private_tool',
      description: 'd',
      requiredPermissions: ['admin'],
      parameters: z.object({}),
      returns: z.object({}),
      execute: async () => ({}),
    });
    expect(getToolsForUser(['read'])).toHaveLength(0);
  });

  it('returns gated tool when user has all required permissions', () => {
    registerTool({
      name: 'gated',
      description: 'd',
      requiredPermissions: ['read', 'write'],
      parameters: z.object({}),
      returns: z.object({}),
      execute: async () => ({}),
    });
    expect(getToolsForUser(['read', 'write'])).toHaveLength(1);
  });
});

describe('executeTool', () => {
  beforeEach(() => freshRegistry());

  it('throws NOT_FOUND for unknown tool', async () => {
    await expect(executeTool('ghost', {}, makeContext())).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('throws UNAUTHORIZED when user lacks permissions', async () => {
    registerTool({
      name: 'admin_tool',
      description: 'd',
      requiredPermissions: ['admin'],
      parameters: z.object({}),
      returns: z.object({}),
      execute: async () => ({}),
    });
    await expect(executeTool('admin_tool', {}, makeContext(['read']))).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('throws INVALID_PARAMS for bad parameters', async () => {
    registerTool({
      name: 'typed_tool',
      description: 'd',
      parameters: z.object({ id: z.string() }),
      returns: z.object({ ok: z.boolean() }),
      execute: async () => ({ ok: true }),
    });
    await expect(executeTool('typed_tool', { id: 123 }, makeContext())).rejects.toMatchObject({ code: 'INVALID_PARAMS' });
  });

  it('throws INVALID_PARAMS for non-Zod errors during parsing', async () => {
    const errorThrowingParams = z.object({});
    errorThrowingParams.parse = () => { throw new Error('Boom'); };
    registerTool({
      name: 'non_zod_err_tool',
      description: 'd',
      parameters: errorThrowingParams,
      returns: z.object({}),
      execute: async () => ({}),
    });
    await expect(executeTool('non_zod_err_tool', {}, makeContext())).rejects.toMatchObject({ code: 'INVALID_PARAMS' });
  });

  it('executes tool and returns validated result', async () => {
    registerTool({
      name: 'ok_tool',
      description: 'd',
      parameters: z.object({ n: z.number() }),
      returns: z.object({ doubled: z.number() }),
      execute: async (p: { n: number }) => ({ doubled: p.n * 2 }),
    });
    const result = await executeTool('ok_tool', { n: 5 }, makeContext());
    expect(result).toEqual({ doubled: 10 });
  });

  it('wraps unexpected execution errors as INTERNAL_ERROR', async () => {
    registerTool({
      name: 'throwing_tool',
      description: 'd',
      parameters: z.object({}),
      returns: z.object({}),
      execute: async () => { throw new Error('explosion'); },
    });
    await expect(executeTool('throwing_tool', {}, makeContext())).rejects.toMatchObject({ code: 'INTERNAL_ERROR' });
  });

  it('re-throws ToolError from execute as-is', async () => {
    registerTool({
      name: 'tool_err',
      description: 'd',
      parameters: z.object({}),
      returns: z.object({}),
      execute: async () => { throw new ToolError('TIMEOUT', 'timed out'); },
    });
    await expect(executeTool('tool_err', {}, makeContext())).rejects.toMatchObject({ code: 'TIMEOUT' });
  });

  it('times out when tool exceeds timeout', async () => {
    registerTool({
      name: 'slow_tool',
      description: 'd',
      timeout: 20,
      parameters: z.object({}),
      returns: z.object({}),
      execute: () => new Promise<Record<string, never>>(resolve => setTimeout(() => resolve({}), 500)),
    });
    await expect(executeTool('slow_tool', {}, makeContext())).rejects.toMatchObject({ code: 'TIMEOUT' });
  });
});

describe('isToolSensitive', () => {
  beforeEach(() => freshRegistry());

  it('returns false for non-sensitive tool', () => {
    registerTool({ name: 'plain', description: 'd', parameters: z.object({}), returns: z.object({}), execute: async () => ({}) });
    expect(isToolSensitive('plain')).toBe(false);
  });

  it('returns false for unknown tool', () => {
    expect(isToolSensitive('does_not_exist')).toBe(false);
  });
});

describe('cache invalidation handlers', () => {
  it('invalidateCache warns when no handler registered', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await invalidateCache('my_tool');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('"my_tool"'));
    warnSpy.mockRestore();
  });

  it('invalidateCachePattern warns when no handler registered', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await invalidateCachePattern('my_tool:*');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('"my_tool:*"'));
    warnSpy.mockRestore();
  });

  it('calls registered invalidation handler', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const patternHandler = vi.fn().mockResolvedValue(undefined);
    registerCacheHandler({ invalidate: handler, invalidatePattern: patternHandler });
    await invalidateCache('tool_x', { id: 1 });
    expect(handler).toHaveBeenCalledWith('tool_x', { id: 1 });
    await invalidateCachePattern('tool_x:*');
    expect(patternHandler).toHaveBeenCalledWith('tool_x:*');
    // reset
    registerCacheHandler({ invalidate: null as never, invalidatePattern: null as never });
  });
});
