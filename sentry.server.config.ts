// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === "development",

  // Filter out low-value errors
  beforeSend(event, hint) {
    const error = hint.originalException

    // Ignore specific errors
    if (error instanceof Error) {
      // Ignore expected auth errors
      if (error.message.includes("Auth session missing")) {
        return null
      }

      // Ignore rate limit errors (expected behavior)
      if (error.message.includes("Rate limit exceeded")) {
        return null
      }

      // Ignore validation errors (expected behavior)
      if (error.message.includes("Validation Error")) {
        return null
      }
    }

    return event
  },

  environment: process.env.NODE_ENV,
})
