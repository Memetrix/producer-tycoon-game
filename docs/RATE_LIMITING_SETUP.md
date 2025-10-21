# Rate Limiting Setup Guide

## Overview

Rate limiting has been implemented across all API endpoints to protect against abuse, DoS attacks, and API cost overruns. The system uses Vercel KV (Redis) for distributed rate limiting.

## Configuration

### Rate Limit Tiers

Different endpoints have different rate limits based on their cost and usage patterns:

| Endpoint Type | Limit | Window | Endpoints |
|---------------|-------|--------|-----------|
| **AI Generation** | 10 req/min | 60s | `/generate-beat-cover`, `/generate-beat-name`, `/generate-avatar`, `/generate-cover`, `/generate-art` |
| **File Upload** | 20 req/min | 60s | `/upload-art`, `/upload-music` |
| **Data Query** | 100 req/min | 60s | `/songs` |
| **Public** | 200 req/min | 60s | `/leaderboards` |

### Per-User vs Per-IP

- **Authenticated users**: Rate limited by `user.id`
- **Anonymous users** (public endpoints): Rate limited by IP address
- **Fallback**: If no identifier available, request is allowed (fail-open)

## Setup Instructions

### 1. Create Vercel KV Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `producer-tycoon-game`
3. Navigate to **Storage** → **Create Database**
4. Select **KV (Redis)** → **Continue**
5. Name: `producer-tycoon-rate-limiter`
6. Region: Same as your deployment (e.g., `Washington, D.C., USA (iad1)`)
7. Click **Create**

### 2. Connect to Your Project

1. In the KV database page, click **Connect to Project**
2. Select `producer-tycoon-game`
3. Environment: **Production**, **Preview**, and **Development**
4. Click **Connect**

This will automatically add the following environment variables:

```env
KV_REST_API_URL=https://your-kv-url.upstash.io
KV_REST_API_TOKEN=your-token-here
KV_REST_API_READ_ONLY_TOKEN=your-readonly-token-here
```

### 3. Pull Environment Variables (Local Development)

```bash
cd /Users/alekseigakh/Desktop/Projects/producer-tycoon-game
vercel env pull .env.local
```

This will download the KV credentials to your `.env.local` file.

### 4. Verify Setup

```bash
npm run dev
```

Then test an endpoint:

```bash
curl -X POST http://localhost:3000/api/generate-beat-name \
  -H "Content-Type: application/json" \
  -d '{"originalTrackName": "Test Track"}'
```

Check the response headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1234567890
```

## Rate Limit Response

When a user exceeds their rate limit, they receive a `429 Too Many Requests` response:

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 45 seconds.",
  "code": "RATE_LIMIT_EXCEEDED",
  "limit": 10,
  "remaining": 0,
  "reset": 1234567890
}
```

Headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567890
Retry-After: 45
```

## Implementation Details

### `lib/rate-limiter.ts`

The rate limiter provides:

1. **`checkRateLimit(request, config)`** - Main function to check rate limits
2. **`RATE_LIMITS`** - Preset configurations for different endpoint types
3. **Automatic identifier detection** - Uses user ID or IP address
4. **Fail-open strategy** - On error, allows the request (prevents KV outages from blocking all traffic)

### Example Usage

```typescript
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limiter"

export async function POST(request: NextRequest) {
  const { user } = await requireAuth(request)

  const { allowed, error } = await checkRateLimit(request, {
    identifier: user.id,
    ...RATE_LIMITS.AI_GENERATION,
    endpoint: "my-endpoint",
  })

  if (!allowed) return error

  // ... endpoint logic
}
```

## Monitoring

### View Rate Limit Logs

Check your Vercel deployment logs:

```
[Rate Limiter] user-123 on generate-beat-name: 5/10 (5 remaining)
[Rate Limiter] Rate limit exceeded for user-456 on generate-avatar
```

### View KV Data

1. Go to Vercel Dashboard → Storage → Your KV database
2. Click **Data Browser**
3. Search for keys: `rate_limit:*`

Example keys:

```
rate_limit:generate-beat-name:user-123
rate_limit:leaderboards:192.168.1.1
```

### Reset Rate Limits (Development)

```bash
vercel kv reset
```

Or delete specific keys via the Data Browser.

## Cost Estimation

Vercel KV (Upstash) pricing (as of 2025):

- **Free tier**: 10,000 commands/day
- **Pro tier**: $0.20 per 100K commands

With our rate limits:

- 100 users × 10 AI requests/min = 1,000 req/min = 60,000 req/hour
- Each request = 2 KV commands (GET + SET) = 120,000 commands/hour
- Free tier covers ~83 hours/month of peak usage
- For production, expect ~$20-50/month for moderate traffic

## Troubleshooting

### Rate limits not working

1. Check environment variables are set:
   ```bash
   echo $KV_REST_API_URL
   echo $KV_REST_API_TOKEN
   ```

2. Check Vercel logs for errors:
   ```
   [Rate Limiter] Error checking rate limit: ...
   ```

3. Verify KV database is connected to project

### Rate limits too strict

Adjust limits in `lib/rate-limiter.ts`:

```typescript
export const RATE_LIMITS = {
  AI_GENERATION: {
    limit: 20, // Increase from 10
    window: 60,
  },
  // ...
}
```

### Users getting rate limited unfairly

- Check if multiple users share same IP (office/school network)
- Consider increasing PUBLIC endpoint limits
- Add whitelist for specific user IDs

## Security Notes

1. **Don't bypass rate limits** - Even for admins, to prevent accidents
2. **Monitor for abuse** - Set up alerts for suspicious patterns
3. **Adjust limits based on usage** - Review logs monthly
4. **Fail-open is intentional** - Prevents KV outages from taking down your app

## Next Steps

After deployment:

1. ✅ Monitor rate limit logs for first week
2. ✅ Adjust limits based on actual usage patterns
3. ✅ Set up alerts for rate limit abuse
4. ✅ Consider implementing user tier system (free/premium with different limits)
