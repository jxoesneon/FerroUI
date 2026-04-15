import CryptoJS from 'crypto-js';
import { FerroUILayout } from '@ferroui/schema';
import { CacheBackend, InMemoryCacheBackend } from './cache-backend.js';

const CACHE_SIGNING_SECRET = process.env.CACHE_SIGNING_SECRET ?? 'ferroui-cache-hmac-secret-CHANGE-IN-PRODUCTION';

export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'RESTRICTED';

const TTL_BY_CLASSIFICATION: Record<DataClassification, number> = {
  PUBLIC:     300 * 1000,
  INTERNAL:    60 * 1000,
  RESTRICTED:   0,
};

export interface CacheEntry {
  layout: FerroUILayout;
  timestamp: number;
  toolOutputs: Record<string, unknown>;
  classification: DataClassification;
  ttlMs: number;
  hmac: string;
}

export class SemanticCache {
  private static instance: SemanticCache;
  private backend: CacheBackend = new InMemoryCacheBackend();
  private usageOrder: Set<string> = new Set();
  private maxSize: number = 1000;

  private constructor() {}

  public static getInstance(): SemanticCache {
    if (!SemanticCache.instance) {
      SemanticCache.instance = new SemanticCache();
    }
    return SemanticCache.instance;
  }

  public setBackend(backend: CacheBackend): void {
    this.backend = backend;
    this.usageOrder.clear();
  }

  public setMaxSize(size: number): void {
    this.maxSize = size;
  }

  private touch(key: string): void {
    this.usageOrder.delete(key);
    this.usageOrder.add(key);
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
  ): Promise<FerroUILayout | undefined> {
    const classification = this.resolveClassification(toolOutputs);

    if (classification === 'RESTRICTED') {
      return undefined;
    }

    const key = this.generateKey(prompt, permissions, userId, toolOutputs, classification);
    const data = await this.backend.get(key);

    if (!data) {
      this.usageOrder.delete(key);
      return undefined;
    }

    const entry: CacheEntry = JSON.parse(data);

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttlMs) {
      await this.backend.delete(key);
      this.usageOrder.delete(key);
      return undefined;
    }

    // Verify HMAC integrity — Security spec §2.4
    if (!this.verifyEntry(entry)) {
      console.error('[SemanticCache] HMAC verification failed — possible cache poisoning. Evicting entry.');
      await this.backend.delete(key);
      this.usageOrder.delete(key);
      return undefined;
    }

    this.touch(key);
    return entry.layout;
  }

  private signEntry(layout: FerroUILayout, toolOutputs: Record<string, unknown>, timestamp: number): string {
    const payload = JSON.stringify({ layout, toolOutputs, timestamp });
    return CryptoJS.HmacSHA256(payload, CACHE_SIGNING_SECRET).toString();
  }

  private verifyEntry(entry: CacheEntry): boolean {
    const expected = this.signEntry(entry.layout, entry.toolOutputs, entry.timestamp);
    return expected === entry.hmac;
  }

  public async set(
    prompt: string,
    permissions: string[],
    userId: string,
    toolOutputs: Record<string, unknown>,
    layout: FerroUILayout,
    classification: DataClassification
  ): Promise<void> {
    const ttlMs = TTL_BY_CLASSIFICATION[classification];
    if (ttlMs === 0) return;

    const key = this.generateKey(prompt, permissions, userId, toolOutputs, classification);
    const timestamp = Date.now();
    const hmac = this.signEntry(layout, toolOutputs, timestamp);

    const entry: CacheEntry = {
      layout,
      timestamp,
      toolOutputs,
      classification,
      ttlMs,
      hmac,
    };

    await this.backend.set(key, JSON.stringify(entry), ttlMs);
    this.touch(key);

    // LRU Eviction
    if (this.usageOrder.size > this.maxSize) {
      const lruKey = this.usageOrder.values().next().value;
      if (lruKey) {
        this.usageOrder.delete(lruKey);
        await this.backend.delete(lruKey);
      }
    }
  }

  public async invalidate(toolName: string, params?: unknown): Promise<void> {
    const keys = await this.backend.keys();
    for (const key of keys) {
      const data = await this.backend.get(key);
      if (!data) continue;
      
      const entry: CacheEntry = JSON.parse(data);
      const output = entry.toolOutputs[toolName];
      if (output) {
        if (!params) {
          await this.backend.delete(key);
          this.usageOrder.delete(key);
          continue;
        }
        if ((output as Record<string, unknown>).args &&
            JSON.stringify((output as Record<string, unknown>).args) === JSON.stringify(params)) {
          await this.backend.delete(key);
          this.usageOrder.delete(key);
        }
      }
    }
  }

  public async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const keys = await this.backend.keys();
    for (const key of keys) {
      const data = await this.backend.get(key);
      if (!data) continue;

      const entry: CacheEntry = JSON.parse(data);
      const toolNames = Object.keys(entry.toolOutputs);
      if (toolNames.some(name => regex.test(name))) {
        await this.backend.delete(key);
        this.usageOrder.delete(key);
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
    // 1. Prompt Normalization - Spec §3.1
    const normalizedPrompt = prompt
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/[?.!,;]$/, '') // Remove trailing punctuation
      .replace(/\bcan't\b/g, 'cannot') // Expand common contractions (example)
      .replace(/\bdon't\b/g, 'do not');

    // 2. Permissions Normalization & Hashing - Spec §3.2
    const sortedPermissions = [...permissions].sort();
    const permissionsHash = CryptoJS.SHA256(sortedPermissions.join(',')).toString().slice(0, 16);

    const userScope = classification === 'PUBLIC' ? 'shared' : userId;

    // 3. Tool Fingerprinting - Spec §3.3
    // Hash individual tool outputs to create a stable compound fingerpint
    const fingerprintedOutputs = Object.entries(toolOutputs)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, output]) => {
        const canonical = JSON.stringify(output);
        const hash = CryptoJS.SHA256(canonical).toString().slice(0, 16);
        return `${name}:${hash}`;
      })
      .join('|');

    const combined = `${classification}|${normalizedPrompt}|${permissionsHash}|${userScope}|${fingerprintedOutputs}`;
    return CryptoJS.SHA256(combined).toString();
  }

  public async clear(): Promise<void> {
    await this.backend.clear();
    this.usageOrder.clear();
  }
}

export const semanticCache = SemanticCache.getInstance();
