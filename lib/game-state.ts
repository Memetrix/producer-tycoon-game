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

  artists: {
    "mc-flow": number
    "lil-dreamer": number
    "street-poet": number
    "young-legend": number
  }

  // Upgrades purchased
  purchasedUpgrades: string[]

  // Daily tasks
  dailyTasks: {
    lastCompletedDate: string // ISO date string
    currentStreak: number
    completedTaskIds: string[] // IDs of tasks completed today
  }

  // Training progress
  trainingProgress: {
    freeSeminar: boolean
    freeBookChapter: boolean
  }

  lastActive?: string // ISO date string
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
  artists: {
    "mc-flow": 0,
    "lil-dreamer": 0,
    "street-poet": 0,
    "young-legend": 0,
  },
  purchasedUpgrades: [],
  dailyTasks: {
    lastCompletedDate: "",
    currentStreak: 0,
    completedTaskIds: [],
  },
  trainingProgress: {
    freeSeminar: false,
    freeBookChapter: false,
  },
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

export const STAGE_TITLES: Record<number, string> = {
  1: "Уличный битмейкер",
  2: "Домашний продюсер",
  3: "Студийный мастер",
  4: "Известный продюсер",
  5: "Звездный продюсер",
}

export const EQUIPMENT_TIERS = {
  phone: {
    name: "Устройство записи",
    tiers: [
      { level: 0, name: "Нет", description: "" },
      { level: 1, name: "Смартфон", description: "Базовая запись на телефон" },
      { level: 2, name: "Планшет с DAW", description: "Мобильная студия" },
      { level: 3, name: "Ноутбук", description: "Полноценная работа" },
      { level: 4, name: "Мощный ноутбук", description: "Профессиональная обработка" },
      { level: 5, name: "Рабочая станция", description: "Максимальная производительность" },
    ],
  },
  headphones: {
    name: "Наушники",
    tiers: [
      { level: 0, name: "Нет", description: "" },
      { level: 1, name: "Проводные наушники", description: "Базовый мониторинг" },
      { level: 2, name: "Bluetooth наушники", description: "Удобство работы" },
      { level: 3, name: "Студийные наушники", description: "Точный звук" },
      { level: 4, name: "Мониторные наушники", description: "Профессиональный мониторинг" },
      { level: 5, name: "Hi-End наушники", description: "Эталонное качество" },
    ],
  },
  microphone: {
    name: "Микрофон",
    tiers: [
      { level: 0, name: "Нет", description: "" },
      { level: 1, name: "USB микрофон", description: "Простая запись вокала" },
      { level: 2, name: "Конденсаторный микрофон", description: "Качественная запись" },
      { level: 3, name: "Студийный микрофон", description: "Профессиональный звук" },
      { level: 4, name: "Ламповый микрофон", description: "Теплый винтажный звук" },
      { level: 5, name: "Топовый студийный микрофон", description: "Эталонная запись" },
    ],
  },
  computer: {
    name: "Студия",
    tiers: [
      { level: 0, name: "Нет", description: "" },
      { level: 1, name: "Аудиоинтерфейс", description: "Качественный звук" },
      { level: 2, name: "Домашняя студия", description: "Базовая студия" },
      { level: 3, name: "Профессиональная студия", description: "Полный набор оборудования" },
      { level: 4, name: "Звукозаписывающая студия", description: "Коммерческая студия" },
      { level: 5, name: "Топовая студия", description: "Мировой уровень" },
    ],
  },
}

export function getStageTitle(stage: number): string {
  return STAGE_TITLES[stage] || `Продюсер уровня ${stage}`
}

export function getEquipmentTier(equipmentKey: keyof GameState["equipment"], level: number) {
  const equipment = EQUIPMENT_TIERS[equipmentKey as keyof typeof EQUIPMENT_TIERS]
  if (!equipment) return null
  return equipment.tiers.find((tier) => tier.level === level) || equipment.tiers[0]
}

