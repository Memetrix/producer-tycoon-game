/**
 * Economy Simulator - Simulates 24 hours of gameplay
 *
 * This script simulates a player's progression through the first 24 hours
 * Uses actual game formulas from the codebase
 */

import * as fs from "fs"

// ============================================================================
// GAME CONSTANTS (from game-state.ts and stage-screen.tsx)
// ============================================================================

const ENERGY_CONFIG = {
  BASE_MAX_ENERGY: 150,
  ENERGY_REGEN_PER_MINUTE: 2,
  ENERGY_COST_PER_BEAT: 15,
}

const BASE_BEAT_PRICE = 30 // from stage-screen.tsx:108
const BASE_EQUIPMENT_PRICE = 100 // Base price for equipment lvl 1

// Equipment costs scale: basePrice * (2.5 ^ level)
// Equipment bonuses: phone gives quality bonus
const EQUIPMENT_MULTIPLIER = 2.5

// Reputation tier multipliers (from game-state.ts)
const TIER_PRICE_MULTIPLIERS = [1.0, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5]

function getReputationTier(reputation: number): number {
  if (reputation < 500) return 1
  if (reputation < 2000) return 2
  if (reputation < 5000) return 3
  if (reputation < 15000) return 4
  if (reputation < 50000) return 5
  return 6
}

function getTierPriceMultiplier(reputation: number): number {
  const tier = getReputationTier(reputation)
  return TIER_PRICE_MULTIPLIERS[tier]
}

// ============================================================================
// GAME STATE
// ============================================================================

interface SimulationState {
  money: number
  reputation: number
  energy: number
  equipment: {
    phone: number
    headphones: number
    microphone: number
    computer: number
    midi: number
    audioInterface: number
  }
  totalBeatsCreated: number
  totalMoneyEarned: number

  // Artists (passive income)
  artists: {
    "mc-flow": number
    "lil-dreamer": number
    "street-poet": number
    "young-legend": number
  }

  // Time tracking
  minutesPassed: number
}

const INITIAL_STATE: SimulationState = {
  money: 800, // Starting money (from INITIAL_GAME_STATE)
  reputation: 0,
  energy: 150,
  equipment: {
    phone: 1,
    headphones: 0,
    microphone: 0,
    computer: 0,
    midi: 0,
    audioInterface: 0,
  },
  totalBeatsCreated: 0,
  totalMoneyEarned: 0,
  artists: {
    "mc-flow": 0,
    "lil-dreamer": 0,
    "street-poet": 0,
    "young-legend": 0,
  },
  minutesPassed: 0,
}

// ============================================================================
// GAME FORMULAS (from stage-screen.tsx and studio-screen.tsx)
// ============================================================================

function calculateQuality(equipment: SimulationState["equipment"]): number {
  // Quality based on equipment levels (from stage-screen.tsx)
  const phoneBonus = equipment.phone * 5
  const headphonesBonus = equipment.headphones * 3
  const micBonus = equipment.microphone * 4
  const computerBonus = equipment.computer * 3
  const midiBonus = equipment.midi * 2
  const audioInterfaceBonus = equipment.audioInterface * 4

  const totalBonus = phoneBonus + headphonesBonus + micBonus + computerBonus + midiBonus + audioInterfaceBonus

  // Base quality 30-50, equipment adds to this
  const baseQuality = 30 + Math.random() * 20
  return Math.min(100, baseQuality + totalBonus)
}

function calculatePrice(quality: number, reputation: number, equipment: SimulationState["equipment"]): number {
  // Price calculation from stage-screen.tsx
  const basePrice = BASE_BEAT_PRICE

  // Quality bonus: 0.5% per quality point above 50
  const qualityBonus = quality > 50 ? (quality - 50) * 0.5 : 0

  // Reputation bonus: 0.2% per reputation point
  const reputationBonus = reputation * 0.2

  // Tier multiplier
  const tierMultiplier = getTierPriceMultiplier(reputation)

  const finalPrice = (basePrice + qualityBonus + reputationBonus) * tierMultiplier

  return Math.floor(finalPrice)
}

