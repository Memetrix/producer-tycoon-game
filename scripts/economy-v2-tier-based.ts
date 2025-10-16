/**
 * Economy V2 - Tier-Based Equipment System
 *
 * Каждый тир = новый сет оборудования = новый этап карьеры
 */

import * as fs from "fs"

// ============================================================================
// TIER-BASED EQUIPMENT SYSTEM
// ============================================================================

interface TierEquipment {
  mainDevice: { name: string; cost: number; qualityBonus: number }
  headphones?: { name: string; cost: number; qualityBonus: number }
  microphone?: { name: string; cost: number; qualityBonus: number }
  midi?: { name: string; cost: number; qualityBonus: number }
  audioInterface?: { name: string; cost: number; qualityBonus: number }
  monitors?: { name: string; cost: number; qualityBonus: number }
}

const TIER_EQUIPMENT: Record<number, TierEquipment> = {
  1: {
    // TIER 1: Уличный - только телефон
    mainDevice: { name: "Old Phone", cost: 0, qualityBonus: 5 },
  },
  2: {
    // TIER 2: Местный - домашняя студия
    mainDevice: { name: "Laptop", cost: 2000, qualityBonus: 15 },
    headphones: { name: "Studio Headphones", cost: 300, qualityBonus: 8 },
    microphone: { name: "USB Mic", cost: 150, qualityBonus: 5 },
  },
  3: {
    // TIER 3: Региональный - профессиональная домашняя студия
    mainDevice: { name: "Desktop PC", cost: 5000, qualityBonus: 25 },
    headphones: { name: "Pro Headphones", cost: 800, qualityBonus: 12 },
    microphone: { name: "Condenser Mic", cost: 1000, qualityBonus: 10 },
    midi: { name: "MIDI 49 keys", cost: 400, qualityBonus: 8 },
    audioInterface: { name: "Focusrite Scarlett", cost: 300, qualityBonus: 10 },
  },
  4: {
    // TIER 4: Национальный - студия в центре города
    mainDevice: { name: "Mac Studio", cost: 15000, qualityBonus: 35 },
    headphones: { name: "Reference Headphones", cost: 2000, qualityBonus: 18 },
    microphone: { name: "Tube Mic", cost: 3000, qualityBonus: 15 },
    midi: { name: "MIDI 88 keys", cost: 1500, qualityBonus: 12 },
    audioInterface: { name: "UA Apollo Twin", cost: 2000, qualityBonus: 15 },
    monitors: { name: "Studio Monitors", cost: 2500, qualityBonus: 15 },
  },
  5: {
    // TIER 5: Международный - мировой класс
    mainDevice: { name: "Mac Pro Rack", cost: 50000, qualityBonus: 45 },
    headphones: { name: "Mastering Headphones", cost: 5000, qualityBonus: 25 },
    microphone: { name: "Vintage Mic Collection", cost: 10000, qualityBonus: 25 },
    midi: { name: "Moog Synthesizer", cost: 8000, qualityBonus: 20 },
    audioInterface: { name: "Apogee Symphony", cost: 8000, qualityBonus: 25 },
    monitors: { name: "Genelec Reference", cost: 10000, qualityBonus: 25 },
  },
  6: {
    // TIER 6: Легенда - своя студия
    mainDevice: { name: "Studio Complex", cost: 200000, qualityBonus: 60 },
    headphones: { name: "Legendary Collection", cost: 15000, qualityBonus: 35 },
    microphone: { name: "Vintage Locker", cost: 50000, qualityBonus: 40 },
    midi: { name: "Synth Museum", cost: 30000, qualityBonus: 30 },
    audioInterface: { name: "SSL Console", cost: 100000, qualityBonus: 40 },
    monitors: { name: "Custom Acoustics", cost: 50000, qualityBonus: 40 },
  },
}

// ============================================================================
// REPUTATION TIERS
// ============================================================================

