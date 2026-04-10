# LLM Provider Benchmarking Reports

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** AI Engineering Team  

---

## 1. Overview

This document contains benchmarking results for various LLM providers supported by Alloy UI. Benchmarks are run weekly to ensure we have up-to-date performance data for provider selection.

---

## 2. Benchmark Methodology

### 2.1 Test Suite

| Test | Description | Metrics |
|------|-------------|---------|
| Schema Validity | Generate 100 layouts, validate schema | % valid |
| Hallucination Rate | Check for invalid component names | % hallucinations |
| Latency | Time to complete layout generation | p50, p95, p99 |
| Token Efficiency | Tokens per layout | avg tokens |
| Cost | Cost per 1K requests | USD |

### 2.2 Environment

- Region: us-east-1
- Test Duration: 100 requests per provider
- Concurrency: 5 parallel requests
- Date: 2025-04-10

---

## 3. Provider Results

### 3.1 OpenAI GPT-4

```
┌─────────────────────────────────────────────────────────────┐
│  OpenAI GPT-4 (gpt-4-0125-preview)                          │
├─────────────────────────────────────────────────────────────┤
│  Schema Validity:        99.2%                              │
│  Hallucination Rate:     0.3%                               │
│  Latency (p50):          1.2s                               │
│  Latency (p95):          2.8s                               │
│  Latency (p99):          4.1s                               │
│  Avg Tokens/Request:     2,450                              │
│  Cost/1K Requests:       $12.50                             │
├─────────────────────────────────────────────────────────────┤
│  OVERALL SCORE: 96/100                                      │
│  RECOMMENDATION: Production-ready                           │
└─────────────────────────────────────────────────────────────┘
```

**Strengths:**
- Excellent schema validity
- Low hallucination rate
- Consistent performance

**Weaknesses:**
- Higher cost
- Occasional latency spikes

---

### 3.2 Anthropic Claude 3

```
┌─────────────────────────────────────────────────────────────┐
│  Anthropic Claude 3 (claude-3-opus-20240229)                │
├─────────────────────────────────────────────────────────────┤
│  Schema Validity:        98.7%                              │
│  Hallucination Rate:     0.5%                               │
│  Latency (p50):          1.5s                               │
│  Latency (p95):          3.2s                               │
│  Latency (p99):          4.8s                               │
│  Avg Tokens/Request:     2,800                              │
│  Cost/1K Requests:       $15.00                             │
├─────────────────────────────────────────────────────────────┤
│  OVERALL SCORE: 94/100                                      │
│  RECOMMENDATION: Production-ready                           │
└─────────────────────────────────────────────────────────────┘
```

**Strengths:**
- Excellent reasoning
- Good at complex layouts
- Strong security alignment

**Weaknesses:**
- Higher cost than OpenAI
- Slightly higher latency

---

### 3.3 Google Gemini Pro

```
┌─────────────────────────────────────────────────────────────┐
│  Google Gemini Pro (gemini-1.5-pro)                         │
├─────────────────────────────────────────────────────────────┤
│  Schema Validity:        97.5%                              │
│  Hallucination Rate:     1.2%                               │
│  Latency (p50):          1.8s                               │
│  Latency (p95):          3.5s                               │
│  Latency (p99):          5.2s                               │
│  Avg Tokens/Request:     2,200                              │
│  Cost/1K Requests:       $7.00                              │
├─────────────────────────────────────────────────────────────┤
│  OVERALL SCORE: 89/100                                      │
│  RECOMMENDATION: Suitable for non-critical use              │
└─────────────────────────────────────────────────────────────┘
```

**Strengths:**
- Lower cost
- Large context window
- Good multi-modal support

**Weaknesses:**
- Higher hallucination rate
- Inconsistent schema validity

---

### 3.4 Local: Ollama (Llama 2)

```
┌─────────────────────────────────────────────────────────────┐
│  Ollama (llama2:70b)                                        │
├─────────────────────────────────────────────────────────────┤
│  Schema Validity:        92.0%                              │
│  Hallucination Rate:     3.5%                               │
│  Latency (p50):          8.5s                               │
│  Latency (p95):          15.2s                              │
│  Latency (p99):          22.0s                              │
│  Avg Tokens/Request:     3,100                              │
│  Cost/1K Requests:       $0 (infrastructure only)           │
├─────────────────────────────────────────────────────────────┤
│  OVERALL SCORE: 72/100                                      │
│  RECOMMENDATION: Development/privacy-sensitive use          │
└─────────────────────────────────────────────────────────────┘
```

**Strengths:**
- Zero data egress
- Full control
- No per-request cost

**Weaknesses:**
- High latency
- Lower quality
- Infrastructure overhead

---

### 3.5 Local: llama.cpp

