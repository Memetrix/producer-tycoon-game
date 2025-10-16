import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"
import { put } from "@vercel/blob"
import { generateText } from "ai"

fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { beatName } = await request.json()

    if (!beatName) {
      return NextResponse.json({ error: "Beat name is required" }, { status: 400 })
    }

    console.log("[v0] Generating cover art for beat:", beatName)

    const { text: creativePrompt } = await generateText({
      model: "openai/gpt-oss-120b",
      system: `You are a creative art director for hip-hop album covers. Generate unique, creative image prompts for beat cover art. Each prompt should be completely different and imaginative, describing a vivid scene or composition. Be creative with themes, colors, objects, and mood. Never repeat the same ideas.

REQUIRED STYLE (always include): "Cel-shaded art style with bold black outlines, flat vibrant colors, 2000s video game aesthetic like Jet Set Radio, isolated on solid dark gray background (#2a2a2a), centered, no text, no shadows, clean simple shapes, square format"

Your creative part should describe: the main subject, scene composition, color palette, mood, urban/street elements, and any symbolic objects. Make each prompt unique and visually striking.`,
      prompt: `Create a unique album cover art prompt for a beat titled: "${beatName}"`,
      temperature: 1.2,
      maxTokens: 200,
    })

    console.log("[v0] Generated creative prompt:", creativePrompt)

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: creativePrompt,
        image_size: "square",
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
