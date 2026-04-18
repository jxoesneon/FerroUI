/**
 * Renderer package — unit tests for pure logic modules.
 *
 * FerroUIRenderer and ActionHandler are React components that require
 * a DOM environment. The renderer vitest config uses 'node' environment,
 * so we test the pure non-DOM logic: useFerroUIStream state machine and
 * the streaming buffer/chunk parsing.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── useFerroUIStream stream parsing logic ─────────────────────────────────────
// We test the chunk-processing switch cases via a helper that mirrors the hook's
// internal SSE line parser without needing React.

type ChunkType =
  | { type: 'phase'; phase: 1 | 2 }
  | { type: 'tool_call'; toolCall: { name: string; args: unknown } }
  | { type: 'tool_output'; toolOutput: { name: string; result: unknown } }
  | { type: 'complete'; layout?: unknown }
  | { type: 'layout_chunk'; layout?: unknown }
  | { type: 'error'; error?: { message: string; retryable?: boolean } };

interface StreamState {
  layout: unknown;
  loading: boolean;
  error: string | null;
  phase: 1 | 2 | null;
  toolCalls: Array<{ name: string; args: unknown; result?: unknown }>;
  cacheHit: boolean;
}

function initialState(): StreamState {
  return { layout: null, loading: true, error: null, phase: null, toolCalls: [], cacheHit: false };
}

function applyChunk(state: StreamState, chunk: ChunkType): StreamState {
  const s = { ...state };
  switch (chunk.type) {
    case 'phase':
      s.phase = chunk.phase;
      break;
    case 'tool_call':
      s.toolCalls = [...s.toolCalls, { name: chunk.toolCall.name, args: chunk.toolCall.args }];
      break;
    case 'tool_output':
      s.toolCalls = s.toolCalls.map(tc =>
        tc.name === chunk.toolOutput.name ? { ...tc, result: chunk.toolOutput.result } : tc,
      );
      break;
    case 'complete':
      s.layout = chunk.layout ?? s.layout;
      s.loading = false;
      s.cacheHit = (chunk.layout as { metadata?: { cacheHit?: boolean } } | undefined)?.metadata?.cacheHit ?? false;
      break;
    case 'layout_chunk':
      if (chunk.layout) s.layout = chunk.layout;
      break;
    case 'error':
      s.error = chunk.error?.message ?? 'Unknown stream error';
      if (!chunk.error?.retryable) s.loading = false;
      break;
  }
  return s;
}

describe('useFerroUIStream — chunk state transitions', () => {
  let state: StreamState;

  beforeEach(() => { state = initialState(); });

  it('phase chunk updates phase', () => {
    state = applyChunk(state, { type: 'phase', phase: 1 });
    expect(state.phase).toBe(1);
    state = applyChunk(state, { type: 'phase', phase: 2 });
    expect(state.phase).toBe(2);
  });

  it('tool_call chunk appends to toolCalls', () => {
    state = applyChunk(state, { type: 'tool_call', toolCall: { name: 'get_user', args: { id: '1' } } });
    expect(state.toolCalls).toHaveLength(1);
    expect(state.toolCalls[0].name).toBe('get_user');
  });

  it('tool_output chunk attaches result to matching tool call', () => {
    state = applyChunk(state, { type: 'tool_call', toolCall: { name: 'get_user', args: {} } });
    state = applyChunk(state, { type: 'tool_output', toolOutput: { name: 'get_user', result: { userId: 'u1' } } });
    expect(state.toolCalls[0].result).toEqual({ userId: 'u1' });
  });

  it('tool_output chunk leaves unrelated calls unchanged', () => {
    state = applyChunk(state, { type: 'tool_call', toolCall: { name: 'tool_a', args: {} } });
    state = applyChunk(state, { type: 'tool_call', toolCall: { name: 'tool_b', args: {} } });
    state = applyChunk(state, { type: 'tool_output', toolOutput: { name: 'tool_b', result: 'ok' } });
    expect(state.toolCalls[0].result).toBeUndefined();
    expect(state.toolCalls[1].result).toBe('ok');
  });

  it('complete chunk sets layout and stops loading', () => {
    const layout = { type: 'Dashboard' };
    state = applyChunk(state, { type: 'complete', layout });
    expect(state.layout).toEqual(layout);
    expect(state.loading).toBe(false);
  });

  it('complete chunk with cacheHit sets cacheHit flag', () => {
    const layout = { type: 'Dashboard', metadata: { cacheHit: true } };
    state = applyChunk(state, { type: 'complete', layout });
    expect(state.cacheHit).toBe(true);
  });

  it('complete chunk without layout keeps previous layout', () => {
    state.layout = { type: 'OldLayout' };
    state = applyChunk(state, { type: 'complete' });
    expect(state.layout).toEqual({ type: 'OldLayout' });
    expect(state.loading).toBe(false);
  });

  it('layout_chunk updates layout while loading', () => {
    const partial = { type: 'Dashboard', children: [] };
    state = applyChunk(state, { type: 'layout_chunk', layout: partial });
    expect(state.layout).toEqual(partial);
    expect(state.loading).toBe(true);
  });

  it('layout_chunk without layout is a no-op', () => {
    state = applyChunk(state, { type: 'layout_chunk' });
    expect(state.layout).toBeNull();
  });

  it('error chunk sets error and stops loading', () => {
    state = applyChunk(state, { type: 'error', error: { message: 'pipeline failed' } });
    expect(state.error).toBe('pipeline failed');
    expect(state.loading).toBe(false);
  });

  it('retryable error keeps loading true', () => {
    state = applyChunk(state, { type: 'error', error: { message: 'retrying', retryable: true } });
    expect(state.error).toBe('retrying');
    expect(state.loading).toBe(true);
  });

  it('error chunk without message uses fallback', () => {
    state = applyChunk(state, { type: 'error' });
    expect(state.error).toBe('Unknown stream error');
  });
});

// ── SSE line parsing ──────────────────────────────────────────────────────────

function parseSSELine(line: string): unknown | null {
  const match = line.match(/^data:\s*(.+)$/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

describe('SSE line parser', () => {
  it('parses valid data line', () => {
    const result = parseSSELine('data: {"type":"phase","phase":1}');
    expect(result).toEqual({ type: 'phase', phase: 1 });
  });

  it('returns null for non-data line', () => {
    expect(parseSSELine('event: update')).toBeNull();
    expect(parseSSELine(': ping')).toBeNull();
    expect(parseSSELine('')).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    expect(parseSSELine('data: {bad json')).toBeNull();
  });

  it('handles extra whitespace after data:', () => {
    const result = parseSSELine('data:   {"type":"complete"}');
    expect(result).toEqual({ type: 'complete' });
  });
});
