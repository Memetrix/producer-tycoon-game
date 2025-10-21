# Sentry Setup Guide

## Overview

Sentry is configured for comprehensive error tracking across the entire application:
- ✅ Client-side errors (React components)
- ✅ Server-side errors (API routes, Server Components)
- ✅ Edge runtime errors (Middleware)
- ✅ Error Boundaries (React)
- ✅ Performance monitoring (optional)

## Setup Instructions

### 1. Create Sentry Project

1. Go to [sentry.io](https://sentry.io)
2. Create new project
3. Select **Next.js** as platform
4. Copy your DSN

### 2. Add Environment Variables

Add to `.env.local`:

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-project
SENTRY_DSN=https://your-key@sentry.io/your-project
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token
```

**Important:**
- `NEXT_PUBLIC_SENTRY_DSN` - Used by client-side (public)
- `SENTRY_DSN` - Used by server-side (private)
- Both can be the same DSN

### 3. Add to Vercel (Production)

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all Sentry variables
3. Redeploy

## Configuration Files

### Client Configuration (`sentry.client.config.ts`)

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% when error occurs

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,      // Privacy: mask all text
      blockAllMedia: true,    // Privacy: block all media
    }),
  ],
})
```

### Server Configuration (`sentry.server.config.ts`)

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,

  beforeSend(event) {
    // Filter out expected errors
    if (event.message?.includes("Auth session missing")) {
      return null // Don't send to Sentry
    }
    return event
  },
})
```

## Error Boundaries

### Global Error Boundary (app/layout.tsx)

```tsx
import { ErrorBoundary } from "@/components/error-boundary"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

### Page-Level Error Handling (app/error.tsx)

```tsx
"use client"

import * as Sentry from "@sentry/nextjs"

export default function Error({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return <div>Something went wrong!</div>
}
```

### Global Error (app/global-error.tsx)

Catches errors in root layout (rare, but critical):

```tsx
"use client"

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <h2>Critical Error</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  )
}
```

## Usage in Code

### Capture Custom Errors

```typescript
import { captureError } from "@/lib/sentry-utils"

try {
  // risky operation
} catch (error) {
  captureError(error, {
    tags: { context: "payment" },
    extra: { userId: user.id },
  })
}
```

### Track User Context

```typescript
import { setSentryUser, clearSentryUser } from "@/lib/sentry-utils"

// After login
setSentryUser({
  id: user.id,
  email: user.email,
  username: user.username,
})

// After logout
clearSentryUser()
```

### Add Breadcrumbs (debugging trail)

```typescript
import { addSentryBreadcrumb } from "@/lib/sentry-utils"

addSentryBreadcrumb("User clicked button", "ui", "info", {
  buttonId: "submit",
})
```

### Track API Errors

```typescript
import { trackApiError } from "@/lib/sentry-utils"

try {
  const response = await fetch("/api/endpoint")
  if (!response.ok) {
    throw new Error("API failed")
  }
} catch (error) {
  trackApiError("/api/endpoint", error, response?.status)
}
```

### Track Game Events

```typescript
import { trackGameEvent } from "@/lib/sentry-utils"

trackGameEvent("beat_created", {
  beatId: beat.id,
  quality: beat.quality,
  style: beat.style,
})
```

## Filtering Errors

### Client-Side Filtering

In `sentry.client.config.ts`:

```typescript
beforeSend(event) {
  // Ignore network errors
  if (event.exception?.values?.[0]?.value?.includes("Failed to fetch")) {
    return null
  }

  // Ignore cancelled requests
  if (event.exception?.values?.[0]?.type === "AbortError") {
    return null
  }

  return event
}
```

### Server-Side Filtering

In `sentry.server.config.ts`:

```typescript
beforeSend(event) {
  // Ignore expected auth errors
  if (event.message?.includes("Unauthorized")) {
    return null
  }

  // Ignore rate limit errors (expected)
  if (event.message?.includes("Rate limit")) {
    return null
  }

  // Ignore validation errors (expected)
  if (event.message?.includes("Validation Error")) {
    return null
  }

  return event
}
```

## Performance Monitoring

### Enable Performance Tracing

```typescript
import { startTransaction } from "@/lib/sentry-utils"

const transaction = startTransaction("create_beat", "task")

try {
  // Perform operation
  const beat = await createBeat(data)

  transaction.setStatus("ok")
} catch (error) {
  transaction.setStatus("internal_error")
  throw error
} finally {
  transaction.finish()
}
```

