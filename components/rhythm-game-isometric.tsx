"use client"

/**
 * Isometric Rhythm Game Component - Optimized for Mobile
 * Based on Rhythm Plus engine architecture
 * Features:
 * - Full 3D isometric perspective with CSS transforms
 * - Precise timing system with delta time
 * - Mobile-first touch controls
 * - High performance canvas rendering
 * - Hold notes support
 * - Combo and scoring system
 */

import { useState, useEffect, useRef, useCallback } from "react"
import { Music } from "lucide-react"

interface RhythmNote {
  id: string
  time: number // Exact hit time in seconds
  lane: number // 0-3 for 4 lanes
  y: number // Visual position (0-1, where 1 is hit line)
  hit: boolean
  judgement: Judgement | null
  timingError: number | null // in milliseconds
  isHoldNote: boolean
  holdEndTime?: number
  isHolding?: boolean
}

type Judgement = "perfect" | "great" | "good" | "bad" | "miss"

interface GameScore {
  perfect: number
  great: number
  good: number
  bad: number
  miss: number
  combo: number
  maxCombo: number
  score: number
  totalNotes: number
}

interface Props {
  onComplete: (accuracy: number) => void
  difficulty: number
  beatPattern?: Array<{ time: number; lane: number }>
}

const LANE_COLORS = [
  { primary: "#22FF22", glow: "rgba(34, 255, 34, 0.6)", name: "Kick" },
  { primary: "#FF2222", glow: "rgba(255, 34, 34, 0.6)", name: "Snare" },
  { primary: "#FFFF22", glow: "rgba(255, 255, 34, 0.6)", name: "Hat" },
  { primary: "#2222FF", glow: "rgba(34, 34, 255, 0.6)", name: "Tom" },
]

const TIMING_WINDOWS = {
  perfect: 30, // ±30ms
  great: 60, // ±60ms
  good: 100, // ±100ms
  bad: 150, // ±150ms
}

const SCORE_VALUES = {
  perfect: 100,
  great: 70,
  good: 40,
  bad: 10,
  miss: 0,
}

