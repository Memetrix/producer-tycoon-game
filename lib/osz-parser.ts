import JSZip from "jszip"

export interface OsuBeatmap {
  title: string
  artist: string
  creator: string
  version: string // difficulty name
  audioFilename: string
  mode: number // 0=standard, 1=taiko, 2=catch, 3=mania
  bpm: number
  timingPoints: TimingPoint[]
  hitObjects: HitObject[]
}

export interface TimingPoint {
  time: number // milliseconds
  beatLength: number // milliseconds per beat (60000/BPM for uninherited)
  meter: number // beats per measure
  uninherited: boolean // true for red lines (BPM changes)
}

export interface HitObject {
  time: number // milliseconds
  type: number // 1=circle, 2=slider, 8=spinner, 128=mania hold
  lane: number // for taiko/mania
  hitSound: number
}

export interface OszPackage {
  beatmaps: OsuBeatmap[]
  audioBlob: Blob | null
  audioFilename: string
}

/**
 * Parse .osz file (osu! beatmap package)
 */
export async function parseOszFile(url: string): Promise<OszPackage> {
  console.log("[v0] Fetching OSZ file:", url)

  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()

  const zip = await JSZip.loadAsync(arrayBuffer)
  console.log("[v0] OSZ archive loaded. Files:", Object.keys(zip.files).length)

  const osuFiles = Object.keys(zip.files).filter((name) => name.endsWith(".osu"))
  console.log("[v0] Found .osu files:", osuFiles.length)

  const beatmaps: OsuBeatmap[] = []
  let audioBlob: Blob | null = null
  let audioFilename = ""

  for (const filename of osuFiles) {
    const file = zip.files[filename]
    const content = await file.async("text")
    const beatmap = parseOsuFile(content)
    beatmaps.push(beatmap)

    if (!audioFilename && beatmap.audioFilename) {
      audioFilename = beatmap.audioFilename
    }
  }

  if (audioFilename) {
    console.log("[v0] Looking for audio file:", audioFilename)

    // Try exact match first
    if (zip.files[audioFilename]) {
      console.log("[v0] Found audio file (exact match):", audioFilename)
      audioBlob = await zip.files[audioFilename].async("blob")
    } else {
      // Try case-insensitive search
      const audioFilenameLower = audioFilename.toLowerCase()
      const matchingFile = Object.keys(zip.files).find((name) => name.toLowerCase() === audioFilenameLower)

      if (matchingFile) {
        console.log("[v0] Found audio file (case-insensitive):", matchingFile)
        audioBlob = await zip.files[matchingFile].async("blob")
      } else {
        // Try finding any audio file
        const audioExtensions = [".mp3", ".ogg", ".wav", ".m4a"]
        const audioFile = Object.keys(zip.files).find((name) =>
          audioExtensions.some((ext) => name.toLowerCase().endsWith(ext)),
        )

        if (audioFile) {
          console.log("[v0] Found audio file (by extension):", audioFile)
          audioBlob = await zip.files[audioFile].async("blob")
          audioFilename = audioFile
        }
      }
    }
  }

  console.log("[v0] Parsed beatmaps:", beatmaps.length)
  console.log("[v0] Audio:", audioFilename, audioBlob ? `found (${audioBlob.size} bytes)` : "not found")

  beatmaps.sort((a, b) => a.hitObjects.length - b.hitObjects.length)

  return {
    beatmaps,
    audioBlob,
    audioFilename,
  }
}

/**
 * Parse .osu file content
 */
