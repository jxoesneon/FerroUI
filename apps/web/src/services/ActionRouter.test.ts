// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionRouter } from './ActionRouter';

describe('ActionRouter', () => {
  let router: ActionRouter;

  beforeEach(() => {
    router = (ActionRouter as any).instance = new (ActionRouter as any)();
  });

  it('should be a singleton', () => {
    const instance1 = ActionRouter.getInstance();
    const instance2 = ActionRouter.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should warn if context is not set', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await router.dispatch({ type: 'REFRESH' } as any);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Context not set'), expect.any(Object));
    consoleSpy.mockRestore();
  });

  it('should dispatch NAVIGATE', async () => {
    const context = { navigate: vi.fn(), refresh: vi.fn(), showToast: vi.fn() };
    router.setContext(context);
    await router.dispatch({ type: 'NAVIGATE', payload: { path: '/home', params: { id: 1 } } } as any);
    expect(context.navigate).toHaveBeenCalledWith('/home', { id: 1 });
  });

  it('should dispatch SHOW_TOAST', async () => {
    const context = { navigate: vi.fn(), refresh: vi.fn(), showToast: vi.fn() };
    router.setContext(context);
    await router.dispatch({ type: 'SHOW_TOAST', payload: { message: 'Hello', variant: 'success' } } as any);
    expect(context.showToast).toHaveBeenCalledWith('Hello', 'success');
  });

  it('should dispatch REFRESH', async () => {
    const context = { navigate: vi.fn(), refresh: vi.fn(), showToast: vi.fn() };
    router.setContext(context);
    await router.dispatch({ type: 'REFRESH' } as any);
    expect(context.refresh).toHaveBeenCalled();
  });

  it('should warn on unhandled action', async () => {
    const context = { navigate: vi.fn(), refresh: vi.fn(), showToast: vi.fn() };
    router.setContext(context);
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await router.dispatch({ type: 'UNKNOWN_ACTION' } as any);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unhandled action type'));
    consoleSpy.mockRestore();
  });

  it('should dispatch TOOL_CALL successfully', async () => {
    const context = { navigate: vi.fn(), refresh: vi.fn(), showToast: vi.fn() };
    router.setContext(context);
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
    
    await router.dispatch({ type: 'TOOL_CALL', payload: { tool: 'myTool', args: { a: 1 } } } as any);
    
    expect(global.fetch).toHaveBeenCalledWith('/api/tools/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'myTool', args: { a: 1 } })
    });
    expect(context.refresh).toHaveBeenCalled();
  });

  it('should handle TOOL_CALL failure', async () => {
    const context = { navigate: vi.fn(), refresh: vi.fn(), showToast: vi.fn() };
    router.setContext(context);
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Server Error'
    });
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await router.dispatch({ type: 'TOOL_CALL', payload: { tool: 'myTool', args: {} } } as any);
    
    expect(context.showToast).toHaveBeenCalledWith('Tool call failed: myTool', 'error');
    consoleSpy.mockRestore();
  });
});
