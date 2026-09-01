import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// In-memory ephemeral cache to reduce Redis latency
const ephemeralCache = new Map();

/**
 * Rate Limiter for Swiping (POST /api/swipes)
 * Allows up to 45 swipes per 1 minute per user
 */
export const swipeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(45, "1 m"),
  ephemeralCache,
  prefix: "ratelimit:swipe",
  timeout: 1500,
});

/**
 * Rate Limiter for Resetting Deck (DELETE /api/swipes)
 * Allows up to 4 resets per 1 minute per user
 */
export const resetDeckLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(4, "1 m"),
  ephemeralCache,
  prefix: "ratelimit:reset",
  timeout: 1500,
});

/**
 * Rate Limiter for Fetching Candidates (GET /api/candidates)
 * Allows up to 30 requests per 1 minute per user
 */
export const candidatesLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  ephemeralCache,
  prefix: "ratelimit:candidates",
  timeout: 1500,
});

/**
 * Rate Limiter for Fetching Matches (GET /api/matches)
 * Allows up to 30 requests per 1 minute per user
 */
export const matchesLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  ephemeralCache,
  prefix: "ratelimit:matches",
  timeout: 1500,
});

/**
 * Rate Limiter for Fetching Incoming Likes (GET /api/likes/received)
 * Allows up to 30 requests per 1 minute per user
 */
export const likesReceivedLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  ephemeralCache,
  prefix: "ratelimit:likes_received",
  timeout: 1500,
});

/**
 * Helper to check rate limit safely with graceful fallback
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    const result = await limiter.limit(identifier);
    return result;
  } catch (err) {
    console.warn("Rate limiter warning (allowing request fallback):", err);
    // Graceful fallback if Redis is down/slow
    return {
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    };
  }
}
