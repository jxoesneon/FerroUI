---
title: LLM Provider Benchmarking Reports
---

# LLM Provider Benchmarking Reports

> **Status:** 📝 Planned. Benchmarking reports comparing OpenAI, Anthropic, Google, Ollama, and llama.cpp providers are under active development.

When published, this page will contain:

- **Latency** — p50 / p95 / p99 time-to-first-token and time-to-full-response for each provider.
- **Cost** — per-1K-token pricing and cost-per-validated-layout at reference prompt complexity.
- **Fidelity** — pass rate on the FerroUI eval harness across the canonical layout set.
- **Failure modes** — common malformations, repair rate, and truncation behavior per provider.

Until this page ships, consult the [eval harness output](https://github.com/jxoesneon/FerroUI/tree/main/ferroui/evals) and [ADR-007 LLM Provider Abstraction](/architecture/ADRs/ADR-007-LLM-Provider-Abstraction).
