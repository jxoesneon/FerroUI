// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { z } from 'zod';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AlloyLayout, AlloyComponent } from '@alloy/schema';

export interface RequestContext {
  userId: string;
  permissions: string[];
  locale: string;
  requestId: string;
  metadata?: Record<string, unknown>;
}

export interface LlmRequest {
  systemPrompt: string;
  userPrompt: string;
  conversationContext?: string[];
  temperature?: number;
  maxTokens?: number;
}

export interface LlmResponse {
  content: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
}

export interface EngineChunk {
  type: 'phase' | 'tool_call' | 'tool_output' | 'layout_chunk' | 'complete' | 'error';
  phase?: 1 | 2;
  content?: string;
  toolCall?: {
    name: string;
    args: any;
  };
  toolOutput?: {
    name: string;
    result: any;
  };
  layout?: Partial<AlloyLayout>;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export interface EngineConfig {
  maxRepairAttempts: number;
  cacheEnabled: boolean;
  toolTimeoutMs: number;
}
