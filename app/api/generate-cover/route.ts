import { NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: `Album cover art: ${prompt}. Professional music album cover design, high quality, vibrant colors, urban hip-hop aesthetic`,
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
