/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

import type { NextRequest } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple rate limiter
 * @param key - Unique identifier for the rate limit (e.g., IP address, user ID)
 * @param limit - Maximum number of requests
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60 * 1000, // 1 minute default
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    
    // Clean up old entries periodically
    if (rateLimitStore.size > 1000) {
      cleanupRateLimitStore();
    }
    
    return { allowed: true, remaining: limit - 1, resetTime };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetTime: entry.resetTime };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for IP address
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback (this might not work in all deployments)
  return "unknown";
}

