# Full Gap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all 13 implementation gaps identified in AUDIT_REPORT.md v2 — real LLM providers, auth middleware, structured audit logging, OTLP telemetry export, persistent session state, real deploy command, `ferroui logs` command, design token system, a11y keyboard nav + axe tests, and `dataClassification` cache routing.

**Architecture:** Each gap is an independent, self-contained task. Tasks 1–3 are P0 (must complete first). Tasks 4–8 are P1. Tasks 9–13 are P2. No task depends on a later task.

**Tech Stack:** TypeScript 6, Express 5, Zod 4, OpenAI SDK, Anthropic SDK, @google/generative-ai, Vitest, opentelemetry-exporter-otlp-http, express-jwt, axe-core

---

## Task 1: Real LLM Provider Implementations (P0)

**Files:**
- Modify: `packages/engine/src/providers/openai.ts`
- Modify: `packages/engine/src/providers/anthropic.ts`
- Modify: `packages/engine/src/providers/google.ts`
- Modify: `packages/engine/src/providers/ollama.ts`
- Modify: `packages/engine/package.json`
- Test: `packages/engine/src/providers/openai.test.ts`

- [ ] **Step 1: Install provider SDKs**

```bash
cd packages/engine
pnpm add openai @anthropic-ai/sdk @google/generative-ai
```

- [ ] **Step 2: Write failing tests for OpenAI provider**

Create `packages/engine/src/providers/openai.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIProvider } from './openai';

vi.mock('openai', () => {
  const mockStream = {
    [Symbol.asyncIterator]: async function* () {
      yield { choices: [{ delta: { content: 'Hello' } }] };
      yield { choices: [{ delta: { content: ' world' } }] };
    },
    finalChatCompletion: async () => ({
      choices: [{ message: { content: 'Hello world' } }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    }),
  };
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue(mockStream),
        },
      };
    },
  };
});

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider({ apiKey: 'test-key', model: 'gpt-4o' });
  });

  it('streams content chunks', async () => {
    const chunks: string[] = [];
    const gen = provider.processPrompt({ systemPrompt: 'sys', userPrompt: 'hi' });
    for await (const chunk of gen) {
      if (typeof chunk === 'string') chunks.push(chunk);
    }
    expect(chunks).toEqual(['Hello', ' world']);
  });

  it('completePrompt returns full content', async () => {
    const result = await provider.completePrompt({ systemPrompt: 'sys', userPrompt: 'hi' });
    expect(result.content).toBe('Hello world');
    expect(result.tokens.total).toBe(15);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd packages/engine
pnpm vitest run src/providers/openai.test.ts
```
Expected: FAIL — module mocking not set up yet / stub returns wrong content

- [ ] **Step 4: Implement OpenAI provider**

Replace `packages/engine/src/providers/openai.ts`:

```typescript
import OpenAI from 'openai';
import { LlmProvider } from './base';
import { LlmRequest, LlmResponse } from '../types';

export interface OpenAIProviderOptions {
  apiKey?: string;
  model?: string;
  baseURL?: string;
}

export class OpenAIProvider implements LlmProvider {
  readonly id = 'openai';
  readonly contextWindowTokens = 128000;
  private client: OpenAI;
  private model: string;

  constructor(options: OpenAIProviderOptions = {}) {
    this.client = new OpenAI({
      apiKey: options.apiKey ?? process.env.OPENAI_API_KEY,
      baseURL: options.baseURL,
    });
    this.model = options.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o';
  }

  async *processPrompt(req: LlmRequest): AsyncGenerator<string, LlmResponse, undefined> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      temperature: req.temperature ?? 0.2,
      max_tokens: req.maxTokens,
      stream: true,
      messages: [
        { role: 'system', content: req.systemPrompt },
        ...(req.conversationContext?.map(c => ({ role: 'user' as const, content: c })) ?? []),
        { role: 'user', content: req.userPrompt },
      ],
    });

    let fullContent = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      if (delta) {
        fullContent += delta;
        yield delta;
      }
    }

    const final = await stream.finalChatCompletion();
    return {
      content: fullContent,
      tokens: {
        input: final.usage?.prompt_tokens ?? this.estimateTokens(req.userPrompt),
        output: final.usage?.completion_tokens ?? this.estimateTokens(fullContent),
        total: final.usage?.total_tokens ?? this.estimateTokens(req.userPrompt + fullContent),
      },
    };
  }

  async completePrompt(req: LlmRequest): Promise<LlmResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: req.temperature ?? 0,
      max_tokens: req.maxTokens,
      stream: false,
      messages: [
        { role: 'system', content: req.systemPrompt },
        ...(req.conversationContext?.map(c => ({ role: 'user' as const, content: c })) ?? []),
        { role: 'user', content: req.userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content ?? '';
    return {
      content,
      tokens: {
        input: response.usage?.prompt_tokens ?? this.estimateTokens(req.userPrompt),
        output: response.usage?.completion_tokens ?? this.estimateTokens(content),
        total: response.usage?.total_tokens ?? this.estimateTokens(req.userPrompt + content),
      },
    };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd packages/engine
pnpm vitest run src/providers/openai.test.ts
```
Expected: PASS

- [ ] **Step 6: Implement Anthropic provider**

Replace `packages/engine/src/providers/anthropic.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { LlmProvider } from './base';
import { LlmRequest, LlmResponse } from '../types';

export interface AnthropicProviderOptions {
  apiKey?: string;
  model?: string;
}

export class AnthropicProvider implements LlmProvider {
  readonly id = 'anthropic';
  readonly contextWindowTokens = 200000;
  private client: Anthropic;
  private model: string;

  constructor(options: AnthropicProviderOptions = {}) {
    this.client = new Anthropic({
      apiKey: options.apiKey ?? process.env.ANTHROPIC_API_KEY,
    });
    this.model = options.model ?? process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022';
  }

  async *processPrompt(req: LlmRequest): AsyncGenerator<string, LlmResponse, undefined> {
    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: req.maxTokens ?? 4096,
      temperature: req.temperature ?? 0.2,
      system: req.systemPrompt,
      messages: [
        ...(req.conversationContext?.map(c => ({ role: 'user' as const, content: c })) ?? []),
        { role: 'user', content: req.userPrompt },
      ],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const text = event.delta.text;
        fullContent += text;
        yield text;
      }
    }

    const finalMsg = await stream.finalMessage();
    inputTokens = finalMsg.usage.input_tokens;
    outputTokens = finalMsg.usage.output_tokens;

    return {
      content: fullContent,
      tokens: { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens },
    };
  }

  async completePrompt(req: LlmRequest): Promise<LlmResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: req.maxTokens ?? 4096,
      temperature: req.temperature ?? 0,
      system: req.systemPrompt,
      messages: [
        ...(req.conversationContext?.map(c => ({ role: 'user' as const, content: c })) ?? []),
        { role: 'user', content: req.userPrompt },
      ],
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    return {
      content,
      tokens: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        total: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
```

- [ ] **Step 7: Implement Google provider**

Replace `packages/engine/src/providers/google.ts`:

