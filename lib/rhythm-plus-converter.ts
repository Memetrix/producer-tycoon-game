/**
 * Converter for OSU beatmaps to Rhythm Plus NoteData format
 */

import type { NoteData } from "./rhythm-plus/Note"
import type { OsuBeatmap } from "./osz-parser"

/**
 * Convert OSU beatmap to Rhythm Plus NoteData format
 * Maps 4-lane drum pattern (kick, snare, hat, tom) to key bindings (d, f, j, k)
 */
export function convertOsuToRhythmPlus(beatmap: OsuBeatmap): NoteData[] {
  const notes: NoteData[] = []
  const laneToKey = ["d", "f", "j", "k"] // kick, snare, hat, tom

  if (beatmap.mode === 1) {
    // Taiko mode - proper mapping
    for (const obj of beatmap.hitObjects) {
      if (obj.type & 8) continue // Skip spinners

      const time = obj.time / 1000 // Convert milliseconds to seconds

      let lane = 0
      if (obj.lane === 0) {
        // Don (red) -> alternate kick (0) and snare (1)
        const donCount = notes.filter((n) => n.k === "d" || n.k === "f").length
        lane = donCount % 2
      } else {
        // Kat (blue) -> alternate hat (2) and tom (3)
        const katCount = notes.filter((n) => n.k === "j" || n.k === "k").length
        lane = 2 + (katCount % 2)
      }

      // Check if this is a hold note (slider or long note)
      const isHoldNote = (obj.type & 2) !== 0 || (obj.type & 128) !== 0

      const noteData: NoteData = {
        t: time,
        k: laneToKey[lane],
      }

      // For hold notes, add hold duration
      // TODO: Parse actual hold duration from slider length
      if (isHoldNote) {
        noteData.h = {
          [laneToKey[lane]]: time + 0.5, // Default 0.5 second hold
        }
      }

      notes.push(noteData)
    }
  } else {
    // Standard mode - map X position to lanes
    for (const obj of beatmap.hitObjects) {
      if (obj.type & 8) continue // Skip spinners

      const time = obj.time / 1000

      // Parse X coordinate from hit object
      // osu! playfield is 512 pixels wide, divide into 4 lanes
      const x = obj.lane // X coordinate stored in lane field
      let lane = 0

      if (x < 128) {
        lane = 0 // kick (d)
      } else if (x < 256) {
        lane = 1 // snare (f)
      } else if (x < 384) {
        lane = 2 // hat (j)
      } else {
        lane = 3 // tom (k)
      }

      const isHoldNote = (obj.type & 2) !== 0 || (obj.type & 128) !== 0

      const noteData: NoteData = {
        t: time,
        k: laneToKey[lane],
      }

      if (isHoldNote) {
        noteData.h = {
          [laneToKey[lane]]: time + 0.5,
        }
      }

      notes.push(noteData)
    }
  }

  // Limit note density for gameplay balance
  const MAX_NOTES = 200
  if (notes.length > MAX_NOTES) {
    console.log(`[Rhythm Plus] Pattern too dense (${notes.length} notes), simplifying to ${MAX_NOTES}`)

    const step = Math.ceil(notes.length / MAX_NOTES)
    const simplified = notes.filter((_, index) => index % step === 0)

    console.log(`[Rhythm Plus] Simplified from ${notes.length} to ${simplified.length} notes`)
    return simplified
  }

  // Sort by time
  notes.sort((a, b) => a.t - b.t)

  console.log(`[Rhythm Plus] Converted ${beatmap.hitObjects.length} osu! objects to ${notes.length} Rhythm Plus notes`)
  console.log(`[Rhythm Plus] Note distribution:`, {
    d: notes.filter((n) => n.k.includes("d")).length,
    f: notes.filter((n) => n.k.includes("f")).length,
    j: notes.filter((n) => n.k.includes("j")).length,
    k: notes.filter((n) => n.k.includes("k")).length,
  })

  return notes
}

/**
 * Detect hold note duration from OSU slider data
 * TODO: Implement proper slider parsing for accurate hold durations
 */
export function calculateSliderDuration(
  beatLength: number,
  sliderMultiplier: number,
  repeats: number,
  pixelLength: number
): number {
  // OSU slider velocity formula
  const duration = (pixelLength / (100 * sliderMultiplier) * beatLength * repeats) / 1000
  return duration
}
