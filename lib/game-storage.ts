import { createClient } from "@/lib/supabase/client"
import type { GameState, Beat } from "@/lib/game-state"

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

export async function loadGameState(): Promise<GameState | null> {
  const supabase = createClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) return null

  const { data: player, error: playerError } = await supabase.from("players").select("*").eq("user_id", userId).single()

  if (playerError || !player) {
    return null
  }

  const { data: gameState, error: stateError } = await supabase
    .from("game_state")
    .select("*")
    .eq("player_id", player.id)
    .single()

  if (stateError || !gameState) {
    return null
  }

  const { data: equipment } = await supabase.from("equipment").select("*").eq("player_id", player.id)

  const { data: artistsData } = await supabase
    .from("player_artists")
    .select("artist_id, level")
    .eq("player_id", player.id)

  const { data: courses } = await supabase.from("player_courses").select("course_id").eq("player_id", player.id)

  const { data: beats } = await supabase.from("beats").select("*").eq("player_id", player.id).eq("sold", false)

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

  const artistsMap: any = {
    "mc-flow": 0,
    "lil-dreamer": 0,
    "street-poet": 0,
    "young-legend": 0,
  }

  artistsData?.forEach((artist) => {
    if (artist.artist_id in artistsMap) {
      artistsMap[artist.artist_id] = artist.level || 0
    }
  })

  const dailyTasksCompleted = (gameState.daily_tasks_completed as string[]) || []
  const trainingProgressArray = (gameState.training_progress as string[]) || []

  const lastActiveFromDB = gameState.last_active || gameState.updated_at || new Date().toISOString()
  const now = new Date()
  const lastActiveDate = new Date(lastActiveFromDB)
  const timeDiffMs = now.getTime() - lastActiveDate.getTime()
  const timeDiffMinutes = Math.floor(timeDiffMs / 60000)

  const baseEnergy = gameState.energy || 0
  const regeneratedEnergy = Math.min(100, baseEnergy + timeDiffMinutes)

  return {
    playerName: player.character_name,
    playerAvatar: player.character_avatar,
    musicStyle: player.music_style || "",
    startingBonus: player.starting_bonus || "",
    money: gameState.money,
    reputation: gameState.reputation,
    energy: regeneratedEnergy,
    gems: 0,
    currentStage: gameState.stage,
    stageProgress: 0,
    totalBeatsCreated: gameState.total_beats_created,
    totalMoneyEarned: gameState.total_money_earned,
    totalBeatsEarnings: gameState.total_beats_earnings || 0,
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
    artists: artistsMap,
    purchasedUpgrades: courses?.map((c) => c.course_id) || [],
    dailyTasks: {
      lastCompletedDate: gameState.daily_tasks_last_reset || "",
      currentStreak: gameState.daily_streak || 0,
      completedTaskIds: dailyTasksCompleted,
      claimedStreakRewards: [],
    },
    trainingProgress: {
      freeSeminar: trainingProgressArray.includes("seminar"),
      freeBookChapter: trainingProgressArray.includes("bookChapter"),
    },
    lastActive: lastActiveFromDB,
  }
}

