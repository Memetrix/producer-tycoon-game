/**
 * GameInstance - Main Rhythm Game Engine
 * Ported from Rhythm Plus with isometric 3D rendering
 */

import { Track } from "./Track"
import type { NoteData, Judgement } from "./Note"

export interface GameResult {
  score: number
  totalPercentage: number
  totalHitNotes: number
  combo: number
  maxCombo: number
  marks: {
    perfect: number
    good: number
    offbeat: number
    miss: number
  }
}

export interface FeverState {
  value: number
  time: number
  percent: number
}

export interface GameOptions {
  soundEffect: boolean
  lowerHitLine: boolean
}

export class GameInstance {
  // Canvas
  public canvas: HTMLCanvasElement
  public ctx: CanvasRenderingContext2D
  public canvasWidth: number = 0
  public canvasHeight: number = 0

  // Tracks (Lanes)
  public dropTrackArr: Track[] = []
  public trackNum: number = 4
  private trackKeyBind: string[] = ["d", "f", "j", "k"]
  private trackMaxWidth: number = 150

  // Game state
  public paused: boolean = true
  public started: boolean = false
  public playMode: boolean = true
  public playbackSpeed: number = 1
  public noFail: boolean = false
  public vibrate: boolean = true

  // Timing
  public currentTime: number = 0
  public playTime: number = 0
  public noteDelay: number = 0
  public checkHitLineY: number = 0
  public noteSpeedPxPerSec: number = 380

  // Note data
  private timeArr: NoteData[] = []
  private timeArrIdx: number = 0

  // Input
  public keyHoldingStatus: Record<string, boolean> = {}

  // Results
  public result: GameResult = {
    score: 0,
    totalPercentage: 0,
    totalHitNotes: 0,
    combo: 0,
    maxCombo: 0,
    marks: { perfect: 0, good: 0, offbeat: 0, miss: 0 },
  }

  public fever: FeverState = { value: 1, time: 0, percent: 0 }
  public health: number = 100

  // Options
  public options: GameOptions = {
    soundEffect: true,
    lowerHitLine: false,
  }

  // Callbacks
  private onJudgeDisplayCallback?: (judgement: Judgement, combo: number) => void
  private onPlayEffectCallback?: (sound: string) => void

  // Animation
  private animationFrameId: number | null = null
  private destroyed: boolean = false

  // Isometric rendering
  private readonly PERSPECTIVE = 1200
  private readonly PERSPECTIVE_ORIGIN = { x: 0.5, y: 0.9 }
  private readonly HIGHWAY_ROTATION_X = 68 // degrees
  private readonly HIGHWAY_Z_OFFSET = -500
  private readonly HIGHWAY_LENGTH = 2000

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Failed to get 2D context")
    this.ctx = ctx

