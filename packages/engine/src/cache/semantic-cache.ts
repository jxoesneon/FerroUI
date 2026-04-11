import CryptoJS from 'crypto-js';
import { AlloyLayout } from '@alloy/schema';

export interface CacheEntry {
  layout: AlloyLayout;
  timestamp: number;
  toolOutputs: Record<string, any>;
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
    userId: string,
    toolOutputs: Record<string, any>
  ): Promise<AlloyLayout | undefined> {
    const key = this.generateKey(prompt, permissions, userId, toolOutputs);
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
    userId: string,
    toolOutputs: Record<string, any>,
    layout: AlloyLayout
  ): Promise<void> {
    const key = this.generateKey(prompt, permissions, userId, toolOutputs);
    this.cache.set(key, {
      layout,
      timestamp: Date.now(),
      toolOutputs,
    });
  }

  public async invalidate(toolName: string, params?: any): Promise<void> {
    for (const [key, entry] of this.cache.entries()) {
      const output = entry.toolOutputs[toolName];
      if (output) {
        if (!params) {
          this.cache.delete(key);
          continue;
        }

        // Deep equality check for params
        // In our dual-phase implementation, we store args in the tool output
        if (output.args && JSON.stringify(output.args) === JSON.stringify(params)) {
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
    toolOutputs: Record<string, any>
  ): string {
    const normalizedPrompt = prompt.trim().toLowerCase();
    const sortedPermissions = [...permissions].sort();
    
    // Consistent serialization of tool outputs
    const serializedOutputs = JSON.stringify(
      Object.entries(toolOutputs).sort(([a], [b]) => a.localeCompare(b))
    );
    
    const combined = `${normalizedPrompt}|${sortedPermissions.join(',')}|${userId}|${serializedOutputs}`;
    return CryptoJS.SHA256(combined).toString();
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const semanticCache = SemanticCache.getInstance();