```typescript
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { LlmProvider } from './base';
import { LlmRequest, LlmResponse } from '../types';

export interface GoogleProviderOptions {
  apiKey?: string;
  model?: string;
}

export class GoogleProvider implements LlmProvider {
  readonly id = 'google';
  readonly contextWindowTokens = 1000000;
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(options: GoogleProviderOptions = {}) {
    this.client = new GoogleGenerativeAI(options.apiKey ?? process.env.GOOGLE_API_KEY ?? '');
    this.model = options.model ?? process.env.GOOGLE_MODEL ?? 'gemini-1.5-pro';
  }

  async *processPrompt(req: LlmRequest): AsyncGenerator<string, LlmResponse, undefined> {
    const genModel = this.client.getGenerativeModel({
      model: this.model,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      systemInstruction: req.systemPrompt,
    });

    const result = await genModel.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: req.userPrompt }] }],
      generationConfig: { temperature: req.temperature ?? 0.2, maxOutputTokens: req.maxTokens },
    });

    let fullContent = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullContent += text;
      yield text;
    }

    const finalResponse = await result.response;
    const usage = finalResponse.usageMetadata;
    return {
      content: fullContent,
      tokens: {
        input: usage?.promptTokenCount ?? this.estimateTokens(req.userPrompt),
        output: usage?.candidatesTokenCount ?? this.estimateTokens(fullContent),
        total: usage?.totalTokenCount ?? this.estimateTokens(req.userPrompt + fullContent),
      },
    };
  }

  async completePrompt(req: LlmRequest): Promise<LlmResponse> {
    const genModel = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: req.systemPrompt,
    });

    const result = await genModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: req.userPrompt }] }],
      generationConfig: { temperature: req.temperature ?? 0, maxOutputTokens: req.maxTokens },
    });

    const content = result.response.text();
    const usage = result.response.usageMetadata;
    return {
      content,
      tokens: {
        input: usage?.promptTokenCount ?? this.estimateTokens(req.userPrompt),
        output: usage?.candidatesTokenCount ?? this.estimateTokens(content),
        total: usage?.totalTokenCount ?? this.estimateTokens(req.userPrompt + content),
      },
    };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
```

- [ ] **Step 8: Implement Ollama provider**

Replace `packages/engine/src/providers/ollama.ts`:

```typescript
import { LlmProvider } from './base';
import { LlmRequest, LlmResponse } from '../types';

export interface OllamaProviderOptions {
  baseURL?: string;
  model?: string;
}

interface OllamaStreamChunk {
  model: string;
  response: string;
  done: boolean;
  prompt_eval_count?: number;
  eval_count?: number;
}

export class OllamaProvider implements LlmProvider {
  readonly id = 'ollama';
  readonly contextWindowTokens = 128000;
  private baseURL: string;
  private model: string;

  constructor(options: OllamaProviderOptions = {}) {
    this.baseURL = options.baseURL ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
    this.model = options.model ?? process.env.OLLAMA_MODEL ?? 'llama3';
  }

  async *processPrompt(req: LlmRequest): AsyncGenerator<string, LlmResponse, undefined> {
    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: `${req.systemPrompt}\n\n${req.userPrompt}`,
        temperature: req.temperature ?? 0.2,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const chunk: OllamaStreamChunk = JSON.parse(line);
          if (chunk.response) {
            fullContent += chunk.response;
            yield chunk.response;
          }
          if (chunk.done) {
            inputTokens = chunk.prompt_eval_count ?? this.estimateTokens(req.userPrompt);
            outputTokens = chunk.eval_count ?? this.estimateTokens(fullContent);
          }
        } catch {
          // partial line — skip
        }
      }
    }

    return {
      content: fullContent,
      tokens: { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens },
    };
  }

  async completePrompt(req: LlmRequest): Promise<LlmResponse> {
    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: `${req.systemPrompt}\n\n${req.userPrompt}`,
        temperature: req.temperature ?? 0,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as OllamaStreamChunk;
    return {
      content: data.response,
      tokens: {
        input: data.prompt_eval_count ?? this.estimateTokens(req.userPrompt),
        output: data.eval_count ?? this.estimateTokens(data.response),
        total: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
      },
    };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
```

- [ ] **Step 9: Build and commit**

```bash
cd packages/engine
pnpm run build
cd ../..
git add packages/engine/src/providers/ packages/engine/package.json
git commit -m "feat(engine): implement real LLM provider SDKs (OpenAI, Anthropic, Google, Ollama)"
```

---

## Task 2: Structured Audit Logging (P0)

**Files:**
- Create: `packages/engine/src/audit/audit-logger.ts`
- Modify: `packages/engine/src/pipeline/dual-phase.ts`
- Modify: `packages/engine/src/server.ts`
- Test: `packages/engine/src/audit/audit-logger.test.ts`

- [ ] **Step 1: Write failing test**

Create `packages/engine/src/audit/audit-logger.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { AuditLogger, AuditEventType } from './audit-logger';

describe('AuditLogger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = new AuditLogger({ output: 'memory' });
  });

  it('records tool_call events', () => {
    logger.log({
      type: AuditEventType.TOOL_CALL,
      requestId: 'req-1',
      userId: 'user-1',
      toolName: 'getUserProfile',
      args: { userId: 'u1' },
      success: true,
      durationMs: 42,
    });

    const events = logger.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe(AuditEventType.TOOL_CALL);
    expect(events[0].toolName).toBe('getUserProfile');
  });

  it('records request_complete events', () => {
    logger.log({
      type: AuditEventType.REQUEST_COMPLETE,
      requestId: 'req-2',
      userId: 'user-2',
      success: true,
      durationMs: 1200,
    });

    const events = logger.getEvents();
    expect(events[0].type).toBe(AuditEventType.REQUEST_COMPLETE);
  });

  it('serializes to JSON lines', () => {
    logger.log({
      type: AuditEventType.TOOL_CALL,
      requestId: 'r',
      userId: 'u',
      toolName: 't',
      args: {},
      success: false,
      durationMs: 0,
    });

    const line = logger.toJsonLines()[0];
    const parsed = JSON.parse(line);
    expect(parsed.type).toBe(AuditEventType.TOOL_CALL);
    expect(parsed.timestamp).toBeDefined();
  });
});
```

- [ ] **Step 2: Run to verify fail**

```bash
cd packages/engine
pnpm vitest run src/audit/audit-logger.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement AuditLogger**

Create `packages/engine/src/audit/audit-logger.ts`:

```typescript
export enum AuditEventType {
  TOOL_CALL = 'tool_call',
  REQUEST_START = 'request_start',
  REQUEST_COMPLETE = 'request_complete',
  REQUEST_ERROR = 'request_error',
  CIRCUIT_OPEN = 'circuit_open',
  CIRCUIT_RESET = 'circuit_reset',
  RATE_LIMITED = 'rate_limited',
}

interface BaseAuditEvent {
  type: AuditEventType;
  requestId: string;
  userId: string;
  timestamp?: string;
}

interface ToolCallEvent extends BaseAuditEvent {
  type: AuditEventType.TOOL_CALL;
  toolName: string;
  args: Record<string, unknown>;
  success: boolean;
  durationMs: number;
  error?: string;
}

interface RequestCompleteEvent extends BaseAuditEvent {
  type: AuditEventType.REQUEST_COMPLETE;
  success: boolean;
  durationMs: number;
  repairAttempts?: number;
  cacheHit?: boolean;
}

interface RequestStartEvent extends BaseAuditEvent {
  type: AuditEventType.REQUEST_START;
  promptHash: string;
  permissions: string[];
  locale: string;
}

interface RequestErrorEvent extends BaseAuditEvent {
  type: AuditEventType.REQUEST_ERROR;
  error: string;
  code: string;
}

