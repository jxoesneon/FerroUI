import { z } from 'zod';

/**
 * alloy.config.ts schema — mirrors PRD-002 §6.1 alloy.config.js specification.
 */
export const AlloyConfigSchema = z.object({
  framework: z.object({
    schemaVersion: z.string().default('1.0'),
    defaultProvider: z.enum(['openai', 'anthropic', 'google', 'ollama']).default('openai'),
  }).optional(),

  dev: z.object({
    port: z.number().int().default(3000),
    enginePort: z.number().int().default(3001),
    inspectorPort: z.number().int().default(3002),
    hotReload: z.boolean().default(true),
  }).optional(),

  providers: z.record(
    z.string(),
    z.object({
      apiKey: z.string().optional(),
      model: z.string().optional(),
      baseUrl: z.string().url().optional(),
    })
  ).optional(),

  registry: z.object({
    paths: z.array(z.string()).default(['./src/components']),
    exclude: z.array(z.string()).default(['**/*.test.tsx']),
  }).optional(),

  tools: z.object({
    paths: z.array(z.string()).default(['./src/tools']),
    timeout: z.number().int().default(5000),
  }).optional(),

  validation: z.object({
    strict: z.boolean().default(true),
    maxRepairAttempts: z.number().int().min(1).max(10).default(3),
  }).optional(),

  telemetry: z.object({
    enabled: z.boolean().default(false),
    exporter: z.enum(['jaeger', 'otlp', 'console']).default('console'),
    jaegerUrl: z.string().url().optional(),
  }).optional(),
});

export type AlloyConfig = z.infer<typeof AlloyConfigSchema>;
