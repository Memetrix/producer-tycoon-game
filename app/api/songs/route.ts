import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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
