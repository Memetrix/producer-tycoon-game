#!/usr/bin/env tsx
/**
 * Image Optimization Script
 * Converts JPG to WebP with optimal quality and resizing
 */

import sharp from "sharp"
import * as fs from "fs"
import * as path from "path"

interface OptimizationConfig {
  maxWidth: number
  maxHeight: number
  quality: number
  format: "webp" | "jpeg"
}

const CONFIGS: Record<string, OptimizationConfig> = {
  // Meta images - high quality, reasonable size
  icon: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 90,
    format: "webp",
  },
  "og-image": {
    maxWidth: 1200,
    maxHeight: 630,
    quality: 85,
    format: "webp",
  },

  // Onboarding - medium quality, optimized for mobile
  onboarding: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 80,
    format: "webp",
  },

  // Studio background - can be lower quality
  "home-music-studio": {
    maxWidth: 1000,
    maxHeight: 1000,
    quality: 75,
    format: "webp",
  },
}

async function getImageInfo(filePath: string) {
  const metadata = await sharp(filePath).metadata()
  const stats = fs.statSync(filePath)
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    size: stats.size,
    format: metadata.format,
  }
}

async function optimizeImage(inputPath: string, outputPath: string, config: OptimizationConfig) {
  console.log(`\n📸 Processing: ${path.basename(inputPath)}`)

  const beforeInfo = await getImageInfo(inputPath)
  console.log(`   Before: ${beforeInfo.width}x${beforeInfo.height}, ${(beforeInfo.size / 1024).toFixed(1)} KB`)

  await sharp(inputPath)
    .resize(config.maxWidth, config.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: config.quality })
    .toFile(outputPath)

  const afterInfo = await getImageInfo(outputPath)
  const savings = ((1 - afterInfo.size / beforeInfo.size) * 100).toFixed(1)

  console.log(`   After:  ${afterInfo.width}x${afterInfo.height}, ${(afterInfo.size / 1024).toFixed(1)} KB`)
  console.log(`   ✅ Saved: ${savings}% (${((beforeInfo.size - afterInfo.size) / 1024).toFixed(1)} KB)`)

  return {
    before: beforeInfo,
    after: afterInfo,
    savings: parseFloat(savings),
  }
}

async function main() {
  console.log("🎨 Starting image optimization...\n")

  const publicDir = path.join(process.cwd(), "public")
  const images = fs.readdirSync(publicDir).filter((file) => file.endsWith(".jpg"))

  const results: Array<{ file: string; before: number; after: number; savings: number }> = []

  for (const image of images) {
    const inputPath = path.join(publicDir, image)
    const outputPath = path.join(publicDir, image.replace(".jpg", ".webp"))

    // Find matching config
    let config = CONFIGS.onboarding // default
    for (const [key, cfg] of Object.entries(CONFIGS)) {
      if (image.includes(key)) {
        config = cfg
        break
      }
    }

    try {
      const result = await optimizeImage(inputPath, outputPath, config)
      results.push({
        file: image,
        before: result.before.size,
        after: result.after.size,
        savings: result.savings,
      })
    } catch (error) {
      console.error(`   ❌ Error processing ${image}:`, error)
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60))
  console.log("📊 OPTIMIZATION SUMMARY")
  console.log("=".repeat(60))

  const totalBefore = results.reduce((sum, r) => sum + r.before, 0)
  const totalAfter = results.reduce((sum, r) => sum + r.after, 0)
  const totalSavings = ((1 - totalAfter / totalBefore) * 100).toFixed(1)

  console.log(`\nTotal images processed: ${results.length}`)
  console.log(`Before: ${(totalBefore / 1024).toFixed(1)} KB`)
  console.log(`After:  ${(totalAfter / 1024).toFixed(1)} KB`)
  console.log(`Saved:  ${totalSavings}% (${((totalBefore - totalAfter) / 1024).toFixed(1)} KB)`)

  console.log("\n✅ Optimization complete!")
  console.log("\n⚠️  Next steps:")
  console.log("   1. Update code references from .jpg to .webp")
  console.log("   2. Delete old .jpg files after verification")
  console.log("   3. Test all images load correctly")
}

main().catch(console.error)
