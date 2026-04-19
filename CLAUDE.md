# FerroUI Project Instructions

## Tech Stack
- **Monorepo**: pnpm Workspaces + Turbo
- **Frontend**: React 19, Vite 8, Tailwind CSS 4, Framer Motion
- **Backend**: Express 5 (Node.js >= 25), Anthropic/OpenAI/Google AI SDKs
- **Desktop**: Tauri (Rust + React)
- **Edge**: Hono / Cloudflare Workers
- **Persistence**: Redis (Cache/Session/Rate-Limit), SQLite (Local Engine)
- **Validation**: Zod (packages/schema)

## Code Style
- **Naming**: kebab-case for directories/files, PascalCase for React components.
- **Typing**: Strict TypeScript; no `any` without explicit justification.
- **Patterns**: Functional components with hooks; SSE-based streaming for layout.
- **Error Handling**: Standardized EngineChunk error responses; circuit-breaker pattern in server.ts.

## Testing
- **Unit Tests**: `pnpm test` (Vitest)
- **Integration**: `pnpm run test:integration`
- **E2E**: `pnpm run playwright`
- **A11y**: `pnpm run test:a11y` (vitest-axe)
- **Mutation**: `pnpm run stryker`

## Build & Run
- **Dev**: `pnpm dev`
- **Build**: `pnpm build`
- **Typecheck**: `pnpm run typecheck`
- **Lint**: `pnpm run lint`

## Project Structure
- `apps/` — Platform-specific clients (web, desktop, edge).
- `packages/engine` — Orchestration, LLM providers, and SSE server.
- `packages/registry` — Component library and theme definitions.
- `packages/schema` — Data models and validation logic.
- `packages/renderer` — Layout rendering engine for React.
- `packages/telemetry` — OpenTelemetry and metrics configuration.
- `packages/cli` — Scaffolding and developer templates.

## Conventions
- **Commits**: Conventional Commits style (feat, fix, refactor, security).
- **Hardening**: Always verify security overrides in root `package.json`.
- **Sanitization**: All user input must be sanitized in `packages/engine/src/server.ts`.
## CI/CD Guidelines
- **Workflow State**: Maintain 100% green builds. Use `gh run watch` to verify changes.
- **E2E Tests**: Webkit requires an initial `page.click('body')` and small retries for focus tests due to rendering timing in CI.
- **Accessibility**: AXE scans in CI filter for `critical` violations to ignore flaky serious contrast variations across rendering engines.
- **Releases**: All packages are currently `private: true` until the `@ferroui` npm scope is created. Authentication is handled via job-level `NODE_AUTH_TOKEN`.
- **Infrastructure**: Docker builds must use multi-stage builds and avoid `corepack` to prevent Trivy scan failures.

