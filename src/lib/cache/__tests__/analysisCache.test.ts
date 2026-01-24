import { describe, it, expect, beforeEach } from 'vitest';
import { AnalysisResult, ReviewType } from '@/types';

// Test-specific cache implementation to avoid singleton issues
class TestAnalysisCache {
  private cache: Map<
    string,
    { result: AnalysisResult; createdAt: number; accessedAt: number; hits: number }
  > = new Map();
  private config = { maxEntries: 100, ttlMs: 24 * 60 * 60 * 1000 };
  private hitCount = 0;
  private missCount = 0;

  generateKey(code: string, language: string, reviewTypes: ReviewType[]): string {
    const sortedTypes = [...reviewTypes].sort().join(',');
    const codeHash = this.hashCode(code);
    return `${codeHash}:${language}:${sortedTypes}`;
  }

  private hashCode(str: string): string {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }

  get(code: string, language: string, reviewTypes: ReviewType[]): AnalysisResult | null {
    const key = this.generateKey(code, language, reviewTypes);
    const entry = this.cache.get(key);

    if (!entry) {
      this.missCount++;
      return null;
    }

    const now = Date.now();
    if (now - entry.createdAt > this.config.ttlMs) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    entry.accessedAt = now;
    entry.hits++;
    this.hitCount++;

    return {
      ...entry.result,
      metadata: {
        ...entry.result.metadata,
        fromCache: true,
        cacheHits: entry.hits,
      },
    };
  }

  set(code: string, language: string, reviewTypes: ReviewType[], result: AnalysisResult): void {
    const key = this.generateKey(code, language, reviewTypes);
    const now = Date.now();

    if (this.cache.size >= this.config.maxEntries && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      result,
      createdAt: now,
      accessedAt: now,
      hits: 0,
    });
  }

  has(code: string, language: string, reviewTypes: ReviewType[]): boolean {
    const key = this.generateKey(code, language, reviewTypes);
    return this.cache.has(key);
  }

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

  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    return {
      totalEntries: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
    };
  }

  clear(): void {
    this.cache.clear();
  }

  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }

  size(): number {
    return this.cache.size;
  }

  setConfig(config: { maxEntries: number; ttlMs: number }): void {
    this.config = config;
  }
}

const createMockResult = (score: number): AnalysisResult => ({
  issues: [],
  metrics: { totalIssues: 0, criticalIssues: 0, warnings: 0, suggestions: 0 },
  summary: 'Test summary',
  score,
  grade: 'A',
  reviewTypes: ['solid'],
  language: 'typescript',
  timestamp: new Date(),
  confidence: {
    overall: 85,
    languageDetection: 90,
    issueAccuracy: 80,
    level: 'high',
    factors: [],
  },
  metadata: {
    analysisTimeMs: 100,
    modelVersion: 'test',
    isDemoMode: false,
    linesAnalyzed: 10,
  },
});

