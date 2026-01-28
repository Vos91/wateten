// Simple in-memory rate limiter
// For production with multiple instances, use Redis (e.g., @upstash/ratelimit)

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  maxRequests: number;   // Max requests per window
  windowMs: number;      // Time window in milliseconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;       // Seconds until reset
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60 * 1000 }
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // First request or window expired
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: Math.ceil(config.windowMs / 1000),
    };
  }

  // Within window
  if (entry.count < config.maxRequests) {
    entry.count++;
    return {
      success: true,
      remaining: config.maxRequests - entry.count,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Rate limited
  return {
    success: false,
    remaining: 0,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback
  return "unknown";
}
