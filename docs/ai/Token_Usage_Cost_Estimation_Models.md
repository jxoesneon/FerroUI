# Token Usage & Cost Estimation Models

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** AI Engineering & Finance Teams  

---

## 1. Overview

This document provides models for estimating token usage and costs for Alloy UI deployments. Accurate cost estimation is critical for budgeting and capacity planning.

---

## 2. Token Fundamentals

### 2.1 What is a Token?

- ~4 characters of English text = 1 token
- 1 word ≈ 1.3 tokens
- Code ≈ 1 token per 3-4 characters
- JSON structure ≈ 0.5-1 token per character

### 2.2 Token Types

| Type | Description | Billing |
|------|-------------|---------|
| Input tokens | Prompt + context | Charged |
| Output tokens | Generated content | Charged (higher rate) |
| Cached tokens | Semantic cache hit | Free |

---

## 3. Token Usage Model

### 3.1 Per-Request Token Breakdown

```
Total Tokens = Input Tokens + Output Tokens

Input Tokens = 
  System Prompt Tokens +
  User Prompt Tokens +
  Tool Results Tokens +
  Component Manifest Tokens

Output Tokens =
  Generated Layout Tokens
```

### 3.2 Typical Token Counts

| Component | Tokens | Notes |
|-----------|--------|-------|
| System Prompt (Phase 1) | 800-1,200 | Includes tool manifest |
| System Prompt (Phase 2) | 1,000-1,500 | Includes component manifest |
| User Prompt | 10-100 | Depends on complexity |
| Tool Results | 500-5,000 | Depends on data volume |
| Generated Layout | 500-3,000 | Depends on UI complexity |

### 3.3 Example Calculation

```
Scenario: Dashboard with KPIs and data table

Phase 1: Data Gathering
  System Prompt:    1,000 tokens
  User Prompt:         50 tokens
  Tool Results:     2,000 tokens
  ─────────────────────────────
  Phase 1 Input:    3,050 tokens
  Phase 1 Output:      50 tokens (tool calls)

Phase 2: UI Generation
  System Prompt:    1,200 tokens
  Context:          2,050 tokens (Phase 1 results)
  ─────────────────────────────
  Phase 2 Input:    3,250 tokens
  Phase 2 Output:   1,500 tokens (layout JSON)

Total per request:  7,850 tokens
```

---

## 4. Cost Estimation Models

### 4.1 Provider Pricing (as of 2025-04-10)

| Provider | Model | Input ($/1M tokens) | Output ($/1M tokens) |
|----------|-------|---------------------|----------------------|
| OpenAI | GPT-4 | $30.00 | $60.00 |
| OpenAI | GPT-3.5 | $3.00 | $6.00 |
| Anthropic | Claude 3 Opus | $15.00 | $75.00 |
| Anthropic | Claude 3 Sonnet | $3.00 | $15.00 |
| Google | Gemini Pro | $3.50 | $10.50 |
| Ollama | Llama 2 | $0.00 | $0.00 |

### 4.2 Cost Per Request Formula

```
Cost = (Input Tokens × Input Rate + Output Tokens × Output Rate) / 1,000,000

Example (GPT-4):
  Input:  6,300 tokens × $30 = $0.189
  Output: 1,550 tokens × $60 = $0.093
  ─────────────────────────────────
  Total: $0.282 per request
```

### 4.3 Monthly Cost Calculator

```typescript
interface CostParams {
  requestsPerDay: number;
  avgTokensPerRequest: number;
  inputOutputRatio: number; // e.g., 0.8 = 80% input, 20% output
  provider: 'openai-gpt4' | 'openai-gpt35' | 'anthropic-opus' | 'anthropic-sonnet' | 'google-gemini';
  cacheHitRate: number;
}

function estimateMonthlyCost(params: CostParams): number {
  const pricing = {
    'openai-gpt4': { input: 30, output: 60 },
    'openai-gpt35': { input: 3, output: 6 },
    'anthropic-opus': { input: 15, output: 75 },
    'anthropic-sonnet': { input: 3, output: 15 },
    'google-gemini': { input: 3.5, output: 10.5 },
  };
  
  const rates = pricing[params.provider];
  const effectiveRequests = params.requestsPerDay * 30 * (1 - params.cacheHitRate);
  
  const inputTokens = params.avgTokensPerRequest * params.inputOutputRatio;
  const outputTokens = params.avgTokensPerRequest * (1 - params.inputOutputRatio);
  
  const costPerRequest = 
    (inputTokens * rates.input + outputTokens * rates.output) / 1_000_000;
  
  return effectiveRequests * costPerRequest;
}

// Example: 1,000 requests/day, GPT-4, 40% cache hit
estimateMonthlyCost({
  requestsPerDay: 1000,
  avgTokensPerRequest: 7850,
  inputOutputRatio: 0.8,
  provider: 'openai-gpt4',
  cacheHitRate: 0.4,
});
// → $5,080/month
```

---

## 5. Cost Optimization Strategies

### 5.1 Semantic Caching

| Cache Hit Rate | Cost Reduction |
|----------------|----------------|
| 20% | 20% |
| 40% | 40% |
| 60% | 60% |

### 5.2 Model Selection

| Scenario | Recommended Model | Savings vs GPT-4 |
|----------|-------------------|------------------|
| Simple layouts | GPT-3.5 | 90% |
| Complex reasoning | GPT-4 | - |
| Cost-sensitive | Gemini Pro | 44% |
| Privacy-critical | Ollama | 100% |

### 5.3 Prompt Optimization

| Technique | Token Savings | Implementation |
|-----------|---------------|----------------|
| Shorter system prompts | 10-20% | Remove examples |
| Condensed component manifest | 15-30% | Use abbreviations |
| Tool result summarization | 20-50% | Pre-process results |

---

## 6. Budget Planning

### 6.1 Tiered Estimates

| Tier | Requests/Day | Est. Monthly Cost (GPT-4) | Est. Monthly Cost (GPT-3.5) |
|------|--------------|---------------------------|----------------------------|
| Starter | 100 | $508 | $51 |
| Growth | 1,000 | $5,080 | $508 |
| Scale | 10,000 | $50,800 | $5,080 |
| Enterprise | 100,000 | $508,000 | $50,800 |

### 6.2 Budget Alert Thresholds

| Alert Level | Threshold | Action |
|-------------|-----------|--------|
| Info | 50% of budget | Monitor closely |
| Warning | 75% of budget | Review usage patterns |
| Critical | 90% of budget | Enable cost controls |
| Emergency | 100% of budget | Switch to cheaper provider |

---

## 7. Monitoring & Reporting

### 7.1 Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Avg tokens/request | < 8,000 | > 10,000 |
| Cost/request | < $0.30 | > $0.50 |
| Cache hit rate | > 40% | < 20% |
| Daily spend | < budget | > 80% of budget |

### 7.2 Dashboard Query

```sql
-- Daily cost breakdown
SELECT 
  DATE(timestamp) as date,
  provider,
  model,
  COUNT(*) as requests,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(cost) as total_cost
FROM llm_requests
GROUP BY DATE(timestamp), provider, model
ORDER BY date DESC;
```

---

## 8. Related Documents

- [LLM Provider Benchmarking Reports](./LLM_Provider_Benchmarking_Reports.md)
- [Semantic Caching Strategy](../engineering/backend/Semantic_Caching_Strategy_Invalidation.md)
- [System Prompt SOP](./System_Prompt_SOP.md)

---

## 9. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | AI Engineering | Initial release |