    this.createTracks(4)
    this.registerInput()
    this.update()
  }

  /**
   * Create tracks/lanes
   */
  private createTracks(trackNum: number): void {
    this.dropTrackArr = []
    this.trackNum = trackNum
    this.trackKeyBind = this.getTrackKeyBind(trackNum)

    for (const keyBind of this.trackKeyBind) {
      this.dropTrackArr.push(new Track(this, 0, this.trackMaxWidth, keyBind))
    }

    this.reposition()
  }

  /**
   * Get key bindings for track count
   */
  private getTrackKeyBind(trackNum: number): string[] {
    switch (trackNum) {
      case 4:
        return ["d", "f", "j", "k"]
      case 5:
        return ["d", "f", " ", "j", "k"]
      case 6:
        return ["s", "d", "f", "j", "k", "l"]
      case 7:
        return ["s", "d", "f", " ", "j", "k", "l"]
      case 8:
        return ["a", "s", "d", "f", "j", "k", "l", ";"]
      default:
        return ["d", "f", "j", "k"]
    }
  }

  /**
   * Reposition tracks and calculate hit line
   */
  public reposition(): void {
    this.canvasWidth = this.canvas.width
    this.canvasHeight = this.canvas.height

    const trackWidth = Math.min(this.canvasWidth / this.trackNum, this.trackMaxWidth)
    const startX = this.canvasWidth / 2 - (this.trackNum * trackWidth) / 2

    for (let i = 0; i < this.dropTrackArr.length; i++) {
      const trackWidthWithOffset = trackWidth + 1
      this.dropTrackArr[i].resizeTrack(startX + trackWidthWithOffset * i, trackWidth)
      this.dropTrackArr[i].updateHitGradient(this.ctx)
    }

    // Calculate hit line position
    const isMobile = window.innerWidth < 768
    let hitLineProp = isMobile ? 8.5 : 9
    if (!this.playMode) hitLineProp = this.options.lowerHitLine ? 4 : 0

    this.checkHitLineY = (this.canvasHeight / 10) * hitLineProp
    this.noteSpeedPxPerSec = 380 * this.playbackSpeed
    this.noteDelay = (this.checkHitLineY / this.noteSpeedPxPerSec) * this.playbackSpeed

    this.repositionNotes()
  }

  /**
   * Register input handlers
   */
  private registerInput(): void {
    const keydownHandler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (!this.trackKeyBind.includes(key)) return
      if (this.keyHoldingStatus[key]) return // Prevent repeat

      this.keyHoldingStatus[key] = true

      for (const track of this.dropTrackArr) {
        track.onKeyDown(key)
      }
    }

    const keyupHandler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      this.keyHoldingStatus[key] = false

      for (const track of this.dropTrackArr) {
        track.onKeyUp(key)
      }
    }

    document.addEventListener("keydown", keydownHandler)
    document.addEventListener("keyup", keyupHandler)

    // Touch handling
    const handleTouch = (e: TouchEvent, isStart: boolean) => {
      e.preventDefault()

      for (const touch of Array.from(e.changedTouches)) {
        const x = touch.clientX
        const rect = this.canvas.getBoundingClientRect()
        const canvasX = x - rect.left

        for (const track of this.dropTrackArr) {
          if (canvasX > track.x && canvasX < track.x + track.width) {
            if (isStart) {
              this.keyHoldingStatus[track.keyBind] = true
              track.onKeyDown(track.keyBind)
            } else {
              this.keyHoldingStatus[track.keyBind] = false
              track.onKeyUp(track.keyBind)
            }
          }
        }
      }
    }

    this.canvas.addEventListener("touchstart", (e) => handleTouch(e, true))
    this.canvas.addEventListener("touchend", (e) => handleTouch(e, false))
    this.canvas.addEventListener("touchcancel", (e) => handleTouch(e, false))
  }

  /**
   * Load song data
   */
  public loadSong(noteData: NoteData[]): void {
    this.timeArr = noteData
    this.timeArrIdx = 0
    this.clearNotes()
  }

  /**
   * Start game
   */
  public startGame(): void {
    this.started = true
    this.paused = false
    this.playTime = 0
    this.currentTime = 0
  }

  /**
   * Pause game
   */
  public pauseGame(): void {
    this.paused = true
  }

  /**
   * Resume game
   */
  public resumeGame(): void {
    this.paused = false
    this.reposition()
  }

  /**
   * Clear all notes from tracks
   */
  private clearNotes(): void {
    for (const track of this.dropTrackArr) {
      track.noteArr = []
    }
  }

  /**
   * Reposition notes based on time
   */
  private repositionNotes(): void {
    const filteredNotes = this.timeArr.filter((note) => this.isWithinTime(note))

    for (const track of this.dropTrackArr) {
      track.repositionNotes(filteredNotes)
    }

    const idx = this.timeArr.findIndex((e) => e === filteredNotes[filteredNotes.length - 1])
    this.timeArrIdx = idx + 1
  }

  /**
   * Check if note is within visible time window
   */
  private isWithinTime(note: NoteData): boolean {
    const time = note.t
    const current = this.playTime
    const afterHitLineSec = (this.canvasHeight - this.checkHitLineY) / this.noteSpeedPxPerSec
    const sec = this.noteDelay + afterHitLineSec

    let isWithinStartTime = time >= current - sec
    const isWithinEndTime = time <= current

    if (note.h) {
      const holdTime = Math.max(...Object.values(note.h))
      isWithinStartTime = holdTime >= current - sec
    }

    return isWithinStartTime && isWithinEndTime
  }

  /**
   * Main update loop with isometric rendering
   */
  private update = (): void => {
    if (this.destroyed) return

    this.animationFrameId = requestAnimationFrame(this.update)

    // Update time
    if (!this.paused && this.started) {
      this.currentTime += 1 / 60 // Assume 60 FPS
      this.playTime = this.currentTime + this.noteDelay

      // Spawn new notes
      while (this.timeArrIdx < this.timeArr.length && this.isWithinTime(this.timeArr[this.timeArrIdx])) {
        const noteObj = this.timeArr[this.timeArrIdx]
        for (const track of this.dropTrackArr) {
          track.dropNote(noteObj.k, noteObj)
        }
        this.timeArrIdx++
      }
    }

    // Clear canvas
    this.ctx.fillStyle = "#0a0a0f"
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)

    // Apply isometric transformation
    this.ctx.save()
    this.renderIsometric3D()
    this.ctx.restore()

    // Draw hit line
    this.drawHitLine()
  }

  /**
   * Render game with 3D isometric perspective
   * Uses canvas 2D transforms to simulate 3D depth
   */
  private renderIsometric3D(): void {
    // Draw highway background
    this.drawHighwayBackground()

    // Update and render all tracks WITHOUT perspective transform
    // (tracks render in normal 2D space)
    for (const track of this.dropTrackArr) {
      track.update(this.ctx)
    }
  }

  /**
   * Draw highway background with lanes
   */
  private drawHighwayBackground(): void {
    // Draw highway base
    const trackWidth = Math.min(this.canvasWidth / this.trackNum, this.trackMaxWidth)
    const highwayWidth = this.trackNum * trackWidth
    const startX = this.canvasWidth / 2 - highwayWidth / 2

    // Background gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight)
    gradient.addColorStop(0, "#1a1a2e")
    gradient.addColorStop(1, "#0a0a0f")

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(startX, 0, highwayWidth, this.canvasHeight)

    // Lane dividers
    for (let i = 0; i <= this.trackNum; i++) {
      const x = startX + i * trackWidth

      this.ctx.strokeStyle = i === 0 || i === this.trackNum ? "rgba(255, 215, 0, 0.3)" : "rgba(255, 255, 255, 0.1)"
      this.ctx.lineWidth = i === 0 || i === this.trackNum ? 2 : 1
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.canvasHeight)
      this.ctx.stroke()
    }
  }


  /**
   * Draw hit line
   */
  private drawHitLine(): void {
    this.ctx.strokeStyle = "#FFD700"
    this.ctx.lineWidth = 4
    this.ctx.shadowBlur = 20
    this.ctx.shadowColor = "rgba(255, 215, 0, 0.8)"

    this.ctx.beginPath()
    this.ctx.moveTo(this.dropTrackArr[0].x, this.checkHitLineY)
    const lastTrack = this.dropTrackArr[this.dropTrackArr.length - 1]
    this.ctx.lineTo(lastTrack.x + lastTrack.width, this.checkHitLineY)
    this.ctx.stroke()

    this.ctx.shadowBlur = 0
  }

  /**
   * Add judgement to result
   */
  public addJudgement(judgement: Judgement): void {
    if (judgement === "perfect") this.result.marks.perfect++
    else if (judgement === "good") this.result.marks.good++
    else if (judgement === "offbeat") this.result.marks.offbeat++
    else if (judgement === "miss") this.result.marks.miss++
  }

  /**
   * Show judge display callback
   */
  public showJudgeDisplay(judgement: Judgement, combo: number): void {
    this.onJudgeDisplayCallback?.(judgement, combo)
  }

  /**
   * Play sound effect callback
   */
  public playEffect(sound: string): void {
    this.onPlayEffectCallback?.(sound)
  }

  /**
   * Get lane color
   */
  public getLaneColor(key: string): string {
    const colors: Record<string, string> = {
      d: "#22FF22",
      f: "#FF2222",
      j: "#FFFF22",
      k: "#2222FF",
      s: "#FF00FF",
      l: "#00FFFF",
      a: "#FF8800",
      ";": "#8800FF",
      " ": "#FFFFFF",
    }
    return colors[key] || "#FFFF00"
  }

  /**
   * Set judge display callback
   */
  public setOnJudgeDisplay(callback: (judgement: Judgement, combo: number) => void): void {
    this.onJudgeDisplayCallback = callback
  }

  /**
   * Set play effect callback
   */
  public setOnPlayEffect(callback: (sound: string) => void): void {
    this.onPlayEffectCallback = callback
  }

  /**
   * Destroy instance and cleanup
   */
  public destroy(): void {
    this.destroyed = true
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
  }
}
