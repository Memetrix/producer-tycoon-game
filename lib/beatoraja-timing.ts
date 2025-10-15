/**
 * Beatoraja-inspired Timing Engine для Producer Tycoon
 *
 * Портировано из: https://github.com/exch-bms2/beatoraja
 * Лицензия: GNU GPL v3 (beatoraja) - это реимплементация концепций
 *
 * Основные фичи:
 * - Микросекундная точность судейства
 * - 5-уровневая система judge (PGREAT/GREAT/GOOD/BAD/POOR)
 * - Green Number System (±ms feedback)
 * - Groove Gauge (Normal/Hard/EX-Hard)
 * - EX Score calculation
 */

// ============================================================================
// КОНСТАНТЫ СУДЕЙСТВА (из beatoraja)
// ============================================================================

/** Judge windows в микросекундах (μs) */
export const BEATORAJA_JUDGE_WINDOWS = {
  PGREAT: 16667, // ±16.667ms (1 frame @ 60Hz)
  GREAT: 33333, // ±33.333ms (2 frames)
  GOOD: 116667, // ±116.667ms (7 frames)
  BAD: 250000, // ±250ms (15 frames)
  POOR: Number.POSITIVE_INFINITY, // miss (за пределами BAD)
} as const

/** Типы судейства */
export type BeatJudgement = "pgreat" | "great" | "good" | "bad" | "poor"

/** Типы gauge */
export type GaugeType = "normal" | "easy" | "hard" | "exhard" | "hazard"

// ============================================================================
// JUDGE SYSTEM
// ============================================================================

export interface JudgeResult {
  judgement: BeatJudgement
  timingError: number // в миллисекундах, + = FAST, - = SLOW
  fast: boolean // true = нажал раньше, false = позже
  score: number // очки за этот hit
}

/**
 * Оценивает попадание с микросекундной точностью
 *
 * @param hitTime - AudioContext.currentTime когда нажали
 * @param noteTime - AudioContext.currentTime когда нота должна быть hit
 * @param judgeWindows - кастомные окна судейства (опционально)
 * @returns результат судейства с детальной информацией
 */
export function judgeHit(hitTime: number, noteTime: number, judgeWindows = BEATORAJA_JUDGE_WINDOWS): JudgeResult {
  // Конвертируем разницу времени в микросекунды для точности
  const errorMicroseconds = (hitTime - noteTime) * 1_000_000
  const absError = Math.abs(errorMicroseconds)

  let judgement: BeatJudgement
  let score: number

  if (absError <= judgeWindows.PGREAT) {
    judgement = "pgreat"
    score = 2 // EX Score: PGREAT = 2 points
  } else if (absError <= judgeWindows.GREAT) {
    judgement = "great"
    score = 1 // EX Score: GREAT = 1 point
  } else if (absError <= judgeWindows.GOOD) {
    judgement = "good"
    score = 0
  } else if (absError <= judgeWindows.BAD) {
    judgement = "bad"
    score = 0
  } else {
    judgement = "poor"
    score = 0
  }

  return {
    judgement,
    timingError: errorMicroseconds / 1000, // конвертируем в ms для отображения
    fast: errorMicroseconds > 0,
    score,
  }
}

// ============================================================================
// GROOVE GAUGE SYSTEM
// ============================================================================

/** Константы изменения gauge (из beatoraja) */
const GAUGE_CHANGES = {
  normal: {
    PGREAT_ADD: 0.15,
    GREAT_ADD: 0.1,
    GOOD_ADD: 0.05,
    BAD_SUB: -2.0,
    POOR_SUB: -6.0,
    INITIAL: 0, // начинаем с 0
    CLEAR_THRESHOLD: 80,
  },
  easy: {
    PGREAT_ADD: 0.2,
    GREAT_ADD: 0.15,
    GOOD_ADD: 0.1,
    BAD_SUB: -1.0,
    POOR_SUB: -3.0,
    INITIAL: 0,
    CLEAR_THRESHOLD: 80,
  },
  hard: {
    PGREAT_ADD: 0.15,
    GREAT_ADD: 0.1,
    GOOD_ADD: 0.05,
    BAD_SUB: -4.0,
    POOR_SUB: -10.0,
    INITIAL: 100, // начинаем с полного gauge
    CLEAR_THRESHOLD: 0, // не упасть до 0
  },
  exhard: {
    PGREAT_ADD: 0.15,
    GREAT_ADD: 0.1,
    GOOD_ADD: 0.05,
    BAD_SUB: -6.0,
    POOR_SUB: -15.0,
    INITIAL: 100,
    CLEAR_THRESHOLD: 0,
  },
  hazard: {
    PGREAT_ADD: 0,
    GREAT_ADD: 0,
    GOOD_ADD: 0,
    BAD_SUB: -100, // instant fail
    POOR_SUB: -100, // instant fail
    INITIAL: 100,
    CLEAR_THRESHOLD: 1,
  },
}

