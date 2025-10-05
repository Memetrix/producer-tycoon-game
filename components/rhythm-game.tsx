"use client"

import { useState, useEffect, useRef } from "react"
import { Music } from "lucide-react"

interface Note {
  id: string
  position: number // 0-100, where 100 is the hit zone
  lane: number // 0-3 for 4 lanes
  hit: boolean
  accuracy: "perfect" | "good" | "miss" | null
}

interface RhythmGameProps {
  onComplete: (accuracy: number) => void // 0-100
  difficulty: number // 1-5, affects speed and number of notes
}

const DRUM_LABELS = ["🥁 Kick", "🎵 Snare", "🔔 Hi-Hat", "💥 Tom"]

// Different beat patterns that rotate between sessions
const BEAT_PATTERNS = [
  // Basic 4/4 rock beat
  [0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2],
  // Hip-hop pattern
  [0, 0, 1, 2, 0, 2, 1, 2, 0, 0, 1, 2, 3, 2, 1, 2],
  // Complex pattern
  [0, 2, 2, 1, 0, 3, 2, 1, 0, 2, 1, 2, 0, 3, 1, 3],
  // Trap pattern
  [0, 2, 0, 2, 1, 2, 0, 2, 0, 2, 1, 2, 3, 2, 1, 2],
  // Drum & Bass
  [0, 2, 1, 2, 0, 2, 1, 3, 0, 2, 1, 2, 0, 3, 1, 2],
]

// Select random pattern for this session
const getRandomPattern = () => {
  return BEAT_PATTERNS[Math.floor(Math.random() * BEAT_PATTERNS.length)]
}

