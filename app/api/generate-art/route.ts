import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"
import { requireAuth } from "@/lib/api-auth"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limiter"
import { validateRequest, schemas } from "@/lib/api-validation"

fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  // ✅ SECURITY: Require authentication
  const { user, error: authError } = await requireAuth(request)
  if (authError) return authError

  // ✅ SECURITY: Rate limiting (10 requests per minute)
  const { allowed, error: rateLimitError } = await checkRateLimit(request, {
    identifier: user.id,
    ...RATE_LIMITS.AI_GENERATION,
    endpoint: "generate-art",
  })
  if (!allowed) return rateLimitError

  // ✅ SECURITY: Input validation
  const { data: validatedData, error: validationError } = await validateRequest(
    request,
    schemas.generateArt
  )
  if (validationError) return validationError

  const { prompt, size, filename } = validatedData

  try {

    console.log("[v0] Generating art:", filename)

    // Parse size (e.g., "512x512" -> width: 512, height: 512)
    const [width, height] = size.split("x").map(Number)

    // Generate image using FLUX.1 [dev]
    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: prompt,
        image_size: {
          width,
          height,
        },
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: false,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("[v0] Generation progress:", update.logs)
        }
      },
    })

    const imageUrl = result.images[0].url

    return NextResponse.json({
      success: true,
      url: imageUrl,
      filename,
    })
  } catch (error) {
    console.error("[v0] Art generation error:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
