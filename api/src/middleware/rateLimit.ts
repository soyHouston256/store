import type { RequestHandler } from 'express';
import { HttpError } from './errorHandler.js';

/**
 * In-memory fixed-window rate limit per client IP (design §5.3, C5). Good
 * enough for the single api replica in compose; `app.set('trust proxy', 1)`
 * makes `req.ip` the address Caddy forwards. `now` is injectable for tests.
 *
 * Exceeding `max` within `windowMs` answers 429 `RATE_LIMITED` with a
 * `Retry-After` header (seconds until the window resets). Expired entries
 * are pruned on every call so the map never grows past the active IPs.
 */
export interface RateLimitOptions {
  windowMs: number;
  max: number;
  now?: () => number;
}

export interface RateLimiter extends RequestHandler {
  /** Forget every client — used between tests. */
  reset(): void;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export function rateLimit({ windowMs, max, now = Date.now }: RateLimitOptions): RateLimiter {
  const buckets = new Map<string, Bucket>();

  const prune = (at: number): void => {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= at) buckets.delete(key);
    }
  };

  const handler: RequestHandler = (req, res, next) => {
    const at = now();
    prune(at);

    const key = req.ip ?? 'unknown';
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { count: 0, resetAt: at + windowMs };
      buckets.set(key, bucket);
    }

    if (bucket.count >= max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - at) / 1000))));
      next(new HttpError('RATE_LIMITED', 'Too many requests, try again later'));
      return;
    }

    bucket.count += 1;
    next();
  };

  const limiter = handler as RateLimiter;
  limiter.reset = () => buckets.clear();
  return limiter;
}