const REPUTATION_TIERS = [
  { tier: 1, min: 0, max: 500, name: "Уличный", priceMultiplier: 1.0, energyCost: 15 },
  { tier: 2, min: 500, max: 2000, name: "Местный", priceMultiplier: 1.25, energyCost: 20 },
  { tier: 3, min: 2000, max: 5000, name: "Региональный", priceMultiplier: 1.5, energyCost: 25 },
  { tier: 4, min: 5000, max: 15000, name: "Национальный", priceMultiplier: 1.75, energyCost: 30 },
  { tier: 5, min: 15000, max: 50000, name: "Международный", priceMultiplier: 2.0, energyCost: 35 },
  { tier: 6, min: 50000, max: Infinity, name: "Легендарный", priceMultiplier: 2.5, energyCost: 40 },
]

function getReputationTier(reputation: number): number {
  for (const tier of REPUTATION_TIERS) {
    if (reputation >= tier.min && reputation < tier.max) {
      return tier.tier
    }
  }
  return 6
}

function getTierData(tier: number) {
  return REPUTATION_TIERS.find((t) => t.tier === tier)!
}

// ============================================================================
// NARRATIVE MILESTONES
// ============================================================================

interface Milestone {
  trigger: "day" | "reputation" | "tier"
  value: number
  title: string
  description: string
  type: "story" | "tier_unlock" | "achievement"
}

const MILESTONES: Milestone[] = [
  { trigger: "day", value: 1, title: "🎤 Начало пути", description: "Ты делаешь биты на телефоне в своей комнате. Мама не верит в тебя.", type: "story" },
  { trigger: "day", value: 3, title: "💰 Первая продажа", description: "Кто-то купил твой бит за $50! Это реально работает!", type: "achievement" },

  { trigger: "tier", value: 2, title: "⭐ TIER 2: Местная знаменитость", description: "Твой трек на радио! MC Flow дарит тебе наушники и предлагает коллаб.", type: "tier_unlock" },
  { trigger: "day", value: 12, title: "🤝 Встреча с MC Flow", description: "Первый настоящий коллаборатор! Он верит в твой талант.", type: "story" },
  { trigger: "day", value: 17, title: "😡 Украденный бит", description: "Fake Producer украл твой трек. Как поступишь - судиться или забить?", type: "story" },

  { trigger: "tier", value: 3, title: "⭐ TIER 3: Региональная звезда", description: "Indie Label инвестирует $5K в твоё оборудование. Домашняя студия!", type: "tier_unlock" },
  { trigger: "day", value: 27, title: "📈 Топ-100 региона", description: "Твой трек в топ-100! 50K прослушиваний.", type: "achievement" },
  { trigger: "day", value: 30, title: "🌟 Встреча с Metro Maximus", description: "Легендарный продюсер слышал твои работы. Он предлагает тест.", type: "story" },

  { trigger: "tier", value: 4, title: "⭐ TIER 4: Национальная звезда", description: "Small Label даёт $20K. Студия в центре города с мониторами и Mac Studio!", type: "tier_unlock" },
  { trigger: "day", value: 40, title: "💿 Платиновый трек", description: "Трек с твоим битом - платиновый! 1M+ прослушиваний.", type: "achievement" },
  { trigger: "day", value: 45, title: "🙏 Воссоединение", description: "Street Poet напоминает откуда ты. Ты не забыл свои корни?", type: "story" },

  { trigger: "tier", value: 5, title: "⭐ TIER 5: Международный уровень", description: "Major Label строит тебе студию мечты! Vintage микрофоны, Moog, SSL предусилители.", type: "tier_unlock" },
  { trigger: "day", value: 50, title: "🏆 Номинация на Грэмми", description: "Ты номинирован на 'Продюсер года'!", type: "achievement" },
  { trigger: "day", value: 52, title: "😢 Цена успеха", description: "Старый друг: 'Ты изменился.' Счастлив ли ты на самом деле?", type: "story" },

  { trigger: "tier", value: 6, title: "⭐ TIER 6: ЛЕГЕНДА", description: "Ты покупаешь здание и строишь Studio Complex. Ты - Dr. Dre своего поколения.", type: "tier_unlock" },
  { trigger: "day", value: 59, title: "👨‍🏫 Передача знаний", description: "Молодой продюсер просит совета. Ты помогаешь - как тебе помог Metro.", type: "story" },
  { trigger: "day", value: 60, title: "🎊 ФИНАЛ: Грэмми", description: "И продюсер года... [ТВОЁ ИМЯ]! От телефона в подвале до вершины. Ты сделал это.", type: "achievement" },
]

