# Alloy UI System Architecture Document

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Status:** Approved  
**Owner:** Architecture Team

---

## 1. Executive Summary

Alloy UI is a production-grade, open meta-framework for building AI-driven applications where the user interface is synthesized at runtime in response to natural language intent. This document formalizes the complete architecture covering the dual-phase orchestration pipeline, atomic component model, LLM strategy layer, schema governance, security, observability, accessibility, internationalization, and developer ergonomics.

---

## 2. Architectural Principles

### 2.1 Core Design Goals

| Goal | Description |
|------|-------------|
| Developer-First Ergonomics | Registering a new component or tool requires fewer than 20 lines of code |
| Predictability Over Creativity | AI is constrained to a typed schema; hallucination surface area is minimized by design |
| Platform Agnosticism | Targets web browsers, Tauri desktop shells, and server-side rendering without code changes |
| LLM Agnosticism | Swapping between OpenAI, Anthropic, Google, or local Ollama requires a single configuration change |
| Production-Grade Reliability | Self-healing loop, circuit breakers, and fallback UIs ensure graceful degradation |
| Accessibility by Default | Every component ships with correct ARIA roles and keyboard navigation |
| Observable by Default | Every pipeline stage emits structured traces compatible with OpenTelemetry |

### 2.2 What Alloy UI Is NOT

- **Not a low-code visual editor** — There is no drag-and-drop canvas
- **Not a chatbot framework** — The LLM produces structured JSON, not prose
- **Not a design system** — Alloy UI consumes a design system through its component registry
- **Not a no-code platform** — Developers write typed components and tool functions in real code

---

## 3. Four-Layer Runtime Architecture

Alloy UI is organized into four distinct runtime layers. Each layer has a single responsibility and communicates with adjacent layers through versioned, typed contracts.

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: CLIENT RENDERER                  │
│         React / TypeScript — Dumb Rendering Engine           │
├─────────────────────────────────────────────────────────────┤
│                  LAYER 2: ORCHESTRATION ENGINE               │
│    TypeScript (Node) or Rust — Prompt Assembly, Tool Dispatch│
├─────────────────────────────────────────────────────────────┤
│                    LAYER 3: LLM STRATEGY                     │
│         Pluggable Provider Interface — Cloud or Local        │
├─────────────────────────────────────────────────────────────┤
│                  LAYER 4: DATA & TOOL LAYER                  │
│         Developer-Registered Functions — Databases, APIs     │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Layer 1 — Client Renderer

The renderer is intentionally "dumb." It knows nothing about data, users, or business logic. It receives a fully validated AlloyLayout JSON tree and paints it using the component registry.

### 4.1 Component Registry

The registry is a compile-time dictionary mapping string identifiers to React components:

```typescript
type ComponentRegistry = Record<string, React.ComponentType<AlloyComponentProps>>;
```

Registry entries are versioned. A component registered as `DataCard` and later breaking-changed becomes `DataCard@2`. The renderer resolves the correct version from the schema's `schemaVersion` field.

### 4.2 Progressive Rendering Pipeline

1. The renderer subscribes to a Server-Sent Event (SSE) stream or Tauri event channel
2. Incoming chunks are fed to a partial-JSON parser that attempts incremental tree construction
3. Each successfully parsed subtree is mounted immediately for perceived instant response
4. A React Error Boundary wraps every dynamically mounted component
5. Framer Motion's layout animation prop is baked into all Organism and Molecule wrappers

### 4.3 Action Router

The router handles four canonical action types:

| Action Type | Description | Payload |
|-------------|-------------|---------|
| NAVIGATE | Push a route into the application router | `{ path: string, params?: object }` |
| SHOW_TOAST | Display a transient notification | `{ message: string, variant: "info"\|"success"\|"warning"\|"error" }` |
| REFRESH | Re-run the current orchestration pipeline | Same original prompt |
| TOOL_CALL | Invoke a registered backend tool directly | `{ tool: string, args: object }` |

**Convention:** Direct `fetch()` calls from component code are forbidden — enforced via ESLint rule `alloy/no-direct-fetch`.

---

## 5. Layer 2 — Orchestration Engine

The orchestration engine is the heart of Alloy UI. It can be deployed as:
- TypeScript (Node.js / Bun) service
- Embedded in a Tauri Rust binary
- Edge deployment on Cloudflare Workers with Durable Objects

### 5.1 The Dual-Phase Pipeline

