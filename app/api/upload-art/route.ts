import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const { url, filename } = await request.json()

    console.log("[v0] Uploading art to Blob:", filename)

    // Download image from fal
    const imageResponse = await fetch(url)
    const imageBlob = await imageResponse.blob()

    // Upload to Vercel Blob
    const blob = await put(filename, imageBlob, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    console.log("[v0] Uploaded to Blob:", blob.url)

    return NextResponse.json({
      success: true,
      blobUrl: blob.url,
      filename,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