function getEquipmentCost(equipmentType: string, currentLevel: number): number {
  // Equipment cost scaling (from studio-screen.tsx)
  const basePrice = BASE_EQUIPMENT_PRICE
  return Math.floor(basePrice * Math.pow(EQUIPMENT_MULTIPLIER, currentLevel))
}

function getArtistCost(artistId: string, currentLevel: number): number {
  // Artist costs (from game-state.ts ARTISTS_CONFIG)
  const baseCosts: Record<string, number> = {
    "street-poet": 70,
    "mc-flow": 80,
    "lil-dreamer": 100,
    "young-legend": 200,
  }

  const baseCost = baseCosts[artistId] || 100
  const costMultiplier = 1.6

  return Math.floor(baseCost * Math.pow(costMultiplier, currentLevel))
}

function getArtistIncome(artistId: string, level: number): number {
  // Income per minute for each artist at each level
  const incomePerLevel: Record<string, number[]> = {
    "street-poet": [0, 5, 7, 10, 14, 20, 28, 38, 50, 65, 85],
    "mc-flow": [0, 6, 9, 13, 18, 25, 34, 46, 62, 82, 108],
    "lil-dreamer": [0, 8, 11, 16, 22, 30, 41, 56, 76, 102, 136],
    "young-legend": [0, 12, 18, 26, 36, 50, 68, 92, 124, 166, 222],
  }

  return incomePerLevel[artistId]?.[level] || 0
}

function getTotalPassiveIncome(artists: SimulationState["artists"]): number {
  let total = 0
  for (const [artistId, level] of Object.entries(artists)) {
    total += getArtistIncome(artistId, level)
  }
  return total
}

// ============================================================================
// SIMULATION LOGIC
// ============================================================================

interface SimulationLog {
  minute: number
  event: string
  money: number
  reputation: number
  energy: number
  equipmentLevel: number
  beatPrice?: number
  passiveIncome: number
}

