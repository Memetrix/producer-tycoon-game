"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { GameInstance, type GameResult } from "@/lib/rhythm-plus/GameInstance"
import type { NoteData } from "@/lib/rhythm-plus/Note"
import { parseOszFile, type OsuBeatmap } from "@/lib/osz-parser"
import { convertOsuToRhythmPlus } from "@/lib/rhythm-plus-converter"
import { Button } from "@/components/ui/button"
import { PlayCircle, PauseCircle, SkipForward } from "lucide-react"

interface RhythmGameRhythmPlusProps {
  difficulty: number
  beatmapUrl: string // URL to .osz beatmap file
  onComplete?: (accuracy: number) => void
}

export function RhythmGameRhythmPlus({ difficulty, beatmapUrl, onComplete }: RhythmGameRhythmPlusProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameInstanceRef = useRef<GameInstance | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const backgroundMusicRef = useRef<AudioBufferSourceNode | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [beatmapLoaded, setBeatmapLoaded] = useState(false)
  const [currentJudgement, setCurrentJudgement] = useState<string>("")
  const [combo, setCombo] = useState(0)
  const [score, setScore] = useState(0)
  const [accuracy, setAccuracy] = useState(100)

  const [oszBeatmaps, setOszBeatmaps] = useState<OsuBeatmap[]>([])
  const [selectedBeatmapIndex, setSelectedBeatmapIndex] = useState<number>(0)
  const [oszAudioBlob, setOszAudioBlob] = useState<Blob | null>(null)

  /**
   * Initialize audio context
   */
  const initAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume()
    }
  }, [])

  /**
   * Load and parse beatmap from music-config
   * Uses the same beatmap loading system as existing rhythm game
   */
  const loadBeatmap = useCallback(async (beatmapUrl: string) => {
    try {
      setIsLoading(true)

      // Parse OSU beatmap package (.osz file)
      const oszPackage = await parseOszFile(beatmapUrl)

      setOszBeatmaps(oszPackage.beatmaps)
      setOszAudioBlob(oszPackage.audioBlob)

      // Select difficulty based on prop (0 = easiest)
      const selectedIndex = Math.min(difficulty, oszPackage.beatmaps.length - 1)
      setSelectedBeatmapIndex(selectedIndex)

      const beatmap = oszPackage.beatmaps[selectedIndex]

      // Convert OSU notes to Rhythm Plus NoteData format
      const notes = convertOsuToRhythmPlus(beatmap)

      console.log("[Rhythm Plus] Loaded beatmap:", beatmap.title, beatmap.version)
      console.log("[Rhythm Plus] Total notes:", notes.length)

      // Load notes into game instance
      if (gameInstanceRef.current) {
        gameInstanceRef.current.loadSong(notes)
        setBeatmapLoaded(true)
      }

      // Load background music
      if (oszPackage.audioBlob && audioContextRef.current) {
        const audioUrl = URL.createObjectURL(oszPackage.audioBlob)
        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)

        const source = audioContextRef.current.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioContextRef.current.destination)
        backgroundMusicRef.current = source

        URL.revokeObjectURL(audioUrl)
      }

      setIsLoading(false)
    } catch (error) {
      console.error("[Rhythm Plus] Failed to load beatmap:", error)
      setIsLoading(false)
    }
  }, [difficulty])

  /**
   * Initialize game instance
   */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    const updateCanvasSize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
        gameInstanceRef.current?.reposition()
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    // Create game instance
    const game = new GameInstance(canvas)

    // Set up callbacks
    game.setOnJudgeDisplay((judgement, currentCombo) => {
      setCurrentJudgement(judgement.toUpperCase())
      setCombo(currentCombo)

      // Clear judgement display after 500ms
      setTimeout(() => setCurrentJudgement(""), 500)
    })

    game.setOnPlayEffect((sound) => {
      // Play drum hit sounds
      playDrumSound(sound)
    })

    gameInstanceRef.current = game

    // Load beatmap
    initAudio().then(() => loadBeatmap(beatmapUrl))

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      game.destroy()
      backgroundMusicRef.current?.stop()
      audioContextRef.current?.close()
    }
  }, [beatmapUrl, loadBeatmap, initAudio])

  /**
   * Update UI with game state
   */
  useEffect(() => {
    const updateUI = () => {
      if (!gameInstanceRef.current) return

      const result = gameInstanceRef.current.result
      setScore(Math.round(result.score))

      if (result.totalHitNotes > 0) {
        const acc = (result.totalPercentage / result.totalHitNotes)
        setAccuracy(Math.round(acc * 100) / 100)
      }

      requestAnimationFrame(updateUI)
    }

    const animId = requestAnimationFrame(updateUI)
    return () => cancelAnimationFrame(animId)
  }, [])

  /**
   * Play drum hit sound effect
   */
  const playDrumSound = useCallback((sound: string) => {
    if (!audioContextRef.current) return

    // Create simple beep sound for now
    // TODO: Load actual drum samples
    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    oscillator.frequency.value = 800
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1)

    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + 0.1)
  }, [])

  /**
   * Start game
   */
  const handleStart = useCallback(async () => {
    if (!gameInstanceRef.current || !beatmapLoaded) return

    await initAudio()

    gameInstanceRef.current.startGame()
    backgroundMusicRef.current?.start()
    setIsPlaying(true)
  }, [beatmapLoaded, initAudio])

  /**
   * Pause game
   */
  const handlePause = useCallback(() => {
    if (!gameInstanceRef.current) return

    gameInstanceRef.current.pauseGame()
    audioContextRef.current?.suspend()
    setIsPlaying(false)
  }, [])

  /**
   * Resume game
   */
  const handleResume = useCallback(() => {
    if (!gameInstanceRef.current) return

    gameInstanceRef.current.resumeGame()
    audioContextRef.current?.resume()
    setIsPlaying(true)
  }, [])

  /**
   * Skip/Complete game
   */
  const handleSkip = useCallback(() => {
    if (!gameInstanceRef.current) return

    const result = gameInstanceRef.current.result
    const finalAccuracy = result.totalHitNotes > 0
      ? (result.totalPercentage / result.totalHitNotes)
      : 0

    backgroundMusicRef.current?.stop()
    gameInstanceRef.current.pauseGame()

    onComplete?.(finalAccuracy)
  }, [onComplete])

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      {/* Canvas for Rhythm Plus rendering */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
        style={{
          touchAction: "none",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      />

      {/* Judgement Display */}
      {currentJudgement && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div
            className={`text-6xl font-bold animate-bounce ${
              currentJudgement === "PERFECT"
                ? "text-yellow-400"
                : currentJudgement === "GOOD"
                  ? "text-green-400"
                  : currentJudgement === "OFFBEAT"
                    ? "text-orange-400"
                    : "text-red-400"
            }`}
            style={{
              textShadow: "0 0 20px currentColor",
              filter: "drop-shadow(0 0 10px currentColor)",
            }}
          >
            {currentJudgement}
          </div>
        </div>
      )}

      {/* Score & Stats HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 space-y-2">
          <div className="text-2xl font-bold text-white">
            Score: <span className="text-yellow-400">{score.toLocaleString()}</span>
          </div>
          <div className="text-xl text-white">
            Combo: <span className="text-blue-400">{combo}x</span>
          </div>
          <div className="text-xl text-white">
            Accuracy: <span className="text-green-400">{accuracy.toFixed(2)}%</span>
          </div>
        </div>

        {/* Health Bar */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 w-64">
          <div className="text-sm text-white mb-2">Health</div>
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
              style={{ width: `${gameInstanceRef.current?.health || 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
        {!isPlaying ? (
          <Button
            onClick={handleStart}
            disabled={isLoading || !beatmapLoaded}
            size="lg"
            className="bg-green-500 hover:bg-green-600"
          >
            <PlayCircle className="mr-2" />
            {isLoading ? "Loading..." : "Start"}
          </Button>
        ) : (
          <>
            <Button onClick={handlePause} size="lg" className="bg-yellow-500 hover:bg-yellow-600">
              <PauseCircle className="mr-2" />
              Pause
            </Button>
            <Button onClick={handleSkip} size="lg" className="bg-red-500 hover:bg-red-600">
              <SkipForward className="mr-2" />
              Finish
            </Button>
          </>
        )}
      </div>

      {/* Key Hints (Mobile) */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none md:hidden">
        <div className="text-white text-sm bg-black/50 backdrop-blur-sm rounded px-3 py-1">
          Tap lanes to hit notes
        </div>
      </div>

      {/* Key Hints (Desktop) */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 gap-4 pointer-events-none hidden md:flex">
        {["D", "F", "J", "K"].map((key) => (
          <div key={key} className="text-white text-lg font-bold bg-black/50 backdrop-blur-sm rounded px-4 py-2">
            {key}
          </div>
        ))}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-white text-2xl">Loading beatmap...</div>
        </div>
      )}
    </div>
  )
}