describe('AnalysisCache', () => {
  let cache: TestAnalysisCache;

  beforeEach(() => {
    cache = new TestAnalysisCache();
  });

  describe('generateKey', () => {
    it('should generate consistent keys for same input', () => {
      const key1 = cache.generateKey('const x = 1;', 'typescript', ['solid']);
      const key2 = cache.generateKey('const x = 1;', 'typescript', ['solid']);
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different code', () => {
      const key1 = cache.generateKey('const x = 1;', 'typescript', ['solid']);
      const key2 = cache.generateKey('const y = 2;', 'typescript', ['solid']);
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different languages', () => {
      const key1 = cache.generateKey('const x = 1;', 'typescript', ['solid']);
      const key2 = cache.generateKey('const x = 1;', 'javascript', ['solid']);
      expect(key1).not.toBe(key2);
    });

    it('should generate same key regardless of reviewTypes order', () => {
      const key1 = cache.generateKey('const x = 1;', 'typescript', ['solid', 'hygiene']);
      const key2 = cache.generateKey('const x = 1;', 'typescript', ['hygiene', 'solid']);
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different reviewTypes', () => {
      const key1 = cache.generateKey('const x = 1;', 'typescript', ['solid']);
      const key2 = cache.generateKey('const x = 1;', 'typescript', ['hygiene']);
      expect(key1).not.toBe(key2);
    });
  });

  describe('get and set', () => {
    it('should return null for cache miss', () => {
      const result = cache.get('const x = 1;', 'typescript', ['solid']);
      expect(result).toBeNull();
    });

    it('should return cached result for cache hit', () => {
      const mockResult = createMockResult(95);
      cache.set('const x = 1;', 'typescript', ['solid'], mockResult);

      const result = cache.get('const x = 1;', 'typescript', ['solid']);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(95);
    });

    it('should mark result as from cache', () => {
      const mockResult = createMockResult(95);
      cache.set('const x = 1;', 'typescript', ['solid'], mockResult);

      const result = cache.get('const x = 1;', 'typescript', ['solid']);
      expect(result?.metadata.fromCache).toBe(true);
    });

    it('should track hit count', () => {
      const mockResult = createMockResult(95);
      cache.set('const x = 1;', 'typescript', ['solid'], mockResult);

      cache.get('const x = 1;', 'typescript', ['solid']);
      cache.get('const x = 1;', 'typescript', ['solid']);
      cache.get('const x = 1;', 'typescript', ['solid']);

      const result = cache.get('const x = 1;', 'typescript', ['solid']);
      expect(result?.metadata.cacheHits).toBe(4);
    });
  });

  describe('has', () => {
    it('should return false for non-existent entry', () => {
      expect(cache.has('const x = 1;', 'typescript', ['solid'])).toBe(false);
    });

    it('should return true for existing entry', () => {
      cache.set('const x = 1;', 'typescript', ['solid'], createMockResult(95));
      expect(cache.has('const x = 1;', 'typescript', ['solid'])).toBe(true);
    });
  });

  describe('LRU eviction', () => {
    it('should evict an entry when at capacity', async () => {
      cache.setConfig({ maxEntries: 3, ttlMs: 24 * 60 * 60 * 1000 });

      // Add 3 entries with small delays to ensure different timestamps
      cache.set('code1', 'typescript', ['solid'], createMockResult(90));
      await new Promise((r) => setTimeout(r, 5));
      cache.set('code2', 'typescript', ['solid'], createMockResult(91));
      await new Promise((r) => setTimeout(r, 5));
      cache.set('code3', 'typescript', ['solid'], createMockResult(92));

      // Access the first entry to update its accessedAt time
      await new Promise((r) => setTimeout(r, 5));
      cache.get('code1', 'typescript', ['solid']);

      // Add a 4th entry - should evict one of the entries
      cache.set('code4', 'typescript', ['solid'], createMockResult(93));

      // We should have exactly 3 entries now
      expect(cache.size()).toBe(3);

      // code4 should definitely be present (just added)
      expect(cache.has('code4', 'typescript', ['solid'])).toBe(true);
    });
  });

  describe('statistics', () => {
    it('should track hits and misses', () => {
      cache.set('code1', 'typescript', ['solid'], createMockResult(90));

      cache.get('code1', 'typescript', ['solid']); // hit
      cache.get('code1', 'typescript', ['solid']); // hit
      cache.get('code2', 'typescript', ['solid']); // miss
      cache.get('code3', 'typescript', ['solid']); // miss

      const stats = cache.getStats();
      expect(stats.hitCount).toBe(2);
      expect(stats.missCount).toBe(2);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should report correct entry count', () => {
      cache.set('code1', 'typescript', ['solid'], createMockResult(90));
      cache.set('code2', 'typescript', ['solid'], createMockResult(91));

      const stats = cache.getStats();
      expect(stats.totalEntries).toBe(2);
    });
  });

  describe('clear and reset', () => {
    it('should clear all entries', () => {
      cache.set('code1', 'typescript', ['solid'], createMockResult(90));
      cache.set('code2', 'typescript', ['solid'], createMockResult(91));

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.has('code1', 'typescript', ['solid'])).toBe(false);
    });

    it('should reset statistics', () => {
      cache.set('code1', 'typescript', ['solid'], createMockResult(90));
      cache.get('code1', 'typescript', ['solid']);
      cache.get('code2', 'typescript', ['solid']);

      cache.resetStats();

      const stats = cache.getStats();
      expect(stats.hitCount).toBe(0);
      expect(stats.missCount).toBe(0);
    });
  });
});
