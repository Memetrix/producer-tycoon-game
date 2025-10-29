/**
 * Note Class - Ported from Rhythm Plus
 * Handles individual note rendering, timing, and judgement
 */

import type { GameInstance } from "./GameInstance"

export interface NoteData {
  t: number // time in seconds
  k: string // key(s) - can be multiple for chords
  h?: Record<string, number> // hold note end times
}

export type Judgement = "perfect" | "good" | "offbeat" | "miss"

export class Note {
  public x: number
  public y: number
  public width: number
  public color: string
  public percentage: number = 0
  public isHoldNote: boolean
  public isUserHolding: boolean = false
  public isHoldingDone: boolean = false
  public didUserHold: boolean = false
  public noteFailed: boolean = false
  public accuracyJudged: boolean = false
  public markJudge?: Judgement
  public sePlayed: boolean = false

  // Timing
  private now: number
  private delta: number = 0
  private then: number = 0
  private timeStarted: number
  private gameHadBeenPaused: boolean = false

  // Hold note specific
  public holdNoteHeight?: number
  public holdNoteY?: number

  private readonly singleNoteHeight = 10

  constructor(
    private game: GameInstance,
    private keyObj: NoteData,
    private key: string,
    x: number,
    y: number,
    width: number,
    color: string,
    private createdNote: boolean = false
  ) {
    this.x = x
    this.y = y
    this.width = width
    this.color = color
    this.isHoldNote = !!keyObj.h?.[key]

    this.now = Date.now()
    this.timeStarted = this.now
  }

  /**
   * Calculate delta time since last frame
   */
  private setDelta(): void {
    if (this.then === 0) this.then = this.now
    this.now = Date.now()
    this.delta = (this.now - this.then) / 1000 // seconds since last frame
    this.then = this.now
  }

  /**
   * Calculate timing accuracy percentage
   */
  private getDiffPercentage(): number {
    if (this.gameHadBeenPaused || this.game.playbackSpeed !== 1) {
      // Use distance-based calculation when game was paused
      const dist = this.game.checkHitLineY - this.y
      return Math.abs(dist) / this.game.canvasHeight
    } else {
      // Use time-based calculation for accurate timing
      const hitTimeSinceStart = (Date.now() - this.timeStarted) / 1000
      const diff = Math.abs(this.game.noteDelay - hitTimeSinceStart)
      return diff / this.game.noteDelay
    }
  }

  /**
   * Calculate overall accuracy percentage
   */
  private calculatePercent(): void {
    this.percentage = 1 - ((1 - this.getDiffPercentage() - 0.2) / 4) * 5
    this.percentage = Math.max(0, Math.min(1, this.percentage))
  }

  /**
   * Judge the hit quality
   */
  public judge(): void {
    this.calculatePercent()

    if (this.percentage < 0.05) {
      this.game.addJudgement("perfect")
      this.markJudge = "perfect"
    } else if (this.percentage < 0.15) {
      this.game.addJudgement("good")
      this.markJudge = "good"
    } else if (this.percentage < 0.3) {
      this.game.addJudgement("offbeat")
      this.markJudge = "offbeat"
    } else {
      // Random miss at extreme timing errors
      if (Math.random() > 0.5) {
        this.game.addJudgement("offbeat")
        this.markJudge = "offbeat"
      } else {
        this.missNote()
      }
    }

    // Health recovery for good hits
    if (!this.game.noFail && this.game.health < 100 && this.percentage < 0.3) {
      this.game.health += 0.3 - this.percentage
    }
  }

  /**
   * Handle note hit and update score
   */
  public hitAndCountScore(isHolding: boolean = false): void {
    this.judge()
    if (this.noteFailed) return

    this.vibrate(25)

    const accuracyPercent = 100 * (1 - this.percentage)

    if (!this.accuracyJudged) {
      this.game.result.totalPercentage += accuracyPercent
      this.game.result.totalHitNotes += 1
      this.accuracyJudged = true
    }

    const buff = isHolding ? 0.5 : 1.2
    this.game.result.score += buff * accuracyPercent * this.game.fever.value
    this.game.result.combo += 1
    this.game.result.maxCombo = Math.max(this.game.result.combo, this.game.result.maxCombo)
    this.game.fever.percent += (1 - this.percentage) / 100

    this.game.showJudgeDisplay(this.markJudge!, this.game.result.combo)
  }

  /**
   * Handle missed note
   */
  public missNote(): void {
    this.game.addJudgement("miss")
    this.game.result.totalHitNotes += 1
    this.game.result.combo = 0
    this.markJudge = "miss"
    this.game.fever.percent -= 0.1

    if (!this.game.noFail) {
      this.game.health -= 3
    }

    this.vibrate([20, 20, 50])
    this.game.showJudgeDisplay(this.markJudge, this.game.result.combo)
    this.noteFailed = true
  }

  /**
   * Check if note is out of canvas bounds
   */
  public isOutOfCanvas(): boolean {
    const yOut = this.y > this.game.canvasHeight

    const isHoldNoteOut =
      !this.isHoldNote || (this.isHoldNote && !this.isUserHolding && !this.isHoldNoteFinished(true))

    if (this.game.started && yOut && isHoldNoteOut && !this.noteFailed) {
      this.missNote()
    }

    const shouldClean =
      (yOut && !this.isHoldNote) || (this.isHoldNote && (this.holdNoteY! > this.game.canvasHeight || this.isHoldingDone))

    return shouldClean
  }

  /**
   * Check if hold note is finished
   */
  private isHoldNoteFinished(nearly: boolean = false): boolean {
    if (!this.holdNoteHeight || !this.holdNoteY) return false

    const offset = nearly ? Math.min(this.holdNoteHeight / 2, 100) : 0
    return this.holdNoteY > this.game.checkHitLineY - offset && this.didUserHold
  }

