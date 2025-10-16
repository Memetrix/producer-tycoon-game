/**
 * Economy Simulator with Narrative - Simulates 60 days with story milestones
 */

import * as fs from "fs"

// ============================================================================
// GAME CONSTANTS
// ============================================================================

const ENERGY_CONFIG = {
  BASE_MAX_ENERGY: 150,
  ENERGY_REGEN_PER_MINUTE: 2,
}

// Dynamic energy cost based on reputation tier
function getEnergyCostPerBeat(reputation: number): number {
  const tier = getReputationTier(reputation)
  const costs = [15, 15, 20, 25, 30, 35, 40] // Energy cost per tier
  return costs[tier]
}

const BASE_BEAT_PRICE = 30
const BASE_EQUIPMENT_PRICE = 100
const EQUIPMENT_MULTIPLIER = 2.5

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
// NARRATIVE MILESTONES
// ============================================================================

interface NarrativeMilestone {
  day: number
  reputation?: number
  title: string
  description: string
  type: "story" | "tier_change" | "achievement"
  tier?: number
}

const NARRATIVE_MILESTONES: NarrativeMilestone[] = [
  // ACT I: ГОЛОДНЫЙ ХУДОЖНИК
  {
    day: 1,
    title: "🎤 Начало пути",
    description: "Ты делаешь биты в своей комнате на телефоне. Мама не верит в тебя. Но у тебя есть мечта.",
    type: "story",
    tier: 1,
  },
  {
    day: 3,
    title: "💰 Первая продажа",
    description: "Кто-то купил твой бит за $50! Это реально работает!",
    type: "achievement",
  },
  {
    day: 7,
    title: "📱 Первое улучшение",
    description: "Накопил на ноутбук! Теперь можно делать биты получше.",
    type: "achievement",
  },
  {
    reputation: 500,
    title: "⭐ TIER 2: Местная знаменитость",
    description: "Твой трек крутят на районной радиостанции! Тебя узнают на улице.",
    type: "tier_change",
    tier: 2,
  },

  // ACT II: РАСТУЩАЯ ЗВЕЗДА
  {
    day: 12,
    title: "🤝 Встреча с MC Flow",
    description: "Твой первый настоящий коллаборатор! Начинающий рэпер хочет работать с тобой.",
    type: "story",
  },
  {
    day: 15,
    title: "🎵 Крупная сделка",
    description: "Известный рэпер купил твой бит за $250!",
    type: "achievement",
  },
  {
    day: 17,
    title: "😡 Драма: Украденный бит",
    description: "Fake Producer украл твой бит и выдал за свой. Как поступишь?",
    type: "story",
  },
  {
    reputation: 2000,
    title: "⭐ TIER 3: Региональная звезда",
    description: "Статья про тебя в хип-хоп блоге! Ты известен в своём регионе.",
    type: "tier_change",
    tier: 3,
  },

  // ACT III: РЕГИОНАЛЬНЫЙ ГЕРОЙ
  {
    day: 23,
    title: "🎸 Контракт с Indie Label",
    description: "Независимый лейбл предлагает сделку. $5K инвестиций = +$50/час пассива.",
    type: "achievement",
  },
  {
    day: 27,
    title: "📈 Топ-100 региона",
    description: "Твой трек попал в топ-100 региона! 50K прослушиваний.",
    type: "achievement",
  },
  {
    day: 30,
    title: "🌟 Встреча с Metro Maximus",
    description: "Легендарный продюсер слышал твои работы. Он предлагает тебе тест...",
    type: "story",
  },
  {
    reputation: 5000,
    title: "⭐ TIER 4: Национальная звезда",
    description: "Интервью в национальном журнале! Ты работаешь с топовыми артистами страны.",
    type: "tier_change",
    tier: 4,
  },

  // ACT IV: НАЦИОНАЛЬНАЯ ЗВЕЗДА
  {
    day: 35,
    title: "🎤 Small Label Deal",
    description: "$20K инвестиций в твою карьеру. Пассивный доход +$200/час.",
    type: "achievement",
  },
  {
    day: 40,
    title: "💿 Платиновый трек",
    description: "Трек с твоим битом стал платиновым! 1M+ прослушиваний.",
    type: "achievement",
  },
  {
    day: 42,
    title: "💔 Творческий кризис",
    description: "Критик пишет: 'Он продался'. Ты делаешь то что продаётся, а не то что любишь...",
    type: "story",
  },
  {
    day: 45,
    title: "🙏 Воссоединение",
    description: "Street Poet - твой старый друг напоминает откуда ты. Почему ты начинал?",
    type: "story",
  },
  {
    reputation: 15000,
    title: "⭐ TIER 5: Международный уровень",
    description: "Приглашение на национальную премию! Forbes написал про тебя статью.",
    type: "tier_change",
    tier: 5,
  },

  // ACT V: МЕЖДУНАРОДНЫЙ УРОВЕНЬ
  {
    day: 48,
    title: "🏢 Major Label Contract",
    description: "$100K инвестиций! Контракт с крупным лейблом. Ты на вершине.",
    type: "achievement",
  },
  {
    day: 50,
    title: "🏆 Номинация на Грэмми",
    description: "Ты номинирован на премию 'Продюсер года'!",
    type: "achievement",
  },
  {
    day: 52,
    title: "😢 Цена успеха",
    description: "Старый друг: 'Ты изменился. Я скучаю по старому тебе.' Ты счастлив?",
    type: "story",
  },
  {
    day: 55,
    title: "🎬 Документальный фильм",
    description: "О тебе снимают док-фильм. Ты пересматриваешь свой путь от начала до конца.",
    type: "story",
  },
  {
    reputation: 50000,
    title: "⭐ TIER 6: ЛЕГЕНДА",
    description: "Ты больше не продюсер. Ты - институция. Dr. Dre. Timbaland. Metro Boomin.",
    type: "tier_change",
    tier: 6,
  },

  // ACT VI: ЛЕГЕНДА
  {
    day: 58,
    title: "🏭 Своя компания",
    description: "Ты открываешь свою звукозаписывающую компанию. Новое поколение смотрит на тебя.",
    type: "achievement",
  },
  {
    day: 59,
    title: "👨‍🏫 Передача знаний",
    description: "Молодой продюсер просит совета. Ты помогаешь ему - как тебе когда-то помог Metro.",
    type: "story",
  },
  {
    day: 60,
    title: "🎊 ФИНАЛ: Грэмми церемония",
    description: "И продюсер года... [ТВОЁ ИМЯ]! Ты прошёл путь от никого до легенды. Ты сделал это.",
    type: "achievement",
  },
]

// ============================================================================
// GAME STATE
// ============================================================================

interface SimulationState {
  day: number
  money: number
  reputation: number
  energy: number
  equipment: { phone: number }
  totalBeatsCreated: number
  artists: { "mc-flow": number }
  minutesPassed: number
  currentTier: number
}

const INITIAL_STATE: SimulationState = {
  day: 1,
  money: 800,
  reputation: 0,
  energy: 150,
  equipment: { phone: 1 },
  totalBeatsCreated: 0,
  artists: { "mc-flow": 0 },
  minutesPassed: 0,
  currentTier: 1,
}

// ============================================================================
// GAME FORMULAS
// ============================================================================

function calculateQuality(equipment: SimulationState["equipment"]): number {
  const phoneBonus = equipment.phone * 5
  const baseQuality = 30 + Math.random() * 20
  return Math.min(100, baseQuality + phoneBonus)
}

function calculatePrice(quality: number, reputation: number): number {
  const basePrice = BASE_BEAT_PRICE
  const qualityBonus = quality > 50 ? (quality - 50) * 0.5 : 0
  const reputationBonus = reputation * 0.2
  const tierMultiplier = getTierPriceMultiplier(reputation)
  return Math.floor((basePrice + qualityBonus + reputationBonus) * tierMultiplier)
}

function getEquipmentCost(currentLevel: number): number {
  return Math.floor(BASE_EQUIPMENT_PRICE * Math.pow(EQUIPMENT_MULTIPLIER, currentLevel))
}