export class GrooveGauge {
  private value: number
  private type: GaugeType
  private failed = false
  private cleared = false

  constructor(type: GaugeType = "normal") {
    this.type = type
    this.value = GAUGE_CHANGES[type].INITIAL
  }

  /**
   * Обновляет gauge на основе judgement
   * @param judgement - результат судейства
   * @param totalNotes - общее количество нот (для нормализации прироста)
   */
  update(judgement: BeatJudgement, totalNotes: number): void {
    if (this.failed) return // уже failed, больше не обновляем

    const config = GAUGE_CHANGES[this.type]
    let change = 0

    switch (judgement) {
      case "pgreat":
        change = (config.PGREAT_ADD / totalNotes) * 100
        break
      case "great":
        change = (config.GREAT_ADD / totalNotes) * 100
        break
      case "good":
        change = (config.GOOD_ADD / totalNotes) * 100
        break
      case "bad":
        change = config.BAD_SUB
        break
      case "poor":
        change = config.POOR_SUB
        break
    }

    this.value += change
    this.value = Math.max(0, Math.min(100, this.value))

    // Проверка fail condition
    if (this.isHardGauge() && this.value <= 0) {
      this.failed = true
    }

    // Проверка clear condition (в конце игры)
    if (this.value >= config.CLEAR_THRESHOLD) {
      this.cleared = true
    }
  }

  getValue(): number {
    return this.value
  }

  getType(): GaugeType {
    return this.type
  }

  isFailed(): boolean {
    return this.failed
  }

  isCleared(): boolean {
    return this.cleared
  }

  private isHardGauge(): boolean {
    return ["hard", "exhard", "hazard"].includes(this.type)
  }

  /**
   * Финальная проверка clear/fail в конце игры
   */
  finalJudge(): "clear" | "failed" {
    const config = GAUGE_CHANGES[this.type]

    if (this.isHardGauge()) {
      // Для hard gauge: просто не упасть до 0
      return this.failed ? "failed" : "clear"
    } else {
      // Для normal/easy gauge: достичь 80%
      return this.value >= config.CLEAR_THRESHOLD ? "clear" : "failed"
    }
  }
}

// ============================================================================
// EX SCORE SYSTEM
// ============================================================================

export interface Score {
  pgreat: number
  great: number
  good: number
  bad: number
  poor: number
  maxCombo: number
  currentCombo: number
}

/**
 * Вычисляет EX Score (PGREAT × 2 + GREAT × 1)
 */
export function calculateEXScore(score: Score): number {
  return score.pgreat * 2 + score.great
}

/**
 * Вычисляет максимально возможный EX Score
 */
export function calculateMaxEXScore(totalNotes: number): number {
  return totalNotes * 2
}

/**
 * Вычисляет процент EX Score
 */
export function calculateEXScoreRate(exScore: number, maxExScore: number): number {
  return maxExScore > 0 ? (exScore / maxExScore) * 100 : 0
}

/**
 * Определяет DJ Level (rank) на основе EX Score rate
 */
export function getDJLevel(exScoreRate: number): string {
  if (exScoreRate >= 88.88) return "AAA"
  if (exScoreRate >= 77.77) return "AA"
  if (exScoreRate >= 66.66) return "A"
  if (exScoreRate >= 55.55) return "B"
  if (exScoreRate >= 44.44) return "C"
  if (exScoreRate >= 33.33) return "D"
  if (exScoreRate >= 22.22) return "E"
  return "F"
}

/**
 * Определяет Clear Lamp
 */
export type ClearLamp =
  | "no-play"
  | "failed"
  | "assist-clear"
  | "easy-clear"
  | "clear"
  | "hard-clear"
  | "exhard-clear"
  | "fullcombo"
  | "perfect"

export function getClearLamp(
  clearStatus: "clear" | "failed",
  gaugeType: GaugeType,
  score: Score,
  totalNotes: number,
): ClearLamp {
  if (clearStatus === "failed") return "failed"

  // Perfect = все ноты PGREAT
  if (score.pgreat === totalNotes) return "perfect"

  // Full Combo = нет BAD/POOR
  if (score.bad === 0 && score.poor === 0) return "fullcombo"

  // Clear type по gauge
  switch (gaugeType) {
    case "exhard":
      return "exhard-clear"
    case "hard":
    case "hazard":
      return "hard-clear"
    case "easy":
      return "easy-clear"
    default:
      return "clear"
  }
}

