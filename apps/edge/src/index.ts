import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type Env = {
  GEMINI_API_KEY: string;
  FERROUI_ENGINE_URL?: string;
  FERROUI_DEBUG?: string;
};

const app = new Hono<{ Bindings: Env }>();

const DEBUG_FLAGS = {
  API_KEY: true,
  MODEL_INIT: true,
  REQUEST_PROCESSING: true,
} as const;

type DebugFlag = keyof typeof DEBUG_FLAGS;

const makeLogger = (debugEnabled: boolean) =>
  (flag: DebugFlag, message: string, data?: unknown) => {
    if (debugEnabled) {
      console.log(`[DEBUG:${flag}] ${message}`, data ?? '');
    }
  };

async function synthesizeLayout(
  prompt: string,
  apiKey: string,
  logger: ReturnType<typeof makeLogger>,
) {
  logger('API_KEY', 'Validating API Key presence', apiKey ? 'set' : 'missing');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  logger('MODEL_INIT', 'Initializing model');
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const systemInstruction = `You are a UI synthesizer for FerroUI. Generate a JSON response that conforms to the FerroUILayout schema. 
Return ONLY valid JSON. No markdown.
The schema consists of a type "Dashboard" with children components: [ProfileHeader, KPIBoard, ActivityFeed, ActionButton, TicketCard, DataTable, SearchBar, FormField].
Dynamically select components and generate relevant data based on the user prompt: "${prompt}".`;

  try {
    const result = await model.generateContent(systemInstruction);
    logger('REQUEST_PROCESSING', 'Layout generated successfully');
    const response = await result.response;
    const text = response.text().trim();
    // Clean JSON: remove potential markdown wrappers if the AI ignored instructions
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    return JSON.parse(cleanJson);
  } catch (error) {
    logger('REQUEST_PROCESSING', 'Error during synthesis', error);
    throw error;
  }
}

app.post('/api/layout', async (c) => {
  const { requestId, prompt } = await c.req.json();
  const apiKey = c.env.GEMINI_API_KEY;
  const logger = makeLogger(c.env.FERROUI_DEBUG === 'true');

  if (!apiKey) {
    logger('API_KEY', 'Error: API Key missing');
    return c.json({ error: 'API Key missing' }, 500);
  }

  try {
    const fullLayout = await synthesizeLayout(prompt || 'Show standard diagnostic dashboard', apiKey, logger);
    fullLayout.requestId = requestId || crypto.randomUUID();
    const jsonString = JSON.stringify(fullLayout);
    
    return streamSSE(c, async (stream) => {
      const chunk1 = jsonString.slice(0, Math.floor(jsonString.length / 3));
      const chunk2 = jsonString.slice(Math.floor(jsonString.length / 3), Math.floor(jsonString.length * 2 / 3));
      const chunk3 = jsonString.slice(Math.floor(jsonString.length * 2 / 3));

      await stream.writeSSE({ data: chunk1 });
      await stream.sleep(400);
      await stream.writeSSE({ data: chunk2 });
      await stream.sleep(400);
      await stream.writeSSE({ data: chunk3 });
      await stream.writeSSE({ data: '[DONE]' });
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger('REQUEST_PROCESSING', 'Unhandled route exception', message);
    return c.json({ error: 'Synthesis failed', details: message }, 500);
  }
});

app.get('/api/stream', (c) => {
  return streamSSE(c, async (stream) => {
    let id = 0;
    while (true) {
      await stream.writeSSE({
        data: JSON.stringify({ message: `Log entry ${id}`, timestamp: new Date().toISOString() }),
        event: 'log',
        id: String(id++),
      });
      await stream.sleep(1000);
    }
  });
});

app.post('/api/tools/call', async (c) => {
  try {
    const body = await c.req.json() as { tool: string; args: Record<string, unknown> };
    const { tool, args } = body;
    const engineUrl = c.env.FERROUI_ENGINE_URL ?? 'http://localhost:4000';

    const response = await fetch(`${engineUrl}/api/tools/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, args }),
    });

    if (!response.ok) {
      return c.json({ success: false, error: `Engine responded ${response.status}` }, 502);
    }

    const result = await response.json();
    return c.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ success: false, error: message }, 400);
  }
});

export default app;