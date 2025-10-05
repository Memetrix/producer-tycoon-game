import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: `Professional portrait photo of a ${prompt}, realistic, high quality, studio lighting, detailed face, music producer aesthetic, 4k`,
        image_size: "square",
        num_inference_steps: 4,
        num_images: 1,
      },
      logs: true,
    })

    const output = result as { images: Array<{ url: string }> }

    return NextResponse.json({
      imageUrl: output.images[0].url,
    })
  } catch (error) {
    console.error("Error generating avatar:", error)
    return NextResponse.json({ error: "Failed to generate avatar" }, { status: 500 })
  }
}