### Track Performance Metrics

```typescript
import { trackPerformance } from "@/lib/sentry-utils"

const start = Date.now()
await expensiveOperation()
const duration = Date.now() - start

trackPerformance("expensive_operation", duration, {
  itemCount: items.length,
})
```

## Sentry Dashboard

### Viewing Errors

1. Go to sentry.io → Your Project
2. Click **Issues** to see all errors
3. Click on an issue to see:
   - Stack trace
   - User context (ID, email)
   - Breadcrumbs (user actions before error)
   - Device/browser info
   - Error count & frequency

### Setting Up Alerts

1. Go to **Alerts** → **Create Alert**
2. Choose trigger:
   - Error frequency (e.g., >10 errors/hour)
   - New issue created
   - Performance degradation
3. Choose notification:
   - Email
   - Slack
   - Discord
   - PagerDuty

### Release Tracking

Track errors by release version:

```bash
# In next.config.js
module.exports = {
  sentry: {
    release: process.env.VERCEL_GIT_COMMIT_SHA,
  },
}
```

## Testing

### Test Error Boundary

Create a test component:

```tsx
function TestError() {
  throw new Error("Test error boundary!")
  return null
}

// Use in page:
<ErrorBoundary>
  <TestError />
</ErrorBoundary>
```

### Test Sentry Capture

```typescript
import * as Sentry from "@sentry/nextjs"

// Manually capture test error
Sentry.captureException(new Error("Test Sentry integration"))
```

### Test Performance

```typescript
const transaction = Sentry.startTransaction({
  name: "test-transaction",
  op: "test",
})

setTimeout(() => {
  transaction.finish()
}, 1000)
```

## Best Practices

### 1. Don't Over-Report

❌ **Bad:** Report every expected error
```typescript
if (!user) {
  Sentry.captureException(new Error("No user")) // Don't do this
  return
}
```

✅ **Good:** Only report unexpected errors
```typescript
if (!user) {
  console.log("No user found")
  return
}

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error) // Unexpected error
}
```

### 2. Add Context

❌ **Bad:** No context
```typescript
Sentry.captureException(error)
```

✅ **Good:** Rich context
```typescript
Sentry.captureException(error, {
  tags: {
    feature: "payment",
    action: "checkout",
  },
  extra: {
    userId: user.id,
    cartTotal: cart.total,
    items: cart.items.length,
  },
  level: "error",
})
```

### 3. Set User Context Early

```typescript
// In auth callback
useEffect(() => {
  if (user) {
    setSentryUser({
      id: user.id,
      email: user.email,
    })
  } else {
    clearSentryUser()
  }
}, [user])
```

### 4. Use Breadcrumbs for Debugging

```typescript
// Track user journey
addSentryBreadcrumb("Opened beat editor", "navigation")
addSentryBreadcrumb("Selected sample", "action", "info", { sampleId })
addSentryBreadcrumb("Clicked export", "action")

// When error occurs, breadcrumbs show the path
```

## Cost Optimization

Sentry pricing is based on:
- **Events** (errors captured)
- **Transactions** (performance samples)
- **Replays** (session recordings)

### Free Tier Limits

- 5,000 errors/month
- 10,000 transactions/month
- 50 replays/month

### Optimization Tips

1. **Sample transactions** (not every request):
   ```typescript
   tracesSampleRate: 0.1 // Only 10%
   ```

2. **Sample replays** (not every session):
   ```typescript
   replaysSessionSampleRate: 0.1 // Only 10%
   ```

3. **Filter expected errors**:
   ```typescript
   beforeSend(event) {
     if (isExpectedError(event)) return null
     return event
   }
   ```

4. **Use environments**:
   ```typescript
   environment: process.env.NODE_ENV // dev/staging/prod
   ```

## Troubleshooting

### Errors Not Appearing

1. Check DSN is correct
2. Check environment variables loaded
3. Check `beforeSend` not filtering everything
4. Check Sentry.init() is called

### Too Many Errors

1. Check `beforeSend` filtering
2. Reduce sample rates
3. Fix recurring errors

### Performance Impact

Sentry adds ~10-20ms overhead per error. Negligible for most apps.

---

**Status:** ✅ Fully Configured
**Last Updated:** 2025-10-21
**Documentation:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
