"use client"

import type React from "react"

import { ArrowLeft, Play, Pause, Music, Sparkles, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import type { Screen } from "@/app/page"
import { type GameState, type Beat, BEAT_NAMES } from "@/lib/game-state"
import { saveBeat } from "@/lib/game-storage"

interface StageScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
}

export function StageScreen({ gameState, setGameState, onNavigate }: StageScreenProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null)
  const [isGeneratingCover, setIsGeneratingCover] = useState(false)

  const ENERGY_COST = 20

  const calculateQuality = () => {
    const baseQuality = 60
    const equipmentBonus =
      gameState.equipment.phone * 5 +
      gameState.equipment.headphones * 5 +
      gameState.equipment.microphone * 10 +
      gameState.equipment.computer * 15
    const randomVariation = Math.floor(Math.random() * 10)
    return Math.min(100, baseQuality + equipmentBonus + randomVariation)
  }

  const calculatePrice = (quality: number) => {
    const basePrice = 30
    const qualityBonus = Math.floor((quality - 60) * 1.5)
    const reputationBonus = Math.floor(gameState.reputation * 0.05)
    return basePrice + qualityBonus + reputationBonus
  }

  const startCreating = async () => {
    if (gameState.energy < ENERGY_COST) {
      alert("Недостаточно энергии! Подожди немного.")
      return
    }

    setGameState((prev) => ({
      ...prev,
      energy: prev.energy - ENERGY_COST,
    }))

    setIsCreating(true)
    setProgress(0)
    setCurrentBeat(null)

    const randomName = BEAT_NAMES[Math.floor(Math.random() * BEAT_NAMES.length)]
    const quality = calculateQuality()
    const price = calculatePrice(quality)

    setIsGeneratingCover(true)
    const coverPromise = fetch("/api/generate-cover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `${randomName} hip hop album cover, urban street art, graffiti, neon lights, vinyl record`,
      }),
    })
      .then((res) => res.json())
      .catch((err) => {
        console.error("[v0] Failed to generate cover:", err)
        return { imageUrl: "/placeholder.svg?height=400&width=400" }
      })

    const interval = setInterval(async () => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsCreating(false)

          coverPromise.then((coverData) => {
            const newBeat: Beat = {
              id: Date.now().toString(),
              name: randomName,
              price: price,
              quality: quality,
              cover: coverData.imageUrl,
              createdAt: Date.now(),
            }
            setCurrentBeat(newBeat)
            setIsGeneratingCover(false)
            saveBeat(newBeat) // Saving the new beat to storage
          })

          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleSellBeat = () => {
    if (progress === 100 && currentBeat && !isGeneratingCover) {
      setGameState((prev) => ({
        ...prev,
        beats: [currentBeat, ...prev.beats],
        money: prev.money + currentBeat.price,
        reputation: prev.reputation + Math.floor(currentBeat.quality / 10),
        totalBeatsCreated: prev.totalBeatsCreated + 1,
        totalMoneyEarned: prev.totalMoneyEarned + currentBeat.price,
        stageProgress: Math.min(100, prev.stageProgress + 5),
      }))
      setProgress(0)
      setCurrentBeat(null)
    }
  }

  const handleSellAll = () => {
    const totalValue = gameState.beats.reduce((sum, beat) => sum + beat.price, 0)
    const totalRep = gameState.beats.reduce((sum, beat) => sum + Math.floor(beat.quality / 10), 0)

    setGameState((prev) => ({
      ...prev,
      money: prev.money + totalValue,
      reputation: prev.reputation + totalRep,
      beats: [],
    }))
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
              {progress === 100 && currentBeat ? (
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
                  : progress === 100 && currentBeat
                    ? `${currentBeat.name} готов!`
                    : "Готов создать новый хит"}
              </p>
              {progress === 100 && currentBeat && (
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="text-muted-foreground">Качество: {currentBeat.quality}%</span>
                  <span className="text-primary font-bold">${currentBeat.price}</span>
                </div>
              )}
              {isCreating && (
                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{progress}%</p>
                </div>
              )}
            </div>

            {progress === 100 ? (
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 shadow-md active:scale-95 transition-transform"
                onClick={handleSellBeat}
                disabled={isGeneratingCover}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isGeneratingCover ? "Генерирую обложку..." : `Продать бит ($${currentBeat?.price})`}
              </Button>
            ) : (
              <div className="w-full space-y-2">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 shadow-md active:scale-95 transition-transform"
                  onClick={startCreating}
                  disabled={isCreating || gameState.energy < ENERGY_COST}
                >
                  {isCreating ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Создаю...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Начать создание (-{ENERGY_COST} энергии)
                    </>
                  )}
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
            <p className="text-2xl font-bold text-primary">{gameState.totalBeatsCreated}</p>
            <p className="text-xs text-muted-foreground mt-1">Битов создано</p>
          </Card>
          <Card className="p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-secondary">${gameState.totalMoneyEarned}</p>
            <p className="text-xs text-muted-foreground mt-1">Заработано</p>
          </Card>
          <Card className="p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-accent">{gameState.reputation}</p>
            <p className="text-xs text-muted-foreground mt-1">Репутация</p>
          </Card>
        </div>

        {gameState.beats.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Твои биты</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSellAll}
                className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 hover:bg-primary/20 active:scale-95 transition-transform"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Продать всё (${gameState.beats.reduce((sum, beat) => sum + beat.price, 0)})
              </Button>
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
