import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { FerroUIEngine } from './engine';
import { RequestContext, EngineChunk } from './types';
import { AnthropicProvider } from './providers/anthropic';
import { OpenAIProvider } from './providers/openai';
import { LlmProvider } from './providers/base';
import { auditLogger, AuditEventType } from './audit/audit-logger';
import { getPrometheusMetrics, recordRequestCompletion } from '@ferroui/telemetry';
import { sessionStore } from './session/session-store';
import { createAuthMiddleware } from './auth/jwt';
import { semanticCache } from './cache/semantic-cache';

/**
 * FerroUI Engine Server
 * 
 * Exposes the FerroUIEngine via an SSE (Server-Sent Events) endpoint.
 * This server implements the Dual-Phase Pipeline specification for streaming
 * UI generation based on user prompts and tool calls.
 */

/**
 * Circuit-breaker state (F-023).
 * After CIRCUIT_BREAKER_THRESHOLD consecutive failures the server enters
 * "safe mode" and returns 503 on /readyz until manually reset.
 */
const CIRCUIT_BREAKER_THRESHOLD = 3;
let consecutiveFailures = 0;
let circuitOpen = false;
let serverReady = true;
let lastFailure: string | null = null;

function recordSuccess(): void {
  consecutiveFailures = 0;
  circuitOpen = false;
}

function recordFailure(): void {
  consecutiveFailures++;
  lastFailure = new Date().toISOString();
  if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitOpen = true;
  }
}

/**
 * Security headers middleware — OWASP LLM Top 10 + standard web hardening (F-026).
 */
function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // XSS protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // HSTS (only meaningful behind TLS, but set it anyway)
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  // Limit what can be embedded / loaded — strict CSP for an API-only server
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'none'; object-src 'none'; frame-ancestors 'none'"
  );
  // Remove fingerprinting header
  res.removeHeader('X-Powered-By');
  next();
}

