import { describe, it, expect } from 'vitest';
import { FerroUIConfigSchema } from './config';

describe('FerroUIConfigSchema', () => {
  it('accepts an empty object and applies no defaults (all sub-blocks optional)', () => {
    const parsed = FerroUIConfigSchema.parse({});
    expect(parsed).toEqual({});
  });

  it('applies defaults for framework when block is supplied', () => {
    const parsed = FerroUIConfigSchema.parse({ framework: {} });
    expect(parsed.framework?.schemaVersion).toBe('1.0');
    expect(parsed.framework?.defaultProvider).toBe('openai');
  });

  it('applies dev-port defaults when dev block is supplied', () => {
    const parsed = FerroUIConfigSchema.parse({ dev: {} });
    expect(parsed.dev).toEqual({
      port: 3000,
      enginePort: 3001,
      inspectorPort: 3002,
      hotReload: true,
    });
  });

  it('rejects unknown provider enum values', () => {
    const result = FerroUIConfigSchema.safeParse({
      framework: { defaultProvider: 'unknown-vendor' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-URL baseUrl in providers', () => {
    const result = FerroUIConfigSchema.safeParse({
      providers: { myvendor: { baseUrl: 'not a url' } },
    });
    expect(result.success).toBe(false);
  });

  it('clamps maxRepairAttempts to the declared range via validation', () => {
    const result = FerroUIConfigSchema.safeParse({
      validation: { maxRepairAttempts: 100 },
    });
    expect(result.success).toBe(false);
  });

  it('accepts full valid config', () => {
    const parsed = FerroUIConfigSchema.parse({
      framework: { schemaVersion: '1.2', defaultProvider: 'anthropic' },
      dev: { port: 4000, enginePort: 4001, inspectorPort: 4002, hotReload: false },
      providers: {
        anthropic: { apiKey: 'sk-test', model: 'claude-3-5-sonnet', baseUrl: 'https://api.anthropic.com' },
      },
      registry: { paths: ['./custom'], exclude: ['**/*.story.tsx'] },
      tools: { paths: ['./tools'], timeout: 10000 },
      validation: { strict: false, maxRepairAttempts: 5 },
      telemetry: { enabled: true, exporter: 'otlp', jaegerUrl: 'https://jaeger.example.com' },
    });
    expect(parsed.framework?.defaultProvider).toBe('anthropic');
    expect(parsed.tools?.timeout).toBe(10000);
    expect(parsed.telemetry?.exporter).toBe('otlp');
  });
});
