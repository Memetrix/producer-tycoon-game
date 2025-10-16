/**
 * Economy V3 - Full Balance с донатом и лидербордами
 *
 * Симулируем 3 типа игроков:
 * 1. Casual - заходит раз в день, делает пару битов
 * 2. Active - заходит 4-6 раз в день (наша целевая аудитория)
 * 3. Whale - донатит, играет постоянно
 */

import * as fs from "fs"

// ============================================================================
// TIER EQUIPMENT
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
    mainDevice: { name: "Phone", cost: 0, qualityBonus: 5 },
  },
  2: {
    mainDevice: { name: "Laptop", cost: 1500, qualityBonus: 15 },
    headphones: { name: "Studio Headphones", cost: 300, qualityBonus: 8 },
    microphone: { name: "USB Mic", cost: 150, qualityBonus: 5 },
  },
  3: {
    mainDevice: { name: "Desktop PC", cost: 4000, qualityBonus: 25 },
    headphones: { name: "Pro Headphones", cost: 600, qualityBonus: 12 },
    microphone: { name: "Condenser Mic", cost: 800, qualityBonus: 10 },
    midi: { name: "MIDI 49", cost: 300, qualityBonus: 8 },
    audioInterface: { name: "Focusrite", cost: 250, qualityBonus: 10 },
  },
  4: {
    mainDevice: { name: "Mac Studio", cost: 12000, qualityBonus: 35 },
    headphones: { name: "Reference HP", cost: 1500, qualityBonus: 18 },
    microphone: { name: "Tube Mic", cost: 2500, qualityBonus: 15 },
    midi: { name: "MIDI 88", cost: 1200, qualityBonus: 12 },
    audioInterface: { name: "UA Apollo", cost: 1800, qualityBonus: 15 },
    monitors: { name: "Monitors", cost: 2000, qualityBonus: 15 },
  },
  5: {
    mainDevice: { name: "Mac Pro", cost: 40000, qualityBonus: 45 },
    headphones: { name: "Mastering HP", cost: 4000, qualityBonus: 25 },
    microphone: { name: "Vintage Mic", cost: 8000, qualityBonus: 25 },
    midi: { name: "Moog", cost: 6000, qualityBonus: 20 },
    audioInterface: { name: "Apogee", cost: 6000, qualityBonus: 25 },
    monitors: { name: "Genelec", cost: 8000, qualityBonus: 25 },
  },
  6: {
    mainDevice: { name: "Studio Complex", cost: 150000, qualityBonus: 60 },
    headphones: { name: "Legend HP", cost: 12000, qualityBonus: 35 },
    microphone: { name: "Vintage Locker", cost: 40000, qualityBonus: 40 },
    midi: { name: "Synth Museum", cost: 25000, qualityBonus: 30 },
    audioInterface: { name: "SSL Console", cost: 80000, qualityBonus: 40 },
    monitors: { name: "Custom Acoustics", cost: 40000, qualityBonus: 40 },
  },
}

// ============================================================================
// REPUTATION TIERS (снижены требования)
// ============================================================================

const REPUTATION_TIERS = [
  { tier: 1, min: 0, max: 300, name: "Уличный", priceMultiplier: 1.0, energyCost: 15 },
  { tier: 2, min: 300, max: 1000, name: "Местный", priceMultiplier: 1.3, energyCost: 20 },
  { tier: 3, min: 1000, max: 3000, name: "Региональный", priceMultiplier: 1.6, energyCost: 25 },
  { tier: 4, min: 3000, max: 8000, name: "Национальный", priceMultiplier: 2.0, energyCost: 30 },
  { tier: 5, min: 8000, max: 20000, name: "Международный", priceMultiplier: 2.5, energyCost: 35 },
  { tier: 6, min: 20000, max: Infinity, name: "Легендарный", priceMultiplier: 3.0, energyCost: 40 },
]

function getReputationTier(reputation: number): number {
  for (const tier of REPUTATION_TIERS) {
    if (reputation >= tier.min && reputation < tier.max) return tier.tier
  }
  return 6
}

function getTierData(tier: number) {
  return REPUTATION_TIERS.find((t) => t.tier === tier)!
}

// ============================================================================
// ДОНАТ МЕХАНИКИ
// ============================================================================

interface DonatBoost {
  name: string
  cost: number // USD
  effect: string
  multiplier?: number
  bonus?: number
}