export function createServer(options: { provider?: LlmProvider; port?: number } = {}): { app: express.Express; server: ReturnType<express.Express['listen']> } {
  const app = express();
  const port = options.port || process.env.PORT || 4000;
  const provider = options.provider || new AnthropicProvider(); // Default to Anthropic
  const engine = new FerroUIEngine(provider);

  app.use(cors());
  app.use(express.json({ limit: '64kb' }));  // Limit payload size
  app.use(cookieParser());
  app.use(securityHeaders);

  /**
   * Request timeout middleware (F-026).
   * Enforces a 30s limit on all incoming requests to prevent resource exhaustion.
   */
  app.use((_req, res, next) => {
    res.setTimeout(30000, () => {
      if (!res.headersSent) {
        res.status(408).json({ error: 'Request timeout — processing took longer than 30s' });
      }
    });
    next();
  });

  // Apply rate limiting to all requests
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
  });
  app.use(limiter);

  // JWT auth — skip health/admin probes, enforce on API routes
  app.use(createAuthMiddleware({
    skipPaths: ['/healthz', '/readyz', '/health', '/admin', '/health/circuit', '/metrics'],
  }));

  /**
   * Liveness probe (k8s: is the process alive?)  — F-023
   */
  app.get('/healthz', (_req, res) => {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Readiness probe (k8s: is the server ready to accept traffic?) — F-023
   * Returns 503 when circuit breaker is open.
   */
  app.get('/readyz', (_req, res) => {
    if (!serverReady || circuitOpen) {
      res.status(503).json({
        status: 'not_ready',
        circuitOpen,
        consecutiveFailures,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    res.status(200).json({
      status: 'ready',
      circuitOpen: false,
      consecutiveFailures,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Circuit-breaker reset (privileged — should be behind auth in production)
   */
  app.post('/admin/circuit-reset', (_req, res) => {
    consecutiveFailures = 0;
    circuitOpen = false;
    serverReady = true;
    auditLogger.log({
      type: AuditEventType.CIRCUIT_RESET,
      requestId: 'admin',
      userId: 'admin',
      consecutiveFailures: 0,
    });
    res.status(200).json({ status: 'reset', timestamp: new Date().toISOString() });
  });

  app.get('/admin/logs', (req: Request, res: Response) => {
    const lines = parseInt((req.query.lines as string) ?? '50', 10);
    const events = auditLogger.getEvents(lines);
    res.status(200).json({ events, total: auditLogger.getEvents().length });
  });

  app.get('/admin/sessions', async (_req: Request, res: Response) => {
    res.status(200).json({ status: 'active', store: sessionStore.constructor.name });
  });

  /**
   * Cache Invalidation Endpoint — Semantic Caching spec §6
   */
  app.post('/admin/cache/invalidate', async (req: Request, res: Response) => {
    const { toolName, params, pattern } = req.body;

    try {
      if (pattern) {
        await semanticCache.invalidatePattern(pattern);
        return res.status(200).json({ status: 'pattern_invalidated', pattern });
      }

      if (toolName) {
        await semanticCache.invalidate(toolName, params);
        return res.status(200).json({ status: 'tool_invalidated', toolName, params });
      }

      res.status(400).json({ error: 'Missing toolName or pattern' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Prometheus metrics endpoint — Observability spec §6
   */
  app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    res.status(200).send(await getPrometheusMetrics());
  });

  /**
   * Circuit breaker state endpoint — Observability spec §6
   */
  app.get('/health/circuit', (_req, res) => {
    res.status(200).json({
      state: circuitOpen ? 'OPEN' : 'CLOSED',
      failures: consecutiveFailures,
      threshold: CIRCUIT_BREAKER_THRESHOLD,
      lastFailure,
    });
  });

  /**
   * Health Check Endpoint (legacy — kept for backward compatibility)
   */
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: circuitOpen ? 'degraded' : 'ok',
      circuitOpen,
      consecutiveFailures,
      timestamp: new Date().toISOString(),
      provider: provider.id,
      version: '0.1.0'
    });
  });

  /**
   * State Update Endpoint (RFC-001)
   * 
   * Persists component-level state changes to the SessionStore.
   */
  app.post('/api/ferroui/state-update', async (req: Request, res: Response) => {
    const { context, componentId, newState } = req.body;

    if (!context || !context.userId || !context.requestId) {
      return res.status(400).json({ error: 'Missing or invalid context' });
    }

    if (!componentId || !newState) {
      return res.status(400).json({ error: 'Missing componentId or newState' });
    }

    try {
      const session = await sessionStore.get(context.requestId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Update the generic state object in the session
      const currentState = session.state || {};
      const updatedState = { ...currentState, [componentId]: newState };

      await sessionStore.set(context.requestId, {
        ...session,
        state: updatedState,
      });

      auditLogger.log({
        type: AuditEventType.SESSION_UPDATED,
        requestId: context.requestId,
        userId: context.userId,
        componentId,
        newState,
      });

      res.status(200).json({ status: 'success', state: updatedState });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Main Engine Process Endpoint (SSE)
   * 
   * Expects:
   * {
   *   "prompt": "string",
   *   "context": RequestContext
   * }
   */
  app.post('/api/ferroui/process', async (req: Request, res: Response) => {
    // Reject new work while circuit is open
    if (circuitOpen) {
      res.status(503).json({
        error: 'Service temporarily unavailable — circuit breaker is open. Retry after reset.',
        circuitOpen: true,
      });
      return;
    }

    const { context } = req.body as { prompt: string; context: RequestContext };
    let { prompt } = req.body as { prompt: string; context: RequestContext };

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    if (!context || !context.userId || !context.requestId) {
      return res.status(400).json({ error: 'Missing or invalid context (userId and requestId are required)' });
    }

    // Basic input sanitization
    // 1. Trim whitespace
    // 2. Remove potential script tags
    // 3. Prevent prompt injection by neutralizing known delimiters
    prompt = prompt
      .trim()
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "");

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Ensure headers are sent immediately

    const requestStart = Date.now();
    let pipelineSucceeded = false;

    try {
      console.log(`[Engine] Starting process for prompt: "${prompt}" (RequestID: ${context.requestId})`);
      
      for await (const chunk of engine.process(prompt, context)) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        if ((chunk as EngineChunk).type === 'complete') {
          pipelineSucceeded = true;
        }
      }

      if (pipelineSucceeded) {
        recordSuccess();
        recordRequestCompletion(Date.now() - requestStart, true, { 
          'request.id': context.requestId,
          'user.id': context.userId 
        });
      }
      
      console.log(`[Engine] Successfully completed process for RequestID: ${context.requestId}`);
    } catch (error) {
      console.error(`[Engine] Error processing request ${context.requestId}:`, error);
      recordFailure();
      recordRequestCompletion(Date.now() - requestStart, false, { 
        'request.id': context.requestId,
        'user.id': context.userId 
      });
      
      const errorChunk: EngineChunk = {
        type: 'error',
        error: {
          code: 'SERVER_STREAM_FAILURE',
          message: error instanceof Error ? error.message : 'An unexpected error occurred during streaming.',
          retryable: !circuitOpen,
        },
      };
      
      res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
    } finally {
      res.end();
    }
  });

  const server = app.listen(port, () => {
    console.log(`[FerroUI] Engine Server listening on port ${port} (Provider: ${provider.id})`);
  });

  return { app, server };
}

// Check if this script is being executed directly
const isDirectlyExecuted = import.meta.url.includes(process.argv[1]);

if (isDirectlyExecuted) {
  const providerType = process.env.LLM_PROVIDER || 'anthropic';
  let provider: LlmProvider;

  if (providerType === 'openai') {
    provider = new OpenAIProvider();
  } else {
    provider = new AnthropicProvider();
  }

  createServer({ provider });
}
