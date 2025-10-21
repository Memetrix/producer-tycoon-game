import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"
import { put } from "@vercel/blob"
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
    endpoint: "generate-beat-cover",
  })
  if (!allowed) return rateLimitError

  // ✅ SECURITY: Input validation
  const { data: validatedData, error: validationError } = await validateRequest(
    request,
    schemas.generateBeatCover
  )
  if (validationError) return validationError

  const { beatName } = validatedData

  try {

    console.log("[v0] Generating cover art for beat:", beatName)

    const systemPrompt = `You are a creative art director for hip-hop album covers. Generate unique, creative image prompts for beat cover art. Each prompt should be completely different and imaginative, describing a vivid scene or composition. Be creative with themes, colors, objects, and mood. Never repeat the same ideas.

REQUIRED STYLE (always include): "Cel-shaded art style with bold black outlines, flat vibrant colors, 2000s video game aesthetic like Jet Set Radio, isolated on solid dark gray background (#2a2a2a), centered, no text, no shadows, clean simple shapes, square format"

Your creative part should describe: the main subject, scene composition, color palette, mood, urban/street elements, and any symbolic objects. Make each prompt unique and visually striking.`

    const userPrompt = `Create a unique album cover art prompt for a beat titled: "${beatName}"`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 1.2,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Groq API error:", response.status, errorText)
      throw new Error(`Groq API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ""
    const creativePrompt = text.trim() || beatName

    console.log("[v0] Generated creative prompt:", creativePrompt)

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: creativePrompt,
        image_size: "square_hd", // 512x512 instead of 1024x1024
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: false,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("[v0] Cover generation progress:", update.logs)
        }
      },
    })

    const imageUrl = result.images[0].url

    console.log("[v0] Generated cover image URL:", imageUrl)

    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()

    const filename = `beat-covers/${beatName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}.jpg`

    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/jpeg",
    })

    console.log("[v0] Uploaded cover to Blob:", blob.url)

    return NextResponse.json({
      coverUrl: blob.url,
      originalUrl: imageUrl,
    })
  } catch (error: any) {
    console.error("[v0] Error generating cover art:", error)
    console.error("[v0] Error details:", {
      message: error.message,
      status: error.status,
      type: error.type,
      stack: error.stack?.substring(0, 200),
    })
    return NextResponse.json(
      {
        error: "Failed to generate cover art",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