// ============================================================================
// GAME STATE
// ============================================================================

interface GameState {
  day: number
  money: number
  reputation: number
  energy: number
  tier: number
  equipment: Set<string> // Owned equipment pieces
  totalBeatsCreated: number

  // Artists
  mcFlow: number // Level 0-10
}

const INITIAL_STATE: GameState = {
  day: 1,
  money: 800, // Starting money
  reputation: 0,
  energy: 150,
  tier: 1,
  equipment: new Set(["Old Phone"]), // Start with phone only
  totalBeatsCreated: 0,
  mcFlow: 0,
}

// ============================================================================
// GAME LOGIC
// ============================================================================

function calculateTotalQuality(state: GameState): number {
  const tierEquip = TIER_EQUIPMENT[state.tier]
  let quality = 30 + Math.random() * 15 // Base quality 30-45

  // Add tier bonus (each tier gives +10 quality)
  quality += state.tier * 10

  // Add equipment bonuses
  if (state.equipment.has(tierEquip.mainDevice.name)) {
    quality += tierEquip.mainDevice.qualityBonus
  }
  if (tierEquip.headphones && state.equipment.has(tierEquip.headphones.name)) {
    quality += tierEquip.headphones.qualityBonus
  }
  if (tierEquip.microphone && state.equipment.has(tierEquip.microphone.name)) {
    quality += tierEquip.microphone.qualityBonus
  }
  if (tierEquip.midi && state.equipment.has(tierEquip.midi.name)) {
    quality += tierEquip.midi.qualityBonus
  }
  if (tierEquip.audioInterface && state.equipment.has(tierEquip.audioInterface.name)) {
    quality += tierEquip.audioInterface.qualityBonus
  }
  if (tierEquip.monitors && state.equipment.has(tierEquip.monitors.name)) {
    quality += tierEquip.monitors.qualityBonus
  }

  return Math.min(100, Math.floor(quality))
}

function calculateBeatPrice(quality: number, reputation: number): number {
  const basePrice = 30
  const qualityBonus = quality > 50 ? (quality - 50) * 1.0 : 0
  const reputationBonus = reputation * 0.15
  const tierData = getTierData(getReputationTier(reputation))

  return Math.floor((basePrice + qualityBonus + reputationBonus) * tierData.priceMultiplier)
}

function getArtistIncome(level: number): number {
  const incomes = [0, 10, 18, 30, 48, 75, 110, 155, 210, 280, 365]
  return incomes[level] || 0
}

function getArtistCost(level: number): number {
  if (level >= 10) return 0
  return Math.floor(100 * Math.pow(1.7, level))
}

// ============================================================================
// SIMULATION
// ============================================================================

interface LogEntry {
  day: number
  event: string
  money: number
  reputation: number
  tier: number
  equipmentOwned: string[]
  milestone?: Milestone
}

