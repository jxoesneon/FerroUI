# Prompt Versioning CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement the `ferroui prompt` command group to allow developers to list, diff, and rollback system prompts without redeploying the engine.

**Architecture:** Use the existing `PromptLoader` in the engine. Add CLI commands that interact with the local prompt file system and potentially a `PromptRegistry` in the shared config.

**Tech Stack:** TypeScript, Commander.js, Chalk.

---

### Task 1: Create `prompt` command group

**Files:**
- Create: `packages/cli/src/commands/prompt.ts`
- Modify: `packages/cli/src/index.ts`

- [x] **Step 1: Implement `list` subcommand**

```typescript
export const promptCommand = new Command('prompt')
  .description('Manage system prompt versions.');

promptCommand.command('list')
  .description('List available prompt versions.')
  .action(async () => {
    // Read packages/engine/prompts/ versions
  });
```

- [x] **Step 2: Implement `diff` subcommand**
- [x] **Step 3: Implement `rollback` subcommand**

---

### Task 2: Prompt Rollback Logic in Engine

**Files:**
- Modify: `packages/engine/src/prompts/loader.ts`

- [x] **Step 1: Implement `setVersion` in `PromptLoader`**
- [x] **Step 2: Add validation to ensure rollback version exists**
- [x] **Step 3: Update `dual-phase.ts` to use the pinned version from loader**
