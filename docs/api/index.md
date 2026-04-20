---
title: API Reference
---

# API Reference

The FerroUI API surface is organized into **three registries** (components, tools, layout schema) and **package-level APIs** generated from the TypeScript source.

## Registries

<div class="vp-features-grid">

- **[Components](/api/components)** — atomic, molecular, and organism React components. Auto-generated from the Zod schemas in [`@ferroui/registry`](/api/packages/registry).
- **[Tools](/api/tools)** — backend integrations with permission scopes, budgets, and cache sensitivity. Sourced from [`@ferroui/tools`](/api/packages/tools).
- **[`FerroUILayout` Schema](/api/schema)** — the root JSON contract between engine and renderer. Every layout the engine emits is validated against this schema before rendering.

</div>

## Package APIs

Package references are generated from TypeScript source using TypeDoc. Each page documents the public exports for a package — types, functions, and classes.

See the **[Packages index](/api/packages/)** for the full catalog.

## Applications

Deployment targets — reference implementations of the FerroUI runtime.

See the **[Applications index](/api/apps/)** for web, edge, desktop, and playground docs.

## How These Pages Are Generated

Registry pages (components, tools, schema) are **regenerated on every push** to `main` that touches `packages/**`, `docs/**`, or the generation scripts. See [`scripts/generate-docs.ts`](https://github.com/jxoesneon/FerroUI/blob/main/scripts/generate-docs.ts) for the pipeline. This guarantees the published API reference never drifts from the running code.
