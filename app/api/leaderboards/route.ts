import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    console.log("[v0] Leaderboards API called")
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "global"
    const playerId = searchParams.get("playerId") // Get player ID from query params
    console.log("[v0] Leaderboard type:", type, "Player ID:", playerId)

    const supabase = await createClient()
    console.log("[v0] Supabase client created")

    const currentPlayerId = playerId || null
    console.log("[v0] Current player:", currentPlayerId)

    // Build query based on type
    let query = supabase
      .from("game_state")
      .select(
        `
        player_id,
        money,
        reputation,
        total_money_earned,
        total_beats_created,
        updated_at,
        players!inner (
          character_name,
          character_avatar
        )
      `,
      )
      .order("reputation", { ascending: false })

    // For weekly leaderboard, filter by last 7 days
    if (type === "weekly") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      query = query.gte("updated_at", weekAgo.toISOString())
    }

    console.log("[v0] Executing leaderboard query...")
    const { data: leaderboardData, error } = await query.limit(100)

    console.log("[v0] Query result - Data count:", leaderboardData?.length, "Error:", error)

    if (error) {
      console.error("[v0] Leaderboard query error:", error)
      return NextResponse.json({ error: "Failed to fetch leaderboard", details: error.message }, { status: 500 })
    }

    // Calculate scores and format data
    const leaderboard = leaderboardData.map((entry: any, index: number) => {
      const score = entry.total_money_earned + entry.reputation * 10

      return {
        rank: index + 1,
        playerId: entry.player_id,
        playerName: entry.players.character_name || "Безымянный продюсер",
        playerAvatar: entry.players.character_avatar || "/placeholder-avatar.jpg",
        score,
        reputation: entry.reputation,
        beatsCreated: entry.total_beats_created,
        isCurrentPlayer: currentPlayerId ? entry.player_id === currentPlayerId : false, // Compare with passed player ID
      }
    })

    // Sort by score
    leaderboard.sort((a, b) => b.score - a.score)

    // Update ranks after sorting
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1
    })

    let playerRank = null
    let playerScore = 0

    if (currentPlayerId) {
      const currentPlayerEntry = leaderboard.find((entry) => entry.isCurrentPlayer)
      playerRank = currentPlayerEntry?.rank || leaderboard.length + 1

      // Get current player's score
      const { data: playerState } = await supabase
        .from("game_state")
        .select("total_money_earned, reputation")
        .eq("player_id", currentPlayerId)
        .single()

      playerScore = playerState ? playerState.total_money_earned + playerState.reputation * 10 : 0
    }

    console.log("[v0] Returning leaderboard with", leaderboard.length, "entries")
    return NextResponse.json({
      leaderboard: leaderboard.slice(0, 50),
      playerRank,
      playerScore,
      type,
    })
  } catch (error: any) {
    console.error("[v0] Leaderboard API error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
