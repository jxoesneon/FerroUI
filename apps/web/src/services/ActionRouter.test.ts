// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActionRouter } from './ActionRouter.js';

describe('ActionRouter', () => {
  let router: ActionRouter;

  beforeEach(() => {
    router = (ActionRouter as unknown as { instance: ActionRouter }).instance =
      new (ActionRouter as unknown as new () => ActionRouter)();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should be a singleton', () => {
    const instance1 = ActionRouter.getInstance();
    const instance2 = ActionRouter.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should warn if context is not set', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await router.dispatch({ type: 'REFRESH', payload: undefined });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Context not set'), expect.any(Object));
    consoleSpy.mockRestore();
  });

  it('should dispatch NAVIGATE', async () => {
    const context = { navigate: vi.fn(), refresh: vi.fn(), showToast: vi.fn() };
    router.setContext(context);
    await router.dispatch({ type: 'NAVIGATE', payload: { path: '/home', params: { id: 1 } } });
    expect(context.navigate).toHaveBeenCalledWith('/home', { id: 1 });
  });

  it('should dispatch SHOW_TOAST', async () => {
    const context = { navigate: vi.fn(), refresh: vi.fn(), showToast: vi.fn() };
    router.setContext(context);
    await router.dispatch({ type: 'SHOW_TOAST', payload: { message: 'Hello', variant: 'success' } });
    expect(context.showToast).toHaveBeenCalledWith('Hello', 'success');
  });

  it('should dispatch REFRESH', async () => {
    const context = { navigate: vi.fn(), refresh: vi.fn(), showToast: vi.fn() };
    router.setContext(context);
    await router.dispatch({ type: 'REFRESH', payload: undefined });
    expect(context.refresh).toHaveBeenCalled();
  });

  it('should warn on unhandled action', async () => {
    const context = { navigate: vi.fn(), refresh: vi.fn(), showToast: vi.fn() };
    router.setContext(context);
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await router.dispatch({ type: 'UNKNOWN_ACTION' } as never);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unhandled action type'), expect.anything());
    consoleSpy.mockRestore();
  });

  it('should dispatch TOOL_CALL successfully', async () => {
    const context = { navigate: vi.fn(), refresh: vi.fn(), showToast: vi.fn() };
    router.setContext(context);
    
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await router.dispatch({ type: 'TOOL_CALL', payload: { tool: 'myTool', args: { a: 1 } } });

    expect(fetchMock).toHaveBeenCalledWith('/api/tools/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'myTool', args: { a: 1 } })
    });
    expect(context.refresh).toHaveBeenCalled();
  });

  it('should handle TOOL_CALL failure', async () => {
    const context = { navigate: vi.fn(), refresh: vi.fn(), showToast: vi.fn() };
    router.setContext(context);
    
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Server Error',
    }));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await router.dispatch({ type: 'TOOL_CALL', payload: { tool: 'myTool', args: {} } });
    
    expect(context.showToast).toHaveBeenCalledWith('Tool call failed: myTool', 'error');
    consoleSpy.mockRestore();
  });
});
