# @ferroui/engine

The core server-side engine for FerroUI, orchestrating LLM interactions and layout generation.

## Installation

```bash
pnpm add @ferroui/engine
```

## Usage

```typescript
import { FerroUIEngine } from '@ferroui/engine';
const engine = new FerroUIEngine(provider);
```

## API Reference

- `FerroUIEngine`: Main class for processing prompts.
- `runDualPhasePipeline`: Core logic for the two-phase generation process.
- `createServer`: Helper to create an Express-based engine server.

## Configuration

Configured via `EngineConfig` object.

## Examples

```typescript
for await (const chunk of engine.process("Show me a dashboard", context)) {
  console.log(chunk);
}
```
