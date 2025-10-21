import fs from "fs"
import path from "path"

const BLOB_BASE_URL = "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com"

// Файлы для обновления
const FILES_TO_UPDATE = [
  "components/studio-screen.tsx",
  "components/onboarding.tsx",
  "components/tutorial-overlay.tsx",
  "lib/game-state.ts",
  "lib/music-config.ts",
]

function updateFile(filePath: string): { file: string; replacements: number } {
  const fullPath = path.join(process.cwd(), filePath)

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`)
    return { file: filePath, replacements: 0 }
  }

  let content = fs.readFileSync(fullPath, "utf-8")
  const originalContent = content

  // Замена всех .png на .webp в Blob URLs
  const pattern = new RegExp(`${BLOB_BASE_URL}/([^"'\`]+)\\.png`, "g")
  content = content.replace(pattern, `${BLOB_BASE_URL}/$1.webp`)

  const replacements = (originalContent.match(pattern) || []).length

  if (replacements > 0) {
    fs.writeFileSync(fullPath, content, "utf-8")
    console.log(`✅ ${filePath}: ${replacements} replacements`)
  } else {
    console.log(`ℹ️  ${filePath}: no changes needed`)
  }

  return { file: filePath, replacements }
}

async function main() {
  console.log("🔄 Updating Blob Storage URLs from .png to .webp...\n")

  let totalReplacements = 0
  const results: Array<{ file: string; replacements: number }> = []

  for (const file of FILES_TO_UPDATE) {
    const result = updateFile(file)
    results.push(result)
    totalReplacements += result.replacements
  }

  console.log("\n" + "=".repeat(60))
  console.log("📊 UPDATE SUMMARY")
  console.log("=".repeat(60))
  console.log(`Files processed: ${FILES_TO_UPDATE.length}`)
  console.log(`Total replacements: ${totalReplacements}`)
  console.log("=".repeat(60))

  if (totalReplacements > 0) {
    console.log("\n✅ All Blob URLs updated successfully!")
    console.log("\nUpdated files:")
    results
      .filter((r) => r.replacements > 0)
      .forEach((r) => {
        console.log(`  - ${r.file} (${r.replacements} changes)`)
      })
  } else {
    console.log("\nℹ️  No updates needed - all URLs already using .webp")
  }
}

main().catch(console.error)
