/**
 * Analysis Cache for Cost Optimization
 *
 * Caches identical code analyses to prevent redundant API calls.
 * Uses LRU (Least Recently Used) eviction strategy with TTL (Time-To-Live).
 *
 * Cache Key: Hash of (code + language + reviewTypes)
 */

import { AnalysisResult, ReviewType } from '@/types';

export interface CacheConfig {
  maxEntries: number;
  ttlMs: number; // Time-to-live in milliseconds
}

export interface CacheEntry {
  result: AnalysisResult;
  createdAt: number;
  accessedAt: number;
  hits: number;
}

export interface CacheStats {
  totalEntries: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  oldestEntryAge: number | null;
}

const DEFAULT_CONFIG: CacheConfig = {
  maxEntries: 100, // Store up to 100 unique analyses
  ttlMs: 24 * 60 * 60 * 1000, // 24 hours
};

class AnalysisCache {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private hitCount = 0;
  private missCount = 0;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: CacheConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.startCleanup();
  }

  /**
   * Generate a cache key from analysis parameters
   */
  generateKey(code: string, language: string, reviewTypes: ReviewType[]): string {
    // Sort review types for consistent key generation
    const sortedTypes = [...reviewTypes].sort().join(',');

    // Simple hash function for the code
    const codeHash = this.hashCode(code);

    return `${codeHash}:${language}:${sortedTypes}`;
  }

  /**
   * Simple hash function for strings
   * Uses djb2 algorithm - fast and reasonably distributed
   */
  private hashCode(str: string): string {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    // Convert to unsigned 32-bit integer and then to hex
    return (hash >>> 0).toString(16);
  }

  /**
   * Get cached analysis result if available and not expired
   */
  get(code: string, language: string, reviewTypes: ReviewType[]): AnalysisResult | null {
    const key = this.generateKey(code, language, reviewTypes);
    const entry = this.cache.get(key);

    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.createdAt > this.config.ttlMs) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    // Update access time and hit count
    entry.accessedAt = now;
    entry.hits++;
    this.hitCount++;

    // Mark the result as cached
    return {
      ...entry.result,
      metadata: {
        ...entry.result.metadata,
        fromCache: true,
        cacheHits: entry.hits,
      },
    };
  }

  /**
   * Store an analysis result in the cache
   */
  set(code: string, language: string, reviewTypes: ReviewType[], result: AnalysisResult): void {
    const key = this.generateKey(code, language, reviewTypes);
    const now = Date.now();

    // Evict if at capacity
    if (this.cache.size >= this.config.maxEntries && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      result: {
        ...result,
        metadata: {
          ...result.metadata,
          cachedAt: new Date().toISOString(),
        },
      },
      createdAt: now,
      accessedAt: now,
      hits: 0,
    });
  }

  /**
   * Check if a cached result exists (without affecting stats)
   */
  has(code: string, language: string, reviewTypes: ReviewType[]): boolean {
    const key = this.generateKey(code, language, reviewTypes);
    const entry = this.cache.get(key);

    if (!entry) return false;

    // Check expiration
    if (Date.now() - entry.createdAt > this.config.ttlMs) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Evict the least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessedAt < oldestTime) {
        oldestTime = entry.accessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Remove expired entries periodically
   */
  private startCleanup(): void {
    // Clean up every hour
    this.cleanupInterval = setInterval(
      () => {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
          if (now - entry.createdAt > this.config.ttlMs) {
            this.cache.delete(key);
          }
        }
      },
      60 * 60 * 1000
    ); // 1 hour

    // Prevent the interval from keeping the process alive in serverless
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.hitCount + this.missCount;
    let oldestAge: number | null = null;

    if (this.cache.size > 0) {
      const now = Date.now();
      let oldestCreated = now;

      for (const entry of this.cache.values()) {
        if (entry.createdAt < oldestCreated) {
          oldestCreated = entry.createdAt;
        }
      }

      oldestAge = now - oldestCreated;
    }

    return {
      totalEntries: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
      oldestEntryAge: oldestAge,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Get the number of cached entries
   */
  size(): number {
    return this.cache.size;
  }
}

// Singleton instance for the application
export const analysisCache = new AnalysisCache();
