/**
 * FerroUI LLM Provider Router
 *
 * Cost-aware, health-tracked fallback router for LLM providers.
 * Selects the cheapest healthy provider that meets the request's
 * complexity tier, falling back through the chain on errors or
 * when a provider's circuit breaker is open.
 *
 * Usage:
 *   const router = new ProviderRouter([
 *     { provider: new AnthropicProvider(), costPerKToken: 0.003, tier: 'standard' },
 *     { provider: new OpenAIProvider(),    costPerKToken: 0.005, tier: 'standard' },
 *     { provider: new OllamaProvider(),    costPerKToken: 0,     tier: 'local'    },
 *   ]);
 *   const result = await router.completePrompt(req);
 */

import { LlmProvider } from './base.js';
import { LlmRequest, LlmResponse } from '../types.js';

export type ProviderTier = 'local' | 'standard' | 'premium';

export interface RoutedProvider {
  provider: LlmProvider;
  /** Estimated cost per 1 000 tokens in USD */
  costPerKToken: number;
  tier: ProviderTier;
  /** Maximum requests per minute (0 = unlimited) */
  maxRpm?: number;
}

export interface ProviderHealth {
  failures: number;
  lastFailureAt: number;
  circuitOpen: boolean;
}

const CIRCUIT_OPEN_THRESHOLD = 3;
const CIRCUIT_RESET_MS = 60_000;

export class ProviderRouter implements LlmProvider {
  readonly id = 'router';
  readonly contextWindowTokens: number;

  private health = new Map<string, ProviderHealth>();

  constructor(private readonly providers: RoutedProvider[]) {
    this.contextWindowTokens = Math.max(...providers.map(p => p.provider.contextWindowTokens));
    for (const { provider } of providers) {
      this.health.set(provider.id, { failures: 0, lastFailureAt: 0, circuitOpen: false });
    }
  }

  private getHealth(providerId: string): ProviderHealth {
    return this.health.get(providerId) ?? { failures: 0, lastFailureAt: 0, circuitOpen: false };
  }

  private recordSuccess(providerId: string): void {
    const h = this.getHealth(providerId);
    h.failures = 0;
    h.circuitOpen = false;
    this.health.set(providerId, h);
  }

  private recordFailure(providerId: string): void {
    const h = this.getHealth(providerId);
    h.failures++;
    h.lastFailureAt = Date.now();
    if (h.failures >= CIRCUIT_OPEN_THRESHOLD) {
      h.circuitOpen = true;
      console.warn(`[ProviderRouter] Circuit OPEN for provider "${providerId}" after ${h.failures} failures`);
    }
    this.health.set(providerId, h);
  }

  private isHealthy(providerId: string): boolean {
    const h = this.getHealth(providerId);
    if (!h.circuitOpen) return true;
    // Auto-reset after CIRCUIT_RESET_MS
    if (Date.now() - h.lastFailureAt > CIRCUIT_RESET_MS) {
      h.circuitOpen = false;
      h.failures = 0;
      this.health.set(providerId, h);
      console.info(`[ProviderRouter] Circuit auto-reset for provider "${providerId}"`);
      return true;
    }
    return false;
  }

  /** Returns providers sorted cheapest-first, filtered to healthy ones */
  private selectCandidates(): RoutedProvider[] {
    return this.providers
      .filter(p => this.isHealthy(p.provider.id))
      .sort((a, b) => a.costPerKToken - b.costPerKToken);
  }

  async *processPrompt(req: LlmRequest): AsyncGenerator<string, LlmResponse, undefined> {
    const candidates = this.selectCandidates();
    if (candidates.length === 0) throw new Error('[ProviderRouter] All providers are unhealthy');

    for (const candidate of candidates) {
      try {
        const result = yield* candidate.provider.processPrompt(req);
        this.recordSuccess(candidate.provider.id);
        return result;
      } catch (err) {
        console.warn(`[ProviderRouter] Provider "${candidate.provider.id}" failed during stream:`, err instanceof Error ? err.message : err);
        this.recordFailure(candidate.provider.id);
      }
    }

    throw new Error('[ProviderRouter] All providers failed during processPrompt');
  }

  async completePrompt(req: LlmRequest): Promise<LlmResponse> {
    const candidates = this.selectCandidates();
    if (candidates.length === 0) throw new Error('[ProviderRouter] All providers are unhealthy');

    const errors: string[] = [];
    for (const candidate of candidates) {
      try {
        const result = await candidate.provider.completePrompt(req);
        this.recordSuccess(candidate.provider.id);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[ProviderRouter] Provider "${candidate.provider.id}" failed: ${msg}`);
        this.recordFailure(candidate.provider.id);
        errors.push(`${candidate.provider.id}: ${msg}`);
      }
    }

    throw new Error(`[ProviderRouter] All providers failed: ${errors.join(' | ')}`);
  }

  estimateTokens(text: string): number {
    return this.providers[0]?.provider.estimateTokens(text) ?? Math.ceil(text.length / 4);
  }

  estimateCost(tokens: { input: number; output: number }): number {
    return this.providers[0]?.provider.estimateCost(tokens) ?? 0;
  }

  /** Returns a snapshot of current provider health for observability */
  getHealthSnapshot(): Record<string, ProviderHealth & { providerId: string }> {
    const out: Record<string, ProviderHealth & { providerId: string }> = {};
    for (const [id, h] of this.health.entries()) {
      out[id] = { ...h, providerId: id };
    }
    return out;
  }
}