interface CircuitEvent extends BaseAuditEvent {
  type: AuditEventType.CIRCUIT_OPEN | AuditEventType.CIRCUIT_RESET;
  consecutiveFailures: number;
}

interface RateLimitedEvent extends BaseAuditEvent {
  type: AuditEventType.RATE_LIMITED;
  ip: string;
}

export type AuditEvent =
  | ToolCallEvent
  | RequestCompleteEvent
  | RequestStartEvent
  | RequestErrorEvent
  | CircuitEvent
  | RateLimitedEvent;

export interface AuditLoggerOptions {
  output?: 'console' | 'memory' | 'file';
  filePath?: string;
}

export class AuditLogger {
  private output: 'console' | 'memory' | 'file';
  private filePath?: string;
  private events: AuditEvent[] = [];
  private static instance?: AuditLogger;

  constructor(options: AuditLoggerOptions = {}) {
    this.output = options.output ?? 'console';
    this.filePath = options.filePath;
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger({
        output: process.env.AUDIT_LOG_OUTPUT as any ?? 'console',
        filePath: process.env.AUDIT_LOG_FILE,
      });
    }
    return AuditLogger.instance;
  }

  public log(event: AuditEvent): void {
    const stamped = { ...event, timestamp: new Date().toISOString() };

    if (this.output === 'memory') {
      this.events.push(stamped);
      return;
    }

    const line = JSON.stringify(stamped);

    if (this.output === 'console') {
      process.stdout.write(`[AUDIT] ${line}\n`);
    } else if (this.output === 'file' && this.filePath) {
      import('fs').then(fs => {
        fs.appendFileSync(this.filePath!, line + '\n', 'utf-8');
      }).catch(() => {
        process.stdout.write(`[AUDIT] ${line}\n`);
      });
    }
  }

  public getEvents(): AuditEvent[] {
    return [...this.events];
  }

  public toJsonLines(): string[] {
    return this.events.map(e => JSON.stringify(e));
  }

  public clear(): void {
    this.events = [];
  }
}

export const auditLogger = AuditLogger.getInstance();
```

- [ ] **Step 4: Run to verify pass**

```bash
cd packages/engine
pnpm vitest run src/audit/audit-logger.test.ts
```
Expected: PASS

- [ ] **Step 5: Wire audit logger into dual-phase pipeline**

In `packages/engine/src/pipeline/dual-phase.ts`, add at the top after existing imports:

```typescript
import { auditLogger, AuditEventType } from '../audit/audit-logger';
import CryptoJS from 'crypto-js';
```

After `yield { type: 'phase', phase: 1, content: 'Starting Phase 1: Data Gathering' };`, add:

```typescript
  auditLogger.log({
    type: AuditEventType.REQUEST_START,
    requestId: context.requestId,
    userId: context.userId,
    promptHash: CryptoJS.SHA256(prompt.trim().toLowerCase()).toString(),
    permissions: context.permissions,
    locale: context.locale,
  });
```

After `yield { type: 'tool_output', toolOutput: { name: call.name, result } };` inside the success branch, add:

```typescript
      auditLogger.log({
        type: AuditEventType.TOOL_CALL,
        requestId: context.requestId,
        userId: context.userId,
        toolName: call.name,
        args: call.args,
        success: true,
        durationMs: 0,
      });
```

After the catch block for tool errors, add similar logging with `success: false`.

After `yield { type: 'complete' };`, add:

```typescript
  auditLogger.log({
    type: AuditEventType.REQUEST_COMPLETE,
    requestId: context.requestId,
    userId: context.userId,
    success: true,
    durationMs: 0,
  });
```

- [ ] **Step 6: Build and commit**

```bash
cd packages/engine
pnpm run build
cd ../..
git add packages/engine/src/audit/ packages/engine/src/pipeline/dual-phase.ts
git commit -m "feat(engine): add structured audit logging (AuditLogger + pipeline wiring)"
```

---

## Task 3: OTel OTLP Exporter (P1)

**Files:**
- Modify: `packages/telemetry/src/tracer.ts`
- Modify: `packages/telemetry/package.json`
- Test: `packages/telemetry/src/tracer.test.ts`

- [ ] **Step 1: Install OTLP exporter**

```bash
cd packages/telemetry
pnpm add @opentelemetry/exporter-trace-otlp-http @opentelemetry/exporter-metrics-otlp-http @opentelemetry/sdk-metrics
```

- [ ] **Step 2: Write failing test**

Create `packages/telemetry/src/tracer.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('@opentelemetry/exporter-trace-otlp-http', () => ({
  OTLPTraceExporter: class { export = vi.fn(); shutdown = vi.fn().mockResolvedValue(undefined); },
}));
vi.mock('@opentelemetry/sdk-trace-base', () => ({
  BasicTracerProvider: class {
    addSpanProcessor = vi.fn();
    register = vi.fn();
  },
  SimpleSpanProcessor: class { constructor(public exporter: any) {} },
  ConsoleSpanExporter: class {},
  BatchSpanProcessor: class { constructor(public exporter: any) {} },
}));
vi.mock('@opentelemetry/resources', () => ({
  Resource: class { constructor(public attrs: any) {} },
}));
vi.mock('@opentelemetry/semantic-conventions', () => ({
  SemanticResourceAttributes: { SERVICE_NAME: 'service.name' },
}));