function simulateGameplay(hoursToSimulate: number = 24): SimulationLog[] {
  const state = { ...INITIAL_STATE }
  const log: SimulationLog[] = []
  const totalMinutes = hoursToSimulate * 60

  // Log initial state
  log.push({
    minute: 0,
    event: "Начало игры",
    money: state.money,
    reputation: state.reputation,
    energy: state.energy,
    equipmentLevel: state.equipment.phone,
    passiveIncome: 0,
  })

  for (let minute = 1; minute <= totalMinutes; minute++) {
    state.minutesPassed = minute

    // === ENERGY REGENERATION ===
    // Regenerate energy every minute (2 energy/min)
    if (state.energy < ENERGY_CONFIG.BASE_MAX_ENERGY) {
      state.energy = Math.min(ENERGY_CONFIG.BASE_MAX_ENERGY, state.energy + ENERGY_CONFIG.ENERGY_REGEN_PER_MINUTE)
    }

    // === PASSIVE INCOME ===
    // Artists generate income every minute
    const passiveIncome = getTotalPassiveIncome(state.artists)
    if (passiveIncome > 0) {
      state.money += passiveIncome
      state.totalMoneyEarned += passiveIncome
    }

    // === ACTIVE GAMEPLAY: CREATE BEATS ===
    // Player creates beats whenever they have energy
    if (state.energy >= ENERGY_CONFIG.ENERGY_COST_PER_BEAT) {
      state.energy -= ENERGY_CONFIG.ENERGY_COST_PER_BEAT

      const quality = calculateQuality(state.equipment)
      const price = calculatePrice(quality, state.reputation, state.equipment)

      state.money += price
      state.totalMoneyEarned += price
      state.totalBeatsCreated++
      state.reputation += 1 // +1 rep per beat

      log.push({
        minute,
        event: `Создан бит #${state.totalBeatsCreated}`,
        money: state.money,
        reputation: state.reputation,
        energy: state.energy,
        equipmentLevel: state.equipment.phone,
        beatPrice: price,
        passiveIncome,
      })
    }

    // === EQUIPMENT UPGRADES ===
    // Try to upgrade equipment when we have enough money
    const phoneLevel = state.equipment.phone
    const phoneUpgradeCost = getEquipmentCost("phone", phoneLevel)

    // Only upgrade if:
    // 1. We have enough money
    // 2. We keep at least 20% of our money as reserve
    // 3. Upgrade is not too expensive relative to our total earnings
    if (state.money > phoneUpgradeCost * 1.5 && phoneLevel < 10) {
      state.money -= phoneUpgradeCost
      state.equipment.phone++

      log.push({
        minute,
        event: `📱 Улучшение Phone до уровня ${state.equipment.phone}`,
        money: state.money,
        reputation: state.reputation,
        energy: state.energy,
        equipmentLevel: state.equipment.phone,
        passiveIncome,
      })
    }

    // === ARTIST HIRING ===
    // Try to hire/upgrade artists when affordable
    if (state.reputation >= 0 && state.artists["mc-flow"] === 0) {
      const cost = getArtistCost("mc-flow", 0)
      if (state.money > cost * 2) {
        state.money -= cost
        state.artists["mc-flow"] = 1

        log.push({
          minute,
          event: `🎤 Нанят MC Flow (уровень 1)`,
          money: state.money,
          reputation: state.reputation,
          energy: state.energy,
          equipmentLevel: state.equipment.phone,
          passiveIncome: getTotalPassiveIncome(state.artists),
        })
      }
    }

    // Upgrade MC Flow
    if (state.artists["mc-flow"] > 0 && state.artists["mc-flow"] < 10) {
      const cost = getArtistCost("mc-flow", state.artists["mc-flow"])
      if (state.money > cost * 3 && passiveIncome < state.totalMoneyEarned / (minute * 0.2)) {
        // Only upgrade if passive income is still low relative to active earnings
        state.money -= cost
        state.artists["mc-flow"]++

        log.push({
          minute,
          event: `⬆️ MC Flow → уровень ${state.artists["mc-flow"]}`,
          money: state.money,
          reputation: state.reputation,
          energy: state.energy,
          equipmentLevel: state.equipment.phone,
          passiveIncome: getTotalPassiveIncome(state.artists),
        })
      }
    }

    // Log every 60 minutes (1 hour)
    if (minute % 60 === 0) {
      log.push({
        minute,
        event: `⏰ Прошёл ${minute / 60} час`,
        money: state.money,
        reputation: state.reputation,
        energy: state.energy,
        equipmentLevel: state.equipment.phone,
        passiveIncome,
      })
    }
  }

  // Final state
  log.push({
    minute: totalMinutes,
    event: "=== ИТОГИ ===",
    money: state.money,
    reputation: state.reputation,
    energy: state.energy,
    equipmentLevel: state.equipment.phone,
    passiveIncome: getTotalPassiveIncome(state.artists),
  })

  return log
}

// ============================================================================
// OUTPUT GENERATION
// ============================================================================

