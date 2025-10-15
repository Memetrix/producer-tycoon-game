"use client"

import type React from "react"

import { ArrowLeft, Play, Music, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import type { Screen } from "@/app/page"
import { type GameState, type Beat, BEAT_NAMES } from "@/lib/game-state"
import { saveBeat, sellBeats } from "@/lib/game-storage"
import { RhythmGameRhythmPlus } from "@/components/rhythm-game-rhythm-plus"
import { MUSIC_TRACKS } from "@/lib/music-config"

interface StageScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
}

export function StageScreen({ gameState, setGameState, onNavigate }: StageScreenProps) {
  const [isPlayingRhythm, setIsPlayingRhythm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null)
  const [isGeneratingCover, setIsGeneratingCover] = useState(false)
  const [isSelling, setIsSelling] = useState(false)

  const ENERGY_COST = 20

  const calculateQuality = (rhythmAccuracy: number) => {
    const baseQuality = 40
    const rhythmBonus = Math.floor(rhythmAccuracy * 0.4) // Up to 40 points from rhythm
    const equipmentBonus =
      gameState.equipment.phone * 3 +
      gameState.equipment.headphones * 3 +
      gameState.equipment.microphone * 5 +
      gameState.equipment.computer * 8
    return Math.min(100, baseQuality + rhythmBonus + equipmentBonus)
  }

  const calculatePrice = (quality: number) => {
    const basePrice = 30
    const qualityBonus = Math.floor((quality - 60) * 1.5)
    const reputationBonus = Math.floor(gameState.reputation * 0.05)
    return Math.max(10, basePrice + qualityBonus + reputationBonus)
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
    setIsCreating(true)

    const randomName = BEAT_NAMES[Math.floor(Math.random() * BEAT_NAMES.length)]
    const quality = calculateQuality(accuracy)
    const price = calculatePrice(quality)

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

    setGameState((prev) => ({
      ...prev,
      energy: prev.energy - ENERGY_COST,
      totalBeatsCreated: prev.totalBeatsCreated + 1,
    }))

    setIsPlayingRhythm(true)
    setCurrentBeat(null)
  }

  const getDifficulty = () => {
    const equipmentLevel =
      gameState.equipment.phone +
      gameState.equipment.headphones +
      gameState.equipment.microphone +
      gameState.equipment.computer
    return Math.min(5, Math.max(1, Math.floor(equipmentLevel / 3) + 1))
  }

  const getBeatmapUrl = () => {
    const difficulty = getDifficulty()
    const trackIndex = Math.min(difficulty - 1, MUSIC_TRACKS.length - 1)
    const track = MUSIC_TRACKS[trackIndex] || MUSIC_TRACKS[0]

    if (!track) {
      console.error("[v0] No tracks available in MUSIC_TRACKS")
      return ""
    }

    console.log("[v0] Selected track:", track.name, "URL:", track.oszUrl)
    return track.oszUrl
  }

  // Fullscreen rhythm game mode
  if (isPlayingRhythm) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="w-full h-full max-w-screen-xl mx-auto flex items-center justify-center">
          <RhythmGameRhythmPlus
            onComplete={handleRhythmComplete}
            difficulty={getDifficulty()}
            beatmapUrl={getBeatmapUrl()}
          />
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
                  {isCreating
                    ? "Создаю бит..."
                    : currentBeat
                      ? `${currentBeat.name} готов!`
                      : "Готов создать новый хит"}
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
        )}

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
