import { useState, useCallback, useRef } from 'react';
import type { FerroUIComponent } from '@ferroui/schema';

export interface FerroUIStreamState {
  /** Current layout tree (may be partial during streaming). */
  layout: FerroUIComponent | null;
  /** Whether the stream is actively receiving data. */
  loading: boolean;
  /** Error from the stream or pipeline. */
  error: string | null;
  /** Phase currently in progress (1 = data gathering, 2 = UI generation). */
  phase: 1 | 2 | null;
  /** Tool calls made during Phase 1. */
  toolCalls: Array<{ name: string; args: unknown; result?: unknown }>;
  /** Cache hit indicator. */
  cacheHit: boolean;
}

export interface UseFerroUIStreamOptions {
  /** Engine endpoint URL. Defaults to /api/ferroui/process. */
  endpoint?: string;
  /** Additional headers (e.g., Authorization). */
  headers?: Record<string, string>;
}

/**
 * React hook for streaming FerroUILayout from the engine SSE endpoint.
 *
 * @example
 * ```tsx
 * const { layout, loading, error, send } = useFerroUIStream();
 * send('Show me a dashboard of recent tickets', context);
 * ```
 */
export function useFerroUIStream(options: UseFerroUIStreamOptions = {}) {
  const endpoint = options.endpoint ?? '/api/ferroui/process';
  const abortRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<FerroUIStreamState>({
    layout: null,
    loading: false,
    error: null,
    phase: null,
    toolCalls: [],
    cacheHit: false,
  });

  const send = useCallback(
    async (prompt: string, context: { userId: string; requestId: string; permissions: string[]; locale: string }) => {
      // Abort any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        layout: null,
        loading: true,
        error: null,
        phase: null,
        toolCalls: [],
        cacheHit: false,
      });

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: JSON.stringify({ prompt, context }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({ error: response.statusText }));
          setState(prev => ({ ...prev, loading: false, error: (errBody as { error: string }).error ?? 'Request failed' }));
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          setState(prev => ({ ...prev, loading: false, error: 'No stream body' }));
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const match = line.match(/^data:\s*(.+)$/);
            if (!match) continue;

            try {
              const chunk = JSON.parse(match[1]);

              switch (chunk.type) {
                case 'phase':
                  setState(prev => ({ ...prev, phase: chunk.phase }));
                  break;

                case 'tool_call':
                  setState(prev => ({
                    ...prev,
                    toolCalls: [...prev.toolCalls, { name: chunk.toolCall.name, args: chunk.toolCall.args }],
                  }));
                  break;

                case 'tool_output':
                  setState(prev => ({
                    ...prev,
                    toolCalls: prev.toolCalls.map(tc =>
                      tc.name === chunk.toolOutput.name ? { ...tc, result: chunk.toolOutput.result } : tc,
                    ),
                  }));
                  break;

                case 'complete':
                  setState(prev => ({
                    ...prev,
                    layout: chunk.layout ?? prev.layout,
                    loading: false,
                    cacheHit: chunk.layout?.metadata?.cacheHit ?? false,
                  }));
                  break;

                case 'layout_chunk':
                  // Partial layout updates during streaming
                  if (chunk.layout) {
                    setState(prev => ({ ...prev, layout: chunk.layout }));
                  }
                  break;

                case 'error':
                  setState(prev => ({
                    ...prev,
                    error: chunk.error?.message ?? 'Unknown stream error',
                    loading: chunk.error?.retryable ? prev.loading : false,
                  }));
                  break;
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }

        // If we exit the loop without a complete chunk, mark as done
        setState(prev => (prev.loading ? { ...prev, loading: false } : prev));
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setState(prev => ({ ...prev, loading: false, error: (err as Error).message }));
      }
    },
    [endpoint, options.headers],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  return { ...state, send, abort };
}