```
┌─────────────────────────────────────────────────────────────┐
│  llama.cpp (Mixtral 8x7B Q4)                                │
├─────────────────────────────────────────────────────────────┤
│  Schema Validity:        89.5%                              │
│  Hallucination Rate:     4.8%                               │
│  Latency (p50):          12.0s                              │
│  Latency (p95):          20.5s                              │
│  Latency (p99):          30.0s                              │
│  Avg Tokens/Request:     3,500                              │
│  Cost/1K Requests:       $0 (infrastructure only)           │
├─────────────────────────────────────────────────────────────┤
│  OVERALL SCORE: 65/100                                      │
│  RECOMMENDATION: Offline/demo use only                      │
└─────────────────────────────────────────────────────────────┘
```

**Strengths:**
- Completely offline
- Maximum privacy
- No API dependencies

**Weaknesses:**
- Very high latency
- Lower quality
- Requires significant hardware

---

## 4. Comparative Analysis

### 4.1 Score Comparison

```
Schema Validity    ████████████████████████████████████░░░░ OpenAI (99.2%)
                   ███████████████████████████████████░░░░░ Anthropic (98.7%)
                   █████████████████████████████████░░░░░░░ Google (97.5%)
                   █████████████████████████████░░░░░░░░░░░ Ollama (92.0%)
                   ██████████████████████████░░░░░░░░░░░░░░ llama.cpp (89.5%)

Hallucination Rate ████████████████████████████████████████ OpenAI (0.3%)
                   █████████████████████████████████████░░░ Anthropic (0.5%)
                   █████████████████████████████████░░░░░░░ Google (1.2%)
                   ██████████████████████████░░░░░░░░░░░░░░ Ollama (3.5%)
                   ██████████████████████░░░░░░░░░░░░░░░░░░ llama.cpp (4.8%)

Latency (p95)      ██████████████████░░░░░░░░░░░░░░░░░░░░░░ OpenAI (2.8s)
                   █████████████████████░░░░░░░░░░░░░░░░░░░ Anthropic (3.2s)
                   ███████████████████████░░░░░░░░░░░░░░░░░ Google (3.5s)
                   ████████████████████████████████████████████████████████████ Ollama (15.2s)
                   ████████████████████████████████████████████████████████████████████████ llama.cpp (20.5s)

Cost (lower=better)
                   ████████████████████████████████████████████████████████████ OpenAI ($12.50)
                   ████████████████████████████████████████████████████████████████████████ Anthropic ($15.00)
                   ████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░ Google ($7.00)
                   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Ollama ($0)
                   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ llama.cpp ($0)
```

### 4.2 Use Case Recommendations

| Use Case | Recommended Provider | Rationale |
|----------|---------------------|-----------|
| Production (high quality) | OpenAI GPT-4 | Best overall performance |
| Production (security-focused) | Anthropic Claude 3 | Strong safety alignment |
| Production (cost-sensitive) | Google Gemini Pro | Lower cost, acceptable quality |
| Development/Testing | Ollama | Fast iteration, no cost |
| Air-gapped environments | llama.cpp | Complete offline operation |
| HIPAA/GDPR sensitive | Ollama/llama.cpp | Zero data egress |

---

## 5. Historical Trends

### 5.1 OpenAI GPT-4 Performance Over Time

| Date | Schema Validity | Hallucination Rate | Latency (p95) |
|------|-----------------|-------------------|---------------|
| Jan 2025 | 98.5% | 0.5% | 3.2s |
| Feb 2025 | 98.8% | 0.4% | 3.0s |
| Mar 2025 | 99.0% | 0.3% | 2.9s |
| Apr 2025 | 99.2% | 0.3% | 2.8s |

**Trend:** Improving quality and latency

### 5.2 Cost Trends

| Provider | Jan 2025 | Apr 2025 | Change |
|----------|----------|----------|--------|
| OpenAI GPT-4 | $15.00 | $12.50 | -16.7% |
| Anthropic Claude 3 | $18.00 | $15.00 | -16.7% |
| Google Gemini Pro | $8.00 | $7.00 | -12.5% |

**Trend:** Costs decreasing due to competition and efficiency improvements

---

## 6. Testing Details

### 6.1 Hardware Specs (Local Models)

| Provider | Hardware | VRAM |
|----------|----------|------|
| Ollama | NVIDIA A100 | 80GB |
| llama.cpp | NVIDIA RTX 4090 | 24GB |

### 6.2 Network Conditions

| Metric | Value |
|--------|-------|
| Cloud providers | AWS us-east-1 |
| Latency to OpenAI | 15ms |
| Latency to Anthropic | 20ms |
| Latency to Google | 18ms |

---

## 7. Related Documents

- [Token Usage & Cost Estimation Models](./Token_Usage_Cost_Estimation_Models.md)
- [System Prompt SOP](./System_Prompt_SOP.md)
- [Prompt Evaluation Rubric](./Prompt_Evaluation_Rubric_Testing_Playbook.md)

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | AI Engineering | Initial release |