function simulate(days: number = 60): LogEntry[] {
  const state = { ...INITIAL_STATE }
  const log: LogEntry[] = []

  const logEvent = (event: string, milestone?: Milestone) => {
    log.push({
      day: state.day,
      event,
      money: Math.floor(state.money),
      reputation: state.reputation,
      tier: state.tier,
      equipmentOwned: Array.from(state.equipment),
      milestone,
    })
  }

  // Day 1
  const day1Milestone = MILESTONES.find((m) => m.trigger === "day" && m.value === 1)
  logEvent("🎮 Начало игры", day1Milestone)

  for (let day = 1; day <= days; day++) {
    state.day = day

    // Player plays 6 sessions per day (every 4 hours)
    for (let session = 0; session < 6; session++) {
      // Passive income from artists (4 hours AFK = 240 minutes)
      const passiveIncome = getArtistIncome(state.mcFlow) * 240
      state.money += passiveIncome

      // Regenerate energy (240 min * 2 energy/min = 480, capped at 150)
      state.energy = 150

      // Create 2 beats per session
      const tierData = getTierData(state.tier)
      const energyCost = tierData.energyCost

      for (let i = 0; i < 2; i++) {
        if (state.energy >= energyCost) {
          state.energy -= energyCost

          const quality = calculateTotalQuality(state)
          const price = calculateBeatPrice(quality, state.reputation)

          state.money += price
          state.totalBeatsCreated++

          // Reputation gain: more in early game, less in late game
          const repGain = Math.max(1, Math.floor(10 / state.tier))
          state.reputation += repGain
        }
      }
    }

    // Check for tier upgrade
    const newTier = getReputationTier(state.reputation)
    if (newTier > state.tier) {
      state.tier = newTier

      // Unlock tier equipment
      const tierEquip = TIER_EQUIPMENT[newTier]
      state.equipment.add(tierEquip.mainDevice.name)

      const tierMilestone = MILESTONES.find((m) => m.trigger === "tier" && m.value === newTier)
      if (tierMilestone) {
        logEvent(`🌟 ${tierMilestone.title}`, tierMilestone)
      }
    }

    // Try to buy equipment for current tier
    const tierEquip = TIER_EQUIPMENT[state.tier]

    // Buy in order: mainDevice → headphones → mic → midi → interface → monitors
    const buyOrder: Array<keyof TierEquipment> = ["mainDevice", "headphones", "microphone", "midi", "audioInterface", "monitors"]

    for (const key of buyOrder) {
      const item = tierEquip[key]
      if (item && !state.equipment.has(item.name) && state.money > item.cost * 1.5) {
        state.money -= item.cost
        state.equipment.add(item.name)

        if (key !== "mainDevice") { // Main device is auto-unlocked with tier
          logEvent(`🛒 Купил: ${item.name} ($${item.cost})`)
        }
        break // Buy one item at a time
      }
    }

    // Hire/upgrade MC Flow
    if (state.reputation >= 100 && state.mcFlow === 0) {
      const cost = getArtistCost(0)
      if (state.money > cost * 2) {
        state.money -= cost
        state.mcFlow = 1
        logEvent(`🤝 Нанял MC Flow (lvl 1) - +${getArtistIncome(1)}/мин пассива`)
      }
    } else if (state.mcFlow > 0 && state.mcFlow < 10) {
      const cost = getArtistCost(state.mcFlow)
      if (state.money > cost * 2) {
        state.money -= cost
        state.mcFlow++
        logEvent(`⬆️ MC Flow → lvl ${state.mcFlow} (+${getArtistIncome(state.mcFlow)}/мин)`)
      }
    }

    // Check for day-specific milestones
    const dayMilestones = MILESTONES.filter((m) => m.trigger === "day" && m.value === day && m.type !== "tier_unlock")
    for (const milestone of dayMilestones) {
      logEvent(milestone.title, milestone)
    }

    // Log every 10 days
    if (day % 10 === 0 || day === days) {
      logEvent(`📊 День ${day}: ${state.tier} tier, $${Math.floor(state.money).toLocaleString()}, ${state.reputation} rep`)
    }
  }

  return log
}

// ============================================================================
// HTML GENERATION
// ============================================================================

