/**
 * Per-Tenant LLM Budget Enforcement (D.4)
 * Tracks and enforces spending limits per tenant/organization
 */

import type { Request, Response, NextFunction } from 'express';
import { AuditLogger, AuditEventType } from '../audit/audit-logger';

interface BudgetConfig {
  maxTokensPerDay: number;
  maxRequestsPerDay: number;
  maxCostPerDay: number; // in USD cents
}

interface TenantBudget {
  tenantId: string;
  config: BudgetConfig;
  usage: {
    tokens: number;
    requests: number;
    costCents: number;
    lastReset: Date;
  };
}

// In-memory storage - in production, use Redis
const tenantBudgets = new Map<string, TenantBudget>();

const DEFAULT_BUDGET: BudgetConfig = {
  maxTokensPerDay: 100000,    // 100K tokens
  maxRequestsPerDay: 1000,     // 1K requests
  maxCostPerDay: 5000,         // $50.00
};

export function createTenantBudgetMiddleware(
  auditLogger: AuditLogger
) {
  return async function tenantBudgetMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const tenantId = req.headers['x-tenant-id'] as string || 'default';
    const budget = getOrCreateBudget(tenantId);

    // Check if budget exceeded
    const violations: string[] = [];

    if (budget.usage.tokens >= budget.config.maxTokensPerDay) {
      violations.push('token limit exceeded');
    }
    if (budget.usage.requests >= budget.config.maxRequestsPerDay) {
      violations.push('request limit exceeded');
    }
    if (budget.usage.costCents >= budget.config.maxCostPerDay) {
      violations.push('cost limit exceeded');
    }

    if (violations.length > 0) {
      auditLogger.log({
        type: AuditEventType.RATE_LIMITED,
        requestId: (req as any).context?.requestId || 'unknown',
        userId: (req as any).auth?.sub || 'unknown',
        ip: req.ip || 'unknown',
      });

      res.status(429).json({
        error: 'Budget limit exceeded',
        violations,
        tenantId,
        resetAt: getNextResetTime().toISOString(),
      });
      return;
    }

    // Attach budget tracker to response
    const originalJson = res.json.bind(res);
    res.json = function(body: unknown) {
      // Track response metrics if it contains LLM usage
      if (body && typeof body === 'object') {
        const llmUsage = (body as any).llmUsage;
        if (llmUsage) {
          trackUsage(tenantId, {
            tokens: llmUsage.inputTokens + llmUsage.outputTokens,
            costCents: estimateCost(llmUsage),
          });
        }
      }
      return originalJson(body);
    };

    next();
  };
}

function getOrCreateBudget(tenantId: string): TenantBudget {
  let budget = tenantBudgets.get(tenantId);
  
  if (!budget || shouldReset(budget)) {
    budget = {
      tenantId,
      config: getTenantConfig(tenantId),
      usage: {
        tokens: 0,
        requests: 0,
        costCents: 0,
        lastReset: new Date(),
      },
    };
    tenantBudgets.set(tenantId, budget);
  }
  
  return budget;
}

function getTenantConfig(tenantId: string): BudgetConfig {
  // In production: fetch from database based on tenant's plan
  const tier = getTenantTier(tenantId);
  
  switch (tier) {
    case 'enterprise':
      return {
        maxTokensPerDay: 1000000,  // 1M tokens
        maxRequestsPerDay: 10000,
        maxCostPerDay: 50000,      // $500
      };
    case 'growth':
      return {
        maxTokensPerDay: 500000,   // 500K tokens
        maxRequestsPerDay: 5000,
        maxCostPerDay: 25000,      // $250
      };
    default: // starter
      return DEFAULT_BUDGET;
  }
}

function getTenantTier(tenantId: string): string {
  // Placeholder - would query tenant database
  if (tenantId.startsWith('ent-')) return 'enterprise';
  if (tenantId.startsWith('growth-')) return 'growth';
  return 'starter';
}

function trackUsage(
  tenantId: string,
  usage: { tokens: number; costCents: number }
): void {
  const budget = tenantBudgets.get(tenantId);
  if (budget) {
    budget.usage.tokens += usage.tokens;
    budget.usage.requests += 1;
    budget.usage.costCents += usage.costCents;
  }
}

function estimateCost(llmUsage: {
  inputTokens: number;
  outputTokens: number;
  model?: string;
}): number {
  // Rough cost estimation in cents
  const model = llmUsage.model || 'claude-3-sonnet';
  
  // Cost per 1K tokens (in cents)
  const rates: Record<string, { input: number; output: number }> = {
    'claude-3-opus': { input: 15, output: 75 },
    'claude-3-sonnet': { input: 3, output: 15 },
    'claude-3-haiku': { input: 0.25, output: 1.25 },
    'gpt-4': { input: 30, output: 60 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  };
  
  const rate = rates[model] || rates['claude-3-sonnet'];
  
  const inputCost = (llmUsage.inputTokens / 1000) * rate.input;
  const outputCost = (llmUsage.outputTokens / 1000) * rate.output;
  
  return Math.ceil(inputCost + outputCost);
}

function shouldReset(budget: TenantBudget): boolean {
  const now = new Date();
  const lastReset = new Date(budget.usage.lastReset);
  
  // Reset at midnight UTC
  return now.getUTCDay() !== lastReset.getUTCDay();
}

function getNextResetTime(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
}

// Admin API endpoints for budget management
export function getBudgetStatus(tenantId: string): TenantBudget | null {
  return tenantBudgets.get(tenantId) || null;
}

export function setBudgetConfig(
  tenantId: string,
  config: Partial<BudgetConfig>
): void {
  const budget = getOrCreateBudget(tenantId);
  budget.config = { ...budget.config, ...config };
}