export function RhythmGame({ onComplete, difficulty }: RhythmGameProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [totalNotes, setTotalNotes] = useState(0)
  const [hitNotes, setHitNotes] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const noteSpawnRef = useRef<NodeJS.Timeout | null>(null)
  const notesSpawnedRef = useRef(0)
  const [activeLanes, setActiveLanes] = useState<Set<number>>(new Set())

  const perfectHitsRef = useRef(0)
  const goodHitsRef = useRef(0)
  const missedHitsRef = useRef(0)

  const patternRef = useRef<number[]>(getRandomPattern())
  const audioContextRef = useRef<AudioContext | null>(null)

  const TOTAL_NOTES_COUNT = patternRef.current.length
  const NOTE_SPEED = 1.2 + difficulty * 0.1
  const HIT_ZONE = 85
  const PERFECT_THRESHOLD = 12
  const GOOD_THRESHOLD = 25
  const TAP_WINDOW = 35

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  const playDrumSound = (lane: number) => {
    if (!audioContextRef.current) return

    const ctx = audioContextRef.current
    const now = ctx.currentTime

    // Create different sounds for each drum
    switch (lane) {
      case 0: // Kick drum - low frequency
        {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(150, now)
          osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5)
          gain.gain.setValueAtTime(1, now)
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
          osc.start(now)
          osc.stop(now + 0.5)
        }
        break
      case 1: // Snare - noise burst
        {
          const bufferSize = ctx.sampleRate * 0.1
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
          const data = buffer.getChannelData(0)
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1
          }
          const noise = ctx.createBufferSource()
          const filter = ctx.createBiquadFilter()
          const gain = ctx.createGain()
          noise.buffer = buffer
          noise.connect(filter)
          filter.connect(gain)
          gain.connect(ctx.destination)
          filter.type = "highpass"
          filter.frequency.value = 1000
          gain.gain.setValueAtTime(0.5, now)
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
          noise.start(now)
        }
        break
      case 2: // Hi-hat - high frequency short burst
        {
          const bufferSize = ctx.sampleRate * 0.05
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
          const data = buffer.getChannelData(0)
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1
          }
          const noise = ctx.createBufferSource()
          const filter = ctx.createBiquadFilter()
          const gain = ctx.createGain()
          noise.buffer = buffer
          noise.connect(filter)
          filter.connect(gain)
          gain.connect(ctx.destination)
          filter.type = "highpass"
          filter.frequency.value = 7000
          gain.gain.setValueAtTime(0.3, now)
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
          noise.start(now)
        }
        break
      case 3: // Tom - mid frequency
        {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(200, now)
          osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.3)
          gain.gain.setValueAtTime(0.7, now)
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
          osc.start(now)
          osc.stop(now + 0.3)
        }
        break
    }
  }

  useEffect(() => {
    if (!gameStarted) {
      startGame()
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      if (noteSpawnRef.current) clearInterval(noteSpawnRef.current)
    }
  }, [])

  const startGame = () => {
    setGameStarted(true)
    setIsPlaying(true)
    setTotalNotes(TOTAL_NOTES_COUNT)

    console.log("[v0] Starting rhythm game with pattern:", patternRef.current)

    let noteIndex = 0
    noteSpawnRef.current = setInterval(
      () => {
        if (noteIndex >= patternRef.current.length) {
          if (noteSpawnRef.current) clearInterval(noteSpawnRef.current)
          return
        }

        const newNote: Note = {
          id: crypto.randomUUID(),
          position: 0,
          lane: patternRef.current[noteIndex], // Use pattern instead of random
          hit: false,
          accuracy: null,
        }

        setNotes((prev) => [...prev, newNote])
        notesSpawnedRef.current++
        noteIndex++
      },
      800 - Math.min(difficulty, 3) * 50,
    )

    gameLoopRef.current = setInterval(() => {
      setNotes((prev) => {
        const updated = prev.map((note) => {
          if (note.hit) return note

          const newPosition = note.position + NOTE_SPEED

          if (newPosition > HIT_ZONE + GOOD_THRESHOLD && !note.hit) {
            setCombo(0)
            missedHitsRef.current++
            console.log("[v0] Note auto-missed. Total misses:", missedHitsRef.current)
            return { ...note, position: newPosition, hit: true, accuracy: "miss" as const }
          }

          return { ...note, position: newPosition }
        })

        const filtered = updated.filter((note) => note.position < 110)

        if (notesSpawnedRef.current >= TOTAL_NOTES_COUNT && filtered.every((note) => note.hit)) {
          endGame()
        }

        return filtered
      })
    }, 50)
  }

  const endGame = () => {
    setIsPlaying(false)
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    if (noteSpawnRef.current) clearInterval(noteSpawnRef.current)

    const totalHits = perfectHitsRef.current + goodHitsRef.current + missedHitsRef.current
    const successfulHits = perfectHitsRef.current + goodHitsRef.current
    const accuracy = totalHits > 0 ? Math.round((successfulHits / totalHits) * 100) : 0

    console.log(
      "[v0] Game ended - Perfect:",
      perfectHitsRef.current,
      "Good:",
      goodHitsRef.current,
      "Miss:",
      missedHitsRef.current,
    )
    console.log("[v0] Final accuracy:", accuracy, "%")

    setTimeout(() => {
      onComplete(accuracy)
    }, 500)
  }

  const handleLaneTap = (lane: number) => {
    if (!isPlaying) return

    playDrumSound(lane)

    setActiveLanes((prev) => new Set(prev).add(lane))
    setTimeout(() => {
      setActiveLanes((prev) => {
        const next = new Set(prev)
        next.delete(lane)
        return next
      })
    }, 100)

    const laneNotes = notes.filter((note) => note.lane === lane && !note.hit)

    if (laneNotes.length === 0) {
      return
    }

    const closestNote = laneNotes.reduce((closest, note) => {
      const closestDist = Math.abs(closest.position - HIT_ZONE)
      const noteDist = Math.abs(note.position - HIT_ZONE)
      return noteDist < closestDist ? note : closest
    })

    const distance = Math.abs(closestNote.position - HIT_ZONE)

    if (distance > TAP_WINDOW) {
      return
    }

    let accuracy: "perfect" | "good" | "miss"
    let points = 0

    if (distance <= PERFECT_THRESHOLD) {
      accuracy = "perfect"
      points = 100
      setCombo((prev) => prev + 1)
      setHitNotes((prev) => prev + 1)
      perfectHitsRef.current++
      console.log("[v0] PERFECT HIT! Distance:", distance)
    } else if (distance <= GOOD_THRESHOLD) {
      accuracy = "good"
      points = 50
      setCombo((prev) => prev + 1)
      setHitNotes((prev) => prev + 1)
      goodHitsRef.current++
      console.log("[v0] GOOD HIT! Distance:", distance)
    } else {
      accuracy = "miss"
      points = 0
      setCombo(0)
      missedHitsRef.current++
      console.log("[v0] MISS! Distance:", distance)
    }

    setScore((prev) => prev + points)
    setNotes((prev) => prev.map((note) => (note.id === closestNote.id ? { ...note, hit: true, accuracy } : note)))
  }

  return (
    <div className="relative w-full h-[380px] bg-gradient-to-b from-background to-card rounded-2xl overflow-hidden border-2 border-primary/30">
      <div className="absolute top-2 left-0 right-0 z-10 flex justify-between px-4">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Комбо</p>
          <p className="text-lg font-bold text-primary">{combo}x</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Очки</p>
          <p className="text-lg font-bold text-secondary">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Ноты</p>
          <p className="text-lg font-bold text-accent">
            {hitNotes}/{totalNotes}
          </p>
        </div>
      </div>

      <div className="absolute inset-0 flex pt-14 pb-20">
        {[0, 1, 2, 3].map((lane) => (
          <div
            key={lane}
            className="flex-1 relative border-r border-border/20 last:border-r-0"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, rgba(var(--primary-rgb), 0.05) ${HIT_ZONE}%, rgba(var(--primary-rgb), 0.1) ${HIT_ZONE + 5}%, transparent 100%)`,
            }}
          >
            <div className="absolute inset-0 border-r border-border/10" />

            {notes
              .filter((note) => note.lane === lane)
              .map((note) => (
                <div
                  key={note.id}
                  className="absolute left-1/2 -translate-x-1/2 transition-all duration-50"
                  style={{
                    top: `${note.position}%`,
                  }}
                >
                  {note.accuracy ? (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold animate-ping ${
                        note.accuracy === "perfect"
                          ? "bg-green-500/50 text-green-100"
                          : note.accuracy === "good"
                            ? "bg-yellow-500/50 text-yellow-100"
                            : "bg-red-500/50 text-red-100"
                      }`}
                    >
                      {note.accuracy === "perfect" ? "💯" : note.accuracy === "good" ? "👍" : "❌"}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg flex items-center justify-center animate-pulse-glow">
                      <Music className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>

      <div className="absolute left-0 right-0 h-1 bg-primary/50 z-10" style={{ top: `${HIT_ZONE}%` }}>
        <div className="absolute inset-0 bg-primary animate-pulse" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex h-20 z-20">
        {[0, 1, 2, 3].map((lane) => (
          <button
            key={lane}
            onClick={() => handleLaneTap(lane)}
            className={`flex-1 border-r border-border/20 last:border-r-0 transition-all active:scale-95 ${
              activeLanes.has(lane) ? "bg-primary/30" : "bg-card/80 hover:bg-card/90"
            }`}
          >
            <div className="flex flex-col items-center justify-center h-full gap-1">
              <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                  activeLanes.has(lane) ? "border-primary bg-primary/20 scale-90" : "border-primary/30 bg-primary/10"
                }`}
              >
                <Music className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[9px] text-muted-foreground font-medium">{DRUM_LABELS[lane]}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
