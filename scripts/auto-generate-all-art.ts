import { fal } from "@fal-ai/client"
import { put } from "@vercel/blob"
import { readFileSync } from "fs"

interface ArtAsset {
  category: string
  name: string
  filename: string
  prompt: string
  size: string
  format: string
  priority: string
}

function parseCSV(content: string, filename: string): ArtAsset[] {
  const lines = content.trim().split("\n")
  const assets: ArtAsset[] = []

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Parse CSV with quoted fields
    const fields: string[] = []
    let current = ""
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        fields.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    fields.push(current.trim())

    // Different CSV structures
    let category, name, prompt, filename_field, size, format, priority

    if (filename.includes("equipment")) {
      // Equipment: Category,Item,Level,Filename,Size,Format,Priority,Prompt
      ;[category, name, , filename_field, size, format, priority, prompt] = fields
    } else {
      // Others: Category,Item,Quantity,Size,Format,Prompt,Filename,Priority
      ;[category, name, , size, format, prompt, filename_field, priority] = fields
    }

    if (category && name && prompt && filename_field) {
      assets.push({
        category,
        name,
        filename: filename_field,
        prompt,
        size,
        format,
        priority,
      })
    }
  }

  return assets
}

async function generateImage(prompt: string, size: string): Promise<string | null> {
  try {
    const [width, height] = size.split("x").map(Number)

    console.log(`[v0] Generating image: ${prompt.substring(0, 60)}...`)

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
    })

    if (result.data?.images?.[0]?.url) {
      return result.data.images[0].url
    }

    return null
  } catch (error) {
    console.error(`[v0] Generation error:`, error)
    return null
  }
}

async function uploadToBlob(imageUrl: string, filename: string): Promise<string> {
  try {
    console.log(`[v0] Uploading to blob: ${filename}`)

    // Fetch the image
    const response = await fetch(imageUrl)
    const blob = await response.blob()

    // Upload to Vercel Blob
    const result = await put(filename, blob, {
      access: "public",
      addRandomSuffix: false,
    })

    console.log(`[v0] Uploaded successfully: ${result.url}`)
    return result.url
  } catch (error) {
    console.error(`[v0] Upload error for ${filename}:`, error)
    throw error
  }
}

async function main() {
  console.log("[v0] Starting automatic art generation...")

  const csvFiles = [
    "public/art-assets-01-equipment.csv",
    "public/art-assets-02-artists.csv",
    "public/art-assets-03-ui-elements.csv",
    "public/art-assets-04-backgrounds.csv",
  ]

  const allAssets: ArtAsset[] = []

  // Load all CSV files
  for (const csvFile of csvFiles) {
    try {
      const content = readFileSync(csvFile, "utf-8")
      const assets = parseCSV(content, csvFile)
      allAssets.push(...assets)
      console.log(`[v0] Loaded ${assets.length} assets from ${csvFile}`)
    } catch (error) {
      console.error(`[v0] Error reading ${csvFile}:`, error)
    }
  }

  console.log(`[v0] Total assets to generate: ${allAssets.length}`)

  // Filter by priority (HIGH first, then MEDIUM, then LOW)
  const highPriority = allAssets.filter((a) => a.priority === "HIGH")
  const mediumPriority = allAssets.filter((a) => a.priority === "MEDIUM")
  const lowPriority = allAssets.filter((a) => a.priority === "LOW")

  const sortedAssets = [...highPriority, ...mediumPriority, ...lowPriority]

  let successCount = 0
  let failCount = 0

  // Generate in batches of 5 to avoid rate limits
  const batchSize = 5
  for (let i = 0; i < sortedAssets.length; i += batchSize) {
    const batch = sortedAssets.slice(i, i + batchSize)

    console.log(
      `\n[v0] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sortedAssets.length / batchSize)}`,
    )

    const promises = batch.map(async (asset) => {
      try {
        // Generate image
        const imageUrl = await generateImage(asset.prompt, asset.size)
        if (!imageUrl) {
          console.error(`[v0] Failed to generate: ${asset.filename}`)
          failCount++
          return
        }

        // Upload to blob
        await uploadToBlob(imageUrl, asset.filename)
        successCount++

        console.log(`[v0] ✓ Completed ${asset.filename} (${successCount}/${sortedAssets.length})`)
      } catch (error) {
        console.error(`[v0] Error processing ${asset.filename}:`, error)
        failCount++
      }
    })

    await Promise.all(promises)

    // Wait 2 seconds between batches to avoid rate limits
    if (i + batchSize < sortedAssets.length) {
      console.log("[v0] Waiting 2 seconds before next batch...")
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  console.log("\n[v0] Generation complete!")
  console.log(`[v0] Success: ${successCount}`)
  console.log(`[v0] Failed: ${failCount}`)
  console.log(`[v0] Total: ${sortedAssets.length}`)
}

main().catch(console.error)
