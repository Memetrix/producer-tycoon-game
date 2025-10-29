"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { GameInstance } from "@/lib/rhythm-plus/GameInstance"
import { parseOszFile, type OsuBeatmap } from "@/lib/osz-parser"
import { convertOsuToRhythmPlus } from "@/lib/rhythm-plus-converter"
import { Button } from "@/components/ui/button"
import { PlayCircle } from "lucide-react"
import { DrumSynthesizer } from "@/lib/drum-sounds"

interface RhythmGameRhythmPlusProps {
  difficulty: number
  beatmapUrl: string // URL to .osz beatmap file
  onComplete?: (accuracy: number) => void
  onClose?: () => void
}

export function RhythmGameRhythmPlus({ difficulty, beatmapUrl, onComplete, onClose }: RhythmGameRhythmPlusProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameInstanceRef = useRef<GameInstance | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const backgroundMusicRef = useRef<AudioBufferSourceNode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gameCompletedRef = useRef(false)
  const drumSynthRef = useRef<DrumSynthesizer | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [beatmapLoaded, setBeatmapLoaded] = useState(false)
  const [currentJudgement, setCurrentJudgement] = useState<string>("")
  const [combo, setCombo] = useState(0)
  const [score, setScore] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [songDuration, setSongDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const [oszBeatmaps, setOszBeatmaps] = useState<OsuBeatmap[]>([])
  const [selectedBeatmapIndex, setSelectedBeatmapIndex] = useState<number>(0)
  const [oszAudioBlob, setOszAudioBlob] = useState<Blob | null>(null)

  const [highwayWidth, setHighwayWidth] = useState<number>(600)

  const updateHighwayWidth = useCallback(() => {
    if (!gameInstanceRef.current) return

    const tracks = gameInstanceRef.current.dropTrackArr
    if (tracks.length === 0 || tracks[0].width === 0) return

    const firstTrack = tracks[0]
    const lastTrack = tracks[tracks.length - 1]
    const totalWidth = lastTrack.x + lastTrack.width - firstTrack.x

    setHighwayWidth(totalWidth)
  }, [])

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
      try {
        setIsLoading(true)
        setLoadError(null)

        const oszPackage = await parseOszFile(beatmapUrl)

        setOszBeatmaps(oszPackage.beatmaps)
        setOszAudioBlob(oszPackage.audioBlob)

        const selectedIndex = Math.min(difficulty - 1, oszPackage.beatmaps.length - 1)
        setSelectedBeatmapIndex(selectedIndex)

        const beatmap = oszPackage.beatmaps[selectedIndex]

        const notes = convertOsuToRhythmPlus(beatmap)

        if (gameInstanceRef.current) {
          gameInstanceRef.current.loadSong(notes)
          setBeatmapLoaded(true)
          setTimeout(() => updateHighwayWidth(), 100)
        }

        if (oszPackage.audioBlob && audioContextRef.current) {
          const audioUrl = URL.createObjectURL(oszPackage.audioBlob)
          const response = await fetch(audioUrl)
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)

          setSongDuration(audioBuffer.duration)

          const source = audioContextRef.current.createBufferSource()
          source.buffer = audioBuffer
          source.connect(audioContextRef.current.destination)
          backgroundMusicRef.current = source

          URL.revokeObjectURL(audioUrl)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("[Rhythm Plus] Failed to load beatmap:", error)
        setLoadError("Не удалось загрузить beatmap. Попробуй другой трек.")
        setIsLoading(false)
      }
    },
    [difficulty, updateHighwayWidth],
  )

  /**
   * Initialize game instance
   */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateCanvasSize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
        gameInstanceRef.current?.reposition()
        setTimeout(() => updateHighwayWidth(), 50)
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    const game = new GameInstance(canvas)

    game.setOnJudgeDisplay((judgement, currentCombo) => {
      setCurrentJudgement(judgement.toUpperCase())
      setCombo(currentCombo)
      setTimeout(() => setCurrentJudgement(""), 500)
    })

    game.setOnPlayEffect((sound) => {
      playDrumSound(sound)
    })

    game.setOnGameEnd(() => {
      handleSkip()
    })

    gameInstanceRef.current = game

    setTimeout(() => updateHighwayWidth(), 100)

    initAudio().then(() => loadBeatmap(beatmapUrl))

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      game.destroy()
      backgroundMusicRef.current?.stop()
      audioContextRef.current?.close()
      drumSynthRef.current?.destroy()
    }
  }, [beatmapUrl, updateHighwayWidth])

  /**
   * Play drum hit sound effect
   */
  const playDrumSound = useCallback((sound: string) => {
    if (!drumSynthRef.current) {
      drumSynthRef.current = new DrumSynthesizer()
      drumSynthRef.current.init()
    }

    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume()
    }

    drumSynthRef.current.play(sound)
  }, [])

  /**
   * Skip/Complete game
   */
  const handleSkip = useCallback(() => {
    if (gameCompletedRef.current) {
      return
    }

    if (!gameInstanceRef.current) return

    gameCompletedRef.current = true

    const result = gameInstanceRef.current.result
    const finalAccuracy = result.totalHitNotes > 0 ? result.totalPercentage / result.totalHitNotes : 0

    try {
      backgroundMusicRef.current?.stop()
    } catch (error) {}
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

    if (backgroundMusicRef.current && audioContextRef.current) {
      backgroundMusicRef.current.start(audioContextRef.current.currentTime)
    }

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
    setIsPaused(true)
  }, [])

  /**
   * Resume game
   */
  const handleResume = useCallback(() => {
    if (!gameInstanceRef.current) return

    gameInstanceRef.current.resumeGame()
    audioContextRef.current?.resume()
    setIsPlaying(true)
    setIsPaused(false)
  }, [])

  // Update highway width when canvas resizes or game initializes
  useEffect(() => {
    if (!beatmapLoaded || isLoading) return

    const updateHighwayWidth = () => {
      if (!gameInstanceRef.current) return

      const tracks = gameInstanceRef.current.dropTrackArr
      if (tracks.length === 0 || tracks[0].width === 0) return

      const firstTrack = tracks[0]
      const lastTrack = tracks[tracks.length - 1]
      const totalWidth = lastTrack.x + lastTrack.width - firstTrack.x

      if (totalWidth > 0 && Math.abs(totalWidth - highwayWidth) > 1) {
        setHighwayWidth(totalWidth)
      }
    }

    const initialTimer = setTimeout(updateHighwayWidth, 100)

    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(() => {
      updateHighwayWidth()
    })
    resizeObserver.observe(canvas)

    return () => {
      clearTimeout(initialTimer)
      resizeObserver.disconnect()
    }
  }, [beatmapLoaded, isLoading, highwayWidth])

  /**
   * Update UI with game state
   */
  useEffect(() => {
    if (!isPlaying) return

    const updateUI = () => {
      if (!gameInstanceRef.current) return

      const result = gameInstanceRef.current.result
      setScore(Math.round(result.score))

      if (result.totalHitNotes > 0) {
        const acc = result.totalPercentage / result.totalHitNotes
        setAccuracy(Math.round(acc * 100) / 100)
      }

      if (gameInstanceRef.current.health <= 0 && isPlaying) {
        handleSkip()
        return
      }

      requestAnimationFrame(updateUI)
    }

    const animId = requestAnimationFrame(updateUI)
    return () => cancelAnimationFrame(animId)
  }, [isPlaying, handleSkip])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying && !isPaused) {
        handlePause()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [isPlaying, isPaused])

  useEffect(() => {
    if (!isPlaying) return

    const updateTime = () => {
      if (gameInstanceRef.current) {
        const time = gameInstanceRef.current.currentTime || 0
        setCurrentTime(time)
      }
      requestAnimationFrame(updateTime)
    }

    const animId = requestAnimationFrame(updateTime)
    return () => cancelAnimationFrame(animId)
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-gradient-to-b from-gray-900 to-black overflow-hidden z-50"
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (isPlaying) {
              handlePause()
              setIsPaused(true)
            }
            if (confirm("Выйти из игры? Прогресс не будет сохранён.")) {
              try {
                backgroundMusicRef.current?.stop()
              } catch (error) {}
              gameInstanceRef.current?.pauseGame()
              onClose?.()
            } else if (isPaused) {
              handleResume()
              setIsPaused(false)
            }
          }}
          className="bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 pointer-events-none flex items-end justify-center">
        <div
          className="flex gap-0 pointer-events-auto"
          style={{
            width: highwayWidth > 0 ? `${highwayWidth}px` : "600px",
          }}
        >
          {["D", "F", "J", "K"].map((key, index) => {
            const laneColors = ["#22FF22", "#FF2222", "#FFFF22", "#2222FF"]
            const isActive = gameInstanceRef.current?.keyHoldingStatus[key.toLowerCase()] || false

            // Get perspective width at hit line for this lane
            const track = gameInstanceRef.current?.dropTrackArr[index]
            let trackWidth = highwayWidth / 4
            let trackX = 0

            if (track && gameInstanceRef.current) {
              const hitLineY = gameInstanceRef.current.checkHitLineY
              const perspective = gameInstanceRef.current.getPerspectiveX(track.x, track.width, hitLineY)
              trackWidth = perspective.width
              trackX = perspective.x
            }

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
                className="h-32 flex flex-col items-center justify-center gap-2 transition-all"
                style={{
                  width: `${trackWidth}px`,
                  background: isActive
                    ? `linear-gradient(to top, ${laneColors[index]}88, ${laneColors[index]}22)`
                    : "linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0.1))",
                  touchAction: "none",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none",
                  borderRight: index < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: laneColors[index],
                    background: isActive ? laneColors[index] : "rgba(255,255,255,0.1)",
                    transform: isActive ? "scale(0.9)" : "scale(1)",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                  }}
                >
                  <span
                    className="text-lg font-bold"
                    style={{
                      color: isActive ? "#000" : laneColors[index],
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    {key}
                  </span>
                </div>
                <span
                  className="text-xs text-white/60"
                  style={{
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  {["Kick", "Snare", "Hat", "Tom"][index]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

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

      <div className="absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none z-40">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs">
          <span className="text-white/60">Score: </span>
          <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span>
          <span className="text-white/60 ml-2">Combo: </span>
          <span className="text-blue-400 font-bold">{combo}x</span>
        </div>

        {songDuration > 0 && (
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs">
            <span className="text-white/60">
              {formatTime(currentTime)} / {formatTime(songDuration)}
            </span>
          </div>
        )}

        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">HP</span>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, gameInstanceRef.current?.health || 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

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

      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-white text-2xl">Loading beatmap...</div>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-red-400 text-xl">{loadError}</div>
            <Button onClick={onClose} variant="outline" className="bg-transparent">
              Вернуться назад
            </Button>
          </div>
        </div>
      )}

      {isPaused && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-auto">
          <div className="text-center space-y-4">
            <div className="text-white text-3xl font-bold">Пауза</div>
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  handleResume()
                  setIsPaused(false)
                }}
                size="lg"
                className="bg-green-500 hover:bg-green-600"
              >
                Продолжить
              </Button>
              <Button
                onClick={() => {
                  if (confirm("Выйти из игры? Прогресс не будет сохранён.")) {
                    try {
                      backgroundMusicRef.current?.stop()
                    } catch (error) {}
                    gameInstanceRef.current?.pauseGame()
                    onClose?.()
                  }
                }}
                size="lg"
                variant="outline"
                className="bg-transparent"
              >
                Выйти
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
