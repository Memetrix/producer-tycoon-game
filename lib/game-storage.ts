import { createClient } from "@/lib/supabase/client"
import type { GameState, Beat } from "@/lib/game-state"

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return ""

  let playerId = localStorage.getItem("producer_tycoon_player_id")

  if (!playerId || !isValidUUID(playerId)) {
    playerId = crypto.randomUUID()
    localStorage.setItem("producer_tycoon_player_id", playerId)
  }

  return playerId
}

export async function loadGameState(): Promise<GameState | null> {
  const supabase = createClient()
  const playerId = getOrCreatePlayerId()
  if (!playerId) return null

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("user_id", playerId)
    .single()

  if (playerError || !player) {
    return null // New player, needs onboarding
  }

  // Load game state
  const { data: gameState, error: stateError } = await supabase
    .from("game_state")
    .select("*")
    .eq("player_id", player.id)
    .single()

  if (stateError || !gameState) {
    return null
  }

  // Load equipment
  const { data: equipment } = await supabase.from("equipment").select("*").eq("player_id", player.id)

  // Load hired artists
  const { data: hiredArtists } = await supabase.from("player_artists").select("artist_id").eq("player_id", player.id)

  // Load purchased courses
  const { data: courses } = await supabase.from("player_courses").select("course_id").eq("player_id", player.id)

  // Load beats
  const { data: beats } = await supabase.from("beats").select("*").eq("player_id", player.id).eq("sold", false)

  // Reconstruct game state
  const equipmentMap: any = {
    phone: 1,
    headphones: 0,
    microphone: 0,
    computer: 0,
    midi: 0,
    audioInterface: 0,
  }

  equipment?.forEach((eq) => {
    if (eq.equipment_type in equipmentMap) {
      equipmentMap[eq.equipment_type] = eq.level
    }
  })

  return {
    playerName: player.character_name,
    playerAvatar: player.character_avatar,
    musicStyle: player.music_style || "",
    startingBonus: player.starting_bonus || "",
    money: gameState.money,
    reputation: gameState.reputation,
    energy: gameState.energy,
    gems: 0,
    currentStage: gameState.stage,
    stageProgress: 0,
    totalBeatsCreated: gameState.total_beats_created,
    totalMoneyEarned: gameState.total_money_earned,
    totalCollabs: 0,
    equipment: equipmentMap,
    beats:
      beats?.map((b) => ({
        id: b.id,
        name: b.title,
        price: b.price,
        quality: b.quality,
        cover: b.cover_url,
        createdAt: new Date(b.created_at).getTime(),
      })) || [],
    artists: [],
    hiredArtists: hiredArtists?.map((a) => a.artist_id) || [],
    purchasedUpgrades: courses?.map((c) => c.course_id) || [],
  }
}

export async function saveGameState(gameState: GameState): Promise<boolean> {
  const supabase = createClient()
  const playerId = getOrCreatePlayerId()
  if (!playerId) return false

  const { data: player } = await supabase.from("players").select("id").eq("user_id", playerId).single()

  if (!player) return false

  // Update game state
  const { error: stateError } = await supabase
    .from("game_state")
    .update({
      money: gameState.money,
      reputation: gameState.reputation,
      energy: gameState.energy,
      stage: gameState.currentStage,
      total_beats_created: gameState.totalBeatsCreated,
      total_money_earned: gameState.totalMoneyEarned,
      updated_at: new Date().toISOString(),
    })
    .eq("player_id", player.id)

  if (stateError) {
    console.error("[v0] Failed to save game state:", stateError)
    return false
  }

  return true
}

export async function createPlayer(
  name: string,
  avatar: string,
  musicStyle: string,
  startingBonus: string,
): Promise<boolean> {
  const supabase = createClient()
  const playerId = getOrCreatePlayerId()
  if (!playerId) return false

  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({
      user_id: playerId,
      character_name: name,
      character_avatar: avatar,
      music_style: musicStyle,
      starting_bonus: startingBonus,
    })
    .select()
    .single()

  if (playerError || !player) {
    console.error("[v0] Failed to create player:", playerError)
    return false
  }

  // Create initial game state
  const { error: stateError } = await supabase.from("game_state").insert({
    player_id: player.id,
    money: 500,
    reputation: 0,
    energy: 100,
    stage: 1,
    total_beats_created: 0,
    total_money_earned: 0,
  })

  if (stateError) {
    console.error("[v0] Failed to create game state:", stateError)
    return false
  }

  // Create initial equipment
  const { error: equipError } = await supabase.from("equipment").insert({
    player_id: player.id,
    equipment_type: "phone",
    level: 1,
  })

  if (equipError) {
    console.error("[v0] Failed to create equipment:", equipError)
  }

  return true
}

export async function saveBeat(beat: Beat): Promise<boolean> {
  const supabase = createClient()
  const playerId = getOrCreatePlayerId()
  if (!playerId) return false

  const { data: player } = await supabase.from("players").select("id").eq("user_id", playerId).single()

  if (!player) return false

  // Save beat
  const { error } = await supabase.from("beats").insert({
    player_id: player.id,
    title: beat.name,
    quality: beat.quality,
    price: beat.price,
    cover_url: beat.cover,
    sold: true,
  })

  if (error) {
    console.error("[v0] Failed to save beat:", error)
    return false
  }

  return true
}

export async function saveEquipmentUpgrade(
  equipmentType: keyof GameState["equipment"],
  level: number,
): Promise<boolean> {
  const supabase = createClient()
  const playerId = getOrCreatePlayerId()
  if (!playerId) return false

  const { data: player } = await supabase.from("players").select("id").eq("user_id", playerId).single()

  if (!player) return false

  // Check if equipment exists
  const { data: existing } = await supabase
    .from("equipment")
    .select("id")
    .eq("player_id", player.id)
    .eq("equipment_type", equipmentType)
    .single()

  if (existing) {
    // Update existing equipment
    const { error } = await supabase
      .from("equipment")
      .update({ level, updated_at: new Date().toISOString() })
      .eq("id", existing.id)

    if (error) {
      console.error("[v0] Failed to update equipment:", error)
      return false
    }
  } else {
    // Insert new equipment
    const { error } = await supabase.from("equipment").insert({
      player_id: player.id,
      equipment_type: equipmentType,
      level,
    })

    if (error) {
      console.error("[v0] Failed to insert equipment:", error)
      return false
    }
  }

  return true
}