export const ARTISTS_CONFIG = {
  "mc-flow": {
    id: "mc-flow",
    name: "MC Flow",
    avatar: "/hip-hop-rapper-portrait-mc-flow--young-male-artist.jpg",
    skill: 65,
    popularity: 45,
    genre: "Хип-хоп",
    baseCost: 100,
    // Passive income per minute at each level
    incomePerLevel: [0, 3, 4, 5, 6, 8], // Level 0-5
    // Energy recovery bonus % at each level
    energyBonusPerLevel: [0, 10, 12, 14, 16, 20],
    // Cost multiplier for each level
    costMultiplier: 1.8,
  },
  "lil-dreamer": {
    id: "lil-dreamer",
    name: "Lil Dreamer",
    avatar: "/trap-artist-portrait-lil-dreamer--stylish-young-ra.jpg",
    skill: 72,
    popularity: 38,
    genre: "Трэп",
    baseCost: 120,
    incomePerLevel: [0, 4, 5, 6, 8, 10],
    energyBonusPerLevel: [0, 15, 18, 21, 24, 30],
    costMultiplier: 1.8,
  },
  "street-poet": {
    id: "street-poet",
    name: "Street Poet",
    avatar: "/conscious-hip-hop-artist-portrait--thoughtful-rapp.jpg",
    skill: 58,
    popularity: 52,
    genre: "Сознательный",
    baseCost: 90,
    incomePerLevel: [0, 2, 3, 4, 5, 6],
    energyBonusPerLevel: [0, 8, 10, 12, 14, 18],
    costMultiplier: 1.8,
  },
  "young-legend": {
    id: "young-legend",
    name: "Young Legend",
    avatar: "/famous-hip-hop-star-portrait--successful-rapper-wi.jpg",
    skill: 85,
    popularity: 70,
    genre: "Хип-хоп",
    baseCost: 250,
    incomePerLevel: [0, 8, 10, 13, 16, 20],
    energyBonusPerLevel: [0, 25, 30, 35, 40, 50],
    costMultiplier: 2.0,
    requiresReputation: 500,
  },
}

export function getArtistUpgradeCost(artistId: keyof typeof ARTISTS_CONFIG, currentLevel: number): number {
  const artist = ARTISTS_CONFIG[artistId]
  if (!artist || currentLevel >= 5) return 0
  return Math.floor(artist.baseCost * Math.pow(artist.costMultiplier, currentLevel))
}

export function getArtistIncome(artistId: keyof typeof ARTISTS_CONFIG, level: number): number {
  const artist = ARTISTS_CONFIG[artistId]
  if (!artist || level < 1 || level > 5) return 0
  return artist.incomePerLevel[level]
}

export function getArtistEnergyBonus(artistId: keyof typeof ARTISTS_CONFIG, level: number): number {
  const artist = ARTISTS_CONFIG[artistId]
  if (!artist || level < 1 || level > 5) return 0
  return artist.energyBonusPerLevel[level]
}

export function getTotalPassiveIncome(artists: GameState["artists"]): number {
  let total = 0
  for (const [artistId, level] of Object.entries(artists)) {
    total += getArtistIncome(artistId as keyof typeof ARTISTS_CONFIG, level)
  }
  return total
}

export function getTotalEnergyBonus(artists: GameState["artists"]): number {
  let total = 0
  for (const [artistId, level] of Object.entries(artists)) {
    total += getArtistEnergyBonus(artistId as keyof typeof ARTISTS_CONFIG, level)
  }
  return total
}

