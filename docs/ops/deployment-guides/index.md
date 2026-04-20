---
title: Deployment Guides
---

# Deployment Guides

This section provides step-by-step instructions for deploying FerroUI across various environments and platform architectures.

## Supported Deployment Targets

| Target | Architecture | Best For |
|--------|--------------|----------|
| **[Cloudflare Edge](/ops/deployment-guides/Edge_Workers_Provisioning)** | Serverless Worker | Low-latency globally distributed apps |
| **[Tauri Desktop](/ops/deployment-guides/Tauri_Desktop_Packaging)** | Rust/Native | High-performance desktop applications |
| **[Web SaaS](/ops/deployment-guides/Web_SaaS_Containerization)** | Docker/K8s | Enterprise multitenant SaaS platforms |

## Core Deployment Principles

1. **Schema Pinning:** Always deploy with a specific version of `@ferroui/schema`. LLM prompts are optimized for the schema current at the time of deployment.
2. **Provider Redundancy:** Configure at least two LLM providers (e.g., Anthropic + Google) to handle upstream outages or rate limits.
3. **Cache Warming:** After a new deployment, run the `Core-v4` eval suite to warm the semantic cache for common user paths.

## Next Steps

- **[Edge Workers Provisioning](/ops/deployment-guides/Edge_Workers_Provisioning)** — Configure Wrangler and Cloudflare secrets.
- **[Tauri Desktop Packaging](/ops/deployment-guides/Tauri_Desktop_Packaging)** — Bundle native assets and sign binaries.
- **[Web SaaS Containerization](/ops/deployment-guides/Web_SaaS_Containerization)** — Optimize Docker images for Node.js 25.
