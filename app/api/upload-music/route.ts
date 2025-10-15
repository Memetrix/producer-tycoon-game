import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

function extractSongMetadata(filename: string) {
  // Remove .osz extension
  const nameWithoutExt = filename.replace(/\.osz$/i, "")

  // Try to parse format: "ID Artist - Title"
  const match = nameWithoutExt.match(/^(\d+)\s+(.+?)\s+-\s+(.+)$/)

  if (match) {
    return {
      artist: match[2].trim(),
      name: match[3].trim(),
    }
  }

  // Fallback: split by dash
  const parts = nameWithoutExt.split("-").map((p) => p.trim())
  if (parts.length >= 2) {
    return {
      artist: parts[0],
      name: parts.slice(1).join(" - "),
    }
  }

  // Last resort: use filename as name
  return {
    artist: "Unknown Artist",
    name: nameWithoutExt,
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    console.log(`[v0] Uploading ${files.length} file(s)`)

    const supabase = await createClient()
    const uploadedSongs = []

    for (const file of files) {
      console.log("[v0] Processing:", file.name)

      const uuid = randomUUID()
      const extension = file.name.split(".").pop()?.toLowerCase() || "osz"
      const blobFilename = `${uuid}.${extension}`

      // Upload to Vercel Blob
      const blob = await put(blobFilename, file, {
        access: "public",
      })

      console.log("[v0] Uploaded to blob:", blob.url)

      // Extract metadata
      const metadata = extractSongMetadata(file.name)

      // Save to database with original filename
      const { data: song, error: dbError } = await supabase
        .from("songs")
        .insert({
          name: metadata.name,
          artist: metadata.artist,
          genre: "Electronic",
          osz_url: blob.url,
          file_size: file.size,
          original_filename: file.name,
        })
        .select()
        .single()

      if (dbError) {
        console.error("[v0] Database error:", dbError)
        throw new Error(`Failed to save song metadata: ${dbError.message}`)
      }

      console.log("[v0] Saved to database:", song.id)

      uploadedSongs.push({
        id: song.id,
        name: metadata.name,
        artist: metadata.artist,
        url: blob.url,
        size: file.size,
      })
    }

    return NextResponse.json({
      success: true,
      count: uploadedSongs.length,
      songs: uploadedSongs,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}
