import { z } from 'zod';
import { FerroUILayoutSchema } from './types.js';

export enum EngineChunkType {
  PHASE = 'phase',
  TOOL_CALL = 'tool_call',
  TOOL_OUTPUT = 'tool_output',
  LAYOUT_CHUNK = 'layout_chunk',
  RAW_CHUNK = 'raw_chunk',
  COMPLETE = 'complete',
  ERROR = 'error',
}

const PhaseChunkSchema = z.object({
  type: z.literal(EngineChunkType.PHASE),
  phase: z.number(),
  content: z.string().optional(),
});

const ToolCallChunkSchema = z.object({
  type: z.literal(EngineChunkType.TOOL_CALL),
  toolCall: z.object({
    name: z.string(),
    args: z.record(z.string(), z.unknown()),
  }),
});

const ToolOutputChunkSchema = z.object({
  type: z.literal(EngineChunkType.TOOL_OUTPUT),
  toolOutput: z.object({
    name: z.string(),
    result: z.unknown(),
  }),
});

const LayoutChunkSchema = z.object({
  type: z.literal(EngineChunkType.LAYOUT_CHUNK),
  layout: FerroUILayoutSchema,
});

const RawChunkSchema = z.object({
  type: z.literal(EngineChunkType.RAW_CHUNK),
  content: z.string(),
});

const CompleteChunkSchema = z.object({
  type: z.literal(EngineChunkType.COMPLETE),
  content: z.string().optional(),
  requestId: z.string().optional(),
  metrics: z.object({
    duration: z.number().optional(),
    tokens: z.number().optional(),
  }).optional(),
});

const ErrorChunkSchema = z.object({
  type: z.literal(EngineChunkType.ERROR),
  error: z.string(),
  code: z.string().optional(),
  retryable: z.boolean().optional(),
});

export const EngineChunkSchema = z.discriminatedUnion('type', [
  PhaseChunkSchema,
  ToolCallChunkSchema,
  ToolOutputChunkSchema,
  LayoutChunkSchema,
  RawChunkSchema,
  CompleteChunkSchema,
  ErrorChunkSchema,
]);

export type EngineChunk = z.infer<typeof EngineChunkSchema>;
