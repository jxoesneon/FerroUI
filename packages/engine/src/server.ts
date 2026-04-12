import express, { Request, Response } from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { AlloyEngine } from './engine';
import { RequestContext, EngineChunk } from './types';
import { AnthropicProvider } from './providers/anthropic';
import { OpenAIProvider } from './providers/openai';
import { LlmProvider } from './providers/base';

/**
 * Alloy Engine Server
 * 
 * Exposes the AlloyEngine via an SSE (Server-Sent Events) endpoint.
 * This server implements the Dual-Phase Pipeline specification for streaming
 * UI generation based on user prompts and tool calls.
 */

export function createServer(options: { provider?: LlmProvider; port?: number } = {}): { app: express.Express; server: ReturnType<express.Express['listen']> } {
  const app = express();
  const port = options.port || process.env.PORT || 4000;
  const provider = options.provider || new AnthropicProvider(); // Default to Anthropic
  const engine = new AlloyEngine(provider);

  app.use(cors());
  app.use(express.json());

  // Apply rate limiting to all requests
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
  });
  app.use(limiter);

  /**
   * Health Check Endpoint
   */
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      provider: provider.id,
      version: '0.1.0'
    });
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
  app.post('/api/alloy/process', async (req: Request, res: Response) => {
    let { prompt, context } = req.body as { prompt: string; context: RequestContext };

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
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "")
      .replace(/[\{\}\[\]]/g, " "); // Neutralize JSON-like structures that might confuse the pipeline

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Ensure headers are sent immediately

    try {
      console.log(`[Engine] Starting process for prompt: "${prompt}" (RequestID: ${context.requestId})`);
      
      for await (const chunk of engine.process(prompt, context)) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      
      console.log(`[Engine] Successfully completed process for RequestID: ${context.requestId}`);
    } catch (error) {
      console.error(`[Engine] Error processing request ${context.requestId}:`, error);
      
      const errorChunk: EngineChunk = {
        type: 'error',
        error: {
          code: 'SERVER_STREAM_FAILURE',
          message: error instanceof Error ? error.message : 'An unexpected error occurred during streaming.',
          retryable: true,
        },
      };
      
      res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
    } finally {
      res.end();
    }
  });

  const server = app.listen(port, () => {
    console.log(`[Alloy] Engine Server listening on port ${port} (Provider: ${provider.id})`);
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
