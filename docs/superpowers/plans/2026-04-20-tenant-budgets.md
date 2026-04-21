# Per-Tenant Cost & Safety Budgets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement per-tenant daily cost budgets (in cents) and safety event tracking to prevent runaway LLM costs and detect malicious patterns.

**Architecture:** Extend the existing `tenantQuotaMiddleware` to check against a `DailyBudget` store. Implement cost estimation in the Dual-Phase pipeline based on provider/model pricing tables.

**Tech Stack:** TypeScript, Express, Redis (optional backend), Zod.

---

### Task 1: Extend Tenant Quota Types & Registry

**Files:**
- Modify: `packages/engine/src/middleware/tenant-quota.ts`
- Test: `packages/engine/src/middleware/tenant-quota.test.ts`

- [x] **Step 1: Define Budget and Pricing Interfaces**

```typescript
export interface TenantBudget {
  dailyCostLimitCents: number;
  maxSafetyEventsPerDay: number;
}

export const PROVIDER_PRICING: Record<string, { input: number; output: number }> = {
  'anthropic': { input: 0.003, output: 0.015 }, // per 1K tokens
  'openai': { input: 0.005, output: 0.015 },
  'google': { input: 0.0035, output: 0.0105 },
  'ollama': { input: 0, output: 0 },
};
```

- [x] **Step 2: Implement Budget Storage & Check Logic**

```typescript
async function checkBudget(tenantId: string, estimatedCostCents: number): Promise<boolean> {
  // Mock implementation for now, using in-memory or Redis
  const currentCost = await getDailyUsage(tenantId);
  const limit = getTenantBudget(tenantId).dailyCostLimitCents;
  return (currentCost + estimatedCostCents) <= limit;
}
```

- [x] **Step 3: Write tests for budget rejection**
- [x] **Step 4: Update middleware to return 402 Payment Required when budget exceeded**

---

### Task 2: Mid-Request Cost Estimation in Pipeline

**Files:**
- Modify: `packages/engine/src/pipeline/dual-phase.ts`
- Modify: `packages/engine/src/types.ts`

- [x] **Step 1: Add `estimateCost` helper to LlmProvider**
- [x] **Step 2: Update `runDualPhasePipeline` to check budget after Phase 1 and before Phase 2**
- [x] **Step 3: Log cost events to AuditLogger**

---

### Task 3: Safety Event Tracking

- [x] **Step 1: Increment safety event counter when `PROMPT_INJECTION` is detected**
- [x] **Step 2: Block tenants who exceed their daily safety event limit (e.g., 5 events/day)**
- [x] **Step 3: Add dashboard metric for `ferroui.safety.budget_exceeded`**