const DONAT_BOOSTS = {
  // Speed-up (для казуалов кто хочет быстрее пройти)
  energyBoost: { name: "Energy Boost", cost: 5, effect: "+50% max energy", multiplier: 1.5 },
  passiveBoost: { name: "Passive x2", cost: 10, effect: "×2 пассивный доход", multiplier: 2 },
  qualityBoost: { name: "Pro Tools", cost: 15, effect: "+20% качество", bonus: 20 },

  // Flex (для whales кто хочет доминировать в лидерборде)
  premiumStudio: { name: "Premium Studio", cost: 50, effect: "Разблокировать всё оборудование", bonus: 100 },
  reputationBoost: { name: "Marketing Campaign", cost: 30, effect: "+5000 reputation", bonus: 5000 },

  // Косметика (для всех)
  customAvatar: { name: "Custom Avatar", cost: 5, effect: "AI-generated аватар" },
  studioSkin: { name: "Studio Skin", cost: 10, effect: "Кастомный визуал студии" },
}

// ============================================================================
// PLAYER TYPES
// ============================================================================

type PlayerType = "casual" | "active" | "whale"

interface PlayerProfile {
  type: PlayerType
  sessionsPerDay: number // Сколько раз заходит
  beatsPerSession: number // Сколько битов делает за сессию
  donatBudget: number // USD готов потратить
  motivation: string
}

const PLAYER_PROFILES: Record<PlayerType, PlayerProfile> = {
  casual: {
    type: "casual",
    sessionsPerDay: 2, // Утро + вечер
    beatsPerSession: 2, // Пару битов и всё
    donatBudget: 0, // F2P
    motivation: "Расслабиться, пройти историю",
  },
  active: {
    type: "active",
    sessionsPerDay: 6, // Каждые 4 часа
    beatsPerSession: 2, // Стабильно
    donatBudget: 20, // Может купить пару бустов
    motivation: "Дойти до конца, увидеть всю историю",
  },
  whale: {
    type: "whale",
    sessionsPerDay: 12, // Постоянно онлайн
    beatsPerSession: 3, // Максимум битов
    donatBudget: 200, // Готов донатить серьёзно
    motivation: "Топ-1 в лидерборде, flex",
  },
}

// ============================================================================
// GAME STATE
// ============================================================================

interface GameState {
  day: number
  money: number
  reputation: number
  energy: number
  maxEnergy: number
  tier: number
  equipment: Set<string>
  totalBeatsCreated: number
  mcFlow: number

  // Донат
  donatedUSD: number
  hasEnergyBoost: boolean
  hasPassiveBoost: boolean
  hasQualityBoost: boolean
}

// ============================================================================
// SIMULATION
// ============================================================================

interface SimResult {
  day: number
  money: number
  reputation: number
  tier: number
  equipmentCount: number
  totalDonated: number
}

