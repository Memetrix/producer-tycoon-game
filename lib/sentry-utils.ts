/**
 * Sentry utility functions for error tracking and user context
 */

import * as Sentry from "@sentry/nextjs"

/**
 * Set user context for Sentry
 * Call this after user logs in
 */
export function setSentryUser(user: {
  id: string
  email?: string
  username?: string
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })
}

/**
 * Clear user context
 * Call this after user logs out
 */
export function clearSentryUser() {
  Sentry.setUser(null)
}

/**
 * Add breadcrumb for debugging
 * Useful for tracking user actions leading to errors
 */
export function addSentryBreadcrumb(
  message: string,
  category?: string,
  level: Sentry.SeverityLevel = "info",
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  })
}

/**
 * Capture custom error with context
 */
export function captureError(
  error: Error,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, any>
    level?: Sentry.SeverityLevel
  }
) {
  Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    level: context?.level || "error",
  })
}

/**
 * Capture custom message (not an error)
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  })
}

/**
 * Start a new transaction for performance monitoring
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  })
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      if (error instanceof Error) {
        captureError(error, {
          tags: { context: context || "unknown" },
          extra: { args },
        })
      }
      throw error
    }
  }) as T
}

/**
 * Track game events for analytics
 */
export function trackGameEvent(
  event: string,
  data?: Record<string, any>
) {
  addSentryBreadcrumb(event, "game", "info", data)

  // You can also send to other analytics services here
  // e.g., Google Analytics, Mixpanel, etc.
}

/**
 * Track API errors specifically
 */
export function trackApiError(
  endpoint: string,
  error: Error,
  statusCode?: number
) {
  captureError(error, {
    tags: {
      type: "api_error",
      endpoint,
      status_code: statusCode?.toString() || "unknown",
    },
  })
}

/**
 * Track performance metrics
 */
export function trackPerformance(
  name: string,
  duration: number,
  metadata?: Record<string, any>
) {
  addSentryBreadcrumb(
    `Performance: ${name}`,
    "performance",
    "info",
    {
      duration_ms: duration,
      ...metadata,
    }
  )
}
