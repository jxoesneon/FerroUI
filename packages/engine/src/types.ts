// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { z } from 'zod';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FerroUILayout, FerroUIComponent } from '@ferroui/schema';

export interface RequestContext {
  userId: string;
  permissions: string[];
  locale: string;
  requestId: string;
  /**
   * Tenant identifier for multi-tenant deployments.
   * Used for per-tenant quota enforcement, audit logging, and cache namespace isolation.
   * Defaults to "default" when not provided.
   */
  tenantId?: string;
  metadata?: Record<string, unknown>;
}

export interface LlmRequest {
  systemPrompt: string;
  userPrompt: string;
  conversationContext?: string[];
  temperature?: number;
  maxTokens?: number;
  /**
   * When true, instructs the provider to return valid JSON only.
   * - OpenAI: sets response_format = { type: 'json_object' }
   * - Anthropic: wraps response in a structured_json tool call
   * - Other providers: no-op (rely on prompt instruction)
   */
  jsonMode?: boolean;
  /**
   * When true, marks the system prompt as a candidate for provider-level
   * prompt caching (Anthropic ephemeral cache / OpenAI cached prefix).
   */
  enablePromptCache?: boolean;
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
  layout?: Partial<FerroUILayout>;
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
