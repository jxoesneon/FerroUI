# FerroUI Release Notes & Changelogs

---

## Version 1.0.0 (2025-04-10)

### 🎉 General Availability Release

We're thrilled to announce the general availability of FerroUI — the AI-powered server-driven UI meta-framework that lets you build dynamic interfaces from natural language.

### ✨ New Features

#### Core Framework
- **Dual-Phase Pipeline** — Strict separation of data gathering (Phase 1) and UI generation (Phase 2)
- **Streaming Architecture** — Progressive layout delivery via Server-Sent Events
- **Self-Healing Engine** — Automatic repair of invalid layouts with up to 3 attempts
- **Component Registry** — Typed component registration with versioning support
- **Tool Registry** — Zod-based data tool registration with automatic schema generation

#### AI & LLM
- **Multi-Provider Support** — OpenAI, Anthropic, Google Gemini, Ollama, llama.cpp
- **Provider Hot-Swap** — Change LLM provider at runtime without restart
- **Semantic Caching** — Per-session caching keyed on prompt + permissions
- **Hallucination Detection** — Multi-layer defense against invalid component names

#### Developer Experience
- **ferroui CLI** — Complete development toolkit
  - `ferroui create` — Project scaffolding
  - `ferroui dev` — Development server with hot reload
  - `ferroui generate` — Component and tool scaffolding
  - `ferroui eval` — Prompt evaluation suite
  - `ferroui registry inspect` — Browser-based component explorer
- **Layout Playground** — Test prompts and see full pipeline output
- **Registry Inspector** — Visual component explorer with live previews

#### Platform & Deployment
- **Web SaaS** — Containerized deployment with Docker and Kubernetes
- **Desktop (Tauri)** — Native desktop apps for macOS, Windows, Linux
- **Edge (Cloudflare)** — Edge deployment with <50ms cold start
- **OpenTelemetry** — Full observability with traces, metrics, and logs

#### Quality & Compliance
- **Accessibility by Default** — WCAG 2.1 AA compliant components
- **i18n & RTL** — Full internationalization with right-to-left support
- **Security Hardening** — Prompt injection prevention, rate limiting
- **Type Safety** — End-to-end TypeScript with Zod validation

### 📦 Packages

```
@ferroui/engine@1.0.0         # Core orchestration engine
@ferroui/react@1.0.0        # React renderer and hooks
@ferroui/cli@1.0.0          # Command-line interface
@ferroui/schema@1.0.0       # Zod schemas and validators
@ferroui/telemetry@1.0.0    # OpenTelemetry integration
@ferroui/i18n@1.0.0         # Internationalization utilities
```

### 🚀 Getting Started

```bash
# Create new project
npm create ferroui-app@latest my-app
cd my-app

# Start development
npm run dev

# Open http://localhost:3000
```

### 📚 Documentation

- [Quickstart Guide](../dev-experience/Quickstart_Developer_Onboarding.md)
- [System Architecture](../architecture/System_Architecture_Document.md)
- [Component Development](../engineering/frontend/Component_Development_Guidelines.md)
- [API Reference](../engineering/backend/Tool_Registration_API_Reference.md)

### ⚠️ Known Issues

1. **Large registries (>500 components)** may experience slower fuzzy matching in repair loop
2. **Streaming updates** are always full-layout replacement; partial updates planned for v1.1
3. **Shared cache** is not yet implemented; per-session cache only

### 🔒 Security

- CVE-2025-XXXX: Prompt injection via tool output (mitigated)
- All dependencies audited with `npm audit`
- Security advisory: https://github.com/ferrouiui/ferroui/security

### 🙏 Contributors

Thank you to all contributors who made this release possible:
- @alice-chen — Core orchestration engine
- @bob-smith — React renderer and streaming
- @carol-jones — CLI and developer experience
- @david-kim — AI provider integrations
- @eve-wong — Documentation and examples

---

## Version 0.9.0 (2025-03-15) — Beta Release

### Features
- Beta release with complete feature set
- Performance optimizations
- Security hardening
- Documentation complete

### Changes
- Improved streaming latency by 30%
- Added rate limiting per user
- Enhanced error messages with suggestions
- New example projects

---

## Version 0.8.0 (2025-02-28) — Beta Preview

### Features
- Desktop deployment via Tauri
- Edge deployment via Cloudflare Workers
- OpenTelemetry integration
- Health check endpoints

### Changes
- Refactored provider interface for better streaming
- Updated Zod to v3.23
- Improved validation error messages

### Bug Fixes
- Fixed memory leak in long-running sessions
- Fixed race condition in concurrent tool calls
- Fixed ARIA label validation for interactive components

---

## Version 0.7.0 (2025-02-15) — Alpha 3

### Features
- Semantic caching implementation
- Circuit breaker pattern
- Tool timeout handling
- Self-healing loop improvements

### Changes
- Changed default repair attempts from 2 to 3
- Updated system prompt format
- Improved hallucination detection

### Bug Fixes
- Fixed schema validation for nested components
- Fixed streaming parser edge cases
- Fixed hot reload in monorepo setups

---

## Version 0.6.0 (2025-02-01) — Alpha 2

### Features
- Component versioning support
- Atomic design hierarchy enforcement
- Registry inspector UI
- Layout playground

### Changes
- Renamed `ComponentLibrary` to `Registry`
- Updated FerroUILayout schema to v1.0
- Improved CLI output formatting

### Bug Fixes
- Fixed TypeScript type inference for tools
- Fixed Storybook integration
- Fixed i18n locale resolution

---

## Version 0.5.0 (2025-01-15) — Alpha 1

### Features
- Initial alpha release
- Core orchestration engine
- React renderer
- Basic CLI commands
- OpenAI provider

### Known Issues
- Limited documentation
- No caching
- No error recovery
- Single provider only

---

## Changelog Format

All notable changes to FerroUI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Types of Changes

- **Added** — New features
- **Changed** — Changes to existing functionality
- **Deprecated** — Soon-to-be removed features
- **Removed** — Removed features
- **Fixed** — Bug fixes
- **Security** — Security-related changes

---

## Upcoming Releases

### Version 1.1.0 (Target: Q2 2025)

- [ ] Partial layout updates (RFC-003)
- [ ] Shared semantic cache (RFC-002)
- [ ] Layout actions and state machines (RFC-001)
- [ ] Vector-indexed registry lookup
- [ ] Improved animation transitions

### Version 1.2.0 (Target: Q3 2025)

- [ ] Multi-modal input support (RFC-004)
- [ ] Voice input integration
- [ ] Image attachment support
- [ ] Document processing
- [ ] Enterprise SSO integration

### Version 2.0.0 (Target: 2026)

- [ ] Visual layout editor (optional)
- [ ] Advanced state machines
- [ ] Plugin ecosystem
- [ ] Marketplace for components
- [ ] Enterprise governance features

---

## Migration Guides

### Migrating from 0.x to 1.0

```bash
# Update packages
npm install @ferroui/engine@latest @ferroui/react@latest

# Run migration tool
npx @ferroui/migrate@latest

# Update configuration
# See: https://docs.ferroui.dev/migration/v1
```

### Breaking Changes in 1.0

1. `FerroUILayout.schema` renamed to `FerroUILayout.schemaVersion`
2. `registerComponent()` signature changed
3. `TOOL_CALL` action payload format updated
4. Minimum Node.js version: 18.0.0

---

## Support

- Documentation: https://docs.ferroui.dev
- GitHub Issues: https://github.com/ferrouiui/ferroui/issues
- Discord: https://discord.gg/ferrouiui
- Email: support@ferroui.dev

---

*Last updated: 2025-04-10*

