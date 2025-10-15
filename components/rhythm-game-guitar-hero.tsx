"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Music, ChevronDown, ChevronLeft } from "lucide-react"
import { ALL_TRACKS, DRUM_SOUNDS, type MusicTrack } from "@/lib/music-config"
import { parseOszFile, convertOsuToGameNotes, type OsuBeatmap } from "@/lib/osz-parser"
import { RhythmEngine, calculateSimpleAccuracy, type RhythmNote } from "@/lib/rhythm-engine"
import type { BeatJudgement, GaugeType } from "@/lib/beatoraja-timing"
import { JudgeDisplay, JudgeCounter } from "./judge-display"
import { GreenNumberContainer } from "./green-number"
import { GrooveGauge } from "./groove-gauge"
import { HispeedController } from "./hispeed-controller"

interface RhythmGameGuitarHeroProps {
  onComplete: (accuracy: number) => void
  difficulty: number
}

const DRUM_LABELS = ["🥁 Kick", "🎵 Snare", "🔔 Hi-Hat", "💥 Tom"]

const LANE_POSITIONS = [12.5, 37.5, 62.5, 87.5] // Percentages matching lane centers

const LANE_COLORS = [
  { bg: "#22FF22", name: "Kick", glow: "34, 255, 34" },
  { bg: "#FF2222", name: "Snare", glow: "255, 34, 34" },
  { bg: "#FFFF22", name: "Hat", glow: "255, 255, 34" },
  { bg: "#2222FF", name: "Tom", glow: "34, 34, 255" },
]

