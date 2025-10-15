"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { GameInstance } from "@/lib/rhythm-plus/GameInstance"
import { parseOszFile, type OsuBeatmap } from "@/lib/osz-parser"
import { convertOsuToRhythmPlus } from "@/lib/rhythm-plus-converter"
import { Button } from "@/components/ui/button"
import { PlayCircle } from "lucide-react"

interface RhythmGameRhythmPlusProps {
  difficulty: number
  beatmapUrl: string // URL to .osz beatmap file
  onComplete?: (accuracy: number) => void
}

export function RhythmGameRhythmPlus({ difficulty, beatmapUrl, onComplete }: RhythmGameRhythmPlusProps) {
  console.log("[RhythmGame] Component mounted with:", { difficulty, beatmapUrl })

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
  const loadBeatmap = useCallback(
    async (beatmapUrl: string) => {
      console.log("[RhythmGame] Loading beatmap from:", beatmapUrl)
      try {
        setIsLoading(true)

        // Parse OSU beatmap package (.osz file)
        console.log("[RhythmGame] Parsing OSZ file...")
        const oszPackage = await parseOszFile(beatmapUrl)
        console.log("[RhythmGame] OSZ parsed. Beatmaps:", oszPackage.beatmaps.length)

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

        console.log("[RhythmGame] Beatmap loaded successfully")
        setIsLoading(false)
      } catch (error) {
        console.error("[RhythmGame] Failed to load beatmap:", error)
        setIsLoading(false)
      }
    },
    [difficulty],
  )

  /**
   * Initialize game instance
   */
  useEffect(() => {
    console.log("[RhythmGame] useEffect triggered! Dependencies:", {
      beatmapUrl,
      hasLoadBeatmap: !!loadBeatmap,
      hasInitAudio: !!initAudio,
    })
    console.log("[RhythmGame] Initializing game instance...")
    const canvas = canvasRef.current
    if (!canvas) {
      console.error("[RhythmGame] Canvas ref is null!")
      return
    }
    console.log("[RhythmGame] Canvas element found:", canvas)

    // Set canvas size
    const updateCanvasSize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
        console.log("[RhythmGame] Canvas sized:", canvas.width, "x", canvas.height)
        gameInstanceRef.current?.reposition()
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    // Create game instance
    console.log("[RhythmGame] Creating GameInstance...")
    const game = new GameInstance(canvas)
    console.log("[RhythmGame] GameInstance created")

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
      console.log("[RhythmGame] Cleanup - unmounting")
      window.removeEventListener("resize", updateCanvasSize)
      game.destroy()
      backgroundMusicRef.current?.stop()
      audioContextRef.current?.close()
    }
  }, [beatmapUrl])

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
   * Skip/Complete game
   */
  const handleSkip = useCallback(() => {
    if (!gameInstanceRef.current) return

    const result = gameInstanceRef.current.result
    const finalAccuracy = result.totalHitNotes > 0 ? result.totalPercentage / result.totalHitNotes : 0

    backgroundMusicRef.current?.stop()
    gameInstanceRef.current.pauseGame()

    onComplete?.(finalAccuracy)
  }, [onComplete])

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

  // Track positions state - updates when tracks are initialized
  const [trackPositions, setTrackPositions] = useState<Array<{ x: number; width: number }>>([])

  // Update track positions when game instance is ready
  useEffect(() => {
    let frameId: number
    let isActive = true
    let lastCanvasSize = { width: 0, height: 0 }

    const updateTrackPositions = () => {
      if (!isActive) return

      const canvas = canvasRef.current
      if (!canvas || !gameInstanceRef.current) {
        frameId = requestAnimationFrame(updateTrackPositions)
        return
      }

      // Force reposition if canvas size changed
      const canvasSizeChanged = canvas.width !== lastCanvasSize.width || canvas.height !== lastCanvasSize.height

      if (canvasSizeChanged && lastCanvasSize.width !== 0) {
        console.log("[Button Position] Canvas resized:", lastCanvasSize.width, "x", lastCanvasSize.height, "→", canvas.width, "x", canvas.height)
        gameInstanceRef.current.reposition()
      }

      lastCanvasSize = { width: canvas.width, height: canvas.height }

      const tracks = gameInstanceRef.current.dropTrackArr
      if (tracks.length === 0 || tracks[0].x === 0 || tracks[0].width === 0) {
        // Tracks not yet positioned, try again
        frameId = requestAnimationFrame(updateTrackPositions)
        return
      }

      const positions = tracks.map((track) => ({ x: track.x, width: track.width }))
      setTrackPositions(positions)

      // Keep updating to handle canvas resizes
      frameId = requestAnimationFrame(updateTrackPositions)
    }

    // Start immediately, no timeout delay
    updateTrackPositions()

    return () => {
      isActive = false
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [beatmapLoaded, isLoading])

  /**
   * Update UI with game state
   */
  useEffect(() => {
    const updateUI = () => {
      if (!gameInstanceRef.current) return

      const result = gameInstanceRef.current.result
      setScore(Math.round(result.score))

      if (result.totalHitNotes > 0) {
        const acc = result.totalPercentage / result.totalHitNotes
        setAccuracy(Math.round(acc * 100) / 100)
      }

      // Check for game over when HP reaches 0
      if (gameInstanceRef.current.health <= 0 && isPlaying) {
        console.log("[Game Over] HP reached 0, ending game")
        handleSkip()
        return
      }

      requestAnimationFrame(updateUI)
    }

    const animId = requestAnimationFrame(updateUI)
    return () => cancelAnimationFrame(animId)
  }, [isPlaying, handleSkip])

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      {/* Canvas for Rhythm Plus rendering */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      />

      {/* Touch buttons overlay - positioned exactly on highway lanes */}
      {trackPositions.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {["D", "F", "J", "K"].map((key, index) => {
            const laneColors = ["#22FF22", "#FF2222", "#FFFF22", "#2222FF"]
            const isActive = gameInstanceRef.current?.keyHoldingStatus[key.toLowerCase()] || false
            const track = trackPositions[index]

            if (!track) return null

            return (
              <button
                key={key}
                onTouchStart={(e) => {
                  e.preventDefault()
                  const keyLower = key.toLowerCase()
                  if (gameInstanceRef.current) {
                    gameInstanceRef.current.keyHoldingStatus[keyLower] = true
                    gameInstanceRef.current.dropTrackArr.forEach((track) => track.onKeyDown(keyLower))
                  }
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  const keyLower = key.toLowerCase()
                  if (gameInstanceRef.current) {
                    gameInstanceRef.current.keyHoldingStatus[keyLower] = false
                    gameInstanceRef.current.dropTrackArr.forEach((track) => track.onKeyUp(keyLower))
                  }
                }}
                onMouseDown={() => {
                  const keyLower = key.toLowerCase()
                  if (gameInstanceRef.current) {
                    gameInstanceRef.current.keyHoldingStatus[keyLower] = true
                    gameInstanceRef.current.dropTrackArr.forEach((track) => track.onKeyDown(keyLower))
                  }
                }}
                onMouseUp={() => {
                  const keyLower = key.toLowerCase()
                  if (gameInstanceRef.current) {
                    gameInstanceRef.current.keyHoldingStatus[keyLower] = false
                    gameInstanceRef.current.dropTrackArr.forEach((track) => track.onKeyUp(keyLower))
                  }
                }}
                className="absolute bottom-0 flex flex-col items-center justify-center gap-2 transition-all pointer-events-auto"
                style={{
                  left: `${track.x}px`,
                  width: `${track.width}px`,
                  height: "128px",
                  background: isActive
                    ? `linear-gradient(to top, ${laneColors[index]}88, ${laneColors[index]}22)`
                    : "linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0.1))",
                  touchAction: "none",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  borderLeft: index === 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: laneColors[index],
                    background: isActive ? laneColors[index] : "rgba(255,255,255,0.1)",
                    transform: isActive ? "scale(0.9)" : "scale(1)",
                  }}
                >
                  <span
                    className="text-lg font-bold"
                    style={{
                      color: isActive ? "#000" : laneColors[index],
                    }}
                  >
                    {key}
                  </span>
                </div>
                <span className="text-xs text-white/60">{["Kick", "Snare", "Hat", "Tom"][index]}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Fallback buttons if tracks not yet initialized */}
      {trackPositions.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-4">
          <div className="relative flex gap-0 pointer-events-auto" style={{ width: "min(400px, 90vw)" }}>
            {["D", "F", "J", "K"].map((key, index) => {
              const laneColors = ["#22FF22", "#FF2222", "#FFFF22", "#2222FF"]
              const isActive = gameInstanceRef.current?.keyHoldingStatus[key.toLowerCase()] || false

              return (
                <button
                  key={key}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    const keyLower = key.toLowerCase()
                    if (gameInstanceRef.current) {
                      gameInstanceRef.current.keyHoldingStatus[keyLower] = true
                      gameInstanceRef.current.dropTrackArr.forEach((track) => track.onKeyDown(keyLower))
                    }
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    const keyLower = key.toLowerCase()
                    if (gameInstanceRef.current) {
                      gameInstanceRef.current.keyHoldingStatus[keyLower] = false
                      gameInstanceRef.current.dropTrackArr.forEach((track) => track.onKeyUp(keyLower))
                    }
                  }}
                  onMouseDown={() => {
                    const keyLower = key.toLowerCase()
                    if (gameInstanceRef.current) {
                      gameInstanceRef.current.keyHoldingStatus[keyLower] = true
                      gameInstanceRef.current.dropTrackArr.forEach((track) => track.onKeyDown(keyLower))
                    }
                  }}
                  onMouseUp={() => {
                    const keyLower = key.toLowerCase()
                    if (gameInstanceRef.current) {
                      gameInstanceRef.current.keyHoldingStatus[keyLower] = false
                      gameInstanceRef.current.dropTrackArr.forEach((track) => track.onKeyUp(keyLower))
                    }
                  }}
                  className="flex-1 h-32 border-r border-white/10 last:border-r-0 flex flex-col items-center justify-center gap-2 transition-all"
                  style={{
                    background: isActive
                      ? `linear-gradient(to top, ${laneColors[index]}88, ${laneColors[index]}22)`
                      : "linear-gradient(to top, rgba(0,0,0,0.3), rgba(0,0,0,0.1))",
                    touchAction: "none",
                    userSelect: "none",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: laneColors[index],
                      background: isActive ? laneColors[index] : "rgba(255,255,255,0.1)",
                      transform: isActive ? "scale(0.9)" : "scale(1)",
                    }}
                  >
                    <span
                      className="text-lg font-bold"
                      style={{
                        color: isActive ? "#000" : laneColors[index],
                      }}
                    >
                      {key}
                    </span>
                  </div>
                  <span className="text-xs text-white/60">{["Kick", "Snare", "Hat", "Tom"][index]}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Judgement Display */}
      {currentJudgement && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
          <div
            className={`text-4xl font-bold animate-bounce ${
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

      {/* Score & Stats HUD - Compact */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none z-40">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs">
          <span className="text-white/60">Score: </span>
          <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span>
          <span className="text-white/60 ml-2">Combo: </span>
          <span className="text-blue-400 font-bold">{combo}x</span>
        </div>

        {/* Health Bar - Compact */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">HP</span>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                style={{ width: `${gameInstanceRef.current?.health || 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons - Hidden during play */}
      {!isPlaying && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 pointer-events-auto z-40">
          <Button
            onClick={handleStart}
            disabled={isLoading || !beatmapLoaded}
            size="lg"
            className="bg-green-500 hover:bg-green-600"
          >
            <PlayCircle className="mr-2" />
            {isLoading ? "Loading..." : "Start"}
          </Button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-white text-2xl">Loading beatmap...</div>
        </div>
      )}
    </div>
  )
}
