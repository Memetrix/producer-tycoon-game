import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { requireAuth } from "@/lib/api-auth"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limiter"
import { validateRequest, schemas } from "@/lib/api-validation"

export async function POST(request: NextRequest) {
  // ✅ SECURITY: Require authentication
  const { user, error: authError } = await requireAuth(request)
  if (authError) return authError

  // ✅ SECURITY: Rate limiting (20 requests per minute)
  const { allowed, error: rateLimitError } = await checkRateLimit(request, {
    identifier: user.id,
    ...RATE_LIMITS.FILE_UPLOAD,
    endpoint: "upload-art",
  })
  if (!allowed) return rateLimitError

  // ✅ SECURITY: Input validation
  const { data: validatedData, error: validationError } = await validateRequest(
    request,
    schemas.uploadArt
  )
  if (validationError) return validationError

  const { url, filename } = validatedData

  try {

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
