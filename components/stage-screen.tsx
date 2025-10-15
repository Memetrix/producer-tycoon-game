"use client"

import type React from "react"

import { ArrowLeft, Play, Music, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import type { Screen } from "@/app/page"
import { type GameState, type Beat, BEAT_NAMES, ENERGY_CONFIG } from "@/lib/game-state"
import { saveBeat, sellBeats } from "@/lib/game-storage"
import { RhythmGameRhythmPlus } from "@/components/rhythm-game-rhythm-plus"
import { OSZ_TRACKS, type OszTrack } from "@/lib/music-config"

interface StageScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
  onRhythmGameStateChange?: (isPlaying: boolean) => void
}

export function StageScreen({ gameState, setGameState, onNavigate, onRhythmGameStateChange }: StageScreenProps) {
  const [isPlayingRhythm, setIsPlayingRhythm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null)
  const [isGeneratingCover, setIsGeneratingCover] = useState(false)
  const [isSelling, setIsSelling] = useState(false)

  // Track and difficulty selection
  const [showTrackSelector, setShowTrackSelector] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<OszTrack | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState(1)

  const [availableTracks, setAvailableTracks] = useState<OszTrack[]>(OSZ_TRACKS)
  const [isLoadingTracks, setIsLoadingTracks] = useState(false)

  useEffect(() => {
    const loadTracks = async () => {
      setIsLoadingTracks(true)
      try {
        const response = await fetch("/api/songs")
        const data = await response.json()

        if (data.songs && Array.isArray(data.songs)) {
          const dbTracks: OszTrack[] = data.songs.map((song: any) => ({
            id: song.id,
            name: song.name,
            artist: song.artist,
            genre: song.genre,
            type: "osz" as const,
            oszUrl: song.osz_url,
          }))

          // Combine hardcoded tracks with database tracks
          setAvailableTracks([...OSZ_TRACKS, ...dbTracks])
          console.log("[v0] Loaded tracks:", OSZ_TRACKS.length + dbTracks.length, "total")
        }
      } catch (error) {
        console.error("[v0] Failed to load tracks from database:", error)
        // Keep using hardcoded tracks if database fetch fails
      } finally {
        setIsLoadingTracks(false)
      }
    }

    loadTracks()
  }, [])

  const ENERGY_COST = ENERGY_CONFIG.ENERGY_COST_PER_BEAT // UPDATED: было 20, теперь 15

  const calculateQuality = (rhythmAccuracy: number, difficulty: number) => {
    const baseQuality = 20 // Reduced base from 40 to 20
    const rhythmBonus = Math.floor(rhythmAccuracy * 0.6) // Increased from 0.4 to 0.6 (up to 60 points)
    const difficultyBonus = difficulty * 3 // Reduced from 5 to 3
    const equipmentBonus = Math.floor(
      (gameState.equipment.phone * 2 +
        gameState.equipment.headphones * 2 +
        gameState.equipment.microphone * 3 +
        gameState.equipment.computer * 5) *
        0.5, // Reduced equipment impact by 50%
    )
    return Math.min(100, baseQuality + rhythmBonus + difficultyBonus + equipmentBonus)
  }

  const calculatePrice = (quality: number, difficulty: number) => {
    const basePrice = 30
    const qualityBonus = Math.floor((quality - 60) * 1.5)
    const difficultyMultiplier = 1 + (difficulty - 1) * 0.3 // Each difficulty adds 30% to price
    const reputationBonus = Math.floor(gameState.reputation * 0.05)
    const finalPrice = Math.floor((basePrice + qualityBonus + reputationBonus) * difficultyMultiplier)
    return Math.max(10, finalPrice)
  }

  const handleSellBeat = async () => {
    if (!currentBeat || isSelling) return

    setIsSelling(true)
    console.log("[v0] Selling beat:", currentBeat.id)

    try {
      await sellBeats([currentBeat.id])
      console.log("[v0] Beat sold successfully")

      setGameState((prev) => ({
        ...prev,
        beats: [currentBeat, ...prev.beats],
        money: prev.money + currentBeat.price,
        reputation: prev.reputation + Math.floor(currentBeat.quality / 5),
        totalMoneyEarned: prev.totalMoneyEarned + currentBeat.price,
        totalBeatsEarnings: (prev.totalBeatsEarnings || 0) + currentBeat.price,
        stageProgress: Math.min(100, prev.stageProgress + 5),
      }))

      setCurrentBeat(null)
    } catch (error) {
      console.error("[v0] Failed to sell beat:", error)
      alert("Ошибка при продаже бита. Попробуй еще раз.")
    } finally {
      setIsSelling(false)
    }
  }

  const handleRhythmComplete = async (accuracy: number) => {
    console.log("[v0] Rhythm game completed with accuracy:", accuracy)
    setIsPlayingRhythm(false)
    onRhythmGameStateChange?.(false)
    setSelectedTrack(null) // Clear selected track to return to main screen after completion
    setIsCreating(true)

    const randomName = BEAT_NAMES[Math.floor(Math.random() * BEAT_NAMES.length)]
    const quality = calculateQuality(accuracy, selectedDifficulty)
    const price = calculatePrice(quality, selectedDifficulty)

    setIsGeneratingCover(true)

    try {
      const coverResponse = await fetch("/api/generate-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${randomName} hip hop album cover, urban street art, graffiti, neon lights, vinyl record`,
        }),
      })
      const coverData = await coverResponse.json()

      const newBeat: Beat = {
        id: crypto.randomUUID(),
        name: randomName,
        price: price,
        quality: quality,
        cover: coverData.imageUrl || "/placeholder.svg?height=400&width=400",
        createdAt: Date.now(),
      }

      console.log("[v0] Beat created:", newBeat.id)
      setCurrentBeat(newBeat)
      await saveBeat(newBeat)
    } catch (error) {
      console.error("[v0] Failed to generate cover:", error)
      const newBeat: Beat = {
        id: crypto.randomUUID(),
        name: randomName,
        price: price,
        quality: quality,
        cover: "/placeholder.svg?height=400&width=400",
        createdAt: Date.now(),
      }
      setCurrentBeat(newBeat)
      await saveBeat(newBeat)
    } finally {
      setIsGeneratingCover(false)
      setIsCreating(false)
    }
  }

  const startCreating = () => {
    if (gameState.energy < ENERGY_COST) {
      alert("Недостаточно энергии! Подожди немного.")
      return
    }

    // Show track selector
    setShowTrackSelector(true)
    setCurrentBeat(null)
  }

  const handleTrackSelect = (track: OszTrack) => {
    setSelectedTrack(track)
    setShowTrackSelector(false)
    // Auto-select difficulty based on equipment
    const equipmentLevel =
      gameState.equipment.phone +
      gameState.equipment.headphones +
      gameState.equipment.microphone +
      gameState.equipment.computer
    const suggestedDifficulty = Math.min(5, Math.max(1, Math.floor(equipmentLevel / 3) + 1))
    setSelectedDifficulty(suggestedDifficulty)
  }

  const handleStartGame = () => {
    console.log("[Stage] Starting game with track:", selectedTrack?.name, "difficulty:", selectedDifficulty)

    setGameState((prev) => ({
      ...prev,
      energy: prev.energy - ENERGY_COST,
      totalBeatsCreated: prev.totalBeatsCreated + 1,
    }))

    setIsPlayingRhythm(true)
    onRhythmGameStateChange?.(true)
  }

  // Fullscreen rhythm game mode
  if (isPlayingRhythm && selectedTrack) {
    console.log("[Stage] Rendering rhythm game. Track:", selectedTrack.name, "URL:", selectedTrack.oszUrl)
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="w-full h-full max-w-screen-xl mx-auto flex items-center justify-center">
          <RhythmGameRhythmPlus
            onComplete={handleRhythmComplete}
            onClose={() => {
              setIsPlayingRhythm(false)
              onRhythmGameStateChange?.(false)
              setSelectedTrack(null)
            }}
            difficulty={selectedDifficulty}
            beatmapUrl={selectedTrack.oszUrl}
          />
        </div>
      </div>
    )
  }

  // Debug: Show current state
  console.log("[Stage] State:", { isPlayingRhythm, hasSelectedTrack: !!selectedTrack, showTrackSelector })

  // Track selection screen
  if (showTrackSelector) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-background to-background/95">
        <div className="p-4 border-b border-border/50 flex items-center gap-3 backdrop-blur-xl bg-card/80">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowTrackSelector(false)}
            className="active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Выбери трек</h1>
            <p className="text-xs text-muted-foreground">Выбери музыку для создания бита</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoadingTracks && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground">Загружаю треки...</p>
              </div>
            </div>
          )}

          {!isLoadingTracks && availableTracks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Нет доступных треков</p>
              <p className="text-xs text-muted-foreground mt-2">Загрузи треки в разделе "Загрузка музыки"</p>
            </div>
          )}

          {!isLoadingTracks &&
            availableTracks.map((track) => (
              <Card
                key={track.id}
                className="p-4 hover:bg-card/80 cursor-pointer transition-all active:scale-95"
                onClick={() => handleTrackSelect(track)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {track.artist} - {track.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{track.genre}</p>
                  </div>
                  <Music className="w-6 h-6 text-primary" />
                </div>
              </Card>
            ))}
        </div>
      </div>
    )
  }

  // Difficulty selection screen
  if (selectedTrack && !isPlayingRhythm) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-background to-background/95">
        <div className="p-4 border-b border-border/50 flex items-center gap-3 backdrop-blur-xl bg-card/80">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedTrack(null)
              setShowTrackSelector(true)
            }}
            className="active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Выбери сложность</h1>
            <p className="text-xs text-muted-foreground">
              {selectedTrack.artist} - {selectedTrack.name}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((diff) => {
              const qualityBonus = diff * 3
              const priceMultiplier = 1 + (diff - 1) * 0.3
              const estimatedPrice = Math.floor(50 * priceMultiplier)

              return (
                <Card
                  key={diff}
                  className={`p-4 cursor-pointer transition-all hover:border-primary ${
                    selectedDifficulty === diff ? "border-2 border-primary bg-primary/10" : ""
                  }`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {diff === 1
                            ? "Лёгкая"
                            : diff === 2
                              ? "Нормальная"
                              : diff === 3
                                ? "Сложная"
                                : diff === 4
                                  ? "Экспертная"
                                  : "Мастер"}
                        </p>
                        <span className="text-xs text-primary">+{qualityBonus}% качество</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Цена: ~${estimatedPrice} (+{Math.floor((priceMultiplier - 1) * 100)}%)
                      </p>
                    </div>
                    {selectedDifficulty === diff && <Sparkles className="w-5 h-5 text-primary" />}
                  </div>
                </Card>
              )
            })}
          </div>

          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-secondary"
            onClick={handleStartGame}
            disabled={gameState.energy < ENERGY_COST}
          >
            <Play className="w-5 h-5 mr-2" />
            Начать игру (-{ENERGY_COST} энергии)
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background to-background/95">
      <div className="p-4 border-b border-border/50 flex items-center gap-3 backdrop-blur-xl bg-card/80">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("home")}
          className="active:scale-95 transition-transform text-foreground hover:text-foreground/80"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Создать бит</h1>
          <p className="text-xs text-muted-foreground">Этап 1: Улица - Начало пути</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
        <Card className="p-8 bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/30 shadow-lg">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              {currentBeat ? (
                <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-primary/30">
                  {isGeneratingCover ? (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                        <p className="text-xs text-muted-foreground">Генерирую обложку...</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={currentBeat.cover || "/placeholder.svg"}
                      alt={currentBeat.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ) : (
                <>
                  <div
                    className={`w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl ${isCreating ? "animate-pulse" : ""}`}
                  >
                    <Music className="w-16 h-16 text-primary-foreground" />
                  </div>
                  {isCreating && (
                    <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
                  )}
                </>
              )}
            </div>

            <div className="w-full space-y-2">
              <p className="text-lg font-semibold">
                {isCreating ? "Создаю бит..." : currentBeat ? `${currentBeat.name} готов!` : "Готов создать новый хит"}
              </p>
              {currentBeat && (
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="text-muted-foreground">Качество: {currentBeat.quality}%</span>
                  <span className="text-primary font-bold">${currentBeat.price}</span>
                </div>
              )}
            </div>

            {currentBeat ? (
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 shadow-md active:scale-95 transition-transform"
                onClick={handleSellBeat}
                disabled={isGeneratingCover || isSelling}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isGeneratingCover
                  ? "Генерирую обложку..."
                  : isSelling
                    ? "Продаю..."
                    : `Продать бит ($${currentBeat?.price})`}
              </Button>
            ) : (
              <div className="w-full space-y-2">
                <Button
                  size="lg"
                  className="w-full h-auto py-3 px-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 shadow-md active:scale-95 transition-transform whitespace-normal"
                  onClick={startCreating}
                  disabled={isCreating || gameState.energy < ENERGY_COST}
                >
                  <Play className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>Начать создание (-{ENERGY_COST} энергии)</span>
                </Button>
                {gameState.energy < ENERGY_COST && (
                  <p className="text-xs text-muted-foreground">Недостаточно энергии. Подожди немного!</p>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-primary">{gameState.beats.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Битов создано</p>
          </Card>
          <Card className="p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-secondary">${gameState.totalBeatsEarnings || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Заработано</p>
          </Card>
          <Card className="p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-accent">{gameState.reputation}</p>
            <p className="text-xs text-muted-foreground mt-1">Репутация</p>
          </Card>
        </div>

        {gameState.beats.length > 0 && (
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Твои биты</h3>
            </div>
            <div className="space-y-2">
              {gameState.beats.map((beat) => (
                <Card key={beat.id} className="p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                      <img
                        src={beat.cover || "/placeholder.svg"}
                        alt={beat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{beat.name}</p>
                      <p className="text-xs text-muted-foreground">Качество: {beat.quality}%</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${beat.price}</p>
                      <p className="text-xs text-muted-foreground">Продано</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
