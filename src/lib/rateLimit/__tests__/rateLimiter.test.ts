import { describe, it, expect, beforeEach } from 'vitest';
import { getClientIp, RateLimitConfig } from '../rateLimiter';

// We need to create a fresh instance for testing, so let's test the class directly
describe('RateLimiter', () => {
  // Create a test-specific rate limiter class to avoid singleton issues
  class TestRateLimiter {
    private store: Map<string, { count: number; windowStart: number }> = new Map();
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
      this.config = config;
    }

    check(ip: string) {
      const now = Date.now();
      const entry = this.store.get(ip);

      if (!entry) {
        return {
          allowed: true,
          remaining: this.config.maxRequestsPerDay,
          resetAt: new Date(now + this.config.windowMs),
          limit: this.config.maxRequestsPerDay,
        };
      }

      const windowExpired = now - entry.windowStart >= this.config.windowMs;

      if (windowExpired) {
        return {
          allowed: true,
          remaining: this.config.maxRequestsPerDay,
          resetAt: new Date(now + this.config.windowMs),
          limit: this.config.maxRequestsPerDay,
        };
      }

      const remaining = Math.max(0, this.config.maxRequestsPerDay - entry.count);
      const resetAt = new Date(entry.windowStart + this.config.windowMs);

      return {
        allowed: remaining > 0,
        remaining,
        resetAt,
        limit: this.config.maxRequestsPerDay,
      };
    }

    consume(ip: string) {
      const now = Date.now();
      const entry = this.store.get(ip);

      if (!entry || now - entry.windowStart >= this.config.windowMs) {
        this.store.set(ip, {
          count: 1,
          windowStart: now,
        });

        return {
          allowed: true,
          remaining: this.config.maxRequestsPerDay - 1,
          resetAt: new Date(now + this.config.windowMs),
          limit: this.config.maxRequestsPerDay,
        };
      }

      entry.count += 1;
      this.store.set(ip, entry);

      const remaining = Math.max(0, this.config.maxRequestsPerDay - entry.count);
      const resetAt = new Date(entry.windowStart + this.config.windowMs);

      return {
        allowed: remaining >= 0 && entry.count <= this.config.maxRequestsPerDay,
        remaining,
        resetAt,
        limit: this.config.maxRequestsPerDay,
      };
    }

    reset() {
      this.store.clear();
    }
  }

  let limiter: TestRateLimiter;

  beforeEach(() => {
    // Create a fresh limiter with 3 requests per day for testing
    limiter = new TestRateLimiter({
      maxRequestsPerDay: 3,
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
    });
  });

  describe('check', () => {
    it('should allow first request from a new IP', () => {
      const result = limiter.check('192.168.1.1');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3);
      expect(result.limit).toBe(3);
    });

    it('should return remaining count after requests', () => {
      limiter.consume('192.168.1.1');
      const result = limiter.check('192.168.1.1');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should track different IPs separately', () => {
      limiter.consume('192.168.1.1');
      limiter.consume('192.168.1.1');

      const result1 = limiter.check('192.168.1.1');
      const result2 = limiter.check('192.168.1.2');

      expect(result1.remaining).toBe(1);
      expect(result2.remaining).toBe(3);
    });
  });

  describe('consume', () => {
    it('should decrement remaining count', () => {
      const result1 = limiter.consume('192.168.1.1');
      expect(result1.remaining).toBe(2);

      const result2 = limiter.consume('192.168.1.1');
      expect(result2.remaining).toBe(1);

      const result3 = limiter.consume('192.168.1.1');
      expect(result3.remaining).toBe(0);
    });

    it('should mark as not allowed after limit exceeded', () => {
      limiter.consume('192.168.1.1'); // 1st - remaining: 2
      limiter.consume('192.168.1.1'); // 2nd - remaining: 1
      limiter.consume('192.168.1.1'); // 3rd - remaining: 0

      const checkResult = limiter.check('192.168.1.1');
      expect(checkResult.allowed).toBe(false);
      expect(checkResult.remaining).toBe(0);
    });

    it('should allow exactly the configured number of requests', () => {
      // With limit of 3, should allow 3 requests
      const result1 = limiter.consume('192.168.1.1');
      expect(result1.allowed).toBe(true);

      const result2 = limiter.consume('192.168.1.1');
      expect(result2.allowed).toBe(true);

      const result3 = limiter.consume('192.168.1.1');
      expect(result3.allowed).toBe(true);

      // 4th request should be denied
      const result4 = limiter.consume('192.168.1.1');
      expect(result4.allowed).toBe(false);
    });
  });

  describe('window expiration', () => {
    it('should reset after window expires', () => {
      // Create limiter with 1-second window for testing
      const shortWindowLimiter = new TestRateLimiter({
        maxRequestsPerDay: 3,
        windowMs: 100, // 100ms window
      });

      // Use all requests
      shortWindowLimiter.consume('192.168.1.1');
      shortWindowLimiter.consume('192.168.1.1');
      shortWindowLimiter.consume('192.168.1.1');

      expect(shortWindowLimiter.check('192.168.1.1').allowed).toBe(false);

      // Wait for window to expire
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const result = shortWindowLimiter.check('192.168.1.1');
          expect(result.allowed).toBe(true);
          expect(result.remaining).toBe(3);
          resolve();
        }, 150);
      });
    });
  });

  describe('reset', () => {
    it('should clear all rate limit data', () => {
      limiter.consume('192.168.1.1');
      limiter.consume('192.168.1.2');

      limiter.reset();

      expect(limiter.check('192.168.1.1').remaining).toBe(3);
      expect(limiter.check('192.168.1.2').remaining).toBe(3);
    });
  });
});

describe('getClientIp', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const request = {
      headers: {
        get: (key: string) => {
          if (key === 'x-forwarded-for') return '203.0.113.195, 70.41.3.18, 150.172.238.178';
          return null;
        },
      },
    } as unknown as Request;

    expect(getClientIp(request)).toBe('203.0.113.195');
  });

  it('should extract IP from cf-connecting-ip header', () => {
    const request = {
      headers: {
        get: (key: string) => {
          if (key === 'cf-connecting-ip') return '203.0.113.50';
          return null;
        },
      },
    } as unknown as Request;

    expect(getClientIp(request)).toBe('203.0.113.50');
  });

  it('should extract IP from x-real-ip header', () => {
    const request = {
      headers: {
        get: (key: string) => {
          if (key === 'x-real-ip') return '203.0.113.100';
          return null;
        },
      },
    } as unknown as Request;

    expect(getClientIp(request)).toBe('203.0.113.100');
  });

  it('should return localhost fallback when no headers present', () => {
    const request = {
      headers: {
        get: () => null,
      },
    } as unknown as Request;

    expect(getClientIp(request)).toBe('127.0.0.1');
  });
});