function simulate(profile: PlayerProfile, days: number = 60): SimResult[] {
  const state: GameState = {
    day: 1,
    money: 800,
    reputation: 0,
    energy: 150,
    maxEnergy: 150,
    tier: 1,
    equipment: new Set(["Phone"]),
    totalBeatsCreated: 0,
    mcFlow: 0,
    donatedUSD: 0,
    hasEnergyBoost: false,
    hasPassiveBoost: false,
    hasQualityBoost: false,
  }

  const results: SimResult[] = []

  // Донат в начале (whale покупает бусты сразу)
  if (profile.type === "whale" && state.donatedUSD < profile.donatBudget) {
    state.hasEnergyBoost = true
    state.hasPassiveBoost = true
    state.hasQualityBoost = true
    state.maxEnergy = Math.floor(150 * 1.5)
    state.donatedUSD += 30 // Energy + Passive + Quality = $30
  }

  // Active может купить один буст
  if (profile.type === "active" && state.donatedUSD < profile.donatBudget) {
    state.hasPassiveBoost = true
    state.donatedUSD += 10
  }

  for (let day = 1; day <= days; day++) {
    state.day = day

    for (let session = 0; session < profile.sessionsPerDay; session++) {
      // Passive income (4 часа AFK = 240 мин)
      const afkMinutes = 1440 / profile.sessionsPerDay
      const basePassive = getArtistIncome(state.mcFlow)
      const passiveMultiplier = state.hasPassiveBoost ? 2 : 1
      state.money += basePassive * afkMinutes * passiveMultiplier

      // Regenerate energy
      state.energy = state.maxEnergy

      // Create beats
      const tierData = getTierData(state.tier)
      const energyCost = tierData.energyCost

      for (let i = 0; i < profile.beatsPerSession; i++) {
        if (state.energy >= energyCost) {
          state.energy -= energyCost

          const quality = calculateQuality(state)
          const price = calculatePrice(quality, state.reputation, tierData.priceMultiplier)

          state.money += price
          state.totalBeatsCreated++

          // Reputation gain (больше в early game)
          const baseRepGain = state.tier === 1 ? 20 : state.tier === 2 ? 15 : state.tier === 3 ? 10 : 8
          state.reputation += baseRepGain
        }
      }
    }

    // Tier upgrade
    const newTier = getReputationTier(state.reputation)
    if (newTier > state.tier) {
      state.tier = newTier
      const tierEquip = TIER_EQUIPMENT[newTier]
      state.equipment.add(tierEquip.mainDevice.name)

      // Whale донатит чтобы сразу купить всё оборудование тира
      if (profile.type === "whale" && state.donatedUSD < profile.donatBudget) {
        const tierEquip = TIER_EQUIPMENT[state.tier]
        state.equipment.add(tierEquip.mainDevice.name)
        if (tierEquip.headphones) state.equipment.add(tierEquip.headphones.name)
        if (tierEquip.microphone) state.equipment.add(tierEquip.microphone.name)
        if (tierEquip.midi) state.equipment.add(tierEquip.midi.name)
        if (tierEquip.audioInterface) state.equipment.add(tierEquip.audioInterface.name)
        if (tierEquip.monitors) state.equipment.add(tierEquip.monitors.name)
        state.donatedUSD += 20 // "Skip grind" pack
      }
    }

    // Buy equipment
    const tierEquip = TIER_EQUIPMENT[state.tier]
    const buyOrder: Array<keyof TierEquipment> = ["headphones", "microphone", "midi", "audioInterface", "monitors"]

    for (const key of buyOrder) {
      const item = tierEquip[key]
      if (item && !state.equipment.has(item.name) && state.money > item.cost * 1.5) {
        state.money -= item.cost
        state.equipment.add(item.name)
        state.reputation += 50 // Покупка оборудования = инвестиция = известность
        break
      }
    }

    // Hire/upgrade artist
    if (state.reputation >= 100 && state.mcFlow === 0 && state.money > 100) {
      state.money -= 100
      state.mcFlow = 1
    } else if (state.mcFlow > 0 && state.mcFlow < 10) {
      const cost = Math.floor(100 * Math.pow(1.7, state.mcFlow))
      if (state.money > cost * 2) {
        state.money -= cost
        state.mcFlow++
      }
    }

    // Log progress
    if (day % 5 === 0 || day === days) {
      results.push({
        day,
        money: Math.floor(state.money),
        reputation: state.reputation,
        tier: state.tier,
        equipmentCount: state.equipment.size,
        totalDonated: state.donatedUSD,
      })
    }
  }

  return results
}

function calculateQuality(state: GameState): number {
  let quality = 30 + Math.random() * 15
  quality += state.tier * 10

  const tierEquip = TIER_EQUIPMENT[state.tier]
  if (state.equipment.has(tierEquip.mainDevice.name)) quality += tierEquip.mainDevice.qualityBonus
  if (tierEquip.headphones && state.equipment.has(tierEquip.headphones.name))
    quality += tierEquip.headphones.qualityBonus
  if (tierEquip.microphone && state.equipment.has(tierEquip.microphone.name))
    quality += tierEquip.microphone.qualityBonus
  if (tierEquip.midi && state.equipment.has(tierEquip.midi.name)) quality += tierEquip.midi.qualityBonus
  if (tierEquip.audioInterface && state.equipment.has(tierEquip.audioInterface.name))
    quality += tierEquip.audioInterface.qualityBonus
  if (tierEquip.monitors && state.equipment.has(tierEquip.monitors.name)) quality += tierEquip.monitors.qualityBonus

  if (state.hasQualityBoost) quality += 20

  return Math.min(100, Math.floor(quality))
}

function calculatePrice(quality: number, reputation: number, tierMultiplier: number): number {
  const basePrice = 30
  const qualityBonus = quality > 50 ? (quality - 50) * 1.2 : 0
  const reputationBonus = reputation * 0.2
  return Math.floor((basePrice + qualityBonus + reputationBonus) * tierMultiplier)
}

function getArtistIncome(level: number): number {
  const incomes = [0, 15, 25, 40, 65, 100, 150, 220, 310, 430, 580]
  return incomes[level] || 0
}