export function RhythmGameIsometric({ onComplete, difficulty, beatPattern }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const gameTimeRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)

  const [notes, setNotes] = useState<RhythmNote[]>([])
  const [score, setScore] = useState<GameScore>({
    perfect: 0,
    great: 0,
    good: 0,
    bad: 0,
    miss: 0,
    combo: 0,
    maxCombo: 0,
    score: 0,
    totalNotes: 0,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeLanes, setActiveLanes] = useState<Set<number>>(new Set())
  const [lastJudgement, setLastJudgement] = useState<Judgement | null>(null)

  // Game constants
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600
  const NOTE_SPEED = 1 + difficulty * 0.1 // pixels per ms
  const HIT_LINE_Y = 0.85 // 85% down the screen
  const LEAD_TIME = 2000 // 2 seconds ahead visibility

  // Generate default beat pattern if not provided
  const defaultPattern = useCallback((): Array<{ time: number; lane: number }> => {
    const pattern: Array<{ time: number; lane: number }> = []
    const duration = 30 // 30 seconds
    const bpm = 120
    const beatInterval = 60 / bpm

    for (let time = 0; time < duration; time += beatInterval) {
      // Generate random lane
      const lane = Math.floor(Math.random() * 4)
      pattern.push({ time, lane })
    }

    return pattern
  }, [])

  const notePattern = beatPattern || defaultPattern()

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size for mobile
    const container = canvas.parentElement
    if (container) {
      canvas.width = Math.min(container.clientWidth, CANVAS_WIDTH)
      canvas.height = Math.min(window.innerHeight * 0.7, CANVAS_HEIGHT)
    }
  }, [])

  // Spawn notes based on game time
  useEffect(() => {
    if (!isPlaying) return

    const spawnedNotes = notePattern
      .filter((note) => {
        const spawnTime = (note.time * 1000 - LEAD_TIME) / 1000
        const despawnTime = note.time + 0.5
        return gameTimeRef.current >= spawnTime && gameTimeRef.current <= despawnTime
      })
      .map((note) => ({
        id: `${note.time}-${note.lane}`,
        time: note.time,
        lane: note.lane,
        y: 0,
        hit: false,
        judgement: null,
        timingError: null,
        isHoldNote: false,
      }))

    setNotes(spawnedNotes)
  }, [isPlaying, notePattern, gameTimeRef.current])

  // Judge note hit
  const judgeNote = useCallback(
    (note: RhythmNote, currentTime: number): Judgement => {
      const timingError = Math.abs((currentTime - note.time) * 1000)

      if (timingError <= TIMING_WINDOWS.perfect) return "perfect"
      if (timingError <= TIMING_WINDOWS.great) return "great"
      if (timingError <= TIMING_WINDOWS.good) return "good"
      if (timingError <= TIMING_WINDOWS.bad) return "bad"
      return "miss"
    },
    []
  )

  // Handle lane tap
  const handleLaneTap = useCallback(
    (laneIndex: number) => {
      if (!isPlaying) return

      setActiveLanes((prev) => new Set(prev).add(laneIndex))
      setTimeout(() => {
        setActiveLanes((prev) => {
          const next = new Set(prev)
          next.delete(laneIndex)
          return next
        })
      }, 100)

      // Find closest unhit note in this lane
      const laneNotes = notes
        .filter((note) => note.lane === laneIndex && !note.hit)
        .sort((a, b) => Math.abs(gameTimeRef.current - a.time) - Math.abs(gameTimeRef.current - b.time))

      if (laneNotes.length === 0) return

      const closestNote = laneNotes[0]
      const judgement = judgeNote(closestNote, gameTimeRef.current)

      // Update note
      closestNote.hit = true
      closestNote.judgement = judgement
      closestNote.timingError = (gameTimeRef.current - closestNote.time) * 1000

      // Update score
      setScore((prev) => {
        const newCombo = judgement === "miss" || judgement === "bad" ? 0 : prev.combo + 1
        return {
          ...prev,
          [judgement]: prev[judgement] + 1,
          combo: newCombo,
          maxCombo: Math.max(prev.maxCombo, newCombo),
          score: prev.score + SCORE_VALUES[judgement] * (1 + newCombo * 0.01),
          totalNotes: prev.totalNotes + 1,
        }
      })

      setLastJudgement(judgement)
      setTimeout(() => setLastJudgement(null), 500)
    },
    [notes, isPlaying, judgeNote]
  )

  // Game loop
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!isPlaying) return

      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx) return

      // Calculate delta time
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp
      }
      const deltaTime = timestamp - lastFrameTimeRef.current
      lastFrameTimeRef.current = timestamp

      // Update game time
      gameTimeRef.current = (timestamp - startTimeRef.current) / 1000

      // Clear canvas
      ctx.fillStyle = "#0a0a0f"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw isometric highway with perspective
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height * 0.15)

      // Apply isometric transform
      const isoScale = 0.8
      const isoAngle = Math.PI / 6 // 30 degrees

      // Draw lanes with perspective
      const laneWidth = 80
      const totalWidth = laneWidth * 4

      for (let i = 0; i < 4; i++) {
        const x = (i - 1.5) * laneWidth

        // Draw lane background with gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7)
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.02)")
        gradient.addColorStop(1, "rgba(255, 255, 255, 0.1)")

        ctx.fillStyle = gradient
        ctx.fillRect(x, 0, laneWidth - 2, canvas.height * 0.7)

        // Draw lane separator
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x + laneWidth, 0)
        ctx.lineTo(x + laneWidth, canvas.height * 0.7)
        ctx.stroke()
      }

      // Draw notes
      notes.forEach((note) => {
        if (note.hit && note.judgement !== "miss") return

        const x = (note.lane - 1.5) * laneWidth + laneWidth / 2
        const progress = (gameTimeRef.current - (note.time - LEAD_TIME / 1000)) / (LEAD_TIME / 1000)
        const y = progress * canvas.height * 0.7

        if (y < 0 || y > canvas.height * 0.7) return

        // Apply perspective scaling
        const scale = 0.5 + (y / (canvas.height * 0.7)) * 0.5

        // Draw note with glow
        ctx.save()
        ctx.translate(x, y)
        ctx.scale(scale, scale)

        // Glow effect
        ctx.shadowBlur = 20 * scale
        ctx.shadowColor = LANE_COLORS[note.lane].glow
        ctx.fillStyle = LANE_COLORS[note.lane].primary
        ctx.beginPath()
        ctx.roundRect(-25, -8, 50, 16, 8)
        ctx.fill()

        // Inner shine
        ctx.shadowBlur = 0
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
        ctx.beginPath()
        ctx.roundRect(-20, -6, 40, 6, 4)
        ctx.fill()

        ctx.restore()
      })

      // Draw hit line
      const hitLineY = canvas.height * 0.7 * HIT_LINE_Y
      ctx.strokeStyle = "#FFD700"
      ctx.lineWidth = 4
      ctx.shadowBlur = 20
      ctx.shadowColor = "rgba(255, 215, 0, 0.8)"
      ctx.beginPath()
      ctx.moveTo(-totalWidth / 2, hitLineY)
      ctx.lineTo(totalWidth / 2, hitLineY)
      ctx.stroke()

      ctx.restore()

      // Check for missed notes
      notes.forEach((note) => {
        if (!note.hit && gameTimeRef.current - note.time > 0.2) {
          note.hit = true
          note.judgement = "miss"
          setScore((prev) => ({
            ...prev,
            miss: prev.miss + 1,
            combo: 0,
            totalNotes: prev.totalNotes + 1,
          }))
        }
      })

      // Check if game is complete
      if (score.totalNotes >= notePattern.length) {
        const accuracy = ((score.perfect * 100 + score.great * 70 + score.good * 40) / (notePattern.length * 100)) * 100
        onComplete(accuracy)
        setIsPlaying(false)
        return
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    },
    [isPlaying, notes, score, notePattern, onComplete, judgeNote]
  )

  // Start game loop
  useEffect(() => {
    if (isPlaying) {
      lastFrameTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, gameLoop])

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()

    for (let touch of Array.from(e.touches)) {
      const x = touch.clientX - rect.left
      const laneWidth = rect.width / 4
      const laneIndex = Math.floor(x / laneWidth)

      if (laneIndex >= 0 && laneIndex < 4) {
        handleLaneTap(laneIndex)
      }
    }
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-background to-card rounded-2xl overflow-hidden border-2 border-primary/30">
      {/* HUD */}
      <div className="absolute top-4 left-0 right-0 z-10 flex justify-around px-4">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Combo</div>
          <div className="text-2xl font-bold text-primary">{score.combo}x</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Score</div>
          <div className="text-2xl font-bold text-secondary">{Math.floor(score.score)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Notes</div>
          <div className="text-2xl font-bold text-accent">
            {score.totalNotes}/{notePattern.length}
          </div>
        </div>
      </div>

      {/* Judgement display */}
      {lastJudgement && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-ping">
          <div
            className={`text-4xl font-bold ${
              lastJudgement === "perfect"
                ? "text-yellow-400"
                : lastJudgement === "great"
                  ? "text-green-400"
                  : lastJudgement === "good"
                    ? "text-blue-400"
                    : "text-red-400"
            }`}
          >
            {lastJudgement.toUpperCase()}
          </div>
        </div>
      )}

      {/* Game canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        onTouchStart={handleTouchStart}
        onClick={(e) => {
          const canvas = canvasRef.current
          if (!canvas) return
          const rect = canvas.getBoundingClientRect()
          const x = e.clientX - rect.left
          const laneWidth = rect.width / 4
          const laneIndex = Math.floor(x / laneWidth)
          if (laneIndex >= 0 && laneIndex < 4) {
            handleLaneTap(laneIndex)
          }
        }}
      />

      {/* Control buttons - positioned at bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-10">
        {LANE_COLORS.map((color, index) => (
          <button
            key={index}
            onClick={() => handleLaneTap(index)}
            onTouchStart={(e) => {
              e.preventDefault()
              handleLaneTap(index)
            }}
            className={`w-16 h-16 rounded-xl border-2 transition-all active:scale-95 ${
              activeLanes.has(index) ? "scale-95 brightness-150" : ""
            }`}
            style={{
              backgroundColor: activeLanes.has(index) ? color.primary : "rgba(0,0,0,0.5)",
              borderColor: color.primary,
              boxShadow: activeLanes.has(index) ? `0 0 20px ${color.glow}` : "none",
            }}
          >
            <div className="text-xs font-semibold text-white">{color.name}</div>
          </button>
        ))}
      </div>

      {/* Start button */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
          <button
            onClick={() => {
              setIsPlaying(true)
              startTimeRef.current = 0
            }}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold hover:bg-primary/90 transition-all active:scale-95"
          >
            <Music className="inline-block mr-2" />
            Start Game
          </button>
        </div>
      )}
    </div>
  )
}
