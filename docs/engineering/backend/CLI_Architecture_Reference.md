# CLI Architecture & Reference

**Version:** 1.0  
**Package:** `@ferroui/cli`  
**Location:** `packages/cli/`

---

## 1. Overview

The FerroUI CLI is the primary developer interface for scaffolding, developing, and evaluating FerroUI UI projects. It provides a suite of commands to streamline the component-driven development lifecycle and ensure prompt parity with the engine.

---

## 2. Command Reference

### 2.1 `ferroui create`
Scaffolds a new FerroUI project with the standard monorepo structure.
- **Usage:** `ferroui create <project-name>`
- **Features:** Templates for Web, Desktop (Tauri), and Edge (Cloudflare).

### 2.2 `ferroui dev`
Starts the local development environment, including the orchestration engine and the client renderer.
- **Usage:** `ferroui dev`
- **Flags:** `--engine-only`, `--renderer-only`.

### 2.3 `ferroui generate`
Generates boilerplate for components or tools.
- **Usage:** `ferroui generate <type> <name>`
- **Types:** `component`, `tool`, `prompt`.

### 2.4 `ferroui eval`
Runs the prompt evaluation suite to measure LLM output quality against the rubric.
- **Usage:** `ferroui eval`
- **Flags:** `--prompt-version`, `--provider`, `--ci`.

### 2.5 `ferroui doctor`
Performs a system check to ensure all dependencies and configurations are correct.
- **Usage:** `ferroui doctor`

---

## 3. Configuration

The CLI looks for an `ferroui.config.json` file in the project root to resolve paths and engine settings.

```json
{
  "engine": {
    "url": "http://localhost:3001",
    "provider": "openai"
  },
  "paths": {
    "prompts": "ferroui/prompts",
    "evals": "ferroui/evals",
    "registry": "packages/registry"
  }
}
```

---

## 4. Internal Architecture

The CLI is built using **Commander.js** and uses **Inquirer.js** for interactive prompts. 
- **Commands:** Located in `src/commands/`.
- **Templates:** Handlebars-based templates in `src/templates/`.
- **Core Logic:** Centralized in `src/index.ts`.