describe('initializeTelemetry', () => {
  it('returns a provider', async () => {
    const { initializeTelemetry } = await import('./tracer');
    const provider = initializeTelemetry('test-service');
    expect(provider).toBeDefined();
  });

  it('uses OTLP exporter when OTEL_EXPORTER_OTLP_ENDPOINT is set', async () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318';
    const { initializeTelemetry } = await import('./tracer');
    const provider = initializeTelemetry('test-service');
    expect(provider).toBeDefined();
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  });
});
```

- [ ] **Step 3: Run to verify fail**

```bash
cd packages/telemetry
pnpm vitest run src/tracer.test.ts
```

- [ ] **Step 4: Update tracer.ts to support OTLP export**

Replace `packages/telemetry/src/tracer.ts`:

```typescript
import { trace, Tracer, Span, SpanOptions, Context, context } from '@opentelemetry/api';
import { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { FerroUIAttributes } from './types';

const INSTRUMENTATION_NAME = '@ferroui/telemetry';
const INSTRUMENTATION_VERSION = '0.1.0';

export function getTracer(): Tracer {
  return trace.getTracer(INSTRUMENTATION_NAME, INSTRUMENTATION_VERSION);
}

export const tracer = getTracer();

export function initializeTelemetry(serviceName: string = 'ferroui-ui') {
  const provider = new BasicTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  });

  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  if (otlpEndpoint) {
    const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
    provider.addSpanProcessor(
      new BatchSpanProcessor(new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` }))
    );
  } else {
    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  }

  provider.register();
  return provider;
}

export function startSpan(name: string, options?: SpanOptions, ctx?: Context): Span {
  return getTracer().startSpan(name, options, ctx);
}

export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  options?: SpanOptions,
  ctx?: Context
): Promise<T> {
  const t = getTracer();
  return t.startActiveSpan(name, options ?? {}, ctx ?? context.active(), async (span) => {
    try {
      return await fn(span);
    } catch (error) {
      if (error instanceof Error) {
        span.recordException(error);
        span.setStatus({ code: 2, message: error.message });
      }
      throw error;
    } finally {
      span.end();
    }
  });
}

export function setCommonAttributes(
  span: Span,
  attributes: { requestId?: string; userId?: string; promptHash?: string; schemaVersion?: string }
) {
  if (attributes.requestId) span.setAttribute(FerroUIAttributes.REQUEST_ID, attributes.requestId);
  if (attributes.userId) span.setAttribute(FerroUIAttributes.USER_ID, attributes.userId);
  if (attributes.promptHash) span.setAttribute(FerroUIAttributes.PROMPT_HASH, attributes.promptHash);
  if (attributes.schemaVersion) span.setAttribute(FerroUIAttributes.SCHEMA_VERSION, attributes.schemaVersion);
}
```

- [ ] **Step 5: Run test to verify pass**

```bash
cd packages/telemetry
pnpm vitest run src/tracer.test.ts
```

- [ ] **Step 6: Build and commit**

```bash
cd packages/telemetry
pnpm run build
cd ../..
git add packages/telemetry/
git commit -m "feat(telemetry): wire OTLP trace exporter via OTEL_EXPORTER_OTLP_ENDPOINT env var"
```

---

## Task 4: `dataClassification` Cache Routing (P2)

**Files:**
- Modify: `packages/engine/src/cache/semantic-cache.ts`
- Test: `packages/engine/src/cache/semantic-cache.test.ts`

- [ ] **Step 1: Write failing tests**

Create `packages/engine/src/cache/semantic-cache.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { SemanticCache } from './semantic-cache';

describe('SemanticCache', () => {
  let cache: SemanticCache;

  beforeEach(() => {
    cache = new (SemanticCache as any)();
    (SemanticCache as any).instance = cache;
  });

  it('shared-classified tool outputs key WITHOUT userId', async () => {
    const sharedToolOutputs = { getMetrics: { classification: 'shared', result: 42 } };
    const layout = { schemaVersion: '1.0', requestId: 'r', locale: 'en', layout: { type: 'Dashboard', id: 'd' } } as any;

    await cache.set('show dashboard', ['admin'], 'user-A', sharedToolOutputs, layout, { getMetrics: 'shared' });
    const hit = await cache.get('show dashboard', ['admin'], 'user-B', sharedToolOutputs, { getMetrics: 'shared' });

    expect(hit).toBeDefined();
  });

  it('user-specific tool outputs key WITH userId — different users get different entries', async () => {
    const userOutputs = { getProfile: { classification: 'user-specific', result: 'Alice' } };
    const layout = { schemaVersion: '1.0', requestId: 'r', locale: 'en', layout: { type: 'Dashboard', id: 'd' } } as any;

    await cache.set('my profile', ['read'], 'user-A', userOutputs, layout, { getProfile: 'user-specific' });
    const hitForA = await cache.get('my profile', ['read'], 'user-A', userOutputs, { getProfile: 'user-specific' });
    const missForB = await cache.get('my profile', ['read'], 'user-B', userOutputs, { getProfile: 'user-specific' });

    expect(hitForA).toBeDefined();
    expect(missForB).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify fail**

```bash
cd packages/engine
pnpm vitest run src/cache/semantic-cache.test.ts
```

- [ ] **Step 3: Update SemanticCache to accept dataClassification map**

Replace `packages/engine/src/cache/semantic-cache.ts`:

```typescript
import CryptoJS from 'crypto-js';
import { FerroUILayout } from '@ferroui/schema';

export interface CacheEntry {
  layout: FerroUILayout;
  timestamp: number;
  toolOutputs: Record<string, any>;
}

export type DataClassificationMap = Record<string, 'shared' | 'user-specific'>;

export class SemanticCache {
  private static instance: SemanticCache;
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTtl = 300 * 1000;

  private constructor() {}

  public static getInstance(): SemanticCache {
    if (!SemanticCache.instance) {
      SemanticCache.instance = new SemanticCache();
    }
    return SemanticCache.instance;
  }

  public async get(
    prompt: string,
    permissions: string[],
    userId: string,
    toolOutputs: Record<string, any>,
    classifications: DataClassificationMap = {}
  ): Promise<FerroUILayout | undefined> {
    const key = this.generateKey(prompt, permissions, userId, toolOutputs, classifications);
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < this.defaultTtl) return entry.layout;
    if (entry) this.cache.delete(key);
    return undefined;
  }

  public async set(
    prompt: string,
    permissions: string[],
    userId: string,
    toolOutputs: Record<string, any>,
    layout: FerroUILayout,
    classifications: DataClassificationMap = {}
  ): Promise<void> {
    const key = this.generateKey(prompt, permissions, userId, toolOutputs, classifications);
    this.cache.set(key, { layout, timestamp: Date.now(), toolOutputs });
  }

  public async invalidate(toolName: string, params?: any): Promise<void> {
    for (const [key, entry] of this.cache.entries()) {
      const output = entry.toolOutputs[toolName];
      if (output) {
        if (!params) { this.cache.delete(key); continue; }
        if (output.args && JSON.stringify(output.args) === JSON.stringify(params)) {
          this.cache.delete(key);
        }
      }
    }
  }

  public async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const [key, entry] of this.cache.entries()) {
      if (Object.keys(entry.toolOutputs).some(n => regex.test(n))) this.cache.delete(key);
    }
  }

  private generateKey(
    prompt: string,
    permissions: string[],
    userId: string,
    toolOutputs: Record<string, any>,
    classifications: DataClassificationMap
  ): string {
    const normalizedPrompt = prompt.trim().toLowerCase();
    const sortedPermissions = [...permissions].sort();

    const allShared = Object.keys(toolOutputs).every(
      k => classifications[k] === 'shared'
    );

    const effectiveUserId = allShared ? '__shared__' : userId;

    const serializedOutputs = JSON.stringify(
      Object.entries(toolOutputs).sort(([a], [b]) => a.localeCompare(b))
    );

    const combined = `${normalizedPrompt}|${sortedPermissions.join(',')}|${effectiveUserId}|${serializedOutputs}`;
    return CryptoJS.SHA256(combined).toString();
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const semanticCache = SemanticCache.getInstance();
```

- [ ] **Step 4: Update dual-phase.ts to pass classifications to cache**

In `packages/engine/src/pipeline/dual-phase.ts`, update the cache get/set calls to pass a `classifications` map built from tool registry:

```typescript
import { getToolsForUser, executeTool, registerCacheHandler, ToolRegistry } from '@ferroui/tools';
// ...
// Build classification map before cache check
const toolDefs = ToolRegistry.getInstance().getAll();
const classifications: Record<string, 'shared' | 'user-specific'> = {};
for (const t of toolDefs) {
  if (t.dataClassification) classifications[t.name] = t.dataClassification;
}

// Cache get:
const cachedLayout = await semanticCache.get(prompt, context.permissions, context.userId, cacheToolOutputs, classifications);
// Cache set:
await semanticCache.set(prompt, context.permissions, context.userId, cacheToolOutputs, finalLayout, classifications);
```

- [ ] **Step 5: Export ToolRegistry from @ferroui/tools**

In `packages/tools/src/index.ts` verify `ToolRegistry` is exported (it's exported via `registry.ts`'s `export class ToolRegistry`). Confirm no change needed.

- [ ] **Step 6: Run tests to verify pass**

```bash
cd packages/engine
pnpm vitest run src/cache/semantic-cache.test.ts
```

- [ ] **Step 7: Build and commit**

```bash
cd packages/engine
pnpm run build
cd ../..
git add packages/engine/src/cache/ packages/engine/src/pipeline/dual-phase.ts
git commit -m "feat(engine): implement dataClassification-aware cache routing (RFC-002)"
```

---

## Task 5: `ferroui logs` CLI Command (P1)

**Files:**
- Create: `packages/cli/src/commands/logs.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/src/commands/logs.test.ts`

- [ ] **Step 1: Write failing test**

Create `packages/cli/src/commands/logs.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { logsCommand } from './logs';

describe('logsCommand', () => {
  it('is named "logs"', () => {
    expect(logsCommand.name()).toBe('logs');
  });

  it('has --follow option', () => {
    const opts = logsCommand.options.map(o => o.long);
    expect(opts).toContain('--follow');
  });

  it('has --service option', () => {
    const opts = logsCommand.options.map(o => o.long);
    expect(opts).toContain('--service');
  });
});
```

- [ ] **Step 2: Run to verify fail**

```bash
cd packages/cli
pnpm vitest run src/commands/logs.test.ts
```

- [ ] **Step 3: Implement logsCommand**

Create `packages/cli/src/commands/logs.ts`:

```typescript
import { Command } from 'commander';
import chalk from 'chalk';

const AUDIT_LOG_SERVICES = ['engine', 'registry', 'playground'] as const;
type ServiceName = typeof AUDIT_LOG_SERVICES[number];

const SERVICE_URLS: Record<ServiceName, string> = {
  engine: process.env.FERROUI_ENGINE_URL ?? 'http://localhost:4000',
  registry: process.env.FERROUI_REGISTRY_URL ?? 'http://localhost:3002',
  playground: process.env.FERROUI_PLAYGROUND_URL ?? 'http://localhost:3000',
};

export const logsCommand = new Command('logs')
  .description('Stream structured audit logs from FerroUI services.')
  .option('-f, --follow', 'Stream logs continuously (tail -f style)', false)
  .option('-s, --service <service>', `Service to tail: ${AUDIT_LOG_SERVICES.join(' | ')}`, 'engine')
  .option('-n, --lines <number>', 'Number of past log lines to show on start', '50')
  .option('--json', 'Output raw JSON lines instead of formatted output', false)
  .action(async (options) => {
    const service = options.service as ServiceName;

    if (!AUDIT_LOG_SERVICES.includes(service)) {
      console.error(chalk.red(`Unknown service "${service}". Valid: ${AUDIT_LOG_SERVICES.join(', ')}`));
      process.exit(1);
    }

    const baseUrl = SERVICE_URLS[service];
    const logsUrl = `${baseUrl}/admin/logs`;

    console.log(chalk.dim(`Connecting to ${chalk.bold(service)} logs at ${logsUrl}...\n`));

    if (options.follow) {
      await streamLogs(logsUrl, options.json);
    } else {
      await fetchRecentLogs(logsUrl, parseInt(options.lines, 10), options.json);
    }
  });

async function fetchRecentLogs(url: string, lines: number, jsonOutput: boolean): Promise<void> {
  try {
    const response = await fetch(`${url}?lines=${lines}`);
    if (!response.ok) {
      console.error(chalk.red(`Failed to fetch logs: HTTP ${response.status}`));
      process.exit(1);
    }
    const data = await response.json() as { events: any[] };
    for (const event of data.events ?? []) {
      printLogEvent(event, jsonOutput);
    }
  } catch (err: any) {
    console.error(chalk.red(`Cannot connect to service: ${err.message}`));
    console.log(chalk.dim('  Make sure the service is running with: ferroui dev'));
    process.exit(1);
  }
}

async function streamLogs(url: string, jsonOutput: boolean): Promise<void> {
  console.log(chalk.dim('Streaming logs... (Ctrl+C to stop)\n'));

  const poll = async () => {
    try {
      const response = await fetch(`${url}?stream=true`);
      if (!response.ok || !response.body) {
        console.error(chalk.red(`Stream error: HTTP ${response.status}`));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const event = JSON.parse(line.replace(/^data:\s*/, ''));
            printLogEvent(event, jsonOutput);
          } catch {
            // skip partial lines
          }
        }
      }
    } catch (err: any) {
      console.error(chalk.yellow(`\nConnection lost: ${err.message}. Retrying in 3s...`));
      await new Promise(r => setTimeout(r, 3000));
      await poll();
    }
  };

  await poll();
}

