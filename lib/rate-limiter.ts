/**
 * Rate Limiter using Vercel KV (Redis)
 *
 * Provides multiple rate limiting strategies:
 * 1. Per-user limits (authenticated users)
 * 2. Per-IP limits (unauthenticated users)
 * 3. Per-endpoint custom limits
 *
 * Usage:
 * ```typescript
 * import { checkRateLimit } from "@/lib/rate-limiter"
 *
 * export async function POST(request: NextRequest) {
 *   const { allowed, error } = await checkRateLimit(request, {
 *     identifier: user?.id,
 *     limit: 10,
 *     window: 60,
 *   })
 *   if (!allowed) return error
 *   // ... endpoint logic
 * }
 * ```
 */

import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export interface RateLimitConfig {
  /** Unique identifier (user ID or IP) */
  identifier?: string | null
  /** Max requests per window */
  limit: number
  /** Time window in seconds */
  window: number
  /** Endpoint name for better logging */
  endpoint?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number
  error: NextResponse | null
}

/**
 * Check if request is within rate limit
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    // Get identifier (user ID or IP)
    const identifier = config.identifier || getIpAddress(request)
    if (!identifier) {
      console.warn("[Rate Limiter] No identifier found, allowing request")
      return {
        allowed: true,
        remaining: config.limit,
        reset: Date.now() + config.window * 1000,
        error: null,
      }
    }

    // Create Redis key
    const key = `rate_limit:${config.endpoint || "api"}:${identifier}`

    // Get current count
    const current = await kv.get<number>(key)
    const count = current || 0

    // Check if over limit
    if (count >= config.limit) {
      const ttl = await kv.ttl(key)
      const resetTime = Date.now() + (ttl > 0 ? ttl * 1000 : config.window * 1000)

      console.warn(`[Rate Limiter] Rate limit exceeded for ${identifier} on ${config.endpoint || "api"}`)

      return {
        allowed: false,
        remaining: 0,
        reset: resetTime,
        error: NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: `Too many requests. Please try again in ${Math.ceil((resetTime - Date.now()) / 1000)} seconds.`,
            code: "RATE_LIMIT_EXCEEDED",
            limit: config.limit,
            remaining: 0,
            reset: resetTime,
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": config.limit.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": resetTime.toString(),
              "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
            },
          }
        ),
      }
    }

    // Increment counter
    const newCount = count + 1
    await kv.set(key, newCount, { ex: config.window })

    const remaining = config.limit - newCount
    const resetTime = Date.now() + config.window * 1000

    console.log(
      `[Rate Limiter] ${identifier} on ${config.endpoint || "api"}: ${newCount}/${config.limit} (${remaining} remaining)`
    )

    return {
      allowed: true,
      remaining,
      reset: resetTime,
      error: null,
    }
  } catch (error) {
    console.error("[Rate Limiter] Error checking rate limit:", error)
    // On error, allow request (fail open)
    return {
      allowed: true,
      remaining: config.limit,
      reset: Date.now() + config.window * 1000,
      error: null,
    }
  }
}

/**
 * Get IP address from request
 */
function getIpAddress(request: NextRequest): string | null {
  // Try Vercel headers first
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("cf-connecting-ip") || // Cloudflare
    null

  return ip
}

/**
 * Preset rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  /** AI generation endpoints (expensive) - 10 requests per minute */
  AI_GENERATION: {
    limit: 10,
    window: 60,
  },
  /** File upload endpoints - 20 requests per minute */
  FILE_UPLOAD: {
    limit: 20,
    window: 60,
  },
  /** Data query endpoints - 100 requests per minute */
  DATA_QUERY: {
    limit: 100,
    window: 60,
  },
  /** Public endpoints (leaderboards) - 200 requests per minute */
  PUBLIC: {
    limit: 200,
    window: 60,
  },
} as const

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set("X-RateLimit-Limit", result.remaining.toString())
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
  response.headers.set("X-RateLimit-Reset", result.reset.toString())
  return response
}
