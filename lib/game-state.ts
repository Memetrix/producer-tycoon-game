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
  totalBeatsEarnings: number
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
    claimedStreakRewards: number[] // Streak milestones that have been claimed (e.g., [7, 14])
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
    bonus: "+$200 стартовых денег",
    emoji: "🎤",
  },
  trap: {
    name: "Trap",
    description: "Современный трэп с 808 басами",
    bonus: "+100 стартовой репутации",
    emoji: "🔥",
  },
  rnb: {
    name: "R&B",
    description: "Мелодичный R&B с душевными вокалами",
    bonus: "Бесплатные наушники (уровень 1) + $100",
    emoji: "💫",
  },
  pop: {
    name: "Pop",
    description: "Популярная музыка для широкой аудитории",
    bonus: "+$150 денег и +50 репутации",
    emoji: "⭐",
  },
  electronic: {
    name: "Electronic",
    description: "Электронная музыка и EDM",
    bonus: "+30 максимальной энергии + $100",
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
    bonus: "Бесплатные наушники (уровень 1) + $200",
    icon: "🎧",
  },
  hustler: {
    name: "Хастлер",
    description: "Ты умеешь зарабатывать деньги",
    bonus: "+$400 стартовых денег",
    icon: "💰",
  },
  connector: {
    name: "Коннектор",
    description: "У тебя много связей в индустрии",
    bonus: "+200 стартовой репутации + $100",
    icon: "🤝",
  },
  energizer: {
    name: "Энерджайзер",
    description: "Ты можешь работать дольше других",
    bonus: "+50 максимальной энергии + $200",
    icon: "⚡",
  },
}

// ENERGY SYSTEM CONSTANTS
export const ENERGY_CONFIG = {
  BASE_MAX_ENERGY: 150, // Increased from 100 for better flow
  ENERGY_REGEN_PER_MINUTE: 2, // Increased from 1 for faster gameplay
  ENERGY_COST_PER_BEAT: 15, // Decreased from 20 for more beats per session
  FULL_RECHARGE_TIME_MINUTES: 75, // 150 / 2 = 75 minutes (was 100 minutes)
}

