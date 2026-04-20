# FerroUI: AI-powered, server-driven UI meta-framework

## Project Overview
FerroUI is an enterprise-grade meta-framework designed for building AI-native, server-driven user interfaces. It leverages a monorepo architecture to provide a seamless development experience across web, desktop, and edge platforms.

## Core Commands
- **Install Dependencies**: `pnpm install`
- **Build All**: `pnpm run build`
- **Development Mode**: `pnpm run dev`
- **Run Tests**: `pnpm run test`
- **Integration Tests**: `pnpm run test:integration`
- **Lint Code**: `pnpm run lint`
- **Type Check**: `pnpm run typecheck`
- **Generate Docs**: `pnpm run docs:generate`
- **Storybook**: `pnpm run storybook`

## Architecture & Project Structure
- `apps/` — Deployment entry points
  - `web/`: React-based web renderer
  - `desktop/`: Tauri-based desktop shell
  - `edge/`: Cloudflare Workers edge deployment
- `packages/` — Core libraries
  - `engine/`: Orchestration and LLM provider management
  - `renderer/`: Layout rendering engine for React
  - `schema/`: Zod validation and data models
  - `registry/`: Component registry and UI primitives
  - `cli/`: Developer scaffolding and templates
  - `telemetry/`: OpenTelemetry and metrics
- `docs/` — Comprehensive documentation
- `infra/` — Infrastructure-as-Code (Terraform/Kubernetes)

## Development Conventions
- **Style**: kebab-case for files, PascalCase for React components.
- **Types**: Strict TypeScript; avoid `any`.
- **Commits**: Conventional Commits style.
- **Imports**: ESM relative imports must include the `.js` extension.
- **Sanitization**: All user input must be sanitized in `packages/engine/src/server.ts`.

## Tech Stack
- **Monorepo**: pnpm Workspaces + Turbo
- **Frontend**: React 19, Vite 8, Tailwind CSS 4, Framer Motion
- **Backend**: Express 5 (Node.js >= 25)
- **Validation**: Zod
