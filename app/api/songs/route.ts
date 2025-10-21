import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/api-auth"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limiter"

export async function GET(request: NextRequest) {
  // ✅ SECURITY: Require authentication
  const { user, error: authError } = await requireAuth(request)
  if (authError) return authError

  // ✅ SECURITY: Rate limiting (100 requests per minute)
  const { allowed, error: rateLimitError } = await checkRateLimit(request, {
    identifier: user.id,
    ...RATE_LIMITS.DATA_QUERY,
    endpoint: "songs",
  })
  if (!allowed) return rateLimitError

  try {
    const supabase = await createClient()

    const { data: songs, error } = await supabase
      .from("songs")
      .select("*")
      .eq("is_active", true)
      .order("uploaded_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ songs })
  } catch (error) {
    console.error("[v0] Failed to fetch songs:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch songs" },
      { status: 500 },
    )
  }
}