// ============================================================================
// HTML GENERATION
// ============================================================================

function generateHTML(
  casualResults: SimResult[],
  activeResults: SimResult[],
  whaleResults: SimResult[],
): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Producer Tycoon - Economy V3 Analysis 📊</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
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
      max-width: 1600px;
      margin: 0 auto;
    }

    h1 {
      font-family: 'Playfair Display', serif;
      text-align: center;
      color: white;
      font-size: 3rem;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .subtitle {
      text-align: center;
      color: rgba(255,255,255,0.9);
      font-size: 1.2rem;
      margin-bottom: 40px;
    }

    .profiles {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }

    .profile-card {
      background: white;
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .profile-card h3 {
      font-size: 1.5rem;
      margin-bottom: 15px;
      color: #667eea;
    }

    .profile-card .stat {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .profile-card .stat:last-child {
      border-bottom: none;
    }

    .casual { border-left: 5px solid #95e1d3; }
    .active { border-left: 5px solid #667eea; }
    .whale { border-left: 5px solid #f093fb; }

    .charts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }

    .chart-container {
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .chart-container h2 {
      margin-bottom: 20px;
      color: #333;
    }

    canvas {
      max-height: 350px;
    }

    .insights {
      background: white;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      margin-bottom: 40px;
    }

    .insights h2 {
      font-family: 'Playfair Display', serif;
      color: #667eea;
      margin-bottom: 20px;
    }

    .insights ul {
      list-style: none;
      padding: 0;
    }

    .insights li {
      padding: 12px 0;
      padding-left: 30px;
      position: relative;
      line-height: 1.6;
    }

    .insights li:before {
      content: "💡";
      position: absolute;
      left: 0;
      font-size: 1.2rem;
    }

    @media (max-width: 1200px) {
      .profiles { grid-template-columns: 1fr; }
      .charts { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎮 Producer Tycoon: Economy V3</h1>
    <div class="subtitle">Сравнение 3 типов игроков - 60 дней симуляции</div>

    <div class="profiles">
      <div class="profile-card casual">
        <h3>😌 Casual Player</h3>
        <div class="stat">
          <span>Финальный капитал:</span>
          <strong>$${casualResults[casualResults.length - 1].money.toLocaleString()}</strong>
        </div>
        <div class="stat">
          <span>Репутация:</span>
          <strong>${casualResults[casualResults.length - 1].reputation.toLocaleString()}</strong>
        </div>
        <div class="stat">
          <span>Tier:</span>
          <strong>${casualResults[casualResults.length - 1].tier}/6</strong>
        </div>
        <div class="stat">
          <span>Оборудование:</span>
          <strong>${casualResults[casualResults.length - 1].equipmentCount} шт</strong>
        </div>
        <div class="stat">
          <span>Донат:</span>
          <strong>$0 (F2P)</strong>
        </div>
        <div style="margin-top: 15px; color: #666; font-size: 0.9rem;">
          Заходит 2 раза в день, делает пару битов. Проходит историю без спешки.
        </div>
      </div>

      <div class="profile-card active">
        <h3>🎯 Active Player</h3>
        <div class="stat">
          <span>Финальный капитал:</span>
          <strong>$${activeResults[activeResults.length - 1].money.toLocaleString()}</strong>
        </div>
        <div class="stat">
          <span>Репутация:</span>
          <strong>${activeResults[activeResults.length - 1].reputation.toLocaleString()}</strong>
        </div>
        <div class="stat">
          <span>Tier:</span>
          <strong>${activeResults[activeResults.length - 1].tier}/6</strong>
        </div>
        <div class="stat">
          <span>Оборудование:</span>
          <strong>${activeResults[activeResults.length - 1].equipmentCount} шт</strong>
        </div>
        <div class="stat">
          <span>Донат:</span>
          <strong>$${activeResults[activeResults.length - 1].totalDonated}</strong>
        </div>
        <div style="margin-top: 15px; color: #666; font-size: 0.9rem;">
          Заходит каждые 4 часа (6 раз в день). Наша целевая аудитория!
        </div>
      </div>

      <div class="profile-card whale">
        <h3>🐋 Whale Player</h3>
        <div class="stat">
          <span>Финальный капитал:</span>
          <strong>$${whaleResults[whaleResults.length - 1].money.toLocaleString()}</strong>
        </div>
        <div class="stat">
          <span>Репутация:</span>
          <strong>${whaleResults[whaleResults.length - 1].reputation.toLocaleString()}</strong>
        </div>
        <div class="stat">
          <span>Tier:</span>
          <strong>${whaleResults[whaleResults.length - 1].tier}/6</strong>
        </div>
        <div class="stat">
          <span>Оборудование:</span>
          <strong>${whaleResults[whaleResults.length - 1].equipmentCount} шт</strong>
        </div>
        <div class="stat">
          <span>Донат:</span>
          <strong style="color: #f093fb;">$${whaleResults[whaleResults.length - 1].totalDonated}</strong>
        </div>
        <div style="margin-top: 15px; color: #666; font-size: 0.9rem;">
          Играет постоянно, донатит за speed-up. Хочет топ-1 в лидерборде!
        </div>
      </div>
    </div>

    <div class="charts">
      <div class="chart-container">
        <h2>💰 Деньги во времени</h2>
        <canvas id="moneyChart"></canvas>
      </div>

      <div class="chart-container">
        <h2>⭐ Репутация</h2>
        <canvas id="reputationChart"></canvas>
      </div>

      <div class="chart-container">
        <h2>🏆 Tier прогрессия</h2>
        <canvas id="tierChart"></canvas>
      </div>

      <div class="chart-container">
        <h2>🎛️ Оборудование</h2>
        <canvas id="equipmentChart"></canvas>
      </div>
    </div>

    <div class="insights">
      <h2>💡 Инсайты и выводы</h2>
      <ul>
        <li><strong>Casual игрок (F2P)</strong> проходит ${casualResults[casualResults.length - 1].tier}/6 тиров за 60 дней. Это OK для casual - они не спешат.</li>
        <li><strong>Active игрок</strong> (наша ЦА) достигает ${activeResults[activeResults.length - 1].tier}/6 тиров. Это наш таргет баланс!</li>
        <li><strong>Whale</strong> с донатом $${whaleResults[whaleResults.length - 1].totalDonated} доходит до ${whaleResults[whaleResults.length - 1].tier}/6 тиров - ощутимое преимущество!</li>
        <li><strong>Донат не обязателен</strong> для прохождения, но даёт преимущество в скорости и лидерборде.</li>
        <li><strong>Post-game контент:</strong> После Tier 6 - соревнование за репутацию/деньги в лидерборде.</li>
        <li><strong>Монетизация:</strong> Speed-up бусты ($5-30) + косметика ($5-10) + "skip grind" паки ($20-50).</li>
        <li><strong>LTV прогноз:</strong> Casual $0, Active $10-30, Whale $50-200. Средний ARPPU ~$15.</li>
      </ul>
    </div>

    <div class="insights">
      <h2>🎮 Донат механики (предложения)</h2>
      <ul>
        <li><strong>Energy Boost ($5)</strong> - +50% max energy = больше битов за сессию</li>
        <li><strong>Passive x2 ($10)</strong> - ×2 пассивный доход = быстрее прогресс</li>
        <li><strong>Pro Tools ($15)</strong> - +20% качество битов = больше денег</li>
        <li><strong>Skip Grind Pack ($20)</strong> - Разблокировать всё оборудование текущего тира</li>
        <li><strong>Marketing Campaign ($30)</strong> - +5000 reputation бустер</li>
        <li><strong>Косметика ($5-10)</strong> - Кастомный аватар, скины студии, эффекты</li>
        <li><strong>Leaderboard Flex</strong> - Whale донатит чтобы быть топ-1, это престиж!</li>
      </ul>
    </div>

    <div class="insights">
      <h2>🏆 Лидерборды (post-game контент)</h2>
      <ul>
        <li><strong>Global Leaderboard</strong> - Топ-100 по репутации (обновляется каждый день)</li>
        <li><strong>Weekly Leaderboard</strong> - Кто заработал больше всех за неделю?</li>
        <li><strong>Total Earnings</strong> - Lifetime лидерборд по деньгам</li>
        <li><strong>Speed Run</strong> - Кто быстрее всех дошёл до Tier 6?</li>
        <li><strong>Rewards:</strong> Топ-10 получают эксклюзивные скины, бейджи, титулы</li>
        <li><strong>Whale мотивация:</strong> Донат = конкурентное преимущество в лидерборде</li>
      </ul>
    </div>
  </div>

  <script>
    const casualData = ${JSON.stringify(casualResults)};
    const activeData = ${JSON.stringify(activeResults)};
    const whaleData = ${JSON.stringify(whaleResults)};

    const chartConfig = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: true } }
    };

    // Money Chart
    new Chart(document.getElementById('moneyChart'), {
      type: 'line',
      data: {
        labels: casualData.map(d => 'День ' + d.day),
        datasets: [
          {
            label: 'Casual (F2P)',
            data: casualData.map(d => d.money),
            borderColor: '#95e1d3',
            backgroundColor: 'rgba(149, 225, 211, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Active ($20 донат)',
            data: activeData.map(d => d.money),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Whale ($200 донат)',
            data: whaleData.map(d => d.money),
            borderColor: '#f093fb',
            backgroundColor: 'rgba(240, 147, 251, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: chartConfig
    });

    // Reputation Chart
    new Chart(document.getElementById('reputationChart'), {
      type: 'line',
      data: {
        labels: casualData.map(d => 'День ' + d.day),
        datasets: [
          {
            label: 'Casual',
            data: casualData.map(d => d.reputation),
            borderColor: '#95e1d3',
            tension: 0.4
          },
          {
            label: 'Active',
            data: activeData.map(d => d.reputation),
            borderColor: '#667eea',
            tension: 0.4
          },
          {
            label: 'Whale',
            data: whaleData.map(d => d.reputation),
            borderColor: '#f093fb',
            tension: 0.4
          }
        ]
      },
      options: chartConfig
    });

    // Tier Chart
    new Chart(document.getElementById('tierChart'), {
      type: 'line',
      data: {
        labels: casualData.map(d => 'День ' + d.day),
        datasets: [
          {
            label: 'Casual',
            data: casualData.map(d => d.tier),
            borderColor: '#95e1d3',
            stepped: true
          },
          {
            label: 'Active',
            data: activeData.map(d => d.tier),
            borderColor: '#667eea',
            stepped: true
          },
          {
            label: 'Whale',
            data: whaleData.map(d => d.tier),
            borderColor: '#f093fb',
            stepped: true
          }
        ]
      },
      options: {
        ...chartConfig,
        scales: {
          y: { min: 1, max: 6, ticks: { stepSize: 1 } }
        }
      }
    });

    // Equipment Chart
    new Chart(document.getElementById('equipmentChart'), {
      type: 'line',
      data: {
        labels: casualData.map(d => 'День ' + d.day),
        datasets: [
          {
            label: 'Casual',
            data: casualData.map(d => d.equipmentCount),
            borderColor: '#95e1d3',
            stepped: true
          },
          {
            label: 'Active',
            data: activeData.map(d => d.equipmentCount),
            borderColor: '#667eea',
            stepped: true
          },
          {
            label: 'Whale',
            data: whaleData.map(d => d.equipmentCount),
            borderColor: '#f093fb',
            stepped: true
          }
        ]
      },
      options: chartConfig
    });
  </script>
</body>
</html>`
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log("🎮 Economy V3: Full Balance Analysis")
  console.log("⏰ Симулируем 3 типа игроков на 60 дней...\n")

  const casualResults = simulate(PLAYER_PROFILES.casual, 60)
  const activeResults = simulate(PLAYER_PROFILES.active, 60)
  const whaleResults = simulate(PLAYER_PROFILES.whale, 60)

  console.log("✅ Симуляция завершена!\n")
  console.log("😌 CASUAL (F2P):")
  console.log(`   Tier: ${casualResults[casualResults.length - 1].tier}/6`)
  console.log(`   Money: $${casualResults[casualResults.length - 1].money.toLocaleString()}`)
  console.log(`   Rep: ${casualResults[casualResults.length - 1].reputation}`)
  console.log()
  console.log("🎯 ACTIVE ($20 донат):")
  console.log(`   Tier: ${activeResults[activeResults.length - 1].tier}/6`)
  console.log(`   Money: $${activeResults[activeResults.length - 1].money.toLocaleString()}`)
  console.log(`   Rep: ${activeResults[activeResults.length - 1].reputation}`)
  console.log()
  console.log("🐋 WHALE ($200+ донат):")
  console.log(`   Tier: ${whaleResults[whaleResults.length - 1].tier}/6`)
  console.log(`   Money: $${whaleResults[whaleResults.length - 1].money.toLocaleString()}`)
  console.log(`   Rep: ${whaleResults[whaleResults.length - 1].reputation}`)

  const html = generateHTML(casualResults, activeResults, whaleResults)
  fs.writeFileSync("economy-v3-full-analysis.html", html)

  console.log("\n📄 HTML отчёт: economy-v3-full-analysis.html")
  console.log("🌐 Открой в браузере для полной визуализации!")
}

main()
