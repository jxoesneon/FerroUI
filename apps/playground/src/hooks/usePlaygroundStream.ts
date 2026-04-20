import { useState, useCallback } from 'react';
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';
import type { FerroUILayout } from '@ferroui/schema';
import type { EngineChunk } from '../../../packages/engine/src/types';

export interface PlaygroundState {
  layout: FerroUILayout | null;
  phase: 1 | 2 | null;
  status: string;
  isGenerating: boolean;
  error: string | null;
}

export function usePlaygroundStream() {
  const [state, setState] = useState<PlaygroundState>({
    layout: null,
    phase: null,
    status: 'Ready',
    isGenerating: false,
    error: null,
  });

  const generate = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    setState({
      layout: null,
      phase: null,
      status: 'Connecting...',
      isGenerating: true,
      error: null,
    });

    try {
      const response = await fetch('http://localhost:4000/api/ferroui/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': 'Bearer playground-token', // Mock token for dev
        },
        body: JSON.stringify({
          prompt,
          context: {
            userId: 'playground-user',
            requestId: `req-${Date.now()}`,
            permissions: ['*'],
            locale: 'en-US',
            tenantId: 'default'
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to connect to engine' }));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body from server');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const parser = createParser((event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          try {
            const chunk = JSON.parse(event.data) as EngineChunk;
            handleChunk(chunk);
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      });

      const handleChunk = (chunk: EngineChunk) => {
        setState((prev) => {
          let nextLayout = prev.layout;
          let nextPhase = prev.phase;
          let nextStatus = prev.status;
          let nextGenerating = prev.isGenerating;
          let nextError = prev.error;

          switch (chunk.type) {
            case 'phase':
              nextPhase = chunk.phase ?? null;
              nextStatus = nextPhase === 1 ? 'Phase 1: Drafting...' : 'Phase 2: Polishing...';
              break;
            case 'tool_call':
              nextStatus = `Calling tool: ${chunk.toolCall?.name}...`;
              break;
            case 'tool_output':
              nextStatus = `Tool ${chunk.toolOutput?.name} returned.`;
              break;
            case 'layout_chunk':
              if (chunk.layout) {
                // If it's a full layout replace (though usually it's partial)
                nextLayout = { ...prev.layout, ...chunk.layout } as FerroUILayout;
              }
              break;
            case 'complete':
              nextStatus = 'Generation complete';
              nextGenerating = false;
              break;
            case 'error':
              nextStatus = 'Error';
              nextGenerating = false;
              nextError = chunk.error?.message || 'Unknown engine error';
              break;
          }

          return {
            layout: nextLayout,
            phase: nextPhase,
            status: nextStatus,
            isGenerating: nextGenerating,
            error: nextError,
          };
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        parser.feed(decoder.decode(value));
      }

    } catch (err) {
      console.error('Playground generation error:', err);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        status: 'Error',
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
      }));
    }
  }, []);

  return { ...state, generate };
}
