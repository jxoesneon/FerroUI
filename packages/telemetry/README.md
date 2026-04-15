# @ferroui/telemetry

Telemetry and observability utilities for FerroUI UI, integrating OpenTelemetry for tracing and metrics.

## Installation

```bash
pnpm add @ferroui/telemetry
```

## Usage

```typescript
import { tracer } from '@ferroui/telemetry';
const span = tracer.startSpan('operation');
```

## API Reference

- `initializeTelemetry`: Setup OTel SDK.
- `tracer`, `ferrouiMetrics`, `logger`: Core instrumentation instances.
- `withSpan`, `withLlmCall`, `withToolCall`: Instrumentation wrappers.

## Configuration

Configured via environment variables (e.g., `OTEL_EXPORTER_OTLP_ENDPOINT`).

## Examples

```typescript
await withSpan('my-task', async (span) => { ... });
```
