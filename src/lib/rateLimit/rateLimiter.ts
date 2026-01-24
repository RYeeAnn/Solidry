/**
 * Rate Limiter for API Protection
 *
 * Implements IP-based rate limiting to protect against abuse and control API costs.
 * Uses in-memory storage suitable for single-instance deployments.
 *
 * For distributed deployments, consider migrating to Redis/Upstash.
 */

export interface RateLimitConfig {
  maxRequestsPerDay: number;
  windowMs: number; // Time window in milliseconds (24 hours = 86400000)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequestsPerDay: 3,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
};

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: RateLimitConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.startCleanup();
  }

  /**
   * Check if a request from the given IP is allowed
   */
  check(ip: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(ip);

    // No previous requests from this IP
    if (!entry) {
      return {
        allowed: true,
        remaining: this.config.maxRequestsPerDay,
        resetAt: new Date(now + this.config.windowMs),
        limit: this.config.maxRequestsPerDay,
      };
    }

    // Check if the window has expired
    const windowExpired = now - entry.windowStart >= this.config.windowMs;

    if (windowExpired) {
      return {
        allowed: true,
        remaining: this.config.maxRequestsPerDay,
        resetAt: new Date(now + this.config.windowMs),
        limit: this.config.maxRequestsPerDay,
      };
    }

    // Window is still active - check the count
    const remaining = Math.max(0, this.config.maxRequestsPerDay - entry.count);
    const resetAt = new Date(entry.windowStart + this.config.windowMs);

    return {
      allowed: remaining > 0,
      remaining,
      resetAt,
      limit: this.config.maxRequestsPerDay,
    };
  }

  /**
   * Record a request from the given IP (call after successful check)
   */
  consume(ip: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(ip);

    // No previous requests or window expired - start fresh
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

    // Increment count within existing window
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

  /**
   * Get rate limit headers for HTTP response
   */
  getHeaders(result: RateLimitResult): Record<string, string> {
    return {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.floor(result.resetAt.getTime() / 1000).toString(),
    };
  }

  /**
   * Clean up expired entries periodically to prevent memory leaks
   */
  private startCleanup(): void {
    // Clean up every hour
    this.cleanupInterval = setInterval(
      () => {
        const now = Date.now();
        for (const [ip, entry] of this.store.entries()) {
          if (now - entry.windowStart >= this.config.windowMs) {
            this.store.delete(ip);
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
   * Get current configuration
   */
  getConfig(): RateLimitConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Reset all rate limit data (useful for testing)
   */
  reset(): void {
    this.store.clear();
  }

  /**
   * Get the number of tracked IPs (useful for monitoring)
   */
  getTrackedCount(): number {
    return this.store.size;
  }
}

// Singleton instance for the application
export const rateLimiter = new RateLimiter();

/**
 * Extract client IP from Next.js request
 * Handles various proxy scenarios (Vercel, Cloudflare, etc.)
 */
export function getClientIp(request: Request): string {
  // Check common headers in order of reliability
  const headers = request.headers;

  // Vercel/Next.js specific
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // x-forwarded-for may contain multiple IPs; the first one is the client
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  // Cloudflare
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  // Standard proxy header
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp;

  // Fallback for local development
  return '127.0.0.1';
}
