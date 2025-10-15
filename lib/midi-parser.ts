export interface MidiNote {
  track: "kick" | "snare" | "hat" | "tom"
  time: number // в миллисекундах
  velocity: number // 0-127
}

export interface ParsedMidi {
  notes: MidiNote[]
  duration: number // общая длительность в мс
  bpm: number
}

// Маппинг MIDI нот на барабаны (General MIDI Drum Map)
const MIDI_NOTE_MAP: Record<number, "kick" | "snare" | "hat" | "tom"> = {
  36: "kick", // Bass Drum 1
  35: "kick", // Acoustic Bass Drum
  38: "snare", // Acoustic Snare
  40: "snare", // Electric Snare
  42: "hat", // Closed Hi-Hat
  44: "hat", // Pedal Hi-Hat
  46: "hat", // Open Hi-Hat
  41: "tom", // Low Floor Tom
  43: "tom", // High Floor Tom
  45: "tom", // Low Tom
  47: "tom", // Low-Mid Tom
  48: "tom", // Hi-Mid Tom
  50: "tom", // High Tom
}

export async function parseMidiFile(url: string): Promise<ParsedMidi> {
  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const dataView = new DataView(arrayBuffer)

    // Парсинг MIDI заголовка
    const headerChunk = readChunk(dataView, 0)
    if (headerChunk.type !== "MThd") {
      throw new Error("Invalid MIDI file: missing header")
    }

    const format = dataView.getUint16(8)
    const trackCount = dataView.getUint16(10)
    const division = dataView.getUint16(12)

    // Вычисляем тики на четверть ноты
    const ticksPerQuarterNote = division & 0x7fff

    // Парсинг треков
    let offset = 14
    const notes: MidiNote[] = []
    let bpm = 120 // дефолтный темп

    for (let i = 0; i < trackCount; i++) {
      const trackChunk = readChunk(dataView, offset)
      if (trackChunk.type !== "MTrk") {
        throw new Error(`Invalid MIDI file: expected MTrk at offset ${offset}`)
      }

      const trackData = new DataView(arrayBuffer, offset + 8, trackChunk.length)
      const trackNotes = parseTrack(trackData, ticksPerQuarterNote)

      // Извлекаем BPM из первого трека
      if (i === 0 && trackNotes.bpm) {
        bpm = trackNotes.bpm
      }

      notes.push(...trackNotes.notes)
      offset += 8 + trackChunk.length
    }

    // Сортируем ноты по времени
    notes.sort((a, b) => a.time - b.time)

    const firstNoteTime = notes.length > 0 ? notes[0].time : 0
    if (firstNoteTime > 0) {
      console.log(`[v0] MIDI offset detected: ${(firstNoteTime / 1000).toFixed(2)}s - normalizing to 0`)
      notes.forEach((note) => {
        note.time -= firstNoteTime
      })
    }

    const filteredNotes = filterNotes(notes)

    console.log(`[v0] MIDI parsed: ${notes.length} raw notes, ${filteredNotes.length} filtered notes`)
    console.log(`[v0] Notes by track:`, {
      kick: filteredNotes.filter((n) => n.track === "kick").length,
      snare: filteredNotes.filter((n) => n.track === "snare").length,
      hat: filteredNotes.filter((n) => n.track === "hat").length,
      tom: filteredNotes.filter((n) => n.track === "tom").length,
    })

    // Вычисляем общую длительность
    const duration = filteredNotes.length > 0 ? filteredNotes[filteredNotes.length - 1].time + 1000 : 0

    return { notes: filteredNotes, duration, bpm }
  } catch (error) {
    console.error("Error parsing MIDI file:", error)
    throw error
  }
}

function readChunk(dataView: DataView, offset: number): { type: string; length: number } {
  const type = String.fromCharCode(
    dataView.getUint8(offset),
    dataView.getUint8(offset + 1),
    dataView.getUint8(offset + 2),
    dataView.getUint8(offset + 3),
  )
  const length = dataView.getUint32(offset + 4)
  return { type, length }
}