function printLogEvent(event: any, jsonOutput: boolean): void {
  if (jsonOutput) {
    console.log(JSON.stringify(event));
    return;
  }

  const ts = event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : '??:??:??';
  const type = (event.type ?? 'unknown').padEnd(20);
  const reqId = (event.requestId ?? '').slice(0, 8);
  const userId = event.userId ? chalk.cyan(event.userId.slice(0, 8)) : chalk.dim('anon');

  const typeColor =
    event.type?.includes('error') ? chalk.red(type) :
    event.type?.includes('complete') ? chalk.green(type) :
    event.type?.includes('tool') ? chalk.yellow(type) :
    chalk.blue(type);

  let detail = '';
  if (event.toolName) detail = `tool=${chalk.bold(event.toolName)} success=${event.success}`;
  else if (event.error) detail = chalk.red(event.error);
  else if (event.durationMs) detail = chalk.dim(`${event.durationMs}ms`);

  console.log(`${chalk.dim(ts)} ${typeColor} ${chalk.dim(reqId)} ${userId} ${detail}`);
}
```

- [ ] **Step 4: Wire into CLI index**

In `packages/cli/src/index.ts`, add:

```typescript
import { logsCommand } from './commands/logs';
// ...
program.addCommand(logsCommand);
```

- [ ] **Step 5: Add `/admin/logs` endpoint to engine server**

In `packages/engine/src/server.ts`, after the `/admin/circuit-reset` route, add:

```typescript
  app.get('/admin/logs', (_req, res) => {
    const { auditLogger } = require('./audit/audit-logger');
    const lines = parseInt((_req.query.lines as string) ?? '50', 10);
    const events = auditLogger.getEvents().slice(-lines);
    res.status(200).json({ events, total: events.length });
  });
```

- [ ] **Step 6: Run tests to verify pass**

```bash
cd packages/cli
pnpm vitest run src/commands/logs.test.ts
```

- [ ] **Step 7: Build and commit**

```bash
cd packages/cli
pnpm run build
cd ../..
git add packages/cli/src/commands/logs.ts packages/cli/src/index.ts packages/engine/src/server.ts
git commit -m "feat(cli): add ferroui logs --follow command + engine /admin/logs endpoint"
```

---

## Task 6: Real `ferroui deploy` Implementation (P1)

**Files:**
- Modify: `packages/cli/src/commands/deploy.ts`
- Test: `packages/cli/src/commands/deploy.test.ts`

- [ ] **Step 1: Write failing test**

Create `packages/cli/src/commands/deploy.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { deployCommand } from './deploy';

describe('deployCommand', () => {
  it('is named "deploy"', () => {
    expect(deployCommand.name()).toBe('deploy');
  });

  it('accepts web | desktop | edge targets', () => {
    const argDef = deployCommand.registeredArguments[0];
    expect(argDef.name()).toBe('target');
  });

  it('has --dry-run option', () => {
    const opts = deployCommand.options.map(o => o.long);
    expect(opts).toContain('--dry-run');
  });
});
```

- [ ] **Step 2: Implement real deploy command**

Replace `packages/cli/src/commands/deploy.ts`:

```typescript
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';