export const INITIAL_GAME_STATE: GameState = {
  playerName: "",
  playerAvatar: "",
  musicStyle: "hip-hop",
  startingBonus: "producer",
  money: 800,
  reputation: 0,
  energy: 150, // UPDATED: было 100, стало 150 для лучшего flow
  gems: 0,
  currentStage: 1,
  stageProgress: 0,
  totalBeatsCreated: 0,
  totalMoneyEarned: 0,
  totalBeatsEarnings: 0,
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
    claimedStreakRewards: [],
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
  "street-poet": {
    id: "street-poet",
    name: "Street Poet",
    avatar: "/conscious-hip-hop-artist-portrait--thoughtful-rapp.jpg",
    skill: 58,
    popularity: 52,
    genre: "Сознательный",
    baseCost: 70,
    incomePerLevel: [0, 5, 7, 10, 14, 20],
    energyBonusPerLevel: [0, 8, 10, 12, 14, 18],
    costMultiplier: 1.6,
  },
  "mc-flow": {
    id: "mc-flow",
    name: "MC Flow",
    avatar: "/hip-hop-rapper-portrait-mc-flow--young-male-artist.jpg",
    skill: 65,
    popularity: 45,
    genre: "Хип-хоп",
    baseCost: 80,
    incomePerLevel: [0, 6, 9, 13, 18, 25],
    energyBonusPerLevel: [0, 10, 12, 14, 16, 20],
    costMultiplier: 1.6,
  },
  "lil-dreamer": {
    id: "lil-dreamer",
    name: "Lil Dreamer",
    avatar: "/trap-artist-portrait-lil-dreamer--stylish-young-ra.jpg",
    skill: 72,
    popularity: 38,
    genre: "Трэп",
    baseCost: 100,
    incomePerLevel: [0, 8, 11, 16, 22, 30],
    energyBonusPerLevel: [0, 15, 18, 21, 24, 30],
    costMultiplier: 1.6,
  },
  "young-legend": {
    id: "young-legend",
    name: "Young Legend",
    avatar: "/famous-hip-hop-star-portrait--successful-rapper-wi.jpg",
    skill: 85,
    popularity: 70,
    genre: "Хип-хоп",
    baseCost: 200,
    incomePerLevel: [0, 12, 18, 26, 36, 50],
    energyBonusPerLevel: [0, 25, 30, 35, 40, 50],
    costMultiplier: 1.6,
    requiresReputation: 400,
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
      reward: { money: 200, reputation: 50 }, // UPDATED: было 100/$20 rep
      icon: "📱",
    },
    {
      id: "twitter_subscribe",
      name: "Подписаться на X (Twitter)",
      description: "Подпишись на нас в X",
      url: "https://google.com", // Placeholder
      reward: { money: 200, reputation: 50 }, // UPDATED: было 100/$20 rep
      icon: "🐦",
    },
    {
      id: "instagram_subscribe",
      name: "Подписаться на Instagram",
      description: "Подпишись на наш Instagram",
      url: "https://google.com", // Placeholder
      reward: { money: 200, reputation: 50 }, // UPDATED: было 100/$20 rep
      icon: "📸",
    },
  ],
  day2: [
    {
      id: "telegram_like",
      name: "Лайкнуть пост в Telegram",
      description: "Поставь лайк на последний пост в Telegram",
      url: "https://google.com", // Placeholder
      reward: { money: 300, reputation: 75, energy: 30 }, // UPDATED: было 150/$30 rep/20 energy
      icon: "📱",
    },
    {
      id: "twitter_like",
      name: "Лайкнуть пост в X",
      description: "Поставь лайк на последний пост в X",
      url: "https://google.com", // Placeholder
      reward: { money: 300, reputation: 75, energy: 30 }, // UPDATED: было 150/$30 rep/20 energy
      icon: "🐦",
    },
    {
      id: "instagram_like",
      name: "Лайкнуть пост в Instagram",
      description: "Поставь лайк на последний пост в Instagram",
      url: "https://google.com", // Placeholder
      reward: { money: 300, reputation: 75, energy: 30 }, // UPDATED: было 150/$30 rep/20 energy
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
    reward: { money: 300, reputation: 100, energyBonus: 5 },
    icon: "🎓",
  },
  bookChapter: {
    id: "bookChapter",
    name: "Пробная глава: Путь продюсера",
    description: "Прочитай первую главу книги о карьере в музыкальной индустрии",
    duration: "10 минут",
    reward: { money: 400, reputation: 150, qualityBonus: 5 },
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

// REPUTATION TIERS - Gate content and provide progression structure
export const REPUTATION_TIERS = {
  1: { min: 0, max: 500, name: "Уличный" },
  2: { min: 500, max: 2000, name: "Местный" },
  3: { min: 2000, max: 5000, name: "Региональный" },
  4: { min: 5000, max: 15000, name: "Национальный" },
  5: { min: 15000, max: 50000, name: "Международный" },
  6: { min: 50000, max: Infinity, name: "Легендарный" },
}

// Get current reputation tier from reputation amount
export function getReputationTier(reputation: number): number {
  if (reputation < 500) return 1
  if (reputation < 2000) return 2
  if (reputation < 5000) return 3
  if (reputation < 15000) return 4
  if (reputation < 50000) return 5
  return 6
}

// TIER PRICE MULTIPLIERS - Prices increase as reputation grows
// Tier 1 (0-500): 1.0x base price
// Tier 2 (500-2k): 1.25x
// Tier 3 (2k-5k): 1.5x
// Tier 4 (5k-15k): 1.75x
// Tier 5 (15k-50k): 2.0x
// Tier 6 (50k+): 2.5x
export const TIER_PRICE_MULTIPLIERS = [1.0, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5]

export function getTierPriceMultiplier(reputation: number): number {
  const tier = getReputationTier(reputation)
  return TIER_PRICE_MULTIPLIERS[tier]
}

export const STREAK_REWARDS = {
  7: {
    money: 500,
    reputation: 100,
    description: "7 дней подряд",
  },
  14: {
    money: 1500,
    reputation: 300,
    description: "14 дней подряд",
  },
  21: {
    money: 3000,
    reputation: 800,
    description: "21 день подряд - Серьёзный продюсер!",
  },
  30: {
    money: 5000,
    reputation: 2000,
    description: "30 дней подряд - Региональная звезда!",
  },
  40: {
    money: 8000,
    reputation: 4000,
    description: "40 дней подряд - Национальный герой!",
  },
  50: {
    money: 12000,
    reputation: 8000,
    description: "50 дней подряд - Международный уровень!",
  },
  60: {
    money: 20000,
    reputation: 15000,
    description: "60 дней подряд - ЛЕГЕНДАРНЫЙ ПРОДЮСЕР!",
  },
}

export function getUnclaimedStreakRewards(currentStreak: number, claimedRewards: number[]): number[] {
  const unclaimed: number[] = []
  for (const milestone of [7, 14, 21, 30, 40, 50, 60]) {
    if (currentStreak >= milestone && !claimedRewards.includes(milestone)) {
      unclaimed.push(milestone)
    }
  }
  return unclaimed
}
