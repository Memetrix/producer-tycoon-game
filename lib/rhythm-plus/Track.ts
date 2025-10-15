/**
 * Track (Lane) Class - Ported from Rhythm Plus
 * Manages notes in a single lane/track
 */

import { Note, type NoteData } from "./Note"
import type { GameInstance } from "./GameInstance"

export class Track {
  public x: number = 0
  public width: number = 0
  public keyBind: string
  public noteArr: Note[] = []
  public keyDown: boolean = false

  private hitGradient?: CanvasGradient

  constructor(
    private game: GameInstance,
    x: number,
    width: number,
    keyBind: string
  ) {
    this.x = x
    this.width = width
    this.keyBind = keyBind
  }

  /**
   * Resize track and update position
   */
  public resizeTrack(x: number, width: number): void {
    this.x = x
    this.width = width
  }

  /**
   * Create gradient for hit line effect
   */
  public updateHitGradient(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0)
    gradient.addColorStop(0, "rgba(255, 255, 255, 0)")
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)")
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
    this.hitGradient = gradient
  }

  /**
   * Handle key down event
   */
  public onKeyDown(key: string): void {
    if (key !== this.keyBind) return
    this.keyDown = true

    // Find and hit the closest note
    const laneNotes = this.noteArr.filter((note) => !note.noteFailed)

    if (laneNotes.length === 0) return

    // Find closest note to hit line
    const closestNote = laneNotes.reduce((closest, note) => {
      const closestDist = Math.abs(closest.y - this.game.checkHitLineY)
      const noteDist = Math.abs(note.y - this.game.checkHitLineY)
      return noteDist < closestDist ? note : closest
    })

    const hitWindowPx = 50 // pixels tolerance for hitting notes
    const dist = Math.abs(closestNote.y - this.game.checkHitLineY)

    if (dist <= hitWindowPx) {
      if (closestNote.isHoldNote) {
        if (!closestNote.didUserHold) {
          closestNote.didUserHold = true
          closestNote.hitAndCountScore(false)
        }
      } else {
        closestNote.hitAndCountScore(false)
        closestNote.noteFailed = true // Mark as hit to remove from array
      }
    }
  }

  /**
   * Handle key up event
   */
  public onKeyUp(key: string): void {
    if (key !== this.keyBind) return
    this.keyDown = false

    // Handle hold note release
    const holdingNotes = this.noteArr.filter((note) => note.isHoldNote && note.isUserHolding && !note.isHoldingDone)

    for (const note of holdingNotes) {
      note.isHoldingDone = true
      note.isUserHolding = false
    }
  }

  /**
   * Add new note to track
   */
  public dropNote(key: string, keyObj: NoteData): void {
    // Check if this key matches our track
    if (!key.includes(this.keyBind)) return

    const color = this.game.getLaneColor(this.keyBind)
    const y = 0 // Start from top

    const note = new Note(this.game, keyObj, this.keyBind, this.x, y, this.width, color, false)

    this.noteArr.push(note)
  }

  /**
   * Reposition all notes based on current time
   */
  public repositionNotes(noteObjects: NoteData[]): void {
    this.noteArr = []

    for (const keyObj of noteObjects) {
      if (keyObj.k.includes(this.keyBind)) {
        const color = this.game.getLaneColor(this.keyBind)
        const timing = this.game.playTime
        const timeElapsed = timing - keyObj.t
        const y = (timeElapsed * this.game.noteSpeedPxPerSec) / this.game.playbackSpeed

        const note = new Note(this.game, keyObj, this.keyBind, this.x, y, this.width, color, true)
        this.noteArr.push(note)
      }
    }
  }

  /**
   * Update and render all notes in track
   */
  public update(ctx: CanvasRenderingContext2D): boolean {
    let shouldAdvanceTimeArr = false

    // Update all notes
    for (let i = this.noteArr.length - 1; i >= 0; i--) {
      const note = this.noteArr[i]

      // Check if note should be spawned
      if (note.y >= -100) {
        note.update(ctx, this.keyDown)
      }

      // Remove notes that are out of canvas
      if (note.isOutOfCanvas()) {
        this.noteArr.splice(i, 1)
        shouldAdvanceTimeArr = true
      }
    }

    // Draw track background
    this.drawTrack(ctx)

    return shouldAdvanceTimeArr
  }

  /**
   * Draw track background and hit line
   */
  private drawTrack(ctx: CanvasRenderingContext2D): void {
    // Draw track separator
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(this.x + this.width, 0)
    ctx.lineTo(this.x + this.width, this.game.canvasHeight)
    ctx.stroke()

    // Draw hit line glow when key is pressed
    if (this.keyDown && this.hitGradient) {
      ctx.fillStyle = this.hitGradient
      ctx.fillRect(this.x, this.game.checkHitLineY - 20, this.width, 40)
    }
  }
}