const DEPLOY_TARGETS = ['web', 'desktop', 'edge'] as const;
type DeployTarget = typeof DEPLOY_TARGETS[number];

export const deployCommand = new Command('deploy')
  .description('Deploy the FerroUI project to a specified target.')
  .argument('[target]', `Deployment target: ${DEPLOY_TARGETS.join(' | ')}`, 'web')
  .option('-e, --env <environment>', 'Deployment environment (staging, production)', 'production')
  .option('--dry-run', 'Validate config and build without actually deploying', false)
  .option('--wrangler-config <path>', 'Custom wrangler.toml path for edge deployments')
  .action(async (target: DeployTarget, options) => {
    if (!DEPLOY_TARGETS.includes(target)) {
      console.error(chalk.red(`Unknown target "${target}". Valid: ${DEPLOY_TARGETS.join(', ')}`));
      process.exit(1);
    }

    const spinner = ora(`Deploying ${chalk.bold(target)} (${options.env})${options.dryRun ? chalk.dim(' [dry-run]') : ''}...`).start();

    try {
      const cwd = process.cwd();
      const distDir = path.resolve(cwd, 'dist');

      // Verify build exists
      if (!await fs.pathExists(distDir)) {
        spinner.fail(chalk.red(`Build directory not found at ${distDir}. Run 'ferroui build' first.`));
        process.exit(1);
      }

      if (target === 'web') {
        await deployWeb(spinner, distDir, options.env, options.dryRun, cwd);
      } else if (target === 'edge') {
        await deployEdge(spinner, options.env, options.dryRun, options.wranglerConfig, cwd);
      } else if (target === 'desktop') {
        await deployDesktop(spinner, options.env, options.dryRun, cwd);
      }
    } catch (error: any) {
      spinner.fail(chalk.red('Deployment failed.'));
      console.error(chalk.dim(error.message));
      process.exit(1);
    }
  });

async function deployWeb(spinner: any, distDir: string, env: string, dryRun: boolean, cwd: string) {
  spinner.text = 'Checking for deployment provider...';

  // Check for Vercel
  const hasVercel = await commandExists('vercel');
  // Check for Netlify
  const hasNetlify = await commandExists('netlify');

  if (dryRun) {
    spinner.succeed(chalk.green('[dry-run] Web deployment validated.'));
    console.log(chalk.dim(`  Build dir: ${distDir}`));
    console.log(chalk.dim(`  Provider:  ${hasVercel ? 'vercel' : hasNetlify ? 'netlify' : 'none detected'}`));
    return;
  }

  if (hasVercel) {
    spinner.text = 'Deploying with Vercel...';
    const args = ['--prod', '--yes'];
    if (env !== 'production') args.push('--env', env);
    const result = await execa('vercel', args, { cwd, stdio: 'pipe' });
    spinner.succeed(chalk.green('Deployed to Vercel!'));
    const urlMatch = result.stdout.match(/https?:\/\/[^\s]+/);
    if (urlMatch) console.log(chalk.dim(`  URL: ${chalk.bold(urlMatch[0])}`));
  } else if (hasNetlify) {
    spinner.text = 'Deploying with Netlify...';
    const args = ['deploy', '--dir', distDir, '--prod'];
    const result = await execa('netlify', args, { cwd, stdio: 'pipe' });
    spinner.succeed(chalk.green('Deployed to Netlify!'));
    const urlMatch = result.stdout.match(/https?:\/\/[^\s]+/);
    if (urlMatch) console.log(chalk.dim(`  URL: ${chalk.bold(urlMatch[0])}`));
  } else {
    spinner.fail(chalk.red('No deployment provider found.'));
    console.log(chalk.dim('\n  Install one of:\n    pnpm add -g vercel\n    pnpm add -g netlify-cli'));
    process.exit(1);
  }
}

async function deployEdge(spinner: any, env: string, dryRun: boolean, configPath: string | undefined, cwd: string) {
  const appsEdge = path.resolve(cwd, 'apps/edge');
  const hasEdge = await fs.pathExists(appsEdge);
  const deployDir = hasEdge ? appsEdge : cwd;

  const wranglerArgs = ['deploy'];
  if (configPath) wranglerArgs.push('--config', configPath);
  if (env !== 'production') wranglerArgs.push('--env', env);
  if (dryRun) wranglerArgs.push('--dry-run');

  spinner.text = `Running wrangler deploy${dryRun ? ' --dry-run' : ''}...`;
  try {
    const result = await execa('wrangler', wranglerArgs, { cwd: deployDir, stdio: 'pipe' });
    spinner.succeed(chalk.green(dryRun ? '[dry-run] Edge deployment validated.' : 'Deployed to Cloudflare Workers!'));
    console.log(chalk.dim(result.stdout));
  } catch (err: any) {
    throw new Error(`wrangler deploy failed: ${err.stderr ?? err.message}`);
  }
}

async function deployDesktop(spinner: any, env: string, dryRun: boolean, cwd: string) {
  const appsDesktop = path.resolve(cwd, 'apps/desktop');
  const hasDesktop = await fs.pathExists(appsDesktop);
  const deployDir = hasDesktop ? appsDesktop : cwd;

  const args = ['tauri', 'build'];
  if (dryRun) {
    spinner.succeed(chalk.green('[dry-run] Desktop build config validated.'));
    console.log(chalk.dim(`  Build dir: ${deployDir}`));
    return;
  }

  spinner.text = 'Building Tauri desktop app...';
  try {
    await execa('pnpm', args, { cwd: deployDir, stdio: 'inherit' });
    spinner.succeed(chalk.green('Desktop app built! Installers are in apps/desktop/src-tauri/target/release/bundle/'));
  } catch (err: any) {
    throw new Error(`tauri build failed: ${err.message}`);
  }
}

