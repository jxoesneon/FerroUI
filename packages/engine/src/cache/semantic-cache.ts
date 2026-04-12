import CryptoJS from 'crypto-js';
import { AlloyLayout } from '@alloy/schema';

export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'RESTRICTED';

const TTL_BY_CLASSIFICATION: Record<DataClassification, number> = {
  PUBLIC:     300 * 1000,
  INTERNAL:    60 * 1000,
  RESTRICTED:   0,
};

export interface CacheEntry {
  layout: AlloyLayout;
  timestamp: number;
  toolOutputs: Record<string, unknown>;
  classification: DataClassification;
  ttlMs: number;
}

export class SemanticCache {
  private static instance: SemanticCache;
  private cache: Map<string, CacheEntry> = new Map();

  private constructor() {}

  public static getInstance(): SemanticCache {
    if (!SemanticCache.instance) {
      SemanticCache.instance = new SemanticCache();
    }
    return SemanticCache.instance;
  }

  private resolveClassification(toolOutputs: Record<string, unknown>): DataClassification {
    let classification: DataClassification = 'PUBLIC';
    for (const output of Object.values(toolOutputs)) {
      const c = (output as Record<string, unknown>)?.classification as string | undefined;
      if (c === 'RESTRICTED') return 'RESTRICTED';
      if (c === 'INTERNAL') classification = 'INTERNAL';
    }
    return classification;
  }

  public async get(
    prompt: string,
    permissions: string[],
    userId: string,
    toolOutputs: Record<string, unknown>
  ): Promise<AlloyLayout | undefined> {
    const classification = this.resolveClassification(toolOutputs);

    if (classification === 'RESTRICTED') {
      return undefined;
    }

    const key = this.generateKey(prompt, permissions, userId, toolOutputs, classification);
    const entry = this.cache.get(key);

    if (entry && Date.now() - entry.timestamp < entry.ttlMs) {
      return entry.layout;
    }

    if (entry) {
      this.cache.delete(key);
    }

    return undefined;
  }

  public async set(
    prompt: string,
    permissions: string[],
    userId: string,
    toolOutputs: Record<string, unknown>,
    layout: AlloyLayout
  ): Promise<void> {
    const classification = this.resolveClassification(toolOutputs);

    if (classification === 'RESTRICTED') {
      return;
    }

    const ttlMs = TTL_BY_CLASSIFICATION[classification];
    const key = this.generateKey(prompt, permissions, userId, toolOutputs, classification);
    this.cache.set(key, {
      layout,
      timestamp: Date.now(),
      toolOutputs,
      classification,
      ttlMs,
    });
  }

  public async invalidate(toolName: string, params?: unknown): Promise<void> {
    for (const [key, entry] of this.cache.entries()) {
      const output = entry.toolOutputs[toolName];
      if (output) {
        if (!params) {
          this.cache.delete(key);
          continue;
        }
        if ((output as Record<string, unknown>).args &&
            JSON.stringify((output as Record<string, unknown>).args) === JSON.stringify(params)) {
          this.cache.delete(key);
        }
      }
    }
  }

  public async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const [key, entry] of this.cache.entries()) {
      const toolNames = Object.keys(entry.toolOutputs);
      if (toolNames.some(name => regex.test(name))) {
        this.cache.delete(key);
      }
    }
  }

  private generateKey(
    prompt: string,
    permissions: string[],
    userId: string,
    toolOutputs: Record<string, unknown>,
    classification: DataClassification
  ): string {
    const normalizedPrompt = prompt.trim().toLowerCase();
    const sortedPermissions = [...permissions].sort();

    const userScope = classification === 'PUBLIC' ? 'shared' : userId;

    const serializedOutputs = JSON.stringify(
      Object.entries(toolOutputs).sort(([a], [b]) => a.localeCompare(b))
    );

    const combined = `${classification}|${normalizedPrompt}|${sortedPermissions.join(',')}|${userScope}|${serializedOutputs}`;
    return CryptoJS.SHA256(combined).toString();
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const semanticCache = SemanticCache.getInstance();
