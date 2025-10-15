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
      { level: 6, name: "Mac Studio", description: "Профессиональная рабочая станция" },
      { level: 7, name: "Custom PC Pro", description: "Кастомный топовый компьютер" },
      { level: 8, name: "Server Grade", description: "Серверное оборудование" },
      { level: 9, name: "AI Workstation", description: "AI-оптимизированная станция" },
      { level: 10, name: "Quantum Studio", description: "Будущее звукозаписи" },
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
      { level: 6, name: "Planar Magnetic", description: "Плоские драйверы" },
      { level: 7, name: "Electrostatic", description: "Электростатические наушники" },
      { level: 8, name: "Custom Tuned", description: "Кастомная настройка под слух" },
      { level: 9, name: "Reference Grade", description: "Эталонный мониторинг" },
      { level: 10, name: "Legendary Sound", description: "Легендарный звук" },
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
      { level: 6, name: "Large Diaphragm Tube", description: "Большая мембрана, лампа" },
      { level: 7, name: "Vintage Neumann", description: "Винтажный Neumann" },
      { level: 8, name: "Telefunken ELA M 251", description: "Легендарный микрофон" },
      { level: 9, name: "Sony C-800G", description: "Топовый вокальный микрофон" },
      { level: 10, name: "Custom Vintage Collection", description: "Коллекция винтажных микрофонов" },
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
      { level: 6, name: "SSL Console Studio", description: "SSL консоль" },
      { level: 7, name: "Abbey Road Replica", description: "Копия Abbey Road" },
      { level: 8, name: "Hitsville U.S.A.", description: "Motown легенда" },
      { level: 9, name: "Electric Lady Studios", description: "Студия Джимми Хендрикса" },
      { level: 10, name: "Your Own Legend", description: "Твоя собственная легенда" },
    ],
  },
  midi: {
    name: "MIDI контроллер",
    tiers: [
      { level: 0, name: "Нет", description: "" },
      { level: 1, name: "MIDI клавиатура 25", description: "Компактная клавиатура" },
      { level: 2, name: "MIDI клавиатура 49", description: "Средняя клавиатура" },
      { level: 3, name: "MIDI клавиатура 61", description: "Полноразмерная клавиатура" },
      { level: 4, name: "MIDI клавиатура 88", description: "Полный размер пианино" },
      { level: 5, name: "Weighted Keys 88", description: "Взвешенные клавиши" },
      { level: 6, name: "MPK Series", description: "Akai MPK профессиональная" },
      { level: 7, name: "Native Instruments S88", description: "Native Instruments топ" },
      { level: 8, name: "Roland Fantom", description: "Roland синтезатор-рабочая станция" },
      { level: 9, name: "Yamaha Montage", description: "Yamaha флагман" },
      { level: 10, name: "Moog One", description: "Легендарный Moog синтезатор" },
    ],
  },
  audioInterface: {
    name: "Аудиоинтерфейс",
    tiers: [
      { level: 0, name: "Нет", description: "" },
      { level: 1, name: "Focusrite Scarlett Solo", description: "Начальный уровень" },
      { level: 2, name: "Focusrite Scarlett 2i2", description: "Домашняя запись" },
      { level: 3, name: "Universal Audio Apollo Twin", description: "Профессиональный звук" },
      { level: 4, name: "UA Apollo x4", description: "Расширенные возможности" },
      { level: 5, name: "UA Apollo x8", description: "Студийный стандарт" },
      { level: 6, name: "Antelope Audio Orion", description: "Топовая конверсия" },
      { level: 7, name: "Apogee Symphony", description: "Apogee качество" },
      { level: 8, name: "Prism Sound ADA-8XR", description: "Референсная конверсия" },
      { level: 9, name: "Burl Audio B80", description: "Легендарное качество" },
      { level: 10, name: "Custom Mastering Chain", description: "Кастомный мастеринг чейн" },
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
  // TIER 1: Street (0-500 rep)
  "street-poet": {
    id: "street-poet",
    name: "Street Poet",
    avatar: "/conscious-hip-hop-artist-portrait--thoughtful-rapp.jpg",
    skill: 58,
    popularity: 52,
    genre: "Сознательный",
    baseCost: 70,
    incomePerLevel: [0, 5, 7, 10, 14, 20, 28, 38, 50, 65, 85], // Extended to 10 levels
    energyBonusPerLevel: [0, 8, 10, 12, 14, 18, 22, 27, 33, 40, 50], // Extended to 10 levels
    costMultiplier: 1.6,
    tier: 1,
  },
  "mc-flow": {
    id: "mc-flow",
    name: "MC Flow",
    avatar: "/hip-hop-rapper-portrait-mc-flow--young-male-artist.jpg",
    skill: 65,
    popularity: 45,
    genre: "Хип-хоп",
    baseCost: 80,
    incomePerLevel: [0, 6, 9, 13, 18, 25, 34, 46, 62, 82, 108], // Extended to 10 levels
    energyBonusPerLevel: [0, 10, 12, 14, 16, 20, 25, 31, 38, 47, 58], // Extended to 10 levels
    costMultiplier: 1.6,
    tier: 1,
  },
  "lil-dreamer": {
    id: "lil-dreamer",
    name: "Lil Dreamer",
    avatar: "/trap-artist-portrait-lil-dreamer--stylish-young-ra.jpg",
    skill: 72,
    popularity: 38,
    genre: "Трэп",
    baseCost: 100,
    incomePerLevel: [0, 8, 11, 16, 22, 30, 41, 56, 76, 102, 136], // Extended to 10 levels
    energyBonusPerLevel: [0, 15, 18, 21, 24, 30, 37, 46, 57, 71, 88], // Extended to 10 levels
    costMultiplier: 1.6,
    tier: 1,
  },
  "young-legend": {
    id: "young-legend",
    name: "Young Legend",
    avatar: "/famous-hip-hop-star-portrait--successful-rapper-wi.jpg",
    skill: 85,
    popularity: 70,
    genre: "Хип-хоп",
    baseCost: 200,
    incomePerLevel: [0, 12, 18, 26, 36, 50, 68, 92, 124, 166, 222], // Extended to 10 levels
    energyBonusPerLevel: [0, 25, 30, 35, 40, 50, 62, 77, 96, 120, 150], // Extended to 10 levels
    costMultiplier: 1.6,
    requiresReputation: 400,
    tier: 1,
  },

  // TIER 2: Local (500-2000 rep) - NEW ARTISTS
  "local-hero": {
    id: "local-hero",
    name: "Local Hero",
    avatar: "/placeholder-artist-2.jpg",
    skill: 78,
    popularity: 65,
    genre: "R&B",
    baseCost: 300,
    incomePerLevel: [0, 20, 28, 38, 52, 70, 94, 126, 168, 224, 298],
    energyBonusPerLevel: [0, 30, 36, 43, 52, 62, 75, 90, 108, 130, 156],
    costMultiplier: 1.6,
    requiresReputation: 500,
    tier: 2,
  },
  "scene-leader": {
    id: "scene-leader",
    name: "Scene Leader",
    avatar: "/placeholder-artist-2.jpg",
    skill: 82,
    popularity: 72,
    genre: "Trap",
    baseCost: 400,
    incomePerLevel: [0, 25, 35, 48, 65, 88, 118, 158, 212, 282, 376],
    energyBonusPerLevel: [0, 35, 42, 50, 60, 72, 86, 104, 125, 150, 180],
    costMultiplier: 1.6,
    requiresReputation: 500,
    tier: 2,
  },

  // TIER 3: Regional (2000-5000 rep) - NEW ARTISTS
  "city-star": {
    id: "city-star",
    name: "City Star",
    avatar: "/placeholder-artist-3.jpg",
    skill: 88,
    popularity: 80,
    genre: "Pop",
    baseCost: 800,
    incomePerLevel: [0, 50, 68, 92, 124, 166, 222, 296, 394, 524, 698],
    energyBonusPerLevel: [0, 50, 60, 72, 86, 104, 125, 150, 180, 216, 260],
    costMultiplier: 1.6,
    requiresReputation: 2000,
    tier: 3,
  },
  "state-champion": {
    id: "state-champion",
    name: "State Champion",
    avatar: "/placeholder-artist-3.jpg",
    skill: 92,
    popularity: 85,
    genre: "Hip-Hop",
    baseCost: 1000,
    incomePerLevel: [0, 60, 82, 110, 148, 198, 264, 352, 470, 626, 834],
    energyBonusPerLevel: [0, 55, 66, 79, 95, 114, 137, 164, 197, 237, 284],
    costMultiplier: 1.6,
    requiresReputation: 2000,
    tier: 3,
  },
}

export function getArtistUpgradeCost(artistId: keyof typeof ARTISTS_CONFIG, currentLevel: number): number {
  const artist = ARTISTS_CONFIG[artistId]
  if (!artist || currentLevel >= 10) return 0 // UPDATED: было 5, стало 10 уровней
  return Math.floor(artist.baseCost * Math.pow(artist.costMultiplier, currentLevel))
}

export function getArtistIncome(artistId: keyof typeof ARTISTS_CONFIG, level: number): number {
  const artist = ARTISTS_CONFIG[artistId]
  if (!artist || level < 1 || level > 10) return 0 // UPDATED: было 5, стало 10
  return artist.incomePerLevel[level] || 0 // Fallback to 0 if level not defined
}

export function getArtistEnergyBonus(artistId: keyof typeof ARTISTS_CONFIG, level: number): number {
  const artist = ARTISTS_CONFIG[artistId]
  if (!artist || level < 1 || level > 10) return 0 // UPDATED: было 5, стало 10
  return artist.energyBonusPerLevel[level] || 0 // Fallback to 0 if level not defined
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