The pipeline enforces strict separation between data gathering and UI generation.

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   REQUEST   │───▶│ CONTEXT RESOLVE  │───▶│  PHASE 1: DATA  │
│  (User NL)  │    │ (User/Perms/Env) │    │    GATHERING    │
└─────────────┘    └──────────────────┘    └────────┬────────┘
                                                    │
                              ┌─────────────────────┘
                              ▼
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   STREAM    │◀───│ VALIDATION &     │◀───│  PHASE 2: UI    │
│  DELIVERY   │    │  SELF-HEALING    │    │   GENERATION    │
└─────────────┘    └──────────────────┘    └─────────────────┘
```

**Pipeline Stages:**

1. **REQUEST** — User submits natural language prompt with optional conversation context
2. **CONTEXT RESOLUTION** — Resolve user identity, permissions, ambient state
3. **PHASE 1: DATA GATHERING** — LLM makes tool calls; engine executes against Tool Registry
4. **LOADING SIGNAL** — Stream skeleton loading layout immediately
5. **PHASE 2: UI GENERATION** — LLM produces ONLY valid AlloyLayout JSON
6. **VALIDATION & SELF-HEALING** — Full validation suite runs; repair loop fires on failure
7. **STREAMING DELIVERY** — Validated JSON streamed chunk-by-chunk to renderer

### 5.2 Concurrency & Request Lifecycle

| Mechanism | Description |
|-----------|-------------|
| Request ID | Monotonically increasing ID per pipeline invocation |
| Optimistic Cancellation | Renderer ignores chunks with lower requestId than acknowledged |
| Circuit Breaker | After 3 consecutive unfixable errors, switches to "safe mode" |
| Tool Timeout Budget | Shared 10s budget; individual 3s timeout per tool |

### 5.3 Caching Strategy

The engine maintains a semantic cache keyed on:
```
hash(normalized_prompt + resolved_permissions + tool_output_fingerprints)
```

- Cache hits skip both LLM calls
- Per-tool TTL: volatile tools (TTL=0), reference tools (TTL=300s)
- Scoped per user session to prevent cross-contamination

---

## 6. Layer 3 — LLM Strategy Layer

### 6.1 The LlmProvider Interface

```typescript
interface LlmProvider {
  readonly id: string;
  processPrompt(req: LlmRequest): AsyncGenerator<string>;
  estimateTokens(text: string): number;
  readonly contextWindowTokens: number;
}
```

**Key Requirement:** `AsyncGenerator` return type is mandatory — all providers must stream.

### 6.2 Built-in Providers

| Provider | Target Model | Transport | Primary Use Case |
|----------|--------------|-----------|------------------|
| CloudProvider | OpenAI, Anthropic, Google Gemini | HTTPS + SSE | High reasoning quality |
| OllamaProvider | Any GGUF model via Ollama | Local HTTP | Zero data egress |
| LlamaCppProvider | llama.cpp via FFI | In-process | Lowest latency, fully offline |
| EdgeProvider | Workers AI (Cloudflare) | Edge HTTP | Globally distributed |

### 6.3 Hot-Swapping

The active provider can be changed via privileged `TOOL_CALL` action (`tool: "alloy.setProvider"`) without restarting the server. Transition is atomic: in-flight requests complete against old provider; new requests use new provider.

---

## 7. Layer 4 — Data & Tool Layer

Tools are the only mechanism through which the LLM accesses real data.

### 7.1 Tool Registration

```typescript
registerTool({
  name: "getUserProfile",
  description: "Returns full profile for a given userId.",
  parameters: z.object({ userId: z.string().uuid() }),
  returns: UserProfileSchema,
  ttl: 300,
  requiredPermissions: ["profile:read"],
  execute: async ({ userId }) => db.users.findById(userId),
});
```

### 7.2 Permission Model

Every tool declares `requiredPermissions`. The engine:
1. Resolves active user's permission set at request time
2. Builds filtered tool manifest
3. Never offers a tool the user is not authorized to invoke

This prevents prompt-injection attacks attempting data exfiltration.

---

## 8. The Alloy Component Model

Alloy UI enforces a three-tier Atomic hierarchy that is machine-validated.

### 8.1 Tier Definitions

#### Tier 1 — Atoms (Foundations)
- Irreducible, unsplittable UI primitives
- Hold design token system baked in at compile time
- AI cannot alter visual properties; only content and named variants
- **Examples:** Text, Icon, Badge, Divider, Skeleton, Avatar, Tag
- **Constraint:** Atoms may not contain other components as children
- **A11y:** Mandatory `aria` property in prop schema

#### Tier 2 — Molecules (Compositions)
- Compose two or more Atoms into reusable, named patterns
- AI orchestrates Molecules as black boxes
- **Examples:** StatBadge, UserAvatar, MetricRow, ActionButton, FormField, SearchBar
- **Constraint:** May contain Atoms and other Molecules, but not Organisms

#### Tier 3 — Organisms (Functional Blocks)
- Fully functional, data-rich UI sections
- Primary currency the AI spends when constructing layouts
- **Examples:** DataTable, KPIBoard, ActivityFeed, ProfileHeader, TicketCard, ChartPanel, FormGroup
- **Constraint:** May contain Atoms, Molecules, and other Organisms
- **Root Constraint:** Dashboard root Organism must always be top-level element

### 8.2 Nesting Enforcement Rules

| Rule | Violation Handling |
|------|-------------------|
| Block-level components MUST NOT appear as children of inline-level components | Self-healing loop fires |
| Atoms MUST NOT declare children | Structural error flagged |
| Dashboard MUST appear exactly once, as root | Invalid if multiple or nested |
| Unknown component types flagged as hallucinated | Immediate rejection |
| All required props must be present | Repair triggered, not silent fallback |

### 8.3 The AlloyLayout JSON Schema

```json
{
  "schemaVersion": "1.0",
  "requestId": "uuid",
  "locale": "en-US",
  "layout": {
    "type": "Dashboard",
    "props": { "title": "Customer Overview" },
    "children": [
      {
        "type": "ProfileHeader",
        "props": { "name": "Jane Doe", "role": "Admin" }
      },
      {
        "type": "DataTable",
        "props": { "columns": [...], "rows": [...] },
        "action": { 
          "type": "TOOL_CALL", 
          "payload": { "tool": "exportCsv", "args": {} } 
        }
      }
    ]
  }
}
```

---

## 9. Validation & Self-Healing Engine

### 9.1 Validation Pipeline

**Streaming Validation:**
- Lightweight structural check as chunks arrive
- Failed chunks buffered; complete response awaited before repair

**Final Validation:**
- Full Zod schema validation
- Hallucinated component registry check
- Nesting rules verification
- Required ARIA props confirmation
- Action payload validation

### 9.2 Self-Healing Loop

```
Validation Failure
       │
       ▼
