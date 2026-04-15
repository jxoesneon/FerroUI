# PRD-002: CLI & Developer Experience

**Version:** 1.0  
**Status:** Approved  
**Last Updated:** 2025-04-10  
**Product Owner:** Developer Experience Team  
**Stakeholders:** Engineering, Documentation, Developer Relations  

---

## 1. Overview

The `ferroui` CLI is the primary interface for FerroUI UI development. This PRD defines the CLI commands, developer workflows, and experience goals that make FerroUI UI the most developer-friendly AI framework.

---

## 2. Design Principles

1. **Zero to Layout in 10 Minutes** — New developers see their first AI-generated layout within 10 minutes of installation
2. **Convention over Configuration** — Sensible defaults that work out of the box
3. **Progressive Disclosure** — Simple for beginners, powerful for experts
4. **Fail Fast, Helpfully** — Clear error messages with suggested fixes
5. **Batteries Included** — Everything needed to start in one package

---

## 3. CLI Command Reference

### 3.1 Project Commands

#### `ferroui create <project-name>`

Create a new FerroUI UI project with all dependencies.

```bash
$ ferroui create my-dashboard
? Select template: (Use arrow keys)
❯ Default (React + TypeScript + Node.js)
  Minimal (Core only)
  Full (With examples and documentation)
? Package manager: (Use arrow keys)
❯ pnpm
  npm
  yarn

Creating project...
✔ Installed dependencies
✔ Initialized git repository
✔ Created example components
✔ Generated README.md

Next steps:
  cd my-dashboard
  ferroui dev
```

**Acceptance Criteria:**
- Project creation completes in < 60 seconds
- All dependencies install without errors
- Example components render in playground
- README includes quickstart instructions

#### `ferroui dev`

Start the development environment.

```bash
$ ferroui dev
✔ Started orchestration engine (port: 3001)
✔ Started registry inspector (port: 3002)
✔ Started layout playground (port: 3000)
✔ Connected to local Ollama provider
✔ OpenTelemetry exporter (Jaeger: http://localhost:16686)

Ready! Open http://localhost:3000 to start building.

Watching for changes...
[components] src/components/DataCard.tsx changed, reloading...
[tools] src/tools/getMetrics.ts changed, reloading...
```

**Acceptance Criteria:**
- All services start in < 30 seconds
- Hot reload completes in < 2 seconds
- Playground accessible at localhost:3000
- Changes trigger automatic reload

### 3.2 Code Generation Commands

#### `ferroui generate component <name>`

Generate a new component with all boilerplate.

```bash
$ ferroui generate component MetricCard
? Component tier: (Use arrow keys)
❯ Atom (irreducible primitive)
  Molecule (composition)
  Organism (functional block)
? Include Storybook stories? (Y/n) Y
? Include accessibility tests? (Y/n) Y

Generated files:
  src/components/MetricCard/
    ├── index.tsx           # Component implementation
    ├── schema.ts           # Zod schema
    ├── types.ts            # TypeScript types
    ├── MetricCard.stories.tsx
    ├── MetricCard.test.tsx
    └── README.md
```

**Acceptance Criteria:**
- Component compiles without errors
- Storybook story renders correctly
- A11y tests pass (axe-core)
- Schema validates correctly

#### `ferroui generate tool <name>`

Generate a new data tool.

```bash
$ ferroui generate tool getUserMetrics
? Tool category: (Use arrow keys)
❯ Data fetch
  Computation
  External API
? Include mock implementation? (Y/n) Y

Generated files:
  src/tools/getUserMetrics/
    ├── index.ts            # Tool implementation
    ├── schema.ts           # Zod schema for params/returns
    ├── mock.ts             # Mock implementation
    ├── test.ts             # Unit tests
    └── README.md
```

**Acceptance Criteria:**
- Tool registers successfully
- Mock implementation works without database
- Unit tests pass
- Schema generates correct JSON Schema

### 3.3 Development Commands

#### `ferroui registry inspect`

Open the registry inspector in browser.

```bash
$ ferroui registry inspect
✔ Started registry inspector at http://localhost:3002

Components: 24
  Atoms: 8
  Molecules: 10
  Organisms: 6

Tools: 12
```

**Registry Inspector Features:**
- Visual tree of all registered components
- Prop schema viewer with types
- Live preview with auto-generated fixtures
- Search and filter
- Export component documentation

#### `ferroui eval`

Run the prompt evaluation suite.

```bash
$ ferroui eval
Running evaluation suite (v1.2.3) against gpt-4...

Prompt: "Show me user analytics"
  ✔ Schema validity
  ✔ No hallucinations
  ✔ Data accuracy
  ✔ Latency: 1.2s

Prompt: "Create a sales dashboard"
  ✔ Schema validity
  ✔ No hallucinations
  ✔ Data accuracy
  ⚠ Latency: 3.5s (threshold: 3s)

Results: 47/48 passed (97.9%)
Report: ./ferroui/evals/report-2025-04-10.html
```

**Acceptance Criteria:**
- Evaluates all prompts in suite
- Generates HTML report
- Fails CI if pass rate < 95%
- Tracks latency percentiles

### 3.4 Build & Deploy Commands

#### `ferroui build`

Build the project for production.

