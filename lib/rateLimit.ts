import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window store
const ipHits = new Map<string, RateLimitRecord>();

// Automatic cleanup every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipHits.entries()) {
      if (now > record.resetTime) {
        ipHits.delete(ip);
      }
    }
  }, 300000);
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

interface CheckRateLimitOptions {
  limit: number;      // max requests per window
  windowMs: number;   // window size in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfterSec: number;
}

export function checkRateLimit(
  request: NextRequest,
  options: CheckRateLimitOptions = { limit: 12, windowMs: 60000 }
): RateLimitResult {
  const ip = getClientIp(request);
  const now = Date.now();

  const record = ipHits.get(ip);

  if (!record || now > record.resetTime) {
    // New window for this IP
    ipHits.set(ip, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetTime: now + options.windowMs,
      retryAfterSec: 0,
    };
  }

  // Existing window
  if (record.count >= options.limit) {
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfterSec: Math.max(1, retryAfterSec),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: options.limit - record.count,
    resetTime: record.resetTime,
    retryAfterSec: 0,
  };
}
