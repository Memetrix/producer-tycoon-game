"use client"

import { useState, useEffect, useRef } from "react"
import { Music, ChevronDown, ChevronLeft } from "lucide-react"
import { ALL_TRACKS, DRUM_SOUNDS, type MusicTrack } from "@/lib/music-config"
import { parseOszFile, convertOsuToGameNotes, type OsuBeatmap } from "@/lib/osz-parser"
import { RhythmEngine, calculateSimpleAccuracy, type RhythmNote } from "@/lib/rhythm-engine"
import { getJudgementColor, type BeatJudgement, type GaugeType } from "@/lib/beatoraja-timing"
import { JudgeDisplay, JudgeCounter } from "./judge-display"
import { GreenNumberContainer } from "./green-number"
import { GrooveGauge } from "./groove-gauge"
import { HispeedController } from "./hispeed-controller"

interface RhythmGameProps {
  onComplete: (accuracy: number) => void
  difficulty: number
}

const DRUM_LABELS = ["🥁 Kick", "🎵 Snare", "🔔 Hi-Hat", "💥 Tom"]

export function RhythmGame({ onComplete, difficulty }: RhythmGameProps) {
  const [notes, setNotes] = useState<RhythmNote[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const notesSpawnedRef = useRef(0)
  const [activeLanes, setActiveLanes] = useState<Set<number>>(new Set())

  const rhythmEngineRef = useRef<RhythmEngine | null>(null)

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
  const gameStartTimeRef = useRef<number>(0)

  const audioContextRef = useRef<AudioContext | null>(null)

  const TOTAL_NOTES_COUNT = midiNotes.length
  const NOTE_SPEED = 1.2 + difficulty * 0.1
  const HIT_ZONE = 85

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

  const playDrumSound = (lane: number) => {
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
  }

  useEffect(() => {
    if (!gameStarted && !isLoading && midiNotes.length > 0 && rhythmEngineRef.current) {
      startGame()
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current)
    }
  }, [isLoading, midiNotes])

  const startGame = () => {
    if (!audioContextRef.current || !rhythmEngineRef.current) return

    setGameStarted(true)
    setIsPlaying(true)

    rhythmEngineRef.current.startGame(bpm, audioContextRef.current)

    if (oszAudioUrl) {
      backgroundMusicRef.current = new Audio(oszAudioUrl)
      backgroundMusicRef.current.volume = 0.5
      backgroundMusicRef.current.play().catch((error) => {
        console.error("[v0] Background music play() failed:", error)
      })
    }

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume()
    }

    gameStartTimeRef.current = audioContextRef.current.currentTime

    const beatInterval = (60 / bpm) * 1000
    setCurrentBeat(1)
    metronomeIntervalRef.current = setInterval(() => {
      setCurrentBeat((prev) => (prev % 4) + 1)
    }, beatInterval)

    const leadTime = rhythmEngineRef.current.getLeadTime()

    let noteIndex = 0
    const spawnNote = () => {
      if (noteIndex >= midiNotes.length || !audioContextRef.current) return

      const currentNote = midiNotes[noteIndex]
      const noteTime = gameStartTimeRef.current + currentNote.time

      const newNote: RhythmNote = {
        id: crypto.randomUUID(),
        time: noteTime,
        lane: currentNote.lane,
        position: 0,
        hit: false,
        judgement: null,
        timingError: null,
      }

      setNotes((prev) => [...prev, newNote])
      notesSpawnedRef.current++
      noteIndex++

      if (noteIndex < midiNotes.length) {
        const nextNote = midiNotes[noteIndex]
        const delay = (nextNote.time - currentNote.time) * 1000
        setTimeout(spawnNote, Math.max(0, delay))
      }
    }

    if (midiNotes.length > 0) {
      const firstNoteTime = midiNotes[0].time
      const spawnDelay = Math.max(0, (firstNoteTime - leadTime) * 1000)
      setTimeout(spawnNote, spawnDelay)
    }

    gameLoopRef.current = setInterval(() => {
      if (!audioContextRef.current || !rhythmEngineRef.current) return

      const currentTime = audioContextRef.current.currentTime

      setNotes((prev) => {
        const updated = prev.map((note) => {
          if (note.hit) return note

          const timeDiff = note.time - currentTime
          const position = 100 - (timeDiff / leadTime) * 100

          if (position > HIT_ZONE + 30 && !note.hit) {
            rhythmEngineRef.current?.handleMissedNote(note)
            return { ...note, position, hit: true, judgement: "poor" as BeatJudgement }
          }

          return { ...note, position }
        })

        rhythmEngineRef.current?.updateGreenNumbers()

        const filtered = updated.filter((note) => note.position < 110)

        if (notesSpawnedRef.current >= TOTAL_NOTES_COUNT && filtered.every((note) => note.hit)) {
          endGame()
        }

        return filtered
      })
    }, 50)
  }

  const endGame = () => {
    if (!rhythmEngineRef.current) return

    setIsPlaying(false)
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current)

    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause()
      backgroundMusicRef.current.currentTime = 0
    }

    const results = rhythmEngineRef.current.endGame()
    const engineState = rhythmEngineRef.current.getState()

    const accuracy = calculateSimpleAccuracy(engineState.score, engineState.totalNotes)

    console.log("[v0] Game ended - Results:", results)
    console.log("[v0] Final accuracy:", accuracy, "%")
    console.log("[v0] EX Score:", results.exScore, "/", engineState.maxExScore)
    console.log("[v0] DJ Level:", results.djLevel)
    console.log("[v0] Clear Lamp:", results.clearLamp)

    setTimeout(() => {
      onComplete(accuracy)
    }, 500)
  }

  const handleLaneTap = (lane: number) => {
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
  }

  const engineState = rhythmEngineRef.current?.getState()

  if (showTrackSelector && !selectedTrack) {
    return (
      <div className="relative w-full h-[380px] bg-gradient-to-b from-background to-card rounded-2xl overflow-hidden border-2 border-primary/30 flex items-center justify-center p-6">
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
      <div className="relative w-full h-[380px] bg-gradient-to-b from-background to-card rounded-2xl overflow-hidden border-2 border-primary/30 flex items-center justify-center p-6">
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
      <div className="relative w-full h-[380px] bg-gradient-to-b from-background to-card rounded-2xl overflow-hidden border-2 border-primary/30 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[380px] bg-gradient-to-b from-background to-card rounded-2xl overflow-hidden border-2 border-primary/30">
      <JudgeDisplay judgement={lastJudgement?.judgement || null} onComplete={() => setLastJudgement(null)} />

      <div className="absolute top-2 left-0 right-0 z-10 flex justify-between px-4">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Комбо</p>
          <p className="text-lg font-bold text-primary">{engineState?.score.currentCombo || 0}x</p>
        </div>

        <div className="text-center">
          <div
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-100 ${
              currentBeat === 1
                ? "bg-primary/30 border-primary scale-110 shadow-lg shadow-primary/50"
                : "bg-primary/10 border-primary/50 scale-100"
            }`}
          >
            <span className="text-lg font-bold text-primary">{currentBeat}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{bpm} BPM</p>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">EX Score</p>
          <p className="text-lg font-bold text-secondary">
            {engineState?.exScore || 0}/{engineState?.maxExScore || 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Rank</p>
          <p className="text-lg font-bold text-accent">{engineState?.djLevel || "F"}</p>
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

      <div className="absolute inset-0 flex pt-24 pb-20">
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
                  {note.judgement ? (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold animate-ping"
                      style={{
                        backgroundColor: `${getJudgementColor(note.judgement)}50`,
                        color: getJudgementColor(note.judgement),
                      }}
                    >
                      {note.judgement === "pgreat"
                        ? "💯"
                        : note.judgement === "great"
                          ? "✨"
                          : note.judgement === "good"
                            ? "👍"
                            : note.judgement === "bad"
                              ? "😐"
                              : "❌"}
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
