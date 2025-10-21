import { put } from "@vercel/blob"
import fs from "fs"
import path from "path"

const OPTIMIZED_DIR = path.join(process.cwd(), "optimized-blob-images")

async function uploadFile(filePath: string, fileName: string): Promise<{ url: string; size: number }> {
  const fileBuffer = fs.readFileSync(filePath)
  const blob = await put(fileName, fileBuffer, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  return {
    url: blob.url,
    size: fileBuffer.length,
  }
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ BLOB_READ_WRITE_TOKEN not found in environment")
    process.exit(1)
  }

  console.log("📤 Starting upload to Blob Storage...\n")

  const categories = ["equipment", "artists", "ui"]
  let totalUploaded = 0
  let totalSize = 0

  for (const category of categories) {
    const categoryDir = path.join(OPTIMIZED_DIR, category)
    if (!fs.existsSync(categoryDir)) {
      console.log(`⚠️  Directory not found: ${categoryDir}`)
      continue
    }

    const files = fs.readdirSync(categoryDir).filter((f) => f.endsWith(".webp"))
    console.log(`\n📦 Uploading ${category} (${files.length} files)...`)

    for (const file of files) {
      try {
        const filePath = path.join(categoryDir, file)
        const { url, size } = await uploadFile(filePath, file)

        totalUploaded++
        totalSize += size

        console.log(`  ✅ ${file} → ${(size / 1024).toFixed(1)}KB`)
      } catch (error) {
        console.error(`  ❌ Failed to upload ${file}:`, error)
      }
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log("📊 UPLOAD SUMMARY")
  console.log("=".repeat(60))
  console.log(`Total files uploaded: ${totalUploaded}`)
  console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log("=".repeat(60))
  console.log("\n✅ All images uploaded successfully!")
  console.log("\n⚠️  Next steps:")
  console.log("1. Update code to use .webp extensions instead of .png")
  console.log("2. Test all images in the app")
  console.log("3. Delete old .png files from Blob Storage")
  console.log("4. Clean up temp directories")
}

main().catch(console.error)
