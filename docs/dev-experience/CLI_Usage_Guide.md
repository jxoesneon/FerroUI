# CLI Usage Guide

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**CLI Version:** 1.0.0  

---

## 1. Installation

### Global Installation

```bash
npm install -g @alloy/cli
```

### Project-local Installation

```bash
npm install --save-dev @alloy/cli
```

### Verify Installation

```bash
alloy --version
# Output: 1.0.0
```

---

## 2. Command Reference

### 2.1 Project Commands

#### `alloy create <project-name>`

Create a new Alloy UI project.

```bash
alloy create my-app
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--template` | Project template | `default` |
| `--pm` | Package manager | `pnpm` |
| `--skip-install` | Skip dependency installation | `false` |

**Templates:**
- `default` — React + TypeScript + Node.js
- `minimal` — Core framework only
- `full` — With examples and documentation

**Example:**

```bash
alloy create my-app --template full --pm npm
```

---

#### `alloy dev`

Start the development environment.

```bash
alloy dev
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--port` | Playground port | `3000` |
| `--engine-port` | Engine port | `3001` |
| `--inspector-port` | Registry inspector port | `3002` |
| `--no-open` | Don't open browser | `false` |

**Example:**

```bash
alloy dev --port 8080 --no-open
```

**What it starts:**
- Orchestration engine (API server)
- Layout playground (web UI)
- Registry inspector (component browser)
- Hot reload watcher
- OpenTelemetry exporter (optional)

---

### 2.2 Code Generation Commands

#### `alloy generate component <name>`

Generate a new component with boilerplate.

```bash
alloy generate component UserCard
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--tier` | Atomic tier | `molecule` |
| `--stories` | Include Storybook stories | `true` |
| `--tests` | Include tests | `true` |
| `--dir` | Output directory | `src/components` |

**Tiers:**
- `atom` — Irreducible primitive
- `molecule` — Composition of atoms
- `organism` — Functional block

**Example:**

```bash
alloy generate component Button --tier atom --stories --tests
```

**Generated files:**

```
src/components/Button/
├── index.tsx
├── schema.ts
├── types.ts
├── Button.stories.tsx
├── Button.test.tsx
└── README.md
```

---

#### `alloy generate tool <name>`

Generate a new data tool.

```bash
alloy generate tool getUserData
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--category` | Tool category | `data-fetch` |
| `--mock` | Include mock implementation | `true` |
| `--dir` | Output directory | `src/tools` |

**Categories:**
- `data-fetch` — Database/API queries
- `computation` — Data processing
- `external-api` — Third-party integrations

**Example:**

```bash
alloy generate tool calculateMetrics --category computation --mock
```

---

### 2.3 Development Commands

#### `alloy registry inspect`

Open the registry inspector in browser.

```bash
alloy registry inspect
```

**Features:**
- Browse all registered components
- View prop schemas
- See live previews
- Search and filter

---

#### `alloy eval`

Run the prompt evaluation suite.

```bash
alloy eval
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--prompt-version` | Prompt version to test | `current` |
| `--provider` | LLM provider | `config default` |
| `--model` | LLM model | `provider default` |
| `--category` | Test category | `all` |
| `--format` | Output format | `console` |
| `--output` | Output file | - |

**Formats:**
- `console` — Terminal output
- `json` — JSON report
- `html` — HTML report

**Example:**

```bash
alloy eval --provider openai --model gpt-4 --format html --output report.html
```

---

### 2.4 Build & Deploy Commands

#### `alloy build`

Build the project for production.

```bash
alloy build
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--target` | Build target | `all` |
| `--analyze` | Analyze bundle size | `false` |

**Targets:**
- `web` — Static web build
- `server` — Server bundle
- `edge` — Edge worker bundle
- `all` — All targets

---

#### `alloy deploy`

Deploy to configured target.

```bash
alloy deploy
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--target` | Deployment target | `vercel` |
| `--preview` | Deploy as preview | `false` |

**Targets:**
- `vercel` — Vercel deployment
- `netlify` — Netlify deployment
- `aws` — AWS deployment
- `cloudflare` — Cloudflare Workers
- `docker` — Docker image build

---

### 2.5 Utility Commands

#### `alloy doctor`

Diagnose common issues.

```bash
alloy doctor
```

**Checks:**
- Node.js version
- Package manager version
- Git repository
- TypeScript configuration
- ESLint configuration
- Environment variables
- API key validity

---

#### `alloy update`

Update Alloy UI to latest version.

```bash
alloy update
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--check` | Check for updates only | `false` |
| `--to` | Specific version | `latest` |

---

#### `alloy logs`

View application logs.

```bash
alloy logs
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--follow` | Follow logs in real-time | `false` |
| `--since` | Show logs since time | `1h` |
| `--level` | Filter by log level | `all` |

---

## 3. Configuration

### 3.1 alloy.config.js

Create `alloy.config.js` in your project root:

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
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-opus-20240229',
    },
    ollama: {
      baseUrl: 'http://localhost:11434',
      model: 'llama2',
    },
  },
  
  // Component registry
  registry: {
    paths: ['./src/components'],
    exclude: ['**/*.test.tsx', '**/*.stories.tsx'],
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

## 4. Environment Variables

### 4.1 Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-...` |
| `GOOGLE_API_KEY` | Google API key | `...` |

### 4.2 Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ALLOY_PROMPT_VERSION` | System prompt version | `1.0` |
| `ALLOY_LOG_LEVEL` | Log level | `info` |
| `ALLOY_CACHE_ENABLED` | Enable semantic cache | `true` |
| `ALLOY_TELEMETRY_ENABLED` | Enable telemetry | `true` |

---

## 5. Tips & Tricks

### 5.1 Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
alias ad='alloy dev'
alias ab='alloy build'
alias ae='alloy eval'
alias adoc='alloy doctor'
```

### 5.2 NPM Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "dev": "alloy dev",
    "build": "alloy build",
    "eval": "alloy eval",
    "deploy": "alloy deploy"
  }
}
```

### 5.3 IDE Integration

**VS Code:**

Install the Alloy UI extension for:
- Syntax highlighting
- Auto-completion
- Inline documentation

---

## 6. Troubleshooting

### 6.1 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `EADDRINUSE` | Port already in use | Change port or kill process |
| `ENOTFOUND` | DNS resolution failed | Check internet connection |
| `ECONNREFUSED` | Service not running | Start required services |
| `UNAUTHORIZED` | Invalid API key | Check environment variables |

### 6.2 Debug Mode

```bash
DEBUG=alloy* alloy dev
```

---

## 7. Related Documents

- [Quickstart & Developer Onboarding](./Quickstart_Developer_Onboarding.md)
- [Core Framework PRD](../product/PRDs/PRD-001-Core-Framework.md)
- [System Architecture Document](../architecture/System_Architecture_Document.md)

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | DX Team | Initial release |
