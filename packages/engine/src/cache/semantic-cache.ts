import CryptoJS from 'crypto-js';
import { AlloyLayout } from '@alloy/schema';

export interface CacheEntry {
  layout: AlloyLayout;
  timestamp: number;
}

export class SemanticCache {
  private static instance: SemanticCache;
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTtl = 300 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): SemanticCache {
    if (!SemanticCache.instance) {
      SemanticCache.instance = new SemanticCache();
    }
    return SemanticCache.instance;
  }

  public async get(
    prompt: string,
    permissions: string[],
    toolOutputs: Record<string, any>
  ): Promise<AlloyLayout | undefined> {
    const key = this.generateKey(prompt, permissions, toolOutputs);
    const entry = this.cache.get(key);
    
    if (entry && Date.now() - entry.timestamp < this.defaultTtl) {
      return entry.layout;
    }
    
    if (entry) {
      this.cache.delete(key); // Evict expired entry
    }
    
    return undefined;
  }

  public async set(
    prompt: string,
    permissions: string[],
    toolOutputs: Record<string, any>,
    layout: AlloyLayout
  ): Promise<void> {
    const key = this.generateKey(prompt, permissions, toolOutputs);
    this.cache.set(key, {
      layout,
      timestamp: Date.now(),
    });
  }

  private generateKey(
    prompt: string,
    permissions: string[],
    toolOutputs: Record<string, any>
  ): string {
    const normalizedPrompt = prompt.trim().toLowerCase();
    const sortedPermissions = [...permissions].sort();
    
    // Consistent serialization of tool outputs
    const serializedOutputs = JSON.stringify(
      Object.entries(toolOutputs).sort(([a], [b]) => a.localeCompare(b))
    );
    
    const combined = `${normalizedPrompt}|${sortedPermissions.join(',')}|${serializedOutputs}`;
    return CryptoJS.SHA256(combined).toString();
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const semanticCache = SemanticCache.getInstance();