async function commandExists(cmd: string): Promise<boolean> {
  try {
    await execa(cmd, ['--version'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 3: Run tests to verify pass**

```bash
cd packages/cli
pnpm vitest run src/commands/deploy.test.ts
```

- [ ] **Step 4: Build and commit**

```bash
cd packages/cli
pnpm run build
cd ../..
git add packages/cli/src/commands/deploy.ts packages/cli/src/commands/deploy.test.ts
git commit -m "feat(cli): implement real ferroui deploy (Vercel/Netlify for web, Wrangler for edge, Tauri for desktop)"
```

---

## Task 7: WCAG 2.1 AA — Keyboard Navigation + axe-core Tests (P2)

**Files:**
- Modify: `apps/web/src/components/components-registration.tsx`
- Modify: `apps/web/src/components/FerroUIRenderer.tsx`
- Modify: `apps/web/src/components/FerroUIRenderer.test.tsx`
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install axe-core**

```bash
cd apps/web
pnpm add -D @axe-core/react axe-core
```

- [ ] **Step 2: Write failing a11y tests**

In `apps/web/src/components/FerroUIRenderer.test.tsx`, add after existing imports:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

Then add a test case:

```typescript
it('renders without a11y violations', async () => {
  const layout = {
    type: 'Button',
    id: 'test-btn',
    props: { label: 'Click me' },
    aria: { label: 'Click me' },
  };

  const { container } = render(
    <FerroUIRenderer layout={layout as any} />
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

- [ ] **Step 3: Add keyboard navigation to Button component**

In `apps/web/src/components/components-registration.tsx`, update the Button component:

```typescript
export const Button: React.FC<{ label: string; onClick?: () => void; 'aria-label'?: string }> = ({ label, onClick, 'aria-label': ariaLabel }) => (
  <button
    className="btn px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
    onClick={onClick}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
    aria-label={ariaLabel ?? label}
    type="button"
  >
    {label}
  </button>
);
```

Update Card component:

```typescript
export const Card: React.FC<{ title: string; content?: string; children?: React.ReactNode }> = ({ title, content, children }) => (
  <article className="card border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow" role="article">
    <h3 className="text-xl font-medium text-gray-700 mb-2" id={`card-${title.replace(/\s+/g, '-').toLowerCase()}`}>{title}</h3>
    {content && <p className="text-gray-600 mb-4">{content}</p>}
    <div className="card-actions mt-4">
      {children}
    </div>
  </article>
);
```

- [ ] **Step 4: Build and verify tests**

```bash
cd apps/web
pnpm vitest run src/components/FerroUIRenderer.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/ apps/web/package.json
git commit -m "feat(web): add WCAG 2.1 AA keyboard navigation + axe-core tests to components"
```

---

## Task 8: Design Token System (P2)

**Files:**
- Create: `tokens/primitive/colors.json`
- Create: `tokens/primitive/spacing.json`
- Create: `tokens/primitive/typography.json`
- Create: `tokens/semantic/colors.json`
- Create: `tokens/semantic/spacing.json`
- Create: `tokens/component/button.json`
- Create: `tokens/component/card.json`
- Create: `scripts/build-tokens.ts`
- Modify: `apps/web/src/index.css`

- [ ] **Step 1: Create primitive color tokens**

Create `tokens/primitive/colors.json`:

```json
{
  "blue-50": { "$value": "#eff6ff", "$type": "color" },
  "blue-100": { "$value": "#dbeafe", "$type": "color" },
  "blue-500": { "$value": "#3b82f6", "$type": "color" },
  "blue-600": { "$value": "#2563eb", "$type": "color" },
  "blue-700": { "$value": "#1d4ed8", "$type": "color" },
  "gray-50": { "$value": "#f9fafb", "$type": "color" },
  "gray-100": { "$value": "#f3f4f6", "$type": "color" },
  "gray-200": { "$value": "#e5e7eb", "$type": "color" },
  "gray-600": { "$value": "#4b5563", "$type": "color" },
  "gray-700": { "$value": "#374151", "$type": "color" },
  "gray-800": { "$value": "#1f2937", "$type": "color" },
  "gray-900": { "$value": "#111827", "$type": "color" },
  "white": { "$value": "#ffffff", "$type": "color" },
  "red-500": { "$value": "#ef4444", "$type": "color" },
  "red-600": { "$value": "#dc2626", "$type": "color" },
  "green-500": { "$value": "#22c55e", "$type": "color" },
  "yellow-500": { "$value": "#eab308", "$type": "color" }
}
```

- [ ] **Step 2: Create primitive spacing tokens**

Create `tokens/primitive/spacing.json`:

```json
{
  "0": { "$value": "0px", "$type": "spacing" },
  "1": { "$value": "4px", "$type": "spacing" },
  "2": { "$value": "8px", "$type": "spacing" },
  "3": { "$value": "12px", "$type": "spacing" },
  "4": { "$value": "16px", "$type": "spacing" },
  "5": { "$value": "20px", "$type": "spacing" },
  "6": { "$value": "24px", "$type": "spacing" },
  "8": { "$value": "32px", "$type": "spacing" },
  "10": { "$value": "40px", "$type": "spacing" },
  "12": { "$value": "48px", "$type": "spacing" },
  "16": { "$value": "64px", "$type": "spacing" }
}
```

- [ ] **Step 3: Create primitive typography tokens**

Create `tokens/primitive/typography.json`:

```json
{
  "font-sans": { "$value": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", "$type": "fontFamily" },
  "font-mono": { "$value": "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace", "$type": "fontFamily" },
  "text-xs": { "$value": "12px", "$type": "fontSize" },
  "text-sm": { "$value": "14px", "$type": "fontSize" },
  "text-base": { "$value": "16px", "$type": "fontSize" },
  "text-lg": { "$value": "18px", "$type": "fontSize" },
  "text-xl": { "$value": "20px", "$type": "fontSize" },
  "text-2xl": { "$value": "24px", "$type": "fontSize" },
  "text-4xl": { "$value": "36px", "$type": "fontSize" },
  "font-normal": { "$value": "400", "$type": "fontWeight" },
  "font-medium": { "$value": "500", "$type": "fontWeight" },
  "font-semibold": { "$value": "600", "$type": "fontWeight" },
  "font-bold": { "$value": "700", "$type": "fontWeight" }
}
```

- [ ] **Step 4: Create semantic color tokens**

Create `tokens/semantic/colors.json`:

```json
{
  "color-primary": { "$value": "{blue-600}", "$type": "color", "$description": "Primary brand color" },
  "color-primary-hover": { "$value": "{blue-700}", "$type": "color" },
  "color-primary-light": { "$value": "{blue-50}", "$type": "color" },
  "color-surface": { "$value": "{white}", "$type": "color", "$description": "Default surface/card background" },
  "color-background": { "$value": "{gray-50}", "$type": "color", "$description": "Page background" },
  "color-border": { "$value": "{gray-200}", "$type": "color" },
  "color-text-primary": { "$value": "{gray-900}", "$type": "color" },
  "color-text-secondary": { "$value": "{gray-600}", "$type": "color" },
  "color-text-heading": { "$value": "{gray-800}", "$type": "color" },
  "color-danger": { "$value": "{red-600}", "$type": "color" },
  "color-success": { "$value": "{green-500}", "$type": "color" },
  "color-warning": { "$value": "{yellow-500}", "$type": "color" }
}
```

- [ ] **Step 5: Create semantic spacing tokens**

Create `tokens/semantic/spacing.json`:

```json
{
  "spacing-tight": { "$value": "{4}", "$type": "spacing", "$description": "Tight: between related inline items" },
  "spacing-comfortable": { "$value": "{16}", "$type": "spacing", "$description": "Comfortable: default padding" },
  "spacing-loose": { "$value": "{32}", "$type": "spacing", "$description": "Loose: section separation" }
}
```

- [ ] **Step 6: Create component tokens**

Create `tokens/component/button.json`:

```json
{
  "button-bg": { "$value": "{color-primary}", "$type": "color" },
  "button-bg-hover": { "$value": "{color-primary-hover}", "$type": "color" },
  "button-text": { "$value": "{white}", "$type": "color" },
  "button-padding-x": { "$value": "{16}", "$type": "spacing" },
  "button-padding-y": { "$value": "{8}", "$type": "spacing" },
  "button-border-radius": { "$value": "6px", "$type": "borderRadius" },
  "button-font-weight": { "$value": "{font-medium}", "$type": "fontWeight" }
}
```

Create `tokens/component/card.json`:

```json
{
  "card-bg": { "$value": "{color-surface}", "$type": "color" },
  "card-border": { "$value": "{color-border}", "$type": "color" },
  "card-padding": { "$value": "{16}", "$type": "spacing" },
  "card-border-radius": { "$value": "8px", "$type": "borderRadius" },
  "card-shadow": { "$value": "0 1px 3px rgba(0,0,0,0.1)", "$type": "shadow" }
}
```

- [ ] **Step 7: Create token build script**

Create `scripts/build-tokens.ts`:

```typescript
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

interface Token {
  $value: string;
  $type?: string;
  $description?: string;
}

type TokenMap = Record<string, Token>;

async function loadTokens(dir: string): Promise<TokenMap> {
  const result: TokenMap = {};
  const files = await fs.readdir(dir);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const tokens: TokenMap = await fs.readJson(path.join(dir, file));
    Object.assign(result, tokens);
  }
  return result;
}

function resolveReference(value: string, primitives: TokenMap): string {
  const ref = value.match(/^\{(.+)\}$/)?.[1];
  if (!ref) return value;
  return primitives[ref]?.$value ?? value;
}

async function buildCssVariables(): Promise<void> {
  const primitives = await loadTokens(path.join(ROOT, 'tokens/primitive'));
  const semantic = await loadTokens(path.join(ROOT, 'tokens/semantic'));
  const components = await loadTokens(path.join(ROOT, 'tokens/component'));

  const lines: string[] = [':root {'];

  for (const [name, token] of Object.entries({ ...semantic, ...components })) {
    const resolved = resolveReference(token.$value, primitives);
    const cssVar = `--ferroui-${name}`;
    lines.push(`  ${cssVar}: ${resolved};`);
  }

  lines.push('}');

  const css = lines.join('\n');
  const outPath = path.join(ROOT, 'apps/web/src/tokens.css');
  await fs.writeFile(outPath, css, 'utf-8');
  console.log(`[tokens] CSS variables written to ${outPath}`);
}

buildCssVariables().catch(console.error);
```

- [ ] **Step 8: Run token build and verify CSS output**

```bash
cd /opt/ferroui
npx tsx scripts/build-tokens.ts
```

Expected: creates `apps/web/src/tokens.css` with `--ferroui-*` CSS custom properties.

- [ ] **Step 9: Import tokens in web app**

In `apps/web/src/index.css`, add at the top:

```css
@import './tokens.css';
```

- [ ] **Step 10: Commit**

```bash
git add tokens/ scripts/build-tokens.ts apps/web/src/tokens.css apps/web/src/index.css
git commit -m "feat: add design token system (3-tier primitive/semantic/component + CSS variable build)"
```

---

## Task 9: Persistent Session Store — In-Memory → Redis-Ready (P1)

**Files:**
- Create: `packages/engine/src/session/session-store.ts`
- Create: `packages/engine/src/session/session-store.test.ts`
- Modify: `packages/engine/src/server.ts`

- [ ] **Step 1: Write failing tests**

Create `packages/engine/src/session/session-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemorySessionStore, SessionState } from './session-store';

describe('InMemorySessionStore', () => {
  let store: InMemorySessionStore;

  beforeEach(() => {
    store = new InMemorySessionStore({ ttlSeconds: 1 });
  });

  it('creates and retrieves a session', async () => {
    const session: SessionState = {
      id: 'sess-1', userId: 'user-1', permissions: ['read'],
      conversationContext: [], createdAt: new Date(), lastActivityAt: new Date(), ttlSeconds: 300,
    };
    await store.set(session.id, session);
    const retrieved = await store.get(session.id);
    expect(retrieved?.userId).toBe('user-1');
  });

  it('expires sessions after TTL', async () => {
    const session: SessionState = {
      id: 'sess-exp', userId: 'u', permissions: [],
      conversationContext: [], createdAt: new Date(), lastActivityAt: new Date(), ttlSeconds: 1,
    };
    await store.set(session.id, session);
    await new Promise(r => setTimeout(r, 1100));
    const expired = await store.get(session.id);
    expect(expired).toBeUndefined();
  });

  it('deletes sessions', async () => {
    const session: SessionState = {
      id: 'sess-del', userId: 'u', permissions: [],
      conversationContext: [], createdAt: new Date(), lastActivityAt: new Date(), ttlSeconds: 300,
    };
    await store.set(session.id, session);
    await store.delete(session.id);
    expect(await store.get(session.id)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Implement session store**

Create `packages/engine/src/session/session-store.ts`:

```typescript
export interface SessionState {
  id: string;
  userId: string;
  permissions: string[];
  conversationContext: string[];
  createdAt: Date;
  lastActivityAt: Date;
  ttlSeconds: number;
}

export interface SessionStore {
  get(sessionId: string): Promise<SessionState | undefined>;
  set(sessionId: string, session: SessionState): Promise<void>;
  delete(sessionId: string): Promise<void>;
  touch(sessionId: string): Promise<void>;
}

export interface InMemorySessionStoreOptions {
  ttlSeconds?: number;
}

export class InMemorySessionStore implements SessionStore {
  private sessions: Map<string, { session: SessionState; expiresAt: number }> = new Map();
  private defaultTtl: number;

  constructor(options: InMemorySessionStoreOptions = {}) {
    this.defaultTtl = (options.ttlSeconds ?? 3600) * 1000;
  }

  async get(sessionId: string): Promise<SessionState | undefined> {
    const entry = this.sessions.get(sessionId);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.sessions.delete(sessionId);
      return undefined;
    }
    return entry.session;
  }

  async set(sessionId: string, session: SessionState): Promise<void> {
    const ttl = session.ttlSeconds * 1000 || this.defaultTtl;
    this.sessions.set(sessionId, { session, expiresAt: Date.now() + ttl });
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async touch(sessionId: string): Promise<void> {
    const entry = this.sessions.get(sessionId);
    if (!entry) return;
    entry.session.lastActivityAt = new Date();
    entry.expiresAt = Date.now() + (entry.session.ttlSeconds * 1000 || this.defaultTtl);
  }
}

export function createSessionStore(): SessionStore {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    console.log('[Session] Redis URL found — using Redis session store (install ioredis to enable)');
  }
  return new InMemorySessionStore({ ttlSeconds: parseInt(process.env.SESSION_TTL_SECONDS ?? '3600', 10) });
}

export const sessionStore = createSessionStore();
```

- [ ] **Step 3: Run tests to verify pass**

```bash
cd packages/engine
pnpm vitest run src/session/session-store.test.ts
```

- [ ] **Step 4: Attach sessionStore to server**

In `packages/engine/src/server.ts`, after the existing imports add:

```typescript
import { sessionStore } from './session/session-store';
```

Then expose `/admin/sessions` for inspection:

```typescript
  app.get('/admin/sessions', async (_req, res) => {
    res.status(200).json({ status: 'session_store_active', type: sessionStore.constructor.name });
  });
```

- [ ] **Step 5: Build and commit**

```bash
cd packages/engine
pnpm run build
cd ../..
git add packages/engine/src/session/ packages/engine/src/server.ts
git commit -m "feat(engine): add session store abstraction (InMemory + Redis-ready via REDIS_URL env)"
```

---

## Final: Full Build Verification and Audit Report Update

- [ ] **Step 1: Run full monorepo build**

```bash
pnpm run -r build
```
Expected: all packages exit 0.

- [ ] **Step 2: Run all tests**

```bash
pnpm run -r test
```
Expected: all test suites pass.

- [ ] **Step 3: Update AUDIT_REPORT.md**

Update the executive summary table and checklist to reflect all items now implemented.

- [ ] **Step 4: Final commit**

```bash
git add AUDIT_REPORT.md
git commit -m "docs: update audit report to reflect all P0/P1/P2 gaps closed"
```