function generateHTML(log: LogEntry[]): string {
  const milestones = log.filter((e) => e.milestone)
  const final = log[log.length - 1]

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Producer Tycoon - Economy V2 Simulation 🎮</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      color: #333;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-family: 'Playfair Display', serif;
      text-align: center;
      color: white;
      font-size: 3rem;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .subtitle {
      text-align: center;
      color: rgba(255,255,255,0.9);
      font-size: 1.2rem;
      margin-bottom: 40px;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 15px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .stat-card h3 {
      font-size: 0.85rem;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .stat-card .value {
      font-size: 2.2rem;
      font-weight: 700;
      color: #667eea;
    }

    .timeline {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      margin-bottom: 40px;
    }

    .timeline h2 {
      font-family: 'Playfair Display', serif;
      color: #667eea;
      font-size: 2rem;
      margin-bottom: 30px;
    }

    .milestone {
      position: relative;
      padding-left: 50px;
      padding-bottom: 35px;
      border-left: 3px solid #e0e0e0;
    }

    .milestone:last-child { border-left: none; }

    .milestone-marker {
      position: absolute;
      left: -12px;
      top: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .milestone.tier_unlock .milestone-marker {
      background: linear-gradient(135deg, #f093fb, #f5576c);
      width: 32px;
      height: 32px;
      left: -16px;
    }

    .milestone.story .milestone-marker {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .milestone.achievement .milestone-marker {
      background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
    }

    .milestone-day {
      font-size: 0.8rem;
      color: #999;
      margin-bottom: 5px;
    }

    .milestone-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 8px;
      color: #333;
    }

    .milestone-desc {
      color: #666;
      line-height: 1.6;
      margin-bottom: 10px;
    }

    .milestone-stats {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      font-size: 0.8rem;
    }

    .milestone-stats span {
      background: #f5f5f5;
      padding: 4px 10px;
      border-radius: 12px;
      color: #666;
    }

    .equipment-list {
      margin-top: 10px;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #555;
    }

    .equipment-list strong {
      color: #667eea;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎮 Producer Tycoon: Economy V2</h1>
    <div class="subtitle">Tier-Based Equipment System - 60 дней симуляции</div>

    <div class="summary">
      <div class="stat-card">
        <h3>💰 Итоговый капитал</h3>
        <div class="value">$${final.money.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <h3>⭐ Репутация</h3>
        <div class="value">${final.reputation.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <h3>🏆 Tier достигнут</h3>
        <div class="value">Tier ${final.tier}</div>
      </div>
      <div class="stat-card">
        <h3>🎛️ Оборудование</h3>
        <div class="value">${final.equipmentOwned.length} штук</div>
      </div>
    </div>

    <div class="timeline">
      <h2>📖 История твоего пути</h2>
      ${milestones.map((m) => `
        <div class="milestone ${m.milestone?.type}">
          <div class="milestone-marker"></div>
          <div class="milestone-day">День ${m.day}</div>
          <div class="milestone-title">${m.milestone?.title}</div>
          <div class="milestone-desc">${m.milestone?.description}</div>
          <div class="milestone-stats">
            <span>💰 $${m.money.toLocaleString()}</span>
            <span>⭐ ${m.reputation} rep</span>
            <span>🏆 Tier ${m.tier}</span>
          </div>
          ${m.equipmentOwned.length > 0 ? `
            <div class="equipment-list">
              <strong>Оборудование:</strong> ${m.equipmentOwned.join(", ")}
            </div>
          ` : ""}
        </div>
      `).join("")}
    </div>

    <div class="timeline">
      <h2>📊 Детальный лог</h2>
      ${log.map((entry) => `
        <div style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 0.9rem;">
          <strong>День ${entry.day}:</strong> ${entry.event}
          <span style="color: #999; margin-left: 15px;">
            $${entry.money.toLocaleString()} | ⭐${entry.reputation} | Tier ${entry.tier}
          </span>
        </div>
      `).join("")}
    </div>
  </div>
</body>
</html>`
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log("🎮 Economy V2: Tier-Based Equipment System")
  console.log("⏰ Симулируем 60 дней...\n")

  const log = simulate(60)
  const final = log[log.length - 1]

  console.log("✅ Симуляция завершена!\n")
  console.log(`💰 Итоговый капитал: $${final.money.toLocaleString()}`)
  console.log(`⭐ Репутация: ${final.reputation}`)
  console.log(`🏆 Tier: ${final.tier}`)
  console.log(`🎛️ Оборудование: ${final.equipmentOwned.length} предметов`)
  console.log(`📖 Ключевых моментов: ${log.filter((e) => e.milestone).length}`)

  const html = generateHTML(log)
  fs.writeFileSync("economy-v2-simulation.html", html)

  console.log("\n📄 HTML отчёт: economy-v2-simulation.html")
  console.log("🌐 Открой в браузере!")
}

main()
