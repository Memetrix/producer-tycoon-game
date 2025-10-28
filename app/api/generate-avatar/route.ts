import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

fal.config({
  credentials: process.env.FAL_KEY,
})

const STYLE_MODES = {
  celshade: "cel shaded game art, bold outlines, flat colors, toon shading",
  illustrated: "digital illustration, game character art, clean lines",
  stylized: "stylized 3D render, game character, smooth shading",
}

const ETHNICITIES = [
  "Slavic",
  "Russian",
  "Eastern European",
  "Central Asian",
  "Caucasian",
  "mixed ethnicity",
  "Eurasian",
]

const HAIRSTYLES_MALE = ["spiky hair", "short fade", "buzz cut", "dreadlocks", "curly hair", "slicked back hair"]

const HAIRSTYLES_FEMALE = ["long straight hair", "braids", "high ponytail", "wavy hair", "bob cut"]

const ACCESSORIES = ["sunglasses", "bandana", "cap", "chain necklace", "earrings", "headphones"]

const CLOTHING = ["hoodie", "leather jacket", "tracksuit", "denim jacket", "graphic tee", "bomber jacket"]

const SETTINGS = ["recording studio", "graffiti wall", "city rooftop", "nightclub", "street corner"]

export async function POST(request: NextRequest) {
  try {
    const { prompt, name, gender, musicStyle = "hip-hop" } = await request.json()

    console.log("[v0] Avatar generation request:", { name, gender, musicStyle })

    const genderText = gender === "male" ? "male" : "female"

    const randomEthnicity = ETHNICITIES[Math.floor(Math.random() * ETHNICITIES.length)]
    const randomHairstyle = (gender === "male" ? HAIRSTYLES_MALE : HAIRSTYLES_FEMALE)[
      Math.floor(Math.random() * (gender === "male" ? HAIRSTYLES_MALE.length : HAIRSTYLES_FEMALE.length))
    ]
    const randomAccessory = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)]
    const randomClothing = CLOTHING[Math.floor(Math.random() * CLOTHING.length)]
    const randomSetting = SETTINGS[Math.floor(Math.random() * SETTINGS.length)]
    const styleMode = STYLE_MODES.celshade

    const positivePrompt = `2D game character art, cel shaded illustration, cartoon style, ${genderText} ${randomEthnicity} ${musicStyle} music producer character named ${name}, ${randomHairstyle}, wearing ${randomAccessory}, wearing ${randomClothing}, ${randomSetting} background, bold black outlines, flat colors, toon shading, 2000s MTV era aesthetic, video game character portrait, frontal view, clean composition, illustrated, non-photorealistic, stylized art`

    const negativePrompt = `photorealistic, photo, photograph, realistic, real person, 3D render, CGI, realistic skin texture, pores, skin details, hyperrealistic, lifelike, actual photo, camera, lens, blurry, low quality, multiple people, distorted face, deformed, text, watermark, signature`

    console.log("[v0] Game art prompt:", positivePrompt)
    console.log("[v0] Negative prompt:", negativePrompt)

    const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
      input: {
        prompt: positivePrompt,
        negative_prompt: negativePrompt,
        image_size: "square",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
      },
      logs: true,
    })

    console.log("[v0] Fal.ai result:", result)

    if (!result.images || result.images.length === 0) {
      throw new Error("No image generated")
    }

    const imageUrl = result.images[0].url

    console.log("[v0] Generated avatar URL:", imageUrl)

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("[v0] Error generating avatar:", error)
    return NextResponse.json({ error: "Failed to generate avatar" }, { status: 500 })
  }
}
