/**
 * Rhythm Engine для Producer Tycoon
 * Интегрирует beatoraja timing system с текущим игровым движком
 */

import {
  judgeHit,
  GrooveGauge,
  HispeedController,
  calculateEXScore,
  calculateMaxEXScore,
  calculateEXScoreRate,
  getDJLevel,
  getClearLamp,
  createGreenNumber,
  updateGreenNumber,
  type BeatJudgement,
  type JudgeResult,
  type GaugeType,
  type GreenNumber,
  type Score,
  type ClearLamp,
} from "./beatoraja-timing"

export interface RhythmNote {
  id: string
  time: number // AudioContext.currentTime когда нота должна быть hit
  lane: number // 0-3 для 4 дорожек
  position: number // 0-100 для визуального отображения
  hit: boolean
  judgement: BeatJudgement | null
  timingError: number | null // в миллисекундах
}

export interface RhythmEngineState {
  // Score tracking
  score: Score
  exScore: number
  maxExScore: number
  exScoreRate: number
  djLevel: string

  // Gauge
  gauge: GrooveGauge
  gaugeValue: number

  // Green Numbers (по одному на каждую дорожку)
  greenNumbers: GreenNumber[]

  // Hispeed
  hispeed: HispeedController

  // Game state
  isPlaying: boolean
  isFailed: boolean
  clearLamp: ClearLamp | null

  // Notes
  notes: RhythmNote[]
  totalNotes: number
}

export class RhythmEngine {
  private state: RhythmEngineState
  private audioContext: AudioContext | null = null
  private gameStartTime = 0
  private bpm = 120

  constructor(totalNotes: number, gaugeType: GaugeType = "normal", audioContext?: AudioContext) {
    this.audioContext = audioContext || null

    this.state = {
      score: {
        pgreat: 0,
        great: 0,
        good: 0,
        bad: 0,
        poor: 0,
        maxCombo: 0,
        currentCombo: 0,
      },
      exScore: 0,
      maxExScore: calculateMaxEXScore(totalNotes),
      exScoreRate: 0,
      djLevel: "F",
      gauge: new GrooveGauge(gaugeType),
      gaugeValue: gaugeType === "normal" ? 0 : 100,
      greenNumbers: [
        { show: false, value: 0, fast: false, opacity: 0, spawnTime: 0 },
        { show: false, value: 0, fast: false, opacity: 0, spawnTime: 0 },
        { show: false, value: 0, fast: false, opacity: 0, spawnTime: 0 },
        { show: false, value: 0, fast: false, opacity: 0, spawnTime: 0 },
      ],
      hispeed: new HispeedController(),
      isPlaying: false,
      isFailed: false,
      clearLamp: null,
      notes: [],
      totalNotes,
    }
  }

  /**
   * Инициализирует игру
   */
  startGame(bpm: number, audioContext: AudioContext): void {
    this.bpm = bpm
    this.audioContext = audioContext
    this.gameStartTime = audioContext.currentTime
    this.state.isPlaying = true
  }

  /**
   * Обрабатывает нажатие на дорожку
   */
  handleLaneHit(lane: number, notes: RhythmNote[]): JudgeResult | null {
    if (!this.state.isPlaying || this.state.isFailed || !this.audioContext) {
      return null
    }

    const currentTime = this.audioContext.currentTime

    // Находим ближайшую неотбитую ноту в этой дорожке
    const laneNotes = notes.filter((note) => note.lane === lane && !note.hit)

    if (laneNotes.length === 0) return null

    // Находим ближайшую ноту по времени
    const closestNote = laneNotes.reduce((closest, note) => {
      const closestDist = Math.abs(closest.time - currentTime)
      const noteDist = Math.abs(note.time - currentTime)
      return noteDist < closestDist ? note : closest
    })

    // Судим попадание с beatoraja точностью
    const judgeResult = judgeHit(currentTime, closestNote.time)

    // Если попадание слишком далеко - игнорируем
    if (judgeResult.judgement === "poor" && Math.abs(judgeResult.timingError) > 250) {
      return null
    }

    // Обновляем ноту
    closestNote.hit = true
    closestNote.judgement = judgeResult.judgement
    closestNote.timingError = judgeResult.timingError

    // Обновляем score
    this.updateScore(judgeResult)

    // Обновляем gauge
    this.state.gauge.update(judgeResult.judgement, this.state.totalNotes)
    this.state.gaugeValue = this.state.gauge.getValue()

    // Проверяем fail condition
    if (this.state.gauge.isFailed()) {
      this.state.isFailed = true
      this.state.isPlaying = false
    }

    // Создаём Green Number для этой дорожки
    this.state.greenNumbers[lane] = createGreenNumber(judgeResult.timingError)

    return judgeResult
  }