function parseTrack(dataView: DataView, ticksPerQuarterNote: number): { notes: MidiNote[]; bpm?: number } {
  const notes: MidiNote[] = []
  let bpm: number | undefined
  let offset = 0
  let currentTime = 0
  let microsecondsPerQuarterNote = 500000 // дефолт 120 BPM

  const midiNoteNumbers = new Set<number>()

  while (offset < dataView.byteLength) {
    // Читаем delta time (variable length)
    const deltaTime = readVariableLength(dataView, offset)
    offset += deltaTime.bytesRead

    // Конвертируем тики в миллисекунды
    const msPerTick = microsecondsPerQuarterNote / 1000 / ticksPerQuarterNote
    currentTime += deltaTime.value * msPerTick

    // Читаем событие
    let eventType = dataView.getUint8(offset)
    offset++

    // Running status (если старший бит не установлен, используем предыдущий статус)
    if ((eventType & 0x80) === 0) {
      offset--
      eventType = 0x90 // предполагаем Note On
    }

    const messageType = eventType & 0xf0

    if (messageType === 0x90) {
      // Note On
      const note = dataView.getUint8(offset)
      const velocity = dataView.getUint8(offset + 1)
      offset += 2

      midiNoteNumbers.add(note)

      // Игнорируем Note On с velocity 0 (это Note Off)
      if (velocity > 0 && MIDI_NOTE_MAP[note]) {
        notes.push({
          track: MIDI_NOTE_MAP[note],
          time: Math.round(currentTime),
          velocity,
        })
      } else if (velocity > 0) {
        console.log(`[v0] Unmapped MIDI note: ${note} (velocity: ${velocity})`)
      }
    } else if (messageType === 0x80) {
      // Note Off
      offset += 2 // пропускаем note и velocity
    } else if (messageType === 0xb0) {
      // Control Change
      offset += 2
    } else if (messageType === 0xc0) {
      // Program Change
      offset += 1
    } else if (messageType === 0xe0) {
      // Pitch Bend
      offset += 2
    } else if (eventType === 0xff) {
      // Meta Event
      const metaType = dataView.getUint8(offset)
      offset++

      const length = readVariableLength(dataView, offset)
      offset += length.bytesRead

      // Tempo change
      if (metaType === 0x51 && length.value === 3) {
        microsecondsPerQuarterNote =
          (dataView.getUint8(offset) << 16) | (dataView.getUint8(offset + 1) << 8) | dataView.getUint8(offset + 2)
        bpm = Math.round(60000000 / microsecondsPerQuarterNote)
      }

      offset += length.value
    } else if (eventType === 0xf0 || eventType === 0xf7) {
      // SysEx
      const length = readVariableLength(dataView, offset)
      offset += length.bytesRead + length.value
    }
  }

  console.log(
    `[v0] MIDI note numbers in track:`,
    Array.from(midiNoteNumbers).sort((a, b) => a - b),
  )

  return { notes, bpm }
}

function readVariableLength(dataView: DataView, offset: number): { value: number; bytesRead: number } {
  let value = 0
  let bytesRead = 0
  let byte: number

  do {
    byte = dataView.getUint8(offset + bytesRead)
    value = (value << 7) | (byte & 0x7f)
    bytesRead++
  } while ((byte & 0x80) !== 0 && bytesRead < 4)

  return { value, bytesRead }
}

function filterNotes(notes: MidiNote[]): MidiNote[] {
  const MIN_VELOCITY = 50 // Убираем слишком тихие ноты (ghost notes)
  const MIN_NOTE_DISTANCE = 100 // Минимум 100ms между нотами на одной дорожке

  // Фильтруем по velocity
  const filtered = notes.filter((note) => note.velocity >= MIN_VELOCITY)

  // Фильтруем слишком близкие ноты на одной дорожке
  const result: MidiNote[] = []
  const lastNoteTime: Record<string, number> = {}

  for (const note of filtered) {
    const lastTime = lastNoteTime[note.track] || Number.NEGATIVE_INFINITY
    const timeDiff = note.time - lastTime

    if (timeDiff >= MIN_NOTE_DISTANCE) {
      result.push(note)
      lastNoteTime[note.track] = note.time
    }
  }

  return result
}