  /**
   * Reposition note based on current time
   */
  public reposition(): void {
    const timing = this.game.playTime
    const timeElapsed = timing - this.keyObj.t
    const y = (timeElapsed * this.game.noteSpeedPxPerSec) / this.game.playbackSpeed
    this.y = y
    this.gameHadBeenPaused = true
  }

  /**
   * Update and render note
   */
  public update(ctx: CanvasRenderingContext2D, isUserHolding: boolean = false): void {
    this.setDelta()

    // Reset delta if game was paused
    if (this.delta > 0.5 || this.game.paused) {
      this.delta = 0
      this.then = this.now
      this.gameHadBeenPaused = true
    }

    const defaultColor = this.color || "#FFFF00"

    if (this.isHoldNote || (!this.game.playMode && this.keyObj.h?.[this.key])) {
      const color = this.noteFailed ? "#808080" : defaultColor
      this.isHoldNote = true
      this.isUserHolding = isUserHolding
      this.drawHoldNote(ctx, color)
    } else {
      let color = this.y > this.game.checkHitLineY + this.singleNoteHeight ? "#FF0000" : defaultColor
      if (!this.game.playMode) color = defaultColor
      this.drawSingleNote(ctx, color)
    }

    if (this.game.paused) return

    // Update position based on speed
    this.y += this.game.noteSpeedPxPerSec * this.delta

    this.playSoundEffect()
  }

  /**
   * Draw single note with perspective scaling
   */
  private drawSingleNote(ctx: CanvasRenderingContext2D, color: string): void {
    // Get perspective-adjusted position and width
    const perspective = this.game.getPerspectiveX(this.x, this.width, this.y)

    // Calculate glow intensity based on distance
    const hitLineY = this.game.checkHitLineY
    const maxDistance = hitLineY
    const distance = Math.max(0, hitLineY - this.y)
    const minScale = 0.3
    const maxScale = 1.0
    const perspectiveScale = minScale + (maxScale - minScale) * (1 - distance / maxDistance)

    // Draw note with perspective
    ctx.fillStyle = color
    ctx.shadowBlur = 10 * perspectiveScale
    ctx.shadowColor = color
    ctx.fillRect(perspective.x, this.y, perspective.width, this.singleNoteHeight)
    ctx.shadowBlur = 0
  }

  /**
   * Draw hold note (long note) with perspective scaling
   */
  private drawHoldNote(ctx: CanvasRenderingContext2D, color: string): void {
    const endTime = this.keyObj.h![this.key]
    const holdLengthInSec = endTime === -1 ? 100 : endTime - this.keyObj.t
    const noteHeight = (holdLengthInSec * this.game.noteSpeedPxPerSec) / this.game.playbackSpeed

    this.holdNoteHeight = noteHeight
    this.holdNoteY = this.y - noteHeight + this.singleNoteHeight

    let paintY = Math.max(0, this.holdNoteY)
    let paintHeight = this.holdNoteY < 0 ? this.holdNoteY + noteHeight : noteHeight

    if (this.isUserHolding) {
      paintHeight = this.game.checkHitLineY - paintY
    }

    if (!this.game.playMode) {
      // Creating hold note in editor mode
      const isUserCreating =
        this.game.keyHoldingStatus[this.key] && this.createdNote && this.keyObj.h?.[this.key] === -1

      if (isUserCreating) {
        paintY = this.game.checkHitLineY
        paintHeight = paintHeight - paintY
      }
    }

    // Draw hold note with perspective (trapezoid shape)
    const hitLineY = this.game.checkHitLineY
    const maxDistance = hitLineY

    // Get perspective for top and bottom of hold note
    const topPerspective = this.game.getPerspectiveX(this.x, this.width, paintY)
    const bottomPerspective = this.game.getPerspectiveX(this.x, this.width, paintY + paintHeight)

    // Calculate scale for glow
    const bottomDistance = Math.max(0, hitLineY - (paintY + paintHeight))
    const minScale = 0.3
    const maxScale = 1.0
    const bottomScale = minScale + (maxScale - minScale) * (1 - bottomDistance / maxDistance)

    // Draw as trapezoid using path
    ctx.save()
    ctx.fillStyle = color
    ctx.globalAlpha = 0.7

    ctx.beginPath()
    ctx.moveTo(topPerspective.x, paintY)
    ctx.lineTo(topPerspective.x + topPerspective.width, paintY)
    ctx.lineTo(bottomPerspective.x + bottomPerspective.width, paintY + paintHeight)
    ctx.lineTo(bottomPerspective.x, paintY + paintHeight)
    ctx.closePath()
    ctx.fill()

    ctx.restore()

    // Draw head of hold note
    const headPerspective = this.game.getPerspectiveX(this.x, this.width, this.y)
    ctx.fillStyle = color
    ctx.shadowBlur = 10 * bottomScale
    ctx.shadowColor = color
    ctx.fillRect(headPerspective.x, this.y, headPerspective.width, this.singleNoteHeight)
    ctx.shadowBlur = 0
  }

  /**
   * Play sound effect when note reaches hit line
   */
  private playSoundEffect(): void {
    if (!this.game.playMode || !this.game.options.soundEffect) return
    if (!this.sePlayed && this.y >= this.game.checkHitLineY) {
      this.sePlayed = true
      this.game.playEffect("du")
    }
  }

  /**
   * Trigger vibration feedback
   */
  private vibrate(pattern: number | number[]): void {
    if (this.game.vibrate && typeof window !== "undefined" && window.navigator?.vibrate) {
      window.navigator.vibrate(pattern)
    }
  }
}