export function RhythmGameGuitarHero({ onComplete, difficulty }: RhythmGameGuitarHeroProps) {
  const [notes, setNotes] = useState<RhythmNote[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [activeLanes, setActiveLanes] = useState<Set<number>>(new Set())

  const rhythmEngineRef = useRef<RhythmEngine | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const notesQueueRef = useRef<Array<{ time: number; lane: number }>>([])
  const nextNoteIndexRef = useRef(0)

  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null)
  const [midiNotes, setMidiNotes] = useState<Array<{ time: number; lane: number }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showTrackSelector, setShowTrackSelector] = useState(true)

  const [oszBeatmaps, setOszBeatmaps] = useState<OsuBeatmap[]>([])
  const [selectedBeatmapIndex, setSelectedBeatmapIndex] = useState<number | null>(null)
  const [oszAudioUrl, setOszAudioUrl] = useState<string | null>(null)
  const [showDifficultySelector, setShowDifficultySelector] = useState(false)

  const drumBuffersRef = useRef<Map<number, AudioBuffer>>(new Map())
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)
  const gameStartAudioTimeRef = useRef<number>(0)

  const audioContextRef = useRef<AudioContext | null>(null)

  const HIGHWAY_LENGTH = 2500
  const HIT_ZONE = 95
  const LEAD_TIME_SECONDS = 3.0 // Increased lead time to 3 seconds for better visibility

  const [currentBeat, setCurrentBeat] = useState(1)
  const [bpm, setBpm] = useState(120)
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [gaugeType] = useState<GaugeType>("normal")
  const [hispeed, setHispeed] = useState(1.0)

  const [lastJudgement, setLastJudgement] = useState<{
    judgement: BeatJudgement
    lane: number
    timestamp: number
  } | null>(null)

  const getTransformZ = useCallback(
    (position: number) => {
      return -HIGHWAY_LENGTH + (position / 100) * HIGHWAY_LENGTH
    },
    [HIGHWAY_LENGTH],
  )

  useEffect(() => {
    if (!selectedTrack) return

    const loadOszPackage = async () => {
      setIsLoading(true)

      try {
        const oszPackage = await parseOszFile(selectedTrack.oszUrl)
        setOszBeatmaps(oszPackage.beatmaps)

        if (oszPackage.audioBlob) {
          const audioUrl = URL.createObjectURL(oszPackage.audioBlob)
          setOszAudioUrl(audioUrl)
        }

        setIsLoading(false)
        setShowTrackSelector(false)
        setShowDifficultySelector(true)
      } catch (error) {
        console.error("[v0] Failed to load OSZ:", error)
        setIsLoading(false)
      }
    }

    loadOszPackage()

    return () => {
      if (oszAudioUrl) URL.revokeObjectURL(oszAudioUrl)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [selectedTrack])

  useEffect(() => {
    if (selectedBeatmapIndex === null || oszBeatmaps.length === 0) return

    const loadBeatmap = async () => {
      setIsLoading(true)

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = ctx

      try {
        const drumSoundMap = {
          kick: 0,
          snare: 1,
          hat: 2,
          tom: 3,
        }

        const drumPromises = Object.entries(DRUM_SOUNDS).map(async ([name, url]) => {
          const response = await fetch(url)
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
          const lane = drumSoundMap[name as keyof typeof drumSoundMap]
          drumBuffersRef.current.set(lane, audioBuffer)
        })

        await Promise.all(drumPromises)

        const beatmap = oszBeatmaps[selectedBeatmapIndex]
        const gameNotes = convertOsuToGameNotes(beatmap)

        setBpm(beatmap.bpm)
        setMidiNotes(gameNotes)

        rhythmEngineRef.current = new RhythmEngine(gameNotes.length, gaugeType, ctx)
        rhythmEngineRef.current.setHispeed(hispeed)

        console.log("[v0] Custom lead time set to:", LEAD_TIME_SECONDS, "seconds")

        setIsLoading(false)
        setShowDifficultySelector(false)
      } catch (error) {
        console.error("[v0] Failed to load beatmap:", error)
        setIsLoading(false)
      }
    }

    loadBeatmap()

    return () => {
      audioContextRef.current?.close()
      backgroundMusicRef.current?.pause()
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current)
    }
  }, [selectedBeatmapIndex, oszBeatmaps, gaugeType, hispeed])

  const handleHispeedChange = (newHispeed: number) => {
    setHispeed(newHispeed)
    if (rhythmEngineRef.current) {
      rhythmEngineRef.current.setHispeed(newHispeed)
    }
  }

  const playDrumSound = useCallback((lane: number) => {
    if (!audioContextRef.current) return

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume()
    }

    const buffer = drumBuffersRef.current.get(lane)
    if (!buffer) return

    const source = audioContextRef.current.createBufferSource()
    const gainNode = audioContextRef.current.createGain()

    source.buffer = buffer
    source.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)
    gainNode.gain.value = 0.7

    source.start(0)
  }, [])

  const gameLoop = useCallback(() => {
    if (!isPlaying || !audioContextRef.current || !rhythmEngineRef.current) return

    const currentAudioTime = audioContextRef.current.currentTime
    const gameTime = currentAudioTime - gameStartAudioTimeRef.current

    while (
      nextNoteIndexRef.current < notesQueueRef.current.length &&
      notesQueueRef.current[nextNoteIndexRef.current].time - gameTime <= LEAD_TIME_SECONDS
    ) {
      const noteData = notesQueueRef.current[nextNoteIndexRef.current]

      console.log(
        "[v0] Spawning note:",
        nextNoteIndexRef.current,
        "noteTime:",
        noteData.time.toFixed(3),
        "gameTime:",
        gameTime.toFixed(3),
        "diff:",
        (noteData.time - gameTime).toFixed(3),
        "lane:",
        noteData.lane,
      )

      const newNote: RhythmNote = {
        id: `${noteData.time}-${noteData.lane}-${nextNoteIndexRef.current}`,
        time: noteData.time, // Store relative time, not absolute
        lane: noteData.lane,
        position: 0,
        hit: false,
        judgement: null,
        timingError: null,
      }

      setNotes((prev) => [...prev, newNote])
      nextNoteIndexRef.current++
    }

    setNotes((prev) => {
      const updated = prev.map((note) => {
        if (note.hit) return note

        const timeUntilHit = note.time - gameTime
        const progress = 1 - timeUntilHit / LEAD_TIME_SECONDS
        const newPosition = progress * HIT_ZONE

        if (newPosition > HIT_ZONE + 30 && !note.hit) {
          console.log("[v0] Note missed - position:", newPosition.toFixed(2))
          rhythmEngineRef.current?.handleMissedNote(note)
          return { ...note, position: newPosition, hit: true, judgement: "poor" as BeatJudgement }
        }

        return { ...note, position: newPosition }
      })

      rhythmEngineRef.current?.updateGreenNumbers()

      const filtered = updated.filter((note) => note.position < 110)

      if (nextNoteIndexRef.current >= notesQueueRef.current.length && filtered.every((note) => note.hit)) {
        endGame()
        return filtered
      }

      return filtered
    })

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [isPlaying, HIT_ZONE, LEAD_TIME_SECONDS])

  useEffect(() => {
    if (!gameStarted && !isLoading && midiNotes.length > 0 && rhythmEngineRef.current) {
      startGame()
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current)
      }
    }
  }, [isLoading, midiNotes])

  const startGame = () => {
    if (!audioContextRef.current || !rhythmEngineRef.current) return

    setGameStarted(true)
    setIsPlaying(true)

    rhythmEngineRef.current.startGame(bpm, audioContextRef.current)

    notesQueueRef.current = [...midiNotes]
    nextNoteIndexRef.current = 0

    console.log("[v0] Starting game with", midiNotes.length, "notes")
    console.log("[v0] First 5 notes:", midiNotes.slice(0, 5))
    console.log("[v0] Lead time:", LEAD_TIME_SECONDS, "seconds") // Log correct lead time

    if (oszAudioUrl) {
      backgroundMusicRef.current = new Audio(oszAudioUrl)
      backgroundMusicRef.current.volume = 0.5

      backgroundMusicRef.current
        .play()
        .then(() => {
          console.log("[v0] Background music started")
          if (audioContextRef.current) {
            gameStartAudioTimeRef.current = audioContextRef.current.currentTime
            console.log("[v0] Game start audio time:", gameStartAudioTimeRef.current)
          }
        })
        .catch((error) => {
          console.error("[v0] Background music play() failed:", error)
          if (audioContextRef.current) {
            gameStartAudioTimeRef.current = audioContextRef.current.currentTime
          }
        })
    } else {
      if (audioContextRef.current) {
        gameStartAudioTimeRef.current = audioContextRef.current.currentTime
      }
    }

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume()
    }

    const beatInterval = (60 / bpm) * 1000
    setCurrentBeat(1)
    metronomeIntervalRef.current = setInterval(() => {
      setCurrentBeat((prev) => (prev % 4) + 1)
    }, beatInterval)

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }

  const endGame = () => {
    if (!rhythmEngineRef.current) return

    console.log("[v0] Ending game")
    setIsPlaying(false)

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current)
    }

    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause()
      backgroundMusicRef.current.currentTime = 0
    }

    const results = rhythmEngineRef.current.endGame()
    const engineState = rhythmEngineRef.current.getState()

    const accuracy = calculateSimpleAccuracy(engineState.score, engineState.totalNotes)

    console.log("[v0] Game ended - Results:", results)
    console.log("[v0] Final accuracy:", accuracy, "%")

    setTimeout(() => {
      onComplete(accuracy)
    }, 500)
  }

  const handleLaneTap = useCallback(
    (lane: number) => {
      if (!isPlaying || !rhythmEngineRef.current) return

      playDrumSound(lane)

      setActiveLanes((prev) => new Set(prev).add(lane))
      setTimeout(() => {
        setActiveLanes((prev) => {
          const next = new Set(prev)
          next.delete(lane)
          return next
        })
      }, 100)

      const judgeResult = rhythmEngineRef.current.handleLaneHit(lane, notes)

      if (judgeResult) {
        setLastJudgement({
          judgement: judgeResult.judgement,
          lane,
          timestamp: Date.now(),
        })
      }
    },
    [isPlaying, notes, playDrumSound],
  )

  const engineState = rhythmEngineRef.current?.getState()

  if (showTrackSelector && !selectedTrack) {
    return (
      <div className="relative w-full h-[600px] bg-gradient-to-b from-background to-card rounded-2xl overflow-hidden border-2 border-primary/30 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Music className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Выбери трек</h3>
            <p className="text-sm text-muted-foreground">Выбери музыку для создания бита</p>
          </div>

          <div className="space-y-2">
            {ALL_TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => setSelectedTrack(track)}
                className="w-full p-4 bg-card hover:bg-card/80 border border-border rounded-xl transition-all active:scale-95 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {track.artist} - {track.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{track.genre}</p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (showDifficultySelector && oszBeatmaps.length > 0) {
    return (
      <div className="relative w-full h-[600px] bg-gradient-to-b from-background to-card rounded-2xl overflow-hidden border-2 border-primary/30 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <button
            onClick={() => {
              setSelectedTrack(null)
              setShowDifficultySelector(false)
              setShowTrackSelector(true)
            }}
            className="absolute top-4 left-4 p-2 hover:bg-card/80 rounded-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <Music className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Выбери сложность</h3>
            <p className="text-sm text-muted-foreground">
              {selectedTrack?.artist} - {selectedTrack?.name}
            </p>
          </div>

          <div className="mb-4">
            <HispeedController hispeed={hispeed} onHispeedChange={handleHispeedChange} />
          </div>

          <div className="max-h-[180px] overflow-y-auto space-y-2 pr-2">
            {oszBeatmaps.map((beatmap, index) => (
              <button
                key={index}
                onClick={() => setSelectedBeatmapIndex(index)}
                className="w-full p-4 bg-card hover:bg-card/80 border border-border rounded-xl transition-all active:scale-95 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{beatmap.version}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {beatmap.mode === 1 ? "Taiko" : "Standard"} • {beatmap.hitObjects.length} нот • {beatmap.bpm} BPM
                    </p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="relative w-full h-[600px] bg-gradient-to-b from-background to-card rounded-2xl overflow-hidden border-2 border-primary/30 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="gh-game-container">
      <style jsx>{`
        .gh-game-container {
          position: relative;
          width: 100%;
          height: 600px;
          background: linear-gradient(to bottom, #0a0a0f 0%, #1a1a2e 100%);
          overflow: hidden;
          border-radius: 1rem;
          border: 2px solid rgba(255, 215, 0, 0.3);
        }
        
        .gh-hud {
          position: absolute;
          top: 0.5rem;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          justify-content: space-around;
          padding: 0 1rem;
        }
        
        .gh-stat {
          text-align: center;
        }
        
        .gh-stat-label {
          font-size: 0.625rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.125rem;
        }
        
        .gh-stat-value {
          font-size: 1.125rem;
          font-weight: bold;
          color: #FFD700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        
        .gh-perspective-container {
          position: absolute;
          inset: 0;
          perspective: 1200px;
          perspective-origin: 50% 90%;
          overflow: hidden;
        }

        .gh-highway {
          position: absolute;
          width: min(400px, 90vw);
          height: 200%;
          left: 50%;
          bottom: 0;
          transform-origin: center bottom;
          transform:
            translateX(-50%)
            translateZ(-500px)
            rotateX(68deg);
          transform-style: preserve-3d;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .gh-highway {
            width: 85vw;
            transform:
              translateX(-50%)
              translateZ(-400px)
              rotateX(70deg);
          }

          .gh-perspective-container {
            perspective: 1000px;
            perspective-origin: 50% 92%;
          }
        }
        
        .gh-fog {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(
            to bottom,
            rgba(10, 10, 15, 1) 0%,
            rgba(10, 10, 15, 0.9) 20%,
            rgba(10, 10, 15, 0.6) 40%,
            rgba(10, 10, 15, 0) 100%
          );
          pointer-events: none;
          z-index: 50;
          transform: translateZ(100px);
        }
        
        .gh-lane {
          position: absolute;
          width: 25%;
          height: 100%;
          border-right: 2px solid rgba(255, 255, 255, 0.15);
          transform-style: preserve-3d;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.02) 0%,
            rgba(255, 255, 255, 0.05) 100%
          );
        }
        
        .gh-lane:last-child {
          border-right: none;
        }
        
        .gh-note {
          position: absolute;
          width: 85%;
          height: 50px;
          left: 7.5%;
          border-radius: 10px;
          transform-style: preserve-3d;
          transition: opacity 0.1s;
        }
        
        .gh-note-body {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }
        
        .gh-note-glow {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          background: inherit;
          filter: blur(8px);
          opacity: 0.6;
        }
        
        .gh-note-streak {
          position: absolute;
          width: 100%;
          height: 400%;
          top: 100%;
          left: 0;
          background: linear-gradient(
            to bottom,
            var(--note-color) 0%,
            transparent 100%
          );
          opacity: 0.3;
          filter: blur(4px);
        }
        
        .gh-note-hit {
          animation: hit-feedback 0.3s ease-out;
        }
        
        @keyframes hit-feedback {
          0% {
            transform: scale(1) translateZ(var(--z-pos));
            opacity: 1;
          }
          100% {
            transform: scale(2) translateZ(var(--z-pos));
            opacity: 0;
          }
        }
        
        .gh-fret-bar {
          position: absolute;
          bottom: 15%;
          left: 50%;
          width: 400px;
          height: 6px;
          transform: translateX(-50%);
          z-index: 60;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 215, 0, 0.8) 20%,
            #FFD700 50%,
            rgba(255, 215, 0, 0.8) 80%,
            transparent 100%
          );
          box-shadow: 
            0 0 20px rgba(255, 215, 0, 0.8),
            0 0 40px rgba(255, 215, 0, 0.4);
          animation: fret-pulse 0.8s ease-in-out infinite;
        }
        
        @keyframes fret-pulse {
          0%, 100% {
            opacity: 0.8;
            transform: translateX(-50%) scaleY(1);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) scaleY(1.2);
          }
        }
        
        .gh-fret-buttons {
          position: absolute;
          bottom: 8%;
          left: 50%;
          width: min(400px, 90vw);
          height: 80px;
          transform: translateX(-50%);
          z-index: 70;
          touch-action: none;
          -webkit-tap-highlight-color: transparent;
        }

        .gh-fret-button {
          position: absolute;
          width: 90px;
          height: 80px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.5);
          cursor: pointer;
          transition: all 0.1s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }

        /* Mobile touch buttons - larger hit areas */
        @media (max-width: 768px) {
          .gh-fret-buttons {
            bottom: 5%;
            height: 100px;
          }

          .gh-fret-button {
            width: 22vw;
            height: 90px;
            max-width: 100px;
          }

          .gh-fret-circle {
            width: 50px;
            height: 50px;
            border-width: 4px;
          }

          .gh-fret-label {
            font-size: 0.75rem;
          }
        }
        
        .gh-fret-button:active,
        .gh-fret-button.active {
          transform: translateX(-50%) scale(0.95);
          box-shadow: 
            inset 0 0 20px var(--button-color),
            0 0 30px var(--button-color);
          background: var(--button-color);
          border-color: white;
        }
        
        .gh-fret-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid currentColor;
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.1s;
        }
        
        .gh-fret-button.active .gh-fret-circle {
          background: white;
          transform: scale(0.9);
        }
        
        .gh-fret-label {
          font-size: 0.65rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
        }
        
        .gh-stage-lights {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 200px;
          pointer-events: none;
          z-index: 5;
          background: radial-gradient(
            ellipse at 50% 0%,
            rgba(255, 215, 0, 0.1) 0%,
            transparent 70%
          );
        }
      `}</style>

      <JudgeDisplay judgement={lastJudgement?.judgement || null} onComplete={() => setLastJudgement(null)} />

      {/* HUD */}
      <div className="gh-hud">
        <div className="gh-stat">
          <div className="gh-stat-label">Combo</div>
          <div className="gh-stat-value">{engineState?.score.currentCombo || 0}x</div>
        </div>
        <div className="gh-stat">
          <div
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-100 ${
              currentBeat === 1
                ? "bg-primary/30 border-primary scale-110 shadow-lg shadow-primary/50"
                : "bg-primary/10 border-primary/50 scale-100"
            }`}
            style={{ margin: "0 auto" }}
          >
            <span className="text-sm font-bold text-primary">{currentBeat}</span>
          </div>
          <div className="gh-stat-label mt-1">{bpm} BPM</div>
        </div>
        <div className="gh-stat">
          <div className="gh-stat-label">EX Score</div>
          <div className="gh-stat-value">
            {engineState?.exScore || 0}/{engineState?.maxExScore || 0}
          </div>
        </div>
        <div className="gh-stat">
          <div className="gh-stat-label">Rank</div>
          <div className="gh-stat-value">{engineState?.djLevel || "F"}</div>
        </div>
      </div>

      <div className="absolute top-2 right-2 z-10">
        {engineState && (
          <JudgeCounter
            pgreat={engineState.score.pgreat}
            great={engineState.score.great}
            good={engineState.score.good}
            bad={engineState.score.bad}
            poor={engineState.score.poor}
          />
        )}
      </div>

      <div className="absolute top-16 left-4 right-4 z-10">
        {engineState && (
          <GrooveGauge
            value={engineState.gaugeValue}
            type={engineState.gauge.getType()}
            isFailed={engineState.isFailed}
          />
        )}
      </div>

      {engineState && <GreenNumberContainer greenNumbers={engineState.greenNumbers} />}

      {/* Stage lights */}
      <div className="gh-stage-lights" />

      {/* 3D Highway */}
      <div className="gh-perspective-container">
        <div className="gh-highway">
          {/* Fog */}
          <div className="gh-fog" />

          {/* Lanes */}
          {LANE_COLORS.map((color, laneIndex) => (
            <div key={laneIndex} className="gh-lane" style={{ left: `${laneIndex * 25}%` }}>
              {/* Notes in this lane */}
              {notes
                .filter((note) => note.lane === laneIndex)
                .map((note) => {
                  const zPos = getTransformZ(note.position)

                  return (
                    <div
                      key={note.id}
                      className={`gh-note ${note.hit ? "gh-note-hit" : ""}`}
                      style={{
                        transform: `translateZ(${zPos}px)`,
                        bottom: `${95 - note.position}%`,
                        ["--z-pos" as any]: `${zPos}px`,
                        ["--note-color" as any]: color.bg,
                      }}
                    >
                      <div className="gh-note-glow" style={{ background: color.bg }} />
                      <div
                        className="gh-note-body"
                        style={{
                          background: color.bg,
                          boxShadow: `0 0 20px rgba(${color.glow}, 0.8)`,
                        }}
                      >
                        <Music className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black" />
                      </div>
                      <div className="gh-note-streak" style={{ ["--note-color" as any]: color.bg }} />
                    </div>
                  )
                })}
            </div>
          ))}
        </div>
      </div>

      {/* Fret bar */}
      <div className="gh-fret-bar" />

      {/* Fret buttons */}
      <div className="gh-fret-buttons">
        {LANE_COLORS.map((color, laneIndex) => (
          <button
            key={laneIndex}
            className={`gh-fret-button ${activeLanes.has(laneIndex) ? "active" : ""}`}
            onClick={() => handleLaneTap(laneIndex)}
            onTouchStart={(e) => {
              e.preventDefault()
              handleLaneTap(laneIndex)
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
            }}
            style={{
              left: `${LANE_POSITIONS[laneIndex]}%`,
              transform: "translateX(-50%)",
              color: color.bg,
              ["--button-color" as any]: color.bg,
            }}
          >
            <div className="gh-fret-circle" />
            <div className="gh-fret-label">{color.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
