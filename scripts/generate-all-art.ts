import * as dotenv from "dotenv"
import * as fal from "@fal-ai/serverless-client"
import { put } from "@vercel/blob"
import * as fs from "fs"
import * as path from "path"
import { parse } from "csv-parse/sync"

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" })

fal.config({
  credentials: process.env.FAL_KEY,
})

interface ArtAsset {
  Category: string
  Item: string
  Level?: string
  Quantity?: string
  Size: string
  Format: string
  Specific_Prompt: string
  Filename: string
  Priority: string
}

async function generateImage(prompt: string, filename: string) {
  console.log(`[v0] Generating: ${filename}`)
  console.log(`[v0] Prompt: ${prompt.substring(0, 100)}...`)

  try {
    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: prompt,
        image_size: "square",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: false,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`[v0] Progress: ${filename}`)
        }
      },
    })

    // result from fal.subscribe is directly the data, not wrapped in .data
    if (result.images && result.images[0]) {
      const imageUrl = result.images[0].url
      console.log(`[v0] Generated: ${filename} - ${imageUrl}`)

      // Download image
      const response = await fetch(imageUrl)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload to Vercel Blob
      const blob = await put(filename, buffer, {
        access: "public",
        contentType: `image/${path.extname(filename).slice(1)}`,
      })

      console.log(`[v0] Uploaded to blob: ${blob.url}`)
      return blob.url
    } else {
      console.error(`[v0] No image generated for ${filename}`)
      console.error(`[v0] Result:`, JSON.stringify(result, null, 2))
      return null
    }
  } catch (error) {
    console.error(`[v0] Error generating ${filename}:`, error)
    return null
  }
}

async function processCSV(csvPath: string) {
  console.log(`[v0] Processing CSV: ${csvPath}`)

  const csvContent = fs.readFileSync(csvPath, "utf-8")
  const records: ArtAsset[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  })

  console.log(`[v0] Found ${records.length} assets to generate`)

  const results: { filename: string; url: string | null }[] = []

  for (const record of records) {
    // Skip if not HIGH priority (optional - remove this to generate all)
    // if (record.Priority !== 'HIGH') {
    //   console.log(`[v0] Skipping ${record.Filename} (priority: ${record.Priority})`)
    //   continue
    // }

    const url = await generateImage(record.Specific_Prompt, record.Filename)
    results.push({ filename: record.Filename, url })

    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  return results
}

async function main() {
  console.log("[v0] Starting art generation process...")
  console.log("[v0] Using fal-ai/flux/dev model")

  const csvFiles = [
    "art-assets-detailed.csv",
  ]

  const allResults: { filename: string; url: string | null }[] = []

  for (const csvFile of csvFiles) {
    console.log(`\n[v0] ========== Processing ${csvFile} ==========\n`)
    const results = await processCSV(csvFile)
    allResults.push(...results)
  }

  // Save results to JSON
  const resultsJson = JSON.stringify(allResults, null, 2)
  fs.writeFileSync("art-generation-results.json", resultsJson)

  console.log("\n[v0] ========== Generation Complete ==========")
  console.log(`[v0] Total assets processed: ${allResults.length}`)
  console.log(`[v0] Successful: ${allResults.filter((r) => r.url).length}`)
  console.log(`[v0] Failed: ${allResults.filter((r) => !r.url).length}`)
  console.log("[v0] Results saved to art-generation-results.json")
}

main().catch(console.error)
