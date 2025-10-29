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
  public canvasWidth = 0
  public canvasHeight = 0

  // Tracks (Lanes)
  public dropTrackArr: Track[] = []
  public trackNum = 4
  private trackKeyBind: string[] = ["d", "f", "j", "k"]
  private trackMaxWidth = 150

  // Game state
  public paused = true
  public started = false
  public playMode = true
  public playbackSpeed = 1
  public noFail = false
  public vibrate = true

  // Timing
  public currentTime = 0
  public playTime = 0
  public noteDelay = 0
  public checkHitLineY = 0
  public noteSpeedPxPerSec = 380

  // Note data
  private timeArr: NoteData[] = []
  private timeArrIdx = 0

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
  public health = 100

  // Options
  public options: GameOptions = {
    soundEffect: true,
    lowerHitLine: false,
  }

  // Callbacks
  private onJudgeDisplayCallback?: (judgement: Judgement, combo: number) => void
  private onPlayEffectCallback?: (sound: string) => void
  private onGameEndCallback?: () => void

  // Animation
  private animationFrameId: number | null = null
  private destroyed = false

  // Isometric rendering
  private readonly PERSPECTIVE = 1200
  private readonly PERSPECTIVE_ORIGIN = { x: 0.5, y: 0.9 }
  private readonly HIGHWAY_ROTATION_X = 68 // degrees
  private readonly HIGHWAY_Z_OFFSET = -500
  private readonly HIGHWAY_LENGTH = 2000

  private gameEnded = false
  private allNotesSpawned = false
  private gameEndCallbackFired = false

  private startTime = 0
  private pausedTime = 0
  private lastUpdateTime = 0

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
    this.gameEnded = false
    this.allNotesSpawned = false
    this.gameEndCallbackFired = false

    if (noteData.length > 0) {
      const firstNote = noteData[0]
      const lastNote = noteData[noteData.length - 1]
      const duration = lastNote.t - firstNote.t

      console.log("[v0] Song loaded:")
      console.log("[v0]   Total notes:", noteData.length)
      console.log("[v0]   First note at:", firstNote.t.toFixed(2), "seconds")
      console.log("[v0]   Last note at:", lastNote.t.toFixed(2), "seconds")
      console.log("[v0]   Duration:", duration.toFixed(2), "seconds")
      console.log("[v0]   Note distribution:", {
        d: noteData.filter((n) => n.k.includes("d")).length,
        f: noteData.filter((n) => n.k.includes("f")).length,
        j: noteData.filter((n) => n.k.includes("j")).length,
        k: noteData.filter((n) => n.k.includes("k")).length,
      })
    }
  }

  /**
   * Start game
   */
  public startGame(): void {
    this.started = true
    this.paused = false
    this.playTime = 0
    this.currentTime = 0
    this.startTime = performance.now()
    this.lastUpdateTime = this.startTime
    this.pausedTime = 0
  }

  /**
   * Pause game
   */
  public pauseGame(): void {
    if (!this.paused) {
      this.paused = true
      this.pausedTime = performance.now()
    }
  }

  /**
   * Resume game
   */
  public resumeGame(): void {
    if (this.paused) {
      this.paused = false
      const pauseDuration = performance.now() - this.pausedTime
      this.startTime += pauseDuration
      this.lastUpdateTime = performance.now()
      this.reposition()
    }
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
      const now = performance.now()
      const elapsedSeconds = (now - this.startTime) / 1000
      this.currentTime = elapsedSeconds
      this.playTime = this.currentTime + this.noteDelay

      const notesBeforeSpawn = this.timeArrIdx

      // Spawn new notes
      while (this.timeArrIdx < this.timeArr.length && this.isWithinTime(this.timeArr[this.timeArrIdx])) {
        const noteObj = this.timeArr[this.timeArrIdx]
        for (const track of this.dropTrackArr) {
          track.dropNote(noteObj.k, noteObj)
        }
        this.timeArrIdx++
      }

      if (notesBeforeSpawn < this.timeArrIdx && this.timeArrIdx % 50 === 0) {
        console.log(
          "[v0] Spawned notes up to index:",
          this.timeArrIdx,
          "/ ",
          this.timeArr.length,
          "at time:",
          this.playTime.toFixed(2),
        )
      }

      if (this.timeArrIdx >= this.timeArr.length && !this.allNotesSpawned) {
        this.allNotesSpawned = true
        console.log("[v0] All notes spawned at time:", this.playTime.toFixed(2), "seconds")
      }

      if (this.allNotesSpawned && !this.gameEnded && !this.gameEndCallbackFired) {
        const allTracksEmpty = this.dropTrackArr.every((track) => track.noteArr.length === 0)
        if (allTracksEmpty) {
          console.log("[v0] Game ended - all notes processed at time:", this.playTime.toFixed(2), "seconds")
          this.gameEnded = true
          this.gameEndCallbackFired = true

          // Call callback after a small delay to ensure state is stable
          setTimeout(() => {
            this.onGameEndCallback?.()
          }, 100)
        }
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
   * Uses perspective scaling instead of matrix transforms
   */
  private renderIsometric3D(): void {
    // Draw highway background with perspective
    this.drawHighwayBackground()

    // Update and render all tracks
    for (const track of this.dropTrackArr) {
      track.update(this.ctx)
    }
  }

  /**
   * Draw highway background with isometric perspective
   */
  private drawHighwayBackground(): void {
    const trackWidth = Math.min(this.canvasWidth / this.trackNum, this.trackMaxWidth)
    const highwayWidth = this.trackNum * trackWidth
    const centerX = this.canvasWidth / 2

    // Perspective parameters
    const minScale = 0.3 // Scale at far end (top)
    const maxScale = 1.0 // Scale at near end (hit line)

    // Draw highway as trapezoid (perspective)
    const topWidth = highwayWidth * minScale
    const bottomWidth = highwayWidth * maxScale

    const topLeft = centerX - topWidth / 2
    const topRight = centerX + topWidth / 2
    const bottomLeft = centerX - bottomWidth / 2
    const bottomRight = centerX + bottomWidth / 2

    // Background gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight)
    gradient.addColorStop(0, "#1a1a2e")
    gradient.addColorStop(0.5, "#16162b")
    gradient.addColorStop(1, "#0a0a0f")

    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.moveTo(topLeft, 0)
    this.ctx.lineTo(topRight, 0)
    this.ctx.lineTo(bottomRight, this.canvasHeight)
    this.ctx.lineTo(bottomLeft, this.canvasHeight)
    this.ctx.closePath()
    this.ctx.fillStyle = gradient
    this.ctx.fill()

    // Lane dividers with perspective
    for (let i = 0; i <= this.trackNum; i++) {
      const lanePercent = i / this.trackNum

      // Calculate X positions at top and bottom with perspective
      const topX = topLeft + topWidth * lanePercent
      const bottomX = bottomLeft + bottomWidth * lanePercent

      // Draw lane divider
      const isEdge = i === 0 || i === this.trackNum
      this.ctx.strokeStyle = isEdge ? "rgba(255, 215, 0, 0.4)" : "rgba(255, 255, 255, 0.15)"
      this.ctx.lineWidth = isEdge ? 3 : 1.5
      this.ctx.shadowBlur = isEdge ? 15 : 0
      this.ctx.shadowColor = "rgba(255, 215, 0, 0.5)"

      this.ctx.beginPath()
      this.ctx.moveTo(topX, 0)
      this.ctx.lineTo(bottomX, this.canvasHeight)
      this.ctx.stroke()

      this.ctx.shadowBlur = 0
    }

    // Add grid lines for depth perception
    const gridLines = 10
    for (let i = 1; i < gridLines; i++) {
      const y = (this.canvasHeight / gridLines) * i
      const yPercent = y / this.canvasHeight
      const scale = minScale + (maxScale - minScale) * yPercent
      const lineWidth = highwayWidth * scale

      const leftX = centerX - lineWidth / 2
      const rightX = centerX + lineWidth / 2

      this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + yPercent * 0.05})`
      this.ctx.lineWidth = 1
      this.ctx.beginPath()
      this.ctx.moveTo(leftX, y)
      this.ctx.lineTo(rightX, y)
      this.ctx.stroke()
    }

    this.ctx.restore()
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
   * Calculate perspective X position for a note
   * Takes lane X position and Y position, returns adjusted X for perspective
   */
  public getPerspectiveX(baseX: number, baseWidth: number, y: number): { x: number; width: number } {
    const hitLineY = this.checkHitLineY
    const maxDistance = hitLineY

    // Clamp Y to valid range and calculate normalized position (0 at top, 1 at hit line)
    const clampedY = Math.max(0, Math.min(y, hitLineY))
    const normalizedY = clampedY / hitLineY

    const minScale = 0.3
    const maxScale = 1.0

    // Calculate highway perspective
    const trackWidth = Math.min(this.canvasWidth / this.trackNum, this.trackMaxWidth)
    const highwayWidth = this.trackNum * trackWidth
    const centerX = this.canvasWidth / 2

    const topWidth = highwayWidth * minScale
    const bottomWidth = highwayWidth * maxScale

    // Find which lane this note is in
    const laneIndex = this.dropTrackArr.findIndex(track =>
      baseX >= track.x && baseX < track.x + track.width
    )

    if (laneIndex === -1) {
      // Fallback to simple scaling
      const currentWidth = topWidth + (bottomWidth - topWidth) * normalizedY
      const currentLaneWidth = currentWidth / this.trackNum
      return {
        x: centerX - currentWidth / 2 + (laneIndex + 0.5) * currentLaneWidth - currentLaneWidth / 2,
        width: currentLaneWidth
      }
    }

    // Calculate current highway width at this Y position
    const currentHighwayWidth = topWidth + (bottomWidth - topWidth) * normalizedY
    const currentLaneWidth = currentHighwayWidth / this.trackNum

    // Calculate lane boundaries in perspective
    const highwayLeft = centerX - currentHighwayWidth / 2
    const laneLeft = highwayLeft + laneIndex * currentLaneWidth

    return {
      x: laneLeft,
      width: currentLaneWidth
    }
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
   * Set game end callback
   */
  public setOnGameEnd(callback: () => void): void {
    this.onGameEndCallback = callback
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