export const DAILY_TASKS_CONFIG = {
  day1: [
    {
      id: "telegram_subscribe",
      name: "Подписаться на Telegram",
      description: "Подпишись на наш канал в Telegram",
      url: "https://google.com", // Placeholder
      reward: { money: 50, reputation: 10 },
      icon: "📱",
    },
    {
      id: "twitter_subscribe",
      name: "Подписаться на X (Twitter)",
      description: "Подпишись на нас в X",
      url: "https://google.com", // Placeholder
      reward: { money: 50, reputation: 10 },
      icon: "🐦",
    },
    {
      id: "instagram_subscribe",
      name: "Подписаться на Instagram",
      description: "Подпишись на наш Instagram",
      url: "https://google.com", // Placeholder
      reward: { money: 50, reputation: 10 },
      icon: "📸",
    },
  ],
  day2: [
    {
      id: "telegram_like",
      name: "Лайкнуть пост в Telegram",
      description: "Поставь лайк на последний пост в Telegram",
      url: "https://google.com", // Placeholder
      reward: { money: 75, reputation: 15, energy: 10 },
      icon: "📱",
    },
    {
      id: "twitter_like",
      name: "Лайкнуть пост в X",
      description: "Поставь лайк на последний пост в X",
      url: "https://google.com", // Placeholder
      reward: { money: 75, reputation: 15, energy: 10 },
      icon: "🐦",
    },
    {
      id: "instagram_like",
      name: "Лайкнуть пост в Instagram",
      description: "Поставь лайк на последний пост в Instagram",
      url: "https://google.com", // Placeholder
      reward: { money: 75, reputation: 15, energy: 10 },
      icon: "📸",
    },
  ],
}

export const FREE_TRAINING_CONFIG = {
  seminar: {
    id: "seminar",
    name: "Бесплатный семинар: Основы битмейкинга",
    description: "Изучи базовые техники создания битов за 15 минут",
    duration: "15 минут",
    reward: { money: 100, reputation: 50, energyBonus: 5 },
    icon: "🎓",
  },
  bookChapter: {
    id: "bookChapter",
    name: "Пробная глава: Путь продюсера",
    description: "Прочитай первую главу книги о карьере в музыкальной индустрии",
    duration: "10 минут",
    reward: { money: 150, reputation: 75, qualityBonus: 5 },
    icon: "📖",
  },
}

export function getTimeUntilDailyReset(): number {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.getTime() - now.getTime()
}

export function shouldResetDailyTasks(lastCompletedDate: string): boolean {
  if (!lastCompletedDate) return false

  const lastDate = new Date(lastCompletedDate)
  const today = new Date()

  // Reset if it's a new day
  return (
    lastDate.getDate() !== today.getDate() ||
    lastDate.getMonth() !== today.getMonth() ||
    lastDate.getFullYear() !== today.getFullYear()
  )
}

export function shouldBreakStreak(lastCompletedDate: string): boolean {
  if (!lastCompletedDate) return false

  const lastDate = new Date(lastCompletedDate)
  const today = new Date()

  // Break streak if more than 1 day has passed
  const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
  return daysDiff > 1
}

export function getDailyTasksForDay(streakDay: number) {
  // Alternate between day 1 (subscribe) and day 2 (like) tasks
  const dayType = streakDay % 2 === 1 ? "day1" : "day2"
  return DAILY_TASKS_CONFIG[dayType]
}

export function calculateOfflineEarnings(
  lastActive: string | undefined,
  passiveIncomePerMinute: number,
): { earnings: number; minutesAway: number } {
  if (!lastActive || passiveIncomePerMinute === 0) {
    return { earnings: 0, minutesAway: 0 }
  }

  const now = new Date()
  const lastActiveDate = new Date(lastActive)
  const minutesAway = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60))

  // Cap at 4 hours (240 minutes)
  const MAX_OFFLINE_MINUTES = 240
  const cappedMinutes = Math.min(minutesAway, MAX_OFFLINE_MINUTES)

  const earnings = Math.floor(passiveIncomePerMinute * cappedMinutes)

  return { earnings, minutesAway: cappedMinutes }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} мин`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} ч`
  }
  return `${hours} ч ${remainingMinutes} мин`
}
