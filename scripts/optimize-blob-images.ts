import sharp from "sharp"
import fs from "fs"
import path from "path"
import https from "https"

const BLOB_BASE_URL = "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com"

// Все изображения на Blob Storage
const BLOB_IMAGES = {
  equipment: [
    // Phone (11 images)
    ...Array.from({ length: 11 }, (_, i) => `phone-${i}.png`),
    // Headphones (11 images)
    ...Array.from({ length: 11 }, (_, i) => `headphones-${i}.png`),
    // Microphone (11 images)
    ...Array.from({ length: 11 }, (_, i) => `microphone-${i}.png`),
    // Computer (11 images)
    ...Array.from({ length: 11 }, (_, i) => `computer-${i}.png`),
    // MIDI (11 images)
    ...Array.from({ length: 11 }, (_, i) => `midi-${i}.png`),
    // Audio Interface (11 images)
    ...Array.from({ length: 11 }, (_, i) => `audio-interface-${i}.png`),
  ],
  artists: [
    // MC Flow (9 images: 0-8)
    ...Array.from({ length: 9 }, (_, i) => `mc-flow-${i}.png`),
  ],
  ui: [
    "loading-screen.png",
    "stage-bg.png",
    "studio-bg.png",
    "skill-energy-efficiency.png",
    "skill-quality-1.png",
    "achievement-first-sale.png",
    "achievement-first-beat.png",
    "contract-easy-1.png",
  ],
}

interface OptimizationConfig {
  maxWidth: number
  maxHeight: number
  quality: number
  format: "webp" | "png"
}

// Конфигурации оптимизации по типам
const CONFIGS: Record<string, OptimizationConfig> = {
  equipment: {
    maxWidth: 512, // equipment images обычно 512x512 или меньше
    maxHeight: 512,
    quality: 85,
    format: "webp",
  },
  artists: {
    maxWidth: 800, // аватары артистов
    maxHeight: 800,
    quality: 85,
    format: "webp",
  },
  ui: {
    maxWidth: 1200, // UI элементы и фоны
    maxHeight: 1200,
    quality: 80,
    format: "webp",
  },
}

// Скачать файл
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${response.statusCode}`))
          return
        }
        response.pipe(file)
        file.on("finish", () => {
          file.close()
          resolve()
        })
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {})
        reject(err)
      })
  })
}

// Оптимизировать изображение
async function optimizeImage(
  inputPath: string,
  outputPath: string,
  config: OptimizationConfig
): Promise<{ originalSize: number; optimizedSize: number }> {
  const originalSize = fs.statSync(inputPath).size

  const image = sharp(inputPath)
  const metadata = await image.metadata()

  // Resize если нужно
  let pipeline = image
  if (metadata.width && metadata.width > config.maxWidth) {
    pipeline = pipeline.resize(config.maxWidth, config.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
  }

  // Конвертация в WebP
  if (config.format === "webp") {
    await pipeline.webp({ quality: config.quality }).toFile(outputPath)
  } else {
    await pipeline.png({ quality: config.quality }).toFile(outputPath)
  }

  const optimizedSize = fs.statSync(outputPath).size

  return { originalSize, optimizedSize }
}

async function main() {
  console.log("🎨 Starting Blob Storage images optimization...\n")

  const tempDir = path.join(process.cwd(), "temp-blob-images")
  const optimizedDir = path.join(process.cwd(), "optimized-blob-images")

  // Создаём временные директории
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
  if (!fs.existsSync(optimizedDir)) fs.mkdirSync(optimizedDir, { recursive: true })

  let totalOriginalSize = 0
  let totalOptimizedSize = 0
  let processedCount = 0

  // Обрабатываем каждую категорию
  for (const [category, images] of Object.entries(BLOB_IMAGES)) {
    console.log(`\n📦 Processing ${category} (${images.length} images)...`)

    const config = CONFIGS[category]
    const categoryDir = path.join(tempDir, category)
    const optimizedCategoryDir = path.join(optimizedDir, category)

    if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir, { recursive: true })
    if (!fs.existsSync(optimizedCategoryDir)) fs.mkdirSync(optimizedCategoryDir, { recursive: true })

    for (const image of images) {
      try {
        const url = `${BLOB_BASE_URL}/${image}`
        const tempPath = path.join(categoryDir, image)
        const optimizedPath = path.join(optimizedCategoryDir, image.replace(".png", ".webp"))

        // Скачиваем
        console.log(`  ⬇️  Downloading ${image}...`)
        await downloadFile(url, tempPath)

        // Оптимизируем
        console.log(`  ⚙️  Optimizing ${image}...`)
        const { originalSize, optimizedSize } = await optimizeImage(tempPath, optimizedPath, config)

        totalOriginalSize += originalSize
        totalOptimizedSize += optimizedSize
        processedCount++

        const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1)
        console.log(
          `  ✅ ${image}: ${(originalSize / 1024).toFixed(1)}KB → ${(optimizedSize / 1024).toFixed(1)}KB (-${savings}%)`
        )
      } catch (error) {
        console.error(`  ❌ Error processing ${image}:`, error)
      }
    }
  }

  // Итоговая статистика
  const totalSavings = totalOriginalSize - totalOptimizedSize
  const savingsPercent = ((totalSavings / totalOriginalSize) * 100).toFixed(1)

  console.log("\n" + "=".repeat(60))
  console.log("📊 OPTIMIZATION SUMMARY")
  console.log("=".repeat(60))
  console.log(`Total images processed: ${processedCount}`)
  console.log(`Original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Saved: ${(totalSavings / 1024 / 1024).toFixed(2)} MB (${savingsPercent}%)`)
  console.log("=".repeat(60))

  console.log(`\n✅ Optimized images saved to: ${optimizedDir}`)
  console.log(`\n⚠️  Next steps:`)
  console.log(`1. Review optimized images in ${optimizedDir}`)
  console.log(`2. Upload them to Blob Storage`)
  console.log(`3. Update file extensions in code from .png to .webp`)
  console.log(`4. Delete temp directories`)
}

main().catch(console.error)
