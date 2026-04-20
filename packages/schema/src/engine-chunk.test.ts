import { describe, it, expect } from 'vitest';
import { EngineChunkSchema, EngineChunkType } from './engine-chunk.js';

describe('EngineChunkSchema', () => {
  it('validates phase chunk', () => {
    const chunk = {
      type: EngineChunkType.PHASE,
      phase: 1,
      content: 'Gathering data...',
    };
    const result = EngineChunkSchema.safeParse(chunk);
    expect(result.success).toBe(true);
  });

  it('validates layout chunk', () => {
    const chunk = {
      type: EngineChunkType.LAYOUT_CHUNK,
      layout: {
        schemaVersion: '1.0',
        requestId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        locale: 'en-US',
        layout: {
          type: 'Dashboard',
          id: 'root',
          props: {},
          children: [],
          aria: { label: 'Dashboard Root' },
        },
      },
    };
    const result = EngineChunkSchema.safeParse(chunk);
    expect(result.success).toBe(true);
  });

  it('validates error chunk', () => {
    const chunk = {
      type: EngineChunkType.ERROR,
      error: 'Something went wrong',
      code: 'E001',
    };
    const result = EngineChunkSchema.safeParse(chunk);
    expect(result.success).toBe(true);
  });

  it('validates complete chunk', () => {
    const chunk = {
      type: EngineChunkType.COMPLETE,
      requestId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      metrics: {
        duration: 1000,
        tokens: 500,
      },
    };
    const result = EngineChunkSchema.safeParse(chunk);
    expect(result.success).toBe(true);
  });

  it('rejects invalid chunk type', () => {
    const chunk = {
      type: 'invalid',
      content: 'test',
    };
    const result = EngineChunkSchema.safeParse(chunk);
    expect(result.success).toBe(false);
  });

  it('rejects phase chunk without phase number', () => {
    const chunk = {
      type: EngineChunkType.PHASE,
      content: 'test',
    };
    const result = EngineChunkSchema.safeParse(chunk);
    expect(result.success).toBe(false);
  });

  it('rejects error chunk without error message', () => {
    const chunk = {
      type: EngineChunkType.ERROR,
      code: 'E001',
    };
    const result = EngineChunkSchema.safeParse(chunk);
    expect(result.success).toBe(false);
  });
});

describe('EngineChunkType', () => {
  it('has all required chunk types', () => {
    expect(EngineChunkType.PHASE).toBe('phase');
    expect(EngineChunkType.LAYOUT_CHUNK).toBe('layout_chunk');
    expect(EngineChunkType.ERROR).toBe('error');
    expect(EngineChunkType.COMPLETE).toBe('complete');
    expect(EngineChunkType.TOOL_CALL).toBe('tool_call');
    expect(EngineChunkType.TOOL_OUTPUT).toBe('tool_output');
  });
});
