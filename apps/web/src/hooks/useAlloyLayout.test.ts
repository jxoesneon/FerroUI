// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAlloyLayout } from './useAlloyLayout';

describe('useAlloyLayout', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid'
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('handles successful streaming', async () => {
    const mockRead = vi.fn()
      .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"type":"Dashboard"}\n\n') })
      .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: [DONE]\n\n') })
      .mockResolvedValueOnce({ done: true, value: undefined });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({ read: mockRead })
      }
    }));

    const { result, unmount } = renderHook(() => useAlloyLayout({ url: '/test' }));
    
    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.layout).toEqual({ type: 'Dashboard' });
    expect(result.current.error).toBeNull();
    
    unmount();
  });

  it('handles parsing error silently', async () => {
    const mockRead = vi.fn()
      .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: INVALID_JSON_{}\n\n') })
      .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: [DONE]\n\n') })
      .mockResolvedValueOnce({ done: true, value: undefined });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({ read: mockRead })
      }
    }));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAlloyLayout({ url: '/test' }));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error parsing partial JSON:', expect.any(Error));
    expect(result.current.loading).toBe(false);
    
    consoleSpy.mockRestore();
  });

  it('handles fetch error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    }));

    const { result } = renderHook(() => useAlloyLayout({ url: '/test' }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch layout: Not Found');
  });

  it('handles abort error during fetch', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

    const { result, unmount } = renderHook(() => useAlloyLayout({ url: '/test' }));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Abort errors are caught and ignored, leaving loading true or depending on state.
    // In our code: if err is AbortError, it just returns.
    expect(result.current.error).toBeNull();
    
    unmount();
  });
  
  it('handles unknown error during fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

    const { result } = renderHook(() => useAlloyLayout({ url: '/test' }));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.error?.message).toBe('Network failure');
    expect(result.current.loading).toBe(false);
  });
  
  it('handles non-Error thrown during fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('String Error'));

    const { result } = renderHook(() => useAlloyLayout({ url: '/test' }));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.error?.message).toBe('Unknown error occurred');
    expect(result.current.loading).toBe(false);
  });
  
  it('handles missing reader in response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      body: null
    }));

    const { result } = renderHook(() => useAlloyLayout({ url: '/test' }));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.error?.message).toBe('Response body is not readable');
    expect(result.current.loading).toBe(false);
  });

  it('handles refresh', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useAlloyLayout({ url: '/test' }));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(mockFetch).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refresh();
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
