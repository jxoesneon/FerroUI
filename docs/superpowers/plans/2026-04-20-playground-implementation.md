# Interactive Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Transform the stub `apps/playground/` into a working React application where users can type prompts, see streamed UI generation, and inspect the underlying JSON layout.

**Architecture:** Build a split-pane UI (Editor | Renderer). Use the `FerroUIRenderer` and a local mock engine or connect to a running local engine.

**Tech Stack:** React, Tailwind CSS, Lucide Icons, `monaco-editor`.

---

### Task 1: Scaffold Playground App

**Files:**
- Create: `apps/playground/src/App.tsx`, `main.tsx`, `index.html`
- Create: `apps/playground/vite.config.ts`

- [x] **Step 1: Set up Vite + React + Tailwind**
- [x] **Step 2: Implement Layout with Split Pane**
- [x] **Step 3: Integrate `FerroUIRenderer`**

---

### Task 2: Real-time SSE Integration

- [x] **Step 1: Implement `usePlaygroundStream` hook**
- [x] **Step 2: Connect to `localhost:4000/api/ferroui/process`**
- [x] **Step 3: Show streaming status (Phase 1, Phase 2, etc.)**

---

### Task 3: JSON Inspector & Mock Tools

- [x] **Step 1: Add Monaco Editor to show generated JSON**
- [x] **Step 2: Add "Mock Tools" panel to simulate data context**
- [x] **Step 3: Deploy to GitHub Pages alongside docs**