export async function saveGameState(gameState: GameState): Promise<boolean> {
  const supabase = createClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) return false

  const { data: player } = await supabase.from("players").select("id").eq("user_id", userId).single()

  if (!player) return false

  const { error: stateError } = await supabase
    .from("game_state")
    .update({
      money: gameState.money,
      reputation: gameState.reputation,
      energy: Math.round(gameState.energy),
      stage: gameState.currentStage,
      total_beats_created: gameState.totalBeatsCreated,
      total_money_earned: gameState.totalMoneyEarned,
      total_beats_earnings: gameState.totalBeatsEarnings || 0,
      updated_at: new Date().toISOString(),
      last_active: gameState.lastActive,
    })
    .eq("player_id", player.id)

  if (stateError) {
    console.error("[v0] Failed to save game state:", stateError.message)
    return false
  }

  try {
    if (gameState.dailyTasks) {
      const trainingProgress: string[] = []
      if (gameState.trainingProgress?.freeSeminar) trainingProgress.push("seminar")
      if (gameState.trainingProgress?.freeBookChapter) trainingProgress.push("bookChapter")

      const { error: dailyTasksError } = await supabase
        .from("game_state")
        .update({
          daily_tasks_completed: gameState.dailyTasks.completedTaskIds || [],
          daily_tasks_last_reset: gameState.dailyTasks.lastCompletedDate || new Date().toISOString(),
          daily_streak: gameState.dailyTasks.currentStreak || 0,
          training_progress: trainingProgress,
        })
        .eq("player_id", player.id)

      if (dailyTasksError) {
        console.error("[v0] Failed to save daily tasks:", dailyTasksError.message)
      }
    }
  } catch (error) {
    // Silently skip if columns don't exist yet
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
  const userId = await getAuthenticatedUserId()
  if (!userId) return false

  if (!avatar || !avatar.trim()) {
    console.error("[v0] Failed to create player: avatar is required")
    return false
  }

  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({
      user_id: userId,
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

  const { error: stateError } = await supabase.from("game_state").insert({
    player_id: player.id,
    money: 500,
    reputation: 0,
    energy: 100,
    stage: 1,
    total_beats_created: 0,
    total_money_earned: 0,
    total_beats_earnings: 0,
  })

  if (stateError) {
    console.error("[v0] Failed to create game state:", stateError)
    return false
  }

  try {
    await supabase
      .from("game_state")
      .update({
        daily_tasks_completed: [],
        daily_tasks_last_reset: new Date().toISOString(),
        daily_streak: 0,
        training_progress: [],
      })
      .eq("player_id", player.id)
  } catch (error) {
    console.log("[v0] Daily tasks columns not yet migrated")
  }

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
  const userId = await getAuthenticatedUserId()
  if (!userId) return false

  const { data: player } = await supabase.from("players").select("id").eq("user_id", userId).single()

  if (!player) return false

  const { error } = await supabase.from("beats").insert({
    player_id: player.id,
    title: beat.name,
    quality: beat.quality,
    price: beat.price,
    cover_url: beat.cover,
    sold: false,
  })

  if (error) {
    console.error("[v0] Failed to save beat:", error)
    return false
  }

  return true
}

export async function sellBeats(beatIds: string[]): Promise<boolean> {
  const supabase = createClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) return false

  const { data: player } = await supabase.from("players").select("id").eq("user_id", userId).single()

  if (!player) return false

  const { error } = await supabase.from("beats").update({ sold: true }).in("id", beatIds).eq("player_id", player.id)

  if (error) {
    console.error("[v0] Failed to sell beats:", error)
    return false
  }

  return true
}

export async function loadAllBeats(): Promise<Beat[]> {
  const supabase = createClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) return []

  const { data: player } = await supabase.from("players").select("id").eq("user_id", userId).single()

  if (!player) return []

  const { data: beats } = await supabase
    .from("beats")
    .select("*")
    .eq("player_id", player.id)
    .order("created_at", { ascending: false })

  return (
    beats?.map((b) => ({
      id: b.id,
      name: b.title,
      price: b.price,
      quality: b.quality,
      cover: b.cover_url,
      createdAt: new Date(b.created_at).getTime(),
    })) || []
  )
}

export async function saveEquipmentUpgrade(
  equipmentType: keyof GameState["equipment"],
  level: number,
): Promise<boolean> {
  const supabase = createClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) return false

  const { data: player } = await supabase.from("players").select("id").eq("user_id", userId).single()

  if (!player) return false

  const { data: existing } = await supabase
    .from("equipment")
    .select("id")
    .eq("player_id", player.id)
    .eq("equipment_type", equipmentType)
    .single()

  if (existing) {
    const { error } = await supabase
      .from("equipment")
      .update({ level, updated_at: new Date().toISOString() })
      .eq("id", existing.id)

    if (error) {
      console.error("[v0] Failed to update equipment:", error)
      return false
    }
  } else {
    const { error } = await supabase.from("equipment").insert({
      player_id: player.id,
      equipment_type: equipmentType,
      level,
    })

    if (error) {
      console.error("[v0] Failed to insert equipment:", error)
    }
  }

  return true
}

export async function saveArtistUpgrade(artistId: keyof GameState["artists"], level: number): Promise<boolean> {
  const supabase = createClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) return false

  const { data: player } = await supabase.from("players").select("id").eq("user_id", userId).single()

  if (!player) return false

  const { data: existing } = await supabase
    .from("player_artists")
    .select("id")
    .eq("player_id", player.id)
    .eq("artist_id", artistId)
    .single()

  if (existing) {
    const { error } = await supabase.from("player_artists").update({ level }).eq("id", existing.id)

    if (error) {
      console.error("[v0] Failed to update artist:", error)
      return false
    }
  } else {
    const { error } = await supabase.from("player_artists").insert({
      player_id: player.id,
      artist_id: artistId,
      level,
    })

    if (error) {
      console.error("[v0] Failed to insert artist:", error)
    }
  }

  return true
}
