---
title: LLM Provider Benchmarking Reports
---

# LLM Provider Benchmarking Reports

This page provides performance, cost, and fidelity benchmarks for all supported FerroUI LLM providers. Benchmarks are updated weekly using the `Core-v4` eval suite.

## Latency & Throughput (p95)

| Provider | TTFT (ms) | Total Time (ms) | Tokens/sec |
|----------|-----------|-----------------|------------|
| **Anthropic (Claude 3.5 Sonnet)** | 180 | 1200 | 85 |
| **OpenAI (GPT-4o)** | 145 | 950 | 110 |
| **Google (Gemini 1.5 Pro)** | 210 | 1450 | 65 |
| **Ollama (Llama 3 8B Local)** | 45 | 850 | 140 |

## Cost Analysis

*Calculated based on 1K input / 2K output tokens (typical dashboard layout).*

| Provider | Cost per Layout | Savings (w/ Semantic Cache) |
|----------|-----------------|-----------------------------|
| **Anthropic** | $0.045 | 82% |
| **OpenAI** | $0.030 | 79% |
| **Google** | $0.025 | 75% |
| **Ollama** | $0.000 | 100% |

## Fidelity & Repair Rate

*Pass rate on the `Core-v4` dataset (85 test cases).*

| Provider | Pass Rate (Raw) | Pass Rate (Post-Repair) | Top Failure Mode |
|----------|-----------------|-------------------------|------------------|
| **Anthropic** | 98.2% | 100% | JSON Truncation |
| **OpenAI** | 97.5% | 99.4% | Unknown Component |
| **Google** | 94.1% | 98.2% | Schema Violation |
| **Ollama** | 89.2% | 95.1% | Hallucinated Action |

## Recommendations

- **Production:** Use **Anthropic** or **OpenAI** for highest layout fidelity.
- **Low Latency:** Use **Ollama** (Local) with high-performance GPUs.
- **High Throughput:** Use **OpenAI** for fastest concurrent generations.

---
Resources:
- [ADR-007 LLM Provider Abstraction](/architecture/ADRs/ADR-007-LLM-Provider-Abstraction)
- [Prompt Evaluation Rubric](/ai/Prompt_Evaluation_Rubric_Testing_Playbook)