function generateHTMLReport(log: SimulationLog[]): string {
  // Extract data for charts
  const chartData = log.map((entry) => ({
    minute: entry.minute,
    hour: entry.minute / 60,
    money: entry.money,
    reputation: entry.reputation,
    energy: entry.energy,
    equipmentLevel: entry.equipmentLevel,
    beatPrice: entry.beatPrice || 0,
    passiveIncome: entry.passiveIncome,
  }))

  // Calculate key metrics
  const finalEntry = log[log.length - 1]
  const beatsCreated = log.filter((e) => e.event.includes("Создан бит")).length
  const equipmentUpgrades = log.filter((e) => e.event.includes("Улучшение")).length
  const artistHires = log.filter((e) => e.event.includes("Нанят") || e.event.includes("→ уровень")).length

  const avgBeatPrice =
    chartData.filter((d) => d.beatPrice > 0).reduce((sum, d) => sum + d.beatPrice, 0) /
    Math.max(1, chartData.filter((d) => d.beatPrice > 0).length)

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Симуляция экономики - 24 часа</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      padding: 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      text-align: center;
      color: white;
      margin-bottom: 30px;
      font-size: 2.5rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .metric-card h3 {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-card .value {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
    }

    .metric-card .subvalue {
      font-size: 0.9rem;
      color: #999;
      margin-top: 4px;
    }

    .charts {
      display: grid;
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .chart-container h2 {
      margin-bottom: 20px;
      color: #333;
      font-size: 1.5rem;
    }

    canvas {
      max-height: 400px;
    }

    .log {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-top: 30px;
    }

    .log h2 {
      margin-bottom: 20px;
      color: #333;
    }

    .log-entry {
      padding: 10px;
      border-bottom: 1px solid #eee;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }

    .log-entry:last-child {
      border-bottom: none;
    }

    .log-entry.highlight {
      background: #f0f7ff;
      font-weight: bold;
    }

    .minute {
      color: #999;
      margin-right: 10px;
    }

    .event {
      color: #333;
    }

    .stats {
      display: flex;
      gap: 15px;
      color: #666;
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎮 Симуляция экономики - Первые 24 часа</h1>

    <div class="metrics">
      <div class="metric-card">
        <h3>💰 Итоговые деньги</h3>
        <div class="value">$${finalEntry.money.toLocaleString()}</div>
        <div class="subvalue">Начало: $800</div>
      </div>

      <div class="metric-card">
        <h3>⭐ Репутация</h3>
        <div class="value">${finalEntry.reputation.toLocaleString()}</div>
        <div class="subvalue">Тир ${getReputationTier(finalEntry.reputation)}</div>
      </div>

      <div class="metric-card">
        <h3>🎵 Битов создано</h3>
        <div class="value">${beatsCreated}</div>
        <div class="subvalue">Средняя цена: $${avgBeatPrice.toFixed(0)}</div>
      </div>

      <div class="metric-card">
        <h3>📱 Уровень оборудования</h3>
        <div class="value">${finalEntry.equipmentLevel}</div>
        <div class="subvalue">Апгрейдов: ${equipmentUpgrades}</div>
      </div>

      <div class="metric-card">
        <h3>🎤 Артисты</h3>
        <div class="value">${artistHires}</div>
        <div class="subvalue">Наймов/улучшений</div>
      </div>

      <div class="metric-card">
        <h3>💸 Пассивный доход</h3>
        <div class="value">$${finalEntry.passiveIncome}/мин</div>
        <div class="subvalue">$${finalEntry.passiveIncome * 60}/час</div>
      </div>
    </div>

    <div class="charts">
      <div class="chart-container">
        <h2>💰 Деньги во времени</h2>
        <canvas id="moneyChart"></canvas>
      </div>

      <div class="chart-container">
        <h2>📈 Доход за бит</h2>
        <canvas id="beatPriceChart"></canvas>
      </div>

      <div class="chart-container">
        <h2>⚡ Энергия</h2>
        <canvas id="energyChart"></canvas>
      </div>

      <div class="chart-container">
        <h2>⭐ Репутация и уровень оборудования</h2>
        <canvas id="progressChart"></canvas>
      </div>

      <div class="chart-container">
        <h2>💸 Активный vs Пассивный доход</h2>
        <canvas id="incomeChart"></canvas>
      </div>
    </div>

    <div class="log">
      <h2>📝 Лог событий (ключевые моменты)</h2>
      ${log
        .filter((entry) => entry.event !== "")
        .map(
          (entry) =>
            `<div class="log-entry ${entry.event.includes("===") || entry.event.includes("⏰") ? "highlight" : ""}">
          <span class="minute">[${Math.floor(entry.minute / 60)}ч ${entry.minute % 60}м]</span>
          <span class="event">${entry.event}</span>
          <div class="stats">
            <span>💰 $${entry.money.toLocaleString()}</span>
            <span>⭐ ${entry.reputation}</span>
            <span>⚡ ${entry.energy}</span>
            ${entry.beatPrice ? `<span>🎵 $${entry.beatPrice}</span>` : ""}
          </div>
        </div>`,
        )
        .join("")}
    </div>
  </div>

  <script>
    const chartData = ${JSON.stringify(chartData)};

    const chartConfig = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
        }
      }
    };

    // Money Chart
    new Chart(document.getElementById('moneyChart'), {
      type: 'line',
      data: {
        labels: chartData.map(d => d.hour.toFixed(1) + 'h'),
        datasets: [{
          label: 'Деньги ($)',
          data: chartData.map(d => d.money),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: chartConfig
    });

    // Beat Price Chart
    new Chart(document.getElementById('beatPriceChart'), {
      type: 'line',
      data: {
        labels: chartData.filter(d => d.beatPrice > 0).map(d => d.hour.toFixed(1) + 'h'),
        datasets: [{
          label: 'Цена бита ($)',
          data: chartData.filter(d => d.beatPrice > 0).map(d => d.beatPrice),
          borderColor: '#f093fb',
          backgroundColor: 'rgba(240, 147, 251, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: chartConfig
    });

    // Energy Chart
    new Chart(document.getElementById('energyChart'), {
      type: 'line',
      data: {
        labels: chartData.map(d => d.hour.toFixed(1) + 'h'),
        datasets: [{
          label: 'Энергия',
          data: chartData.map(d => d.energy),
          borderColor: '#ffa600',
          backgroundColor: 'rgba(255, 166, 0, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: chartConfig
    });

    // Progress Chart
    new Chart(document.getElementById('progressChart'), {
      type: 'line',
      data: {
        labels: chartData.map(d => d.hour.toFixed(1) + 'h'),
        datasets: [
          {
            label: 'Репутация',
            data: chartData.map(d => d.reputation),
            borderColor: '#4ecdc4',
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            yAxisID: 'y',
            tension: 0.4
          },
          {
            label: 'Уровень оборудования',
            data: chartData.map(d => d.equipmentLevel),
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            yAxisID: 'y1',
            tension: 0.4
          }
        ]
      },
      options: {
        ...chartConfig,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Репутация' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Уровень оборудования' },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });

    // Income Comparison Chart
    new Chart(document.getElementById('incomeChart'), {
      type: 'line',
      data: {
        labels: chartData.map(d => d.hour.toFixed(1) + 'h'),
        datasets: [
          {
            label: 'Цена за бит (активный доход)',
            data: chartData.map(d => d.beatPrice || null),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            spanGaps: true
          },
          {
            label: 'Пассивный доход ($/мин)',
            data: chartData.map(d => d.passiveIncome),
            borderColor: '#764ba2',
            backgroundColor: 'rgba(118, 75, 162, 0.1)',
            tension: 0.4
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
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log("🎮 Запуск симуляции экономики...")
  console.log("⏰ Симулируем первые 24 часа игры\n")

  const log = simulateGameplay(24)

  console.log("✅ Симуляция завершена!")
  console.log(`📊 Записей в логе: ${log.length}`)
  console.log(`🎵 Битов создано: ${log.filter((e) => e.event.includes("Создан бит")).length}`)
  console.log(`💰 Итоговая сумма: $${log[log.length - 1].money}`)
  console.log(`⭐ Итоговая репутация: ${log[log.length - 1].reputation}`)
  console.log()

  // Generate HTML report
  const html = generateHTMLReport(log)
  const outputPath = "economy-simulation-report.html"
  fs.writeFileSync(outputPath, html)

  console.log(`📄 HTML отчёт сохранён: ${outputPath}`)
  console.log("🌐 Открой файл в браузере чтобы увидеть графики!")
}

main()
