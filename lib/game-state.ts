export interface GameState {
  // Player
  playerName: string
  playerAvatar: string
  musicStyle: MusicStyle
  startingBonus: StartingBonus

  // Resources
  money: number
  reputation: number
  energy: number
  gems: number

  // Progress
  currentStage: number
  stageProgress: number

  // Stats
  totalBeatsCreated: number
  totalMoneyEarned: number
  totalCollabs: number

  // Equipment levels
  equipment: {
    phone: number
    headphones: number
    microphone: number
    computer: number
    midi: number
    audioInterface: number
  }

  // Beats inventory
  beats: Beat[]

  // Artists
  artists: Artist[]
  hiredArtists: string[]

  // Upgrades purchased
  purchasedUpgrades: string[]
}

export interface Beat {
  id: string
  name: string
  price: number
  quality: number
  cover: string
  createdAt: number
}

export interface Artist {
  id: string
  name: string
  avatar: string
  skill: number
  popularity: number
  cost: number
  genre: string
  isHired: boolean
  isWorking: boolean
}

export type MusicStyle = "hip-hop" | "trap" | "rnb" | "pop" | "electronic"
export type StartingBonus = "producer" | "hustler" | "connector" | "energizer"

export const MUSIC_STYLES: Record<MusicStyle, { name: string; description: string; bonus: string; emoji: string }> = {
  "hip-hop": {
    name: "Hip-Hop",
    description: "Классический хип-хоп с сильным битом",
    bonus: "+$100 стартовых денег",
    emoji: "🎤",
  },
  trap: {
    name: "Trap",
    description: "Современный трэп с 808 басами",
    bonus: "+50 стартовой репутации",
    emoji: "🔥",
  },
  rnb: {
    name: "R&B",
    description: "Мелодичный R&B с душевными вокалами",
    bonus: "Бесплатные наушники (уровень 1)",
    emoji: "💫",
  },
  pop: {
    name: "Pop",
    description: "Популярная музыка для широкой аудитории",
    bonus: "+$50 денег и +25 репутации",
    emoji: "⭐",
  },
  electronic: {
    name: "Electronic",
    description: "Электронная музыка и EDM",
    bonus: "+20 максимальной энергии",
    emoji: "⚡",
  },
}

export const STARTING_BONUSES: Record<
  StartingBonus,
  { name: string; description: string; bonus: string; icon: string }
> = {
  producer: {
    name: "Продюсер",
    description: "Ты фокусируешься на качестве звука",
    bonus: "Бесплатные наушники (уровень 1)",
    icon: "🎧",
  },
  hustler: {
    name: "Хастлер",
    description: "Ты умеешь зарабатывать деньги",
    bonus: "+$200 стартовых денег",
    icon: "💰",
  },
  connector: {
    name: "Коннектор",
    description: "У тебя много связей в индустрии",
    bonus: "+100 стартовой репутации",
    icon: "🤝",
  },
  energizer: {
    name: "Энерджайзер",
    description: "Ты можешь работать дольше других",
    bonus: "+50 максимальной энергии",
    icon: "⚡",
  },
}

export const INITIAL_GAME_STATE: GameState = {
  playerName: "",
  playerAvatar: "",
  musicStyle: "hip-hop",
  startingBonus: "producer",
  money: 500,
  reputation: 0,
  energy: 100,
  gems: 0,
  currentStage: 1,
  stageProgress: 0,
  totalBeatsCreated: 0,
  totalMoneyEarned: 0,
  totalCollabs: 0,
  equipment: {
    phone: 1,
    headphones: 0,
    microphone: 0,
    computer: 0,
    midi: 0,
    audioInterface: 0,
  },
  beats: [],
  artists: [],
  hiredArtists: [],
  purchasedUpgrades: [],
}

export const BEAT_NAMES = [
  "Уличные мечты",
  "Ночная суета",
  "Огни города",
  "Городской ритм",
  "Темные улицы",
  "Неоновый флоу",
  "Бетонные джунгли",
  "Полуночный хастл",
  "Асфальтовая поэзия",
  "Метро вайб",
  "Районные истории",
  "Бетонная волна",
  "Уличный философ",
  "Ночной дозор",
  "Городские легенды",
]
