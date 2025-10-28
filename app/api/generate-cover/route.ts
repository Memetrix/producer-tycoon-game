import { NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: Request) {
  try {
    const { prompt, style } = await request.json()

    const styleKeywords = {
      "Hip-Hop": "graffiti wall, urban street, boombox, turntables",
      Trap: "purple neon lights, luxury car, diamonds, night city",
      "R&B": "smooth gradient, vinyl record, microphone, studio vibes",
      Pop: "colorful confetti, stage lights, disco ball, party atmosphere",
      Electronic: "synthesizer, laser lights, cyberpunk, digital waves",
    }

    const styleHint = styleKeywords[style as keyof typeof styleKeywords] || "urban music vibes"

    const enhancedPrompt = `2D game art album cover for "${prompt}", ${styleHint}, cel shaded illustration style, bold outlines, flat colors, posterized shading, 2000s Y2K aesthetic, MTV era vibes, vibrant colors, clean composition, square format, game UI asset`

    const negativePrompt =
      "text, letters, words, typography, writing, alphabet, characters, numbers, symbols, watermark, signature, logo, title, caption, label, readable text, font, script, calligraphy, graffiti text, street signs with text, photorealistic, 3D render, photograph, realistic texture, detailed skin, bokeh, depth of field, lens flare, film grain"

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: enhancedPrompt,
        negative_prompt: negativePrompt,
        image_size: "square",
        num_inference_steps: 4,
        num_images: 1,
      },
      logs: true,
    })

    return NextResponse.json({ imageUrl: result.images[0].url })
  } catch (error) {
    console.error("[v0] Error generating cover:", error)
    return NextResponse.json({ error: "Failed to generate cover" }, { status: 500 })
  }
}