```bash
$ ferroui build
✔ Type checking passed
✔ Linting passed
✔ Tests passed (142 tests)
✔ Built component registry
✔ Built orchestration engine
✔ Generated deployment artifacts

Output:
  dist/
    ├── web/              # Static web build
    ├── server/           # Server bundle
    └── edge/             # Edge worker bundle
```

#### `ferroui deploy`

Deploy to configured target.

```bash
$ ferroui deploy
? Deployment target: (Use arrow keys)
❯ Vercel
  Netlify
  AWS
  Cloudflare Workers
  Docker

Deploying to Vercel...
✔ Built project
✔ Uploaded artifacts
✔ Deployed to https://my-dashboard-abc123.vercel.app
```

### 3.5 Utility Commands

#### `ferroui doctor`

Diagnose common issues.

```bash
$ ferroui doctor
Checking FerroUI UI installation...

✔ Node.js version (20.11.0)
✔ pnpm version (8.15.0)
✔ Git repository initialized
✔ TypeScript configuration valid
✔ ESLint configuration valid
⚠ Ollama not detected (optional for local LLM)
✖ Missing environment variable: FERROUI_API_KEY

Fix: Create .env.local file with FERROUI_API_KEY=your_key
```

#### `ferroui update`

Update FerroUI UI to latest version.

```bash
$ ferroui update
Current version: 1.2.3
Latest version: 1.3.0

Changelog:
  - New: Support for Google Gemini provider
  - Fix: Reduced memory usage in streaming
  - Improvement: 20% faster validation

? Update now? (Y/n) Y
✔ Updated packages
✔ Migrated configuration
✔ Updated documentation
```

---

## 4. Developer Workflows

### 4.1 First-Time Setup

```
1. Install CLI
   npm install -g @ferroui/cli

2. Create project
   ferroui create my-app

3. Start development
   cd my-app && ferroui dev

4. Open playground
   http://localhost:3000

5. Type first prompt
   "Show me a dashboard with KPIs"

6. See AI-generated layout
   ✓ Layout rendered with mock data
```

### 4.2 Daily Development Loop

```
1. Start dev server
   ferroui dev

2. Open playground in browser
   http://localhost:3000

3. Iterate on components
   - Edit component file
   - See hot reload in playground
   - Test with various prompts

4. Add new tool
   ferroui generate tool getNewData
   - Implement tool logic
   - Test in playground

5. Run evaluation
   ferroui eval

6. Commit changes
   git commit -m "feat: add new tool"
```

### 4.3 Production Deployment

```
1. Run tests
   ferroui test

2. Build for production
   ferroui build

3. Deploy
   ferroui deploy

4. Monitor
   ferroui logs --follow
```

---

## 5. Error Handling

### 5.1 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `E001: Component not found` | Typo in component type | Check registry with `ferroui registry inspect` |
| `E002: Schema validation failed` | Invalid props passed | Review component schema |
| `E003: Tool timeout` | Tool took too long | Increase timeout or optimize tool |
| `E004: LLM rate limit` | Too many requests | Enable caching or upgrade plan |
| `E005: Hallucination detected` | AI invented component | Check system prompt version |

### 5.2 Error Message Format

```
┌─────────────────────────────────────────────────────────────┐
│  ERROR [E003]: Tool execution timeout                        │
├─────────────────────────────────────────────────────────────┤
│  Tool: getUserMetrics                                        │
│  Timeout: 3000ms                                             │
│  Elapsed: 5234ms                                             │
│                                                              │
│  Suggestions:                                                │
│  1. Increase timeout in tool config                          │
│  2. Add database index for faster queries                    │
│  3. Implement caching in tool                                │
│                                                              │
│  Documentation: https://docs.ferroui.dev/errors/E003           │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Configuration

### 6.1 ferroui.config.js

```javascript
module.exports = {
  // Framework configuration
  framework: {
    schemaVersion: '1.0',
    defaultProvider: 'openai',
  },
  
  // Development server
  dev: {
    port: 3000,
    enginePort: 3001,
    inspectorPort: 3002,
    hotReload: true,
  },
  
  // LLM providers
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4',
    },
    ollama: {
      baseUrl: 'http://localhost:11434',
      model: 'llama2',
    },
  },
  
  // Component registry
  registry: {
    paths: ['./src/components'],
    exclude: ['**/*.test.tsx'],
  },
  
  // Tool registry
  tools: {
    paths: ['./src/tools'],
    timeout: 5000,
  },
  
  // Validation
  validation: {
    strict: true,
    maxRepairAttempts: 3,
  },
  
  // Telemetry
  telemetry: {
    enabled: true,
    exporter: 'jaeger',
    jaegerUrl: 'http://localhost:14268',
  },
};
```

---

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first layout | < 10 minutes | New user telemetry |
| CLI command success rate | > 98% | Error tracking |
| Hot reload time | < 2 seconds | Performance monitoring |
| Developer satisfaction | > 4.5/5 | Quarterly survey |
| Documentation helpfulness | > 90% | In-CLI feedback |

---

## 8. Related Documents

- [CLI Usage Guide](../../dev-experience/CLI_Usage_Guide.md)
- [Quickstart & Developer Onboarding](../../dev-experience/Quickstart_Developer_Onboarding.md)
- [Core Framework PRD](./PRD-001-Core-Framework.md)

---

## 9. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | DX Team | Initial release |