function getArtistCost(currentLevel: number): number {
  const baseCost = 80
  const costMultiplier = 1.6
  return Math.floor(baseCost * Math.pow(costMultiplier, currentLevel))
}

function getArtistIncome(level: number): number {
  const incomePerLevel = [0, 6, 9, 13, 18, 25, 34, 46, 62, 82, 108]
  return incomePerLevel[level] || 0
}

// ============================================================================
// SIMULATION
// ============================================================================

interface SimulationLog {
  day: number
  minute: number
  event: string
  money: number
  reputation: number
  energy: number
  tier: number
  equipmentLevel: number
  beatPrice?: number
  passiveIncome: number
  milestone?: NarrativeMilestone
}

function simulateGameplay(daysToSimulate: number = 60): SimulationLog[] {
  const state = { ...INITIAL_STATE }
  const log: SimulationLog[] = []
  const MINUTES_PER_DAY = 1440 // 24 hours
  const SESSION_INTERVAL = 240 // Player logs in every 4 hours (240 min)

  // Log initial state
  const firstMilestone = NARRATIVE_MILESTONES.find((m) => m.day === 1)
  log.push({
    day: 1,
    minute: 0,
    event: "🎮 Начало игры",
    money: state.money,
    reputation: state.reputation,
    energy: state.energy,
    tier: 1,
    equipmentLevel: state.equipment.phone,
    passiveIncome: 0,
    milestone: firstMilestone,
  })

  for (let day = 1; day <= daysToSimulate; day++) {
    state.day = day

    // Player sessions: 6 times per day (every 4 hours)
    const sessionsPerDay = Math.floor(MINUTES_PER_DAY / SESSION_INTERVAL)

    for (let session = 0; session < sessionsPerDay; session++) {
      const sessionStartMinute = session * SESSION_INTERVAL

      // Collect passive income from AFK time
      const afkMinutes = SESSION_INTERVAL
      const passiveIncome = getArtistIncome(state.artists["mc-flow"])
      if (passiveIncome > 0) {
        const afkEarnings = passiveIncome * afkMinutes
        state.money += afkEarnings
      }

      // Regenerate energy during AFK
      const energyRegen = ENERGY_CONFIG.ENERGY_REGEN_PER_MINUTE * afkMinutes
      state.energy = Math.min(ENERGY_CONFIG.BASE_MAX_ENERGY, state.energy + energyRegen)

      // Active gameplay: Create 2 beats per session
      const beatsToCreate = 2
      for (let i = 0; i < beatsToCreate; i++) {
        const energyCost = getEnergyCostPerBeat(state.reputation)

        if (state.energy >= energyCost) {
          state.energy -= energyCost

          const quality = calculateQuality(state.equipment)
          const price = calculatePrice(quality, state.reputation)

          state.money += price
          state.totalBeatsCreated++
          state.reputation += 1

          // Check for tier change
          const newTier = getReputationTier(state.reputation)
          if (newTier !== state.currentTier) {
            state.currentTier = newTier
            const tierMilestone = NARRATIVE_MILESTONES.find((m) => m.tier === newTier && m.type === "tier_change")
            if (tierMilestone) {
              log.push({
                day,
                minute: sessionStartMinute,
                event: `🌟 ${tierMilestone.title}`,
                money: state.money,
                reputation: state.reputation,
                energy: state.energy,
                tier: newTier,
                equipmentLevel: state.equipment.phone,
                passiveIncome,
                milestone: tierMilestone,
              })
            }
          }
        }
      }

      // Equipment upgrades
      const phoneUpgradeCost = getEquipmentCost(state.equipment.phone)
      if (state.money > phoneUpgradeCost * 2 && state.equipment.phone < 10) {
        state.money -= phoneUpgradeCost
        state.equipment.phone++
      }

      // Artist hiring/upgrading
      if (state.reputation >= 100 && state.artists["mc-flow"] === 0) {
        const cost = getArtistCost(0)
        if (state.money > cost * 2) {
          state.money -= cost
          state.artists["mc-flow"] = 1
        }
      } else if (state.artists["mc-flow"] > 0 && state.artists["mc-flow"] < 10) {
        const cost = getArtistCost(state.artists["mc-flow"])
        if (state.money > cost * 3) {
          state.money -= cost
          state.artists["mc-flow"]++
        }
      }
    }

    // Check for day-specific milestones
    const dayMilestones = NARRATIVE_MILESTONES.filter((m) => m.day === day && m.type !== "tier_change")
    for (const milestone of dayMilestones) {
      log.push({
        day,
        minute: 0,
        event: `${milestone.title}`,
        money: state.money,
        reputation: state.reputation,
        energy: state.energy,
        tier: state.currentTier,
        equipmentLevel: state.equipment.phone,
        passiveIncome: getArtistIncome(state.artists["mc-flow"]),
        milestone,
      })
    }

    // Daily summary
    if (day % 10 === 0 || day === daysToSimulate) {
      log.push({
        day,
        minute: MINUTES_PER_DAY - 1,
        event: `📊 День ${day} завершён`,
        money: state.money,
        reputation: state.reputation,
        energy: state.energy,
        tier: state.currentTier,
        equipmentLevel: state.equipment.phone,
        passiveIncome: getArtistIncome(state.artists["mc-flow"]),
      })
    }
  }

  return log
}