function parseOsuFile(content: string): OsuBeatmap {
  const lines = content.split("\n").map((line) => line.trim())

  const beatmap: OsuBeatmap = {
    title: "",
    artist: "",
    creator: "",
    version: "",
    audioFilename: "",
    mode: 0,
    bpm: 120,
    timingPoints: [],
    hitObjects: [],
  }

  let section = ""

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line || line.startsWith("//")) continue

    // Section headers
    if (line.startsWith("[") && line.endsWith("]")) {
      section = line.slice(1, -1)
      continue
    }

    // Parse sections
    if (section === "General") {
      if (line.startsWith("AudioFilename:")) {
        beatmap.audioFilename = line.split(":")[1].trim()
      } else if (line.startsWith("Mode:")) {
        beatmap.mode = Number.parseInt(line.split(":")[1].trim())
      }
    } else if (section === "Metadata") {
      if (line.startsWith("Title:")) {
        beatmap.title = line.split(":")[1].trim()
      } else if (line.startsWith("Artist:")) {
        beatmap.artist = line.split(":")[1].trim()
      } else if (line.startsWith("Creator:")) {
        beatmap.creator = line.split(":")[1].trim()
      } else if (line.startsWith("Version:")) {
        beatmap.version = line.split(":")[1].trim()
      }
    } else if (section === "TimingPoints") {
      const parts = line.split(",")
      if (parts.length >= 2) {
        const time = Number.parseFloat(parts[0])
        const beatLength = Number.parseFloat(parts[1])
        const meter = parts.length >= 3 ? Number.parseInt(parts[2]) : 4
        const uninherited = parts.length >= 7 ? parts[6] === "1" : beatLength > 0

        beatmap.timingPoints.push({
          time,
          beatLength,
          meter,
          uninherited,
        })

        // Calculate BPM from first uninherited timing point
        if (uninherited && beatLength > 0 && beatmap.bpm === 120) {
          beatmap.bpm = Math.round(60000 / beatLength)
        }
      }
    } else if (section === "HitObjects") {
      const parts = line.split(",")
      if (parts.length >= 3) {
        const x = Number.parseInt(parts[0])
        const time = Number.parseInt(parts[2])
        const type = Number.parseInt(parts[3])
        const hitSound = parts.length >= 5 ? Number.parseInt(parts[4]) : 0

        // For taiko mode, determine lane based on hit sound or color
        // In taiko: hitSound & 2 (whistle) or hitSound & 8 (clap) = Kat (blue)
        // Otherwise = Don (red)
        let lane = 0
        if (beatmap.mode === 1) {
          // Taiko mode
          const isKat = (hitSound & 2) !== 0 || (hitSound & 8) !== 0
          lane = isKat ? 1 : 0
        }

        beatmap.hitObjects.push({
          time,
          type,
          lane,
          hitSound,
        })
      }
    }
  }

  console.log(`[v0] Parsed beatmap: ${beatmap.artist} - ${beatmap.title} [${beatmap.version}]`)
  console.log(`[v0]   Mode: ${beatmap.mode}, BPM: ${beatmap.bpm}, Notes: ${beatmap.hitObjects.length}`)

  return beatmap
}

/**
 * Convert osu! beatmap to our game format
 */
export function convertOsuToGameNotes(beatmap: OsuBeatmap): Array<{ time: number; lane: number }> {
  const notes: Array<{ time: number; lane: number }> = []

  if (beatmap.mode === 1) {
    // Taiko mode - proper mapping
    for (const obj of beatmap.hitObjects) {
      if (obj.type & 8) continue // Skip spinners

      const time = obj.time / 1000

      if (obj.lane === 0) {
        // Don (red) -> alternate kick (0) and snare (1)
        const donCount = notes.filter((n) => n.lane === 0 || n.lane === 1).length
        const lane = donCount % 2
        notes.push({ time, lane })
      } else {
        // Kat (blue) -> alternate hat (2) and tom (3)
        const katCount = notes.filter((n) => n.lane === 2 || n.lane === 3).length
        const lane = 2 + (katCount % 2)
        notes.push({ time, lane })
      }
    }
  } else {
    for (const obj of beatmap.hitObjects) {
      if (obj.type & 8) continue // Skip spinners

      const time = obj.time / 1000

      // Get X position from hit object (stored in first part of line)
      // osu! playfield is 512 pixels wide, divide into 4 lanes
      const x = obj.lane // This was parsed as X coordinate
      let lane = 0

      if (x < 128)
        lane = 0 // Left quarter -> kick
      else if (x < 256)
        lane = 1 // Left-center -> snare
      else if (x < 384)
        lane = 2 // Right-center -> hat
      else lane = 3 // Right quarter -> tom

      notes.push({ time, lane })
    }
  }

  const MAX_NOTES = 200
  if (notes.length > MAX_NOTES) {
    console.log(`[v0] Pattern too dense (${notes.length} notes), simplifying to ${MAX_NOTES}`)

    // Keep every Nth note to reduce density
    const step = Math.ceil(notes.length / MAX_NOTES)
    const simplified = notes.filter((_, index) => index % step === 0)

    console.log(`[v0] Simplified from ${notes.length} to ${simplified.length} notes`)

    console.log(`[v0] Note distribution:`, {
      kick: simplified.filter((n) => n.lane === 0).length,
      snare: simplified.filter((n) => n.lane === 1).length,
      hat: simplified.filter((n) => n.lane === 2).length,
      tom: simplified.filter((n) => n.lane === 3).length,
    })

    return simplified
  }

  console.log(`[v0] Converted ${beatmap.hitObjects.length} osu! objects to ${notes.length} game notes`)
  console.log(`[v0] Note distribution:`, {
    kick: notes.filter((n) => n.lane === 0).length,
    snare: notes.filter((n) => n.lane === 1).length,
    hat: notes.filter((n) => n.lane === 2).length,
    tom: notes.filter((n) => n.lane === 3).length,
  })

  return notes
}