┌──────────────┐
│ Format Repair │
│    Prompt     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  LLM Repair   │
│ (temp=0.1)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│   Validate    │────▶│  Max Attempts │
│    (Retry)    │     │   Exceeded?   │
└──────────────┘     └──────┬───────┘
                            │ Yes
                            ▼
                    ┌──────────────┐
                    │  ErrorLayout  │
                    │  (Safe Mode)  │
                    └──────────────┘
```

- MAX_REPAIR_ATTEMPTS: 3 (default, configurable)
- Repair temperature: 0.1 (reduced creative deviation)
- Fallback: Pre-built static ErrorLayout with StatusBanner

### 9.3 Hallucination Detection

| Layer | Defense Mechanism |
|-------|-------------------|
| Layer 1 | System Prompt Injection — Full list of valid component names appended |
| Layer 2 | Registry Verification — O(1) lookup for every component type |
| Layer 3 | Fuzzy Matching for Repair — Edit distance suggestions in repair prompt |

---

## 10. Deployment Models

| Model | Stack | Best For |
|-------|-------|----------|
| Web SaaS | Node.js/Bun, SSE, Cloud LLM, Redis cache | Easiest to scale |
| Desktop (Tauri) | Rust engine, Tauri events, SQLite cache | Zero network dependency |
| Edge (Cloudflare) | Workers, Durable Objects, KV cache | Global low latency |
| Hybrid | Edge Phase 1 + Cloud Phase 2, shared Redis | Best latency + quality trade-off |

### 10.1 Monorepo Structure

```
apps/
  web/           — React renderer application
  desktop/       — Tauri shell
  edge/          — Cloudflare Worker entry point
packages/
  engine/        — Core orchestration engine
  registry/      — Component registry and Atomic library
  schema/        — AlloyLayout Zod schemas
  tools/         — Tool registration helpers
  telemetry/     — OTel instrumentation
  i18n/          — Locale bundles
alloy/
  prompts/       — Versioned system prompt files
  evals/         — Automated prompt evaluation suite
```

---

## 11. Related Documents

- [Monorepo Architecture & Package Governance](./Monorepo_Architecture_Package_Governance.md)
- [Component Development Guidelines](../engineering/frontend/Component_Development_Guidelines.md)
- [Design Token & Theming Specification](../engineering/frontend/Design_Token_Theming_Specification.md)
- [Tool Registration API Reference](../engineering/backend/Tool_Registration_API_Reference.md)
- [AlloyLayout JSON Schema Specification](../engineering/backend/AlloyLayout_JSON_Schema_Specification.md)
- [Security Threat Model](../security/Security_Threat_Model.md)
- [Observability & Telemetry Dictionary](../ops/Observability_Telemetry_Dictionary.md)

---

## 12. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Architecture Team | Initial release |
