/**
 * API Authentication Middleware
 * Provides authentication checks for API routes using Supabase Auth
 *
 * Usage:
 * ```typescript
 * import { requireAuth, optionalAuth } from '@/lib/api-auth'
 *
 * export async function POST(request: Request) {
 *   const { user, error } = await requireAuth(request)
 *   if (error) return error
 *
 *   // user is authenticated, proceed with request
 * }
 * ```
 */

import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"

export interface AuthResult {
  user: {
    id: string
    email?: string
  } | null
  error: NextResponse | null
}

/**
 * Require authentication for API endpoint
 * Returns user if authenticated, or error response if not
 *
 * @param request - Next.js request object
 * @returns { user, error } - user object or error response
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[API Auth] Unauthorized access attempt:", authError?.message || "No user")

      return {
        user: null,
        error: NextResponse.json(
          {
            error: "Unauthorized",
            message: "Authentication required. Please log in.",
            code: "AUTH_REQUIRED",
          },
          { status: 401 }
        ),
      }
    }

    // User is authenticated
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      error: null,
    }
  } catch (error) {
    console.error("[API Auth] Authentication error:", error)

    // Log to Sentry
    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: { scope: "api_auth" },
      })
    }

    return {
      user: null,
      error: NextResponse.json(
        {
          error: "Internal Server Error",
          message: "Failed to authenticate request",
          code: "AUTH_ERROR",
        },
        { status: 500 }
      ),
    }
  }
}

/**
 * Optional authentication for API endpoint
 * Returns user if authenticated, or null if not (without error)
 *
 * Use for endpoints that work for both authenticated and anonymous users
 * Example: Public leaderboards that show more data for authenticated users
 *
 * @param request - Next.js request object
 * @returns { user, error } - user object or null (no error response)
 */
export async function optionalAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    return {
      user: user
        ? {
            id: user.id,
            email: user.email,
          }
        : null,
      error: null,
    }
  } catch (error) {
    console.error("[API Auth] Optional auth error:", error)

    // For optional auth, we don't return error response
    // Just return null user
    return {
      user: null,
      error: null,
    }
  }
}

/**
 * Check if user has specific permission/role
 * Can be extended for role-based access control (RBAC)
 *
 * @param userId - User ID to check
 * @param permission - Permission to check (e.g., 'admin', 'moderator')
 * @returns boolean - true if user has permission
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  // TODO: Implement RBAC when needed
  // For now, all authenticated users have same permissions

  // Example implementation:
  // const supabase = createClient()
  // const { data } = await supabase
  //   .from('user_roles')
  //   .select('role')
  //   .eq('user_id', userId)
  //   .single()
  //
  // return data?.role === permission

  return true
}

/**
 * Rate limit check per user
 * Returns error if user exceeded rate limit
 *
 * @param userId - User ID
 * @param endpoint - API endpoint name
 * @param limit - Max requests per window
 * @param windowMs - Time window in milliseconds
 * @returns { allowed, error } - whether request is allowed and optional error response
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<{ allowed: boolean; error: NextResponse | null }> {
  // TODO: Implement rate limiting
  // This is a placeholder that always allows requests
  // Real implementation should use Redis or similar

  // Example implementation:
  // const key = `ratelimit:${endpoint}:${userId}`
  // const requests = await redis.incr(key)
  //
  // if (requests === 1) {
  //   await redis.expire(key, Math.floor(windowMs / 1000))
  // }
  //
  // if (requests > limit) {
  //   return {
  //     allowed: false,
  //     error: NextResponse.json(
  //       {
  //         error: 'Rate Limit Exceeded',
  //         message: `Too many requests. Try again later.`,
  //         code: 'RATE_LIMIT_EXCEEDED',
  //       },
  //       { status: 429 }
  //     ),
  //   }
  // }

  return {
    allowed: true,
    error: null,
  }
}

/**
 * Validate API key for service-to-service communication
 * Use for webhooks, cron jobs, etc.
 *
 * @param request - Next.js request object
 * @returns boolean - true if API key is valid
 */
export async function validateApiKey(request: NextRequest): Promise<boolean> {
  const apiKey = request.headers.get("x-api-key")

  if (!apiKey) {
    return false
  }

  // Check against environment variable
  const validApiKey = process.env.API_SECRET_KEY

  if (!validApiKey) {
    console.warn("[API Auth] API_SECRET_KEY not configured")
    return false
  }

  return apiKey === validApiKey
}

/**
 * Get user ID from request (convenience function)
 * Returns user ID if authenticated, null otherwise
 *
 * @param request - Next.js request object
 * @returns string | null - user ID or null
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  const { user } = await optionalAuth(request)
  return user?.id || null
}

/**
 * CORS helper for API routes
 * Add CORS headers to response
 *
 * @param response - NextResponse object
 * @param origin - Allowed origin (default: *)
 * @returns NextResponse with CORS headers
 */
export function addCorsHeaders(response: NextResponse, origin: string = "*"): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", origin)
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  response.headers.set("Access-Control-Max-Age", "86400") // 24 hours

  return response
}

/**
 * Handle OPTIONS request for CORS preflight
 *
 * @returns NextResponse with CORS headers
 */
export function handleCorsPreflightRequest(): NextResponse {
  const response = new NextResponse(null, { status: 204 })
  return addCorsHeaders(response)
}