// ============================================================================
// HTML GENERATION
// ============================================================================

function generateHTMLReport(log: SimulationLog[]): string {
  const milestones = log.filter((entry) => entry.milestone)
  const finalEntry = log[log.length - 1]

  const chartData = log
    .filter((entry, index) => index % 10 === 0 || entry.milestone)
    .map((entry) => ({
      day: entry.day,
      money: entry.money,
      reputation: entry.reputation,
      tier: entry.tier,
      equipmentLevel: entry.equipmentLevel,
    }))

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Producer Tycoon - Симуляция 60 дней 🎮</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
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
      font-family: 'Playfair Display', serif;
      font-size: 3rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .summary-card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      text-align: center;
    }

    .summary-card h3 {
      font-size: 0.9rem;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .summary-card .value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #667eea;
    }

    .timeline {
      background: white;
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .timeline h2 {
      font-family: 'Playfair Display', serif;
      color: #667eea;
      margin-bottom: 30px;
      font-size: 2rem;
    }

    .milestone {
      position: relative;
      padding-left: 50px;
      padding-bottom: 40px;
      border-left: 3px solid #e0e0e0;
    }

    .milestone:last-child {
      border-left: none;
    }

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

    .milestone.story .milestone-marker {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .milestone.tier_change .milestone-marker {
      background: linear-gradient(135deg, #f093fb, #f5576c);
      width: 30px;
      height: 30px;
      left: -15px;
    }

    .milestone.achievement .milestone-marker {
      background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
    }

    .milestone-day {
      font-size: 0.85rem;
      color: #999;
      margin-bottom: 5px;
    }

    .milestone-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
    }

    .milestone-desc {
      color: #666;
      line-height: 1.6;
    }

    .milestone-stats {
      display: flex;
      gap: 15px;
      margin-top: 10px;
      font-size: 0.85rem;
      color: #999;
    }

    .milestone-stats span {
      background: #f5f5f5;
      padding: 4px 10px;
      border-radius: 12px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }

    .chart-container {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .chart-container h2 {
      margin-bottom: 20px;
      color: #333;
      font-size: 1.3rem;
    }

    canvas {
      max-height: 300px;
    }

    @media (max-width: 900px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎮 Producer Tycoon: 60 дней истории</h1>

    <div class="summary">
      <div class="summary-card">
        <h3>💰 Итоговый капитал</h3>
        <div class="value">$${finalEntry.money.toLocaleString()}</div>
      </div>
      <div class="summary-card">
        <h3>⭐ Репутация</h3>
        <div class="value">${finalEntry.reputation.toLocaleString()}</div>
      </div>
      <div class="summary-card">
        <h3>🎵 Создано битов</h3>
        <div class="value">${log.filter((e) => e.beatPrice).length}</div>
      </div>
      <div class="summary-card">
        <h3>🏆 Tier достигнут</h3>
        <div class="value">Tier ${finalEntry.tier}</div>
      </div>
    </div>

    <div class="timeline">
      <h2>📖 История твоего пути</h2>
      ${milestones
        .map(
          (m) => `
        <div class="milestone ${m.milestone?.type}">
          <div class="milestone-marker"></div>
          <div class="milestone-day">День ${m.day}</div>
          <div class="milestone-title">${m.milestone?.title}</div>
          <div class="milestone-desc">${m.milestone?.description}</div>
          <div class="milestone-stats">
            <span>💰 $${m.money.toLocaleString()}</span>
            <span>⭐ ${m.reputation}</span>
            <span>📱 Lvl ${m.equipmentLevel}</span>
            <span>Tier ${m.tier}</span>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>

    <div class="charts-grid">
      <div class="chart-container">
        <h2>💰 Деньги во времени</h2>
        <canvas id="moneyChart"></canvas>
      </div>

      <div class="chart-container">
        <h2>⭐ Репутация</h2>
        <canvas id="reputationChart"></canvas>
      </div>

      <div class="chart-container">
        <h2>📱 Уровень оборудования</h2>
        <canvas id="equipmentChart"></canvas>
      </div>

      <div class="chart-container">
        <h2>🌟 Tier прогрессия</h2>
        <canvas id="tierChart"></canvas>
      </div>
    </div>
  </div>

  <script>
    const chartData = ${JSON.stringify(chartData)};

    const chartConfig = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      }
    };

    // Money Chart
    new Chart(document.getElementById('moneyChart'), {
      type: 'line',
      data: {
        labels: chartData.map(d => 'День ' + d.day),
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

    // Reputation Chart
    new Chart(document.getElementById('reputationChart'), {
      type: 'line',
      data: {
        labels: chartData.map(d => 'День ' + d.day),
        datasets: [{
          label: 'Репутация',
          data: chartData.map(d => d.reputation),
          borderColor: '#f093fb',
          backgroundColor: 'rgba(240, 147, 251, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: chartConfig
    });

    // Equipment Chart
    new Chart(document.getElementById('equipmentChart'), {
      type: 'line',
      data: {
        labels: chartData.map(d => 'День ' + d.day),
        datasets: [{
          label: 'Уровень оборудования',
          data: chartData.map(d => d.equipmentLevel),
          borderColor: '#ffa600',
          backgroundColor: 'rgba(255, 166, 0, 0.1)',
          fill: true,
          tension: 0.4,
          stepped: true
        }]
      },
      options: chartConfig
    });

    // Tier Chart
    new Chart(document.getElementById('tierChart'), {
      type: 'line',
      data: {
        labels: chartData.map(d => 'День ' + d.day),
        datasets: [{
          label: 'Tier',
          data: chartData.map(d => d.tier),
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          fill: true,
          tension: 0.4,
          stepped: true
        }]
      },
      options: {
        ...chartConfig,
        scales: {
          y: {
            min: 1,
            max: 6,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
  </script>
</body>
</html>`
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log("🎮 Запуск симуляции с нарративом...")
  console.log("⏰ Симулируем 60 дней игры (6 лет карьеры)\n")

  const log = simulateGameplay(60)

  console.log("✅ Симуляция завершена!")
  console.log(`📊 Ключевых моментов: ${log.filter((e) => e.milestone).length}`)
  console.log(`💰 Итоговая сумма: $${log[log.length - 1].money}`)
  console.log(`⭐ Итоговая репутация: ${log[log.length - 1].reputation}`)
  console.log(`🏆 Tier достигнут: ${log[log.length - 1].tier}`)
  console.log()

  const html = generateHTMLReport(log)
  const outputPath = "economy-simulation-with-narrative.html"
  fs.writeFileSync(outputPath, html)

  console.log(`📄 HTML отчёт сохранён: ${outputPath}`)
  console.log("🌐 Открой файл в браузере чтобы увидеть историю!")
}

main()
