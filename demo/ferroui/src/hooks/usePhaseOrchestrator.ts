import { useState, useCallback, useRef } from 'react';
import { createParser } from 'eventsource-parser';
import type { Phase, MetricData, ProxyConnection } from '../types';

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL ?? 'http://localhost:4000';

export interface EngineData {
  metrics: MetricData[];
  connections: ProxyConnection[];
  timeSeries: number[];
}

const FALLBACK_DATA: EngineData = {
  metrics: [
    { label: 'CPU Load',      value: '73.2', trend: '2.1%',  trendDirection: 'up'   },
    { label: 'Memory Usage',  value: '12.4', trend: 'Stable', trendDirection: 'stable' },
    { label: 'Network I/O',   value: '842',  trend: '5.3%',  trendDirection: 'down' },
  ],
  connections: [
    { id: 'PXY-001', origin: 'us-east-1',    destination: 'eu-west-2',  latency: '42ms',  status: 'Online',   uptime: '99.97%' },
    { id: 'PXY-002', origin: 'ap-south-1',   destination: 'us-west-1',  latency: '187ms', status: 'Degraded', uptime: '98.12%' },
    { id: 'PXY-003', origin: 'eu-central-1', destination: 'ap-east-1',  latency: '91ms',  status: 'Online',   uptime: '99.84%' },
    { id: 'PXY-004', origin: 'us-west-2',    destination: 'sa-east-1',  latency: '203ms', status: 'Offline',  uptime: '0%'     },
    { id: 'PXY-005', origin: 'eu-north-1',   destination: 'us-east-2',  latency: '38ms',  status: 'Online',   uptime: '99.99%' },
  ],
  timeSeries: [340, 420, 380, 510, 620, 580, 720, 690, 810, 780, 842, 800],
};

function extractEngineData(toolOutputs: Array<{ name: string; result: unknown }>): Partial<EngineData> {
  const data: Partial<EngineData> = {};

  for (const output of toolOutputs) {
    const r = output.result as Record<string, unknown>;

    if (output.name.includes('metric') || output.name.includes('kpi') || output.name.includes('cpu')) {
      if (Array.isArray(r?.metrics)) data.metrics = r.metrics as MetricData[];
      else if (Array.isArray(r?.data)) data.metrics = r.data as MetricData[];
    }

    if (output.name.includes('connection') || output.name.includes('proxy') || output.name.includes('network')) {
      if (Array.isArray(r?.connections)) data.connections = r.connections as ProxyConnection[];
      else if (Array.isArray(r?.data)) data.connections = r.data as ProxyConnection[];
    }

    if (output.name.includes('latency') || output.name.includes('timeseries') || output.name.includes('chart')) {
      if (Array.isArray(r?.series)) data.timeSeries = r.series as number[];
      else if (Array.isArray(r?.data)) data.timeSeries = r.data as number[];
    }
  }

  return data;
}

export function usePhaseOrchestrator() {
  const [phase, setPhase]               = useState<Phase>('idle');
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [engineData, setEngineData]     = useState<EngineData>(FALLBACK_DATA);
  const abortRef = useRef<AbortController | null>(null);

  const triggerExpand = useCallback(() => setPhase('expand'), []);

  const triggerInputFinished = useCallback(async (prompt: string) => {
    setCurrentPrompt(prompt);
    setPhase('loading');

    // Abort any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const toolOutputs: Array<{ name: string; result: unknown }> = [];

    try {
      const response = await fetch(`${ENGINE_URL}/api/ferroui/process`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({
          prompt,
          context: {
            userId:    'demo-user',
            requestId: crypto.randomUUID(),
            locale:    'en',
            permissions: [],
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Engine returned ${response.status}`);
      }

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();

      const parser = createParser({
        onEvent(event) {
          if (!event.data || event.data === '[DONE]') return;
          try {
            const chunk = JSON.parse(event.data) as {
              type: string;
              toolOutput?: { name: string; result: unknown };
            };

            if (chunk.type === 'tool_output' && chunk.toolOutput) {
              toolOutputs.push(chunk.toolOutput);
            }

            if (chunk.type === 'complete' || chunk.type === 'error') {
              const extracted = extractEngineData(toolOutputs);
              setEngineData(prev => ({ ...FALLBACK_DATA, ...prev, ...extracted }));
              setPhase('synthesis');
              setTimeout(() => setPhase('complete'), 500);
            }
          } catch {
            // ignore malformed chunk
          }
        },
      });

      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) parser.feed(decoder.decode(value, { stream: true }));
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      // Engine unreachable — fall through to fallback data so demo still works
      console.warn('[FerroUI demo] Engine unavailable, using fallback data:', err instanceof Error ? err.message : err);
      setPhase('synthesis');
      setTimeout(() => setPhase('complete'), 500);
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setPhase('idle');
  }, []);

  return { phase, currentPrompt, engineData, setPhase, triggerExpand, triggerInputFinished, reset };
}