// ============================================================================
// GREEN NUMBER SYSTEM
// ============================================================================

export interface GreenNumber {
  show: boolean
  value: number // абсолютное значение в ms
  fast: boolean // true = FAST, false = SLOW
  opacity: number // для fade-out анимации (1.0 -> 0.0)
  spawnTime: number // когда появился (для анимации)
}

/**
 * Создаёт Green Number для отображения
 */
export function createGreenNumber(timingError: number): GreenNumber {
  return {
    show: true,
    value: Math.abs(Math.round(timingError)), // округляем до целого ms
    fast: timingError > 0,
    opacity: 1.0,
    spawnTime: performance.now(),
  }
}

/**
 * Обновляет Green Number (fade-out анимация)
 */
export function updateGreenNumber(
  gn: GreenNumber,
  currentTime: number,
  fadeOutDuration = 500, // ms
): GreenNumber {
  if (!gn.show) return gn

  const age = currentTime - gn.spawnTime
  const opacity = Math.max(0, 1 - age / fadeOutDuration)

  return {
    ...gn,
    opacity,
    show: opacity > 0,
  }
}

// ============================================================================
// HISPEED CONTROLLER
// ============================================================================

export class HispeedController {
  private hispeed = 1.0
  private greenNumber = 300 // расстояние до judge line в px

  setHispeed(value: number): void {
    this.hispeed = Math.max(0.5, Math.min(10.0, value))
  }

  getHispeed(): number {
    return this.hispeed
  }

  adjustHispeed(delta: number): void {
    this.setHispeed(this.hispeed + delta)
  }

  setGreenNumber(value: number): void {
    this.greenNumber = Math.max(100, Math.min(1000, value))
  }

  getGreenNumber(): number {
    return this.greenNumber
  }

  /**
   * Вычисляет скорость ноты в пикселях в секунду
   */
  calculateNoteSpeed(bpm: number): number {
    const beatsPerSecond = bpm / 60
    const baseSpeed = beatsPerSecond * this.greenNumber
    return baseSpeed * this.hispeed
  }

  /**
   * Вычисляет LEAD_TIME (время для ноты чтобы доехать до judge line)
   */
  calculateLeadTime(bpm: number): number {
    const noteSpeed = this.calculateNoteSpeed(bpm)
    return this.greenNumber / noteSpeed
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Форматирует timing error для отображения
 */
export function formatTimingError(error: number): string {
  const sign = error > 0 ? "+" : "-"
  const value = Math.abs(Math.round(error))
  return `${sign}${value}`
}

/**
 * Возвращает цвет для judgement
 */
export function getJudgementColor(judgement: BeatJudgement): string {
  switch (judgement) {
    case "pgreat":
      return "#FFD700" // gold
    case "great":
      return "#4AFF88" // green
    case "good":
      return "#4A9EFF" // blue
    case "bad":
      return "#FF884A" // orange
    case "poor":
      return "#FF4A4A" // red
  }
}

/**
 * Возвращает текст для judgement
 */
export function getJudgementText(judgement: BeatJudgement): string {
  switch (judgement) {
    case "pgreat":
      return "PERFECT"
    case "great":
      return "GREAT"
    case "good":
      return "GOOD"
    case "bad":
      return "BAD"
    case "poor":
      return "POOR"
  }
}

/**
 * Возвращает цвет для gauge
 */
export function getGaugeColor(value: number, type: GaugeType): string {
  const isHard = ["hard", "exhard", "hazard"].includes(type)

  if (isHard) {
    if (value > 50) return "#FF4A4A" // red
    if (value > 25) return "#FF884A" // orange
    return "#8B0000" // dark red
  } else {
    if (value >= 80) return "#4AFF88" // green (clear zone)
    if (value >= 50) return "#FFD54A" // yellow
    return "#FF4A4A" // red
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Judge
  judgeHit,
  BEATORAJA_JUDGE_WINDOWS,

  // Gauge
  GrooveGauge,

  // Score
  calculateEXScore,
  calculateMaxEXScore,
  calculateEXScoreRate,
  getDJLevel,
  getClearLamp,

  // Green Number
  createGreenNumber,
  updateGreenNumber,

  // Hispeed
  HispeedController,

  // Utils
  formatTimingError,
  getJudgementColor,
  getJudgementText,
  getGaugeColor,
}
