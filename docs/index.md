---
layout: home
title: FerroUI — Server-Driven UI Meta-Framework
titleTemplate: The AI-Native UI Meta-Framework

hero:
  name: FerroUI
  text: The AI-Native UI Meta-Framework
  tagline: Generative UI orchestration, semantic caching, and atomic component registries built for production-grade LLM applications.
  image:
    src: /logo.svg
    alt: FerroUI
  actions:
    - theme: brand
      text: Get Started in 5 min
      link: /dev-experience/Quickstart_Developer_Onboarding
    - theme: alt
      text: System Architecture
      link: /architecture/System_Architecture_Document
    - theme: alt
      text: API Reference
      link: /api/
    - theme: alt
      text: GitHub ↗
      link: https://github.com/jxoesneon/FerroUI

features:
  - icon: 🧠
    title: Dual-Phase LLM Pipeline
    details: A deterministic, cache-first generator produces atomic layouts from Zod-validated registries. Partial JSON streaming means UIs render before the token stream finishes.
    link: /architecture/System_Architecture_Document
    linkText: Read the architecture →
  - icon: 🧩
    title: Atomic Component Registry
    details: Strongly-typed atoms, molecules, and organisms with enforced nesting rules. Every component is a Zod schema — the generator can only emit valid UIs.
    link: /api/components
    linkText: Browse components →
  - icon: 🔧
    title: Tool Registration API
    details: Backend tools are permission-gated, budgeted (10 calls per request), and cache-aware. Sensitive tools bypass the semantic cache automatically.
    link: /api/tools
    linkText: Explore tools →
  - icon: ⚡
    title: Semantic Caching
    details: Embedding-based cache with TTL, invalidation webhooks, and per-tool sensitivity flags. Median p95 latency stays under 200ms on warm hits.
    link: /engineering/backend/Semantic_Caching_Strategy_Invalidation
    linkText: Caching strategy →
  - icon: 🌍
    title: i18n & RTL First-Class
    details: Layouts carry a locale field. The renderer resolves translations, mirrors icons, and flips flex axes automatically for RTL scripts.
    link: /engineering/frontend/I18n_RTL_Implementation_Guide
    linkText: i18n guide →
  - icon: 🛡️
    title: Enterprise-Ready Security
    details: Prompt-injection defenses, tool permission gates, audit-trail telemetry, SOC 2 readiness, SIEM export, and SSO support out of the box.
    link: /security/Security_Threat_Model
    linkText: Threat model →
  - icon: 📡
    title: OpenTelemetry Native
    details: Every layout generation, tool call, and cache lookup emits OTel traces. Schema validation failures become first-class spans.
    link: /ops/Observability_Telemetry_Dictionary
    linkText: Telemetry dictionary →
  - icon: 🛠️
    title: Monorepo & CLI DevEx
    details: pnpm monorepo, Turbo builds, ESM-native, Node 25+, TypeScript 6, Changesets, Storybook + Chromatic, Playwright E2E, Stryker mutation tests.
    link: /dev-experience/CLI_Usage_Guide
    linkText: CLI reference →
  - icon: 📋
    title: Structured Decision Records
    details: Every architectural choice is an ADR. Every breaking change is an RFC. Every release is a Changeset.
    link: /architecture/ADRs/
    linkText: Read ADRs →
---

<div class="vp-doc" style="max-width: 1152px; margin: 4rem auto 0; padding: 0 1.5rem;">

## What FerroUI Is

FerroUI is a **server-driven UI meta-framework** for building production-grade LLM-powered applications. Large language models generate **validated `FerroUILayout` JSON** instead of raw HTML. A deterministic renderer composes atomic React components from a typed registry, so the UI surface is always a function of the schema — not a free-form LLM hallucination.

::: tip The 30-second concept
1. **You register components** with Zod schemas (`DataTable`, `KPIBoard`, `ActionButton`, …).
2. **You register tools** with permission scopes (`fetch_orders`, `create_ticket`, …).
3. **The user prompts.** The LLM emits a validated `FerroUILayout` JSON.
4. **The renderer materializes** the layout — with i18n, RTL, actions, and state machines for free.
:::

## What FerroUI Is NOT

- ❌ **Not a low-code editor.** There is no drag-and-drop surface. FerroUI is for engineers building AI-native applications.
- ❌ **Not a chatbot.** It does not ship a conversational UI. It ships the infrastructure to make *any* UI conversational.
- ❌ **Not a design system.** The component registry is extensible and theme-agnostic. Bring your own tokens.
- ❌ **Not no-code.** Every component and tool is real TypeScript with real tests.

## Ecosystem at a Glance

<div class="vp-features-grid">

| Layer | Package | Role |
|-------|---------|------|
| 🧠 Core | [`@ferroui/engine`](/api/packages/engine) | Dual-phase LLM pipeline, partial streaming, semantic cache, tool orchestration |
| 📐 Contract | [`@ferroui/schema`](/api/packages/schema) | `FerroUILayout` Zod schema, component tiers, action router |
| 🧩 Registry | [`@ferroui/registry`](/api/packages/registry) | Atom / Molecule / Organism component registry |
| 🔧 Tools | [`@ferroui/tools`](/api/packages/tools) | Tool registration, permissions, budget enforcement |
| 🌍 i18n | [`@ferroui/i18n`](/api/packages/i18n) | Locale resolution, RTL, translation provider |
| 📡 Telemetry | [`@ferroui/telemetry`](/api/packages/telemetry) | OpenTelemetry tracing, metrics, PII redaction |
| 🎨 Tokens | [`@ferroui/tokens`](/api/packages/tokens) | Design token pipeline — Style Dictionary output |
| 🎬 Renderer | [`@ferroui/renderer`](/api/packages/renderer) | React renderer — state machines, action router |
| 🛠️ CLI | [`@ferroui/cli`](/api/packages/cli) | Project scaffold, eval, dev, doctor |
| 🌐 Web App | [`apps/web`](/api/apps/web) | Reference renderer application |
| ⚙️ Edge | [`apps/edge`](/api/apps/edge) | Cloudflare Worker engine deployment |

</div>

## Popular Paths

<div class="vp-features-grid">

- **[Quickstart → 5 min](/dev-experience/Quickstart_Developer_Onboarding)** — install, scaffold, and render your first layout.
- **[System Architecture](/architecture/System_Architecture_Document)** — the dual-phase pipeline, the action router, the cache topology.
- **[Component API Reference](/api/components)** — every component schema, prop-by-prop, auto-generated from source.
- **[Tool Registration API](/api/tools)** — register tools, set permissions, enforce budgets.
- **[ADR Index](/architecture/ADRs/)** — every architectural decision and its rationale.
- **[Security Threat Model](/security/Security_Threat_Model)** — prompt injection defenses, permission gates, audit trails.

</div>

</div>