  /**
   * Обрабатывает пропущенную ноту (автоматический POOR)
   */
  handleMissedNote(note: RhythmNote): void {
    if (!this.state.isPlaying || this.state.isFailed) return

    note.hit = true
    note.judgement = "poor"
    note.timingError = null

    // Обновляем score
    this.state.score.poor++
    this.state.score.currentCombo = 0

    // Обновляем gauge
    this.state.gauge.update("poor", this.state.totalNotes)
    this.state.gaugeValue = this.state.gauge.getValue()

    // Проверяем fail condition
    if (this.state.gauge.isFailed()) {
      this.state.isFailed = true
      this.state.isPlaying = false
    }
  }

  /**
   * Обновляет Green Numbers (fade-out анимация)
   */
  updateGreenNumbers(): void {
    const currentTime = performance.now()
    this.state.greenNumbers = this.state.greenNumbers.map((gn) => updateGreenNumber(gn, currentTime))
  }

  /**
   * Завершает игру и вычисляет финальные результаты
   */
  endGame(): {
    clearStatus: "clear" | "failed"
    clearLamp: ClearLamp
    exScore: number
    exScoreRate: number
    djLevel: string
    score: Score
  } {
    this.state.isPlaying = false

    const clearStatus = this.state.gauge.finalJudge()
    const clearLamp = getClearLamp(clearStatus, this.state.gauge.getType(), this.state.score, this.state.totalNotes)

    this.state.clearLamp = clearLamp

    return {
      clearStatus,
      clearLamp,
      exScore: this.state.exScore,
      exScoreRate: this.state.exScoreRate,
      djLevel: this.state.djLevel,
      score: this.state.score,
    }
  }

  /**
   * Обновляет score на основе judgement
   */
  private updateScore(judgeResult: JudgeResult): void {
    const { judgement, score: points } = judgeResult

    // Обновляем счётчики judgements
    this.state.score[judgement]++

    // Обновляем combo
    if (judgement === "pgreat" || judgement === "great" || judgement === "good") {
      this.state.score.currentCombo++
      this.state.score.maxCombo = Math.max(this.state.score.maxCombo, this.state.score.currentCombo)
    } else {
      this.state.score.currentCombo = 0
    }

    // Обновляем EX Score
    this.state.exScore = calculateEXScore(this.state.score)
    this.state.exScoreRate = calculateEXScoreRate(this.state.exScore, this.state.maxExScore)
    this.state.djLevel = getDJLevel(this.state.exScoreRate)
  }

  /**
   * Возвращает текущее состояние
   */
  getState(): RhythmEngineState {
    return this.state
  }

  /**
   * Устанавливает hispeed
   */
  setHispeed(value: number): void {
    this.state.hispeed.setHispeed(value)
  }

  /**
   * Вычисляет скорость нот на основе hispeed
   */
  getNoteSpeed(): number {
    return this.state.hispeed.calculateNoteSpeed(this.bpm)
  }

  /**
   * Вычисляет lead time для спавна нот
   */
  getLeadTime(): number {
    return this.state.hispeed.calculateLeadTime(this.bpm)
  }
}

/**
 * Конвертирует старый формат accuracy в новый BeatJudgement
 */
export function convertLegacyAccuracy(accuracy: "perfect" | "good" | "miss" | null): BeatJudgement | null {
  if (!accuracy) return null

  switch (accuracy) {
    case "perfect":
      return "pgreat"
    case "good":
      return "great"
    case "miss":
      return "poor"
  }
}

/**
 * Вычисляет простой процент accuracy для обратной совместимости
 */
export function calculateSimpleAccuracy(score: Score, totalNotes: number): number {
  if (totalNotes === 0) return 0

  const successfulHits = score.pgreat + score.great + score.good
  return Math.round((successfulHits / totalNotes) * 100)
}
