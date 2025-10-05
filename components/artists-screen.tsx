"use client"

import { ArrowLeft, Users, DollarSign, Zap, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"
import {
  ARTISTS_CONFIG,
  getArtistUpgradeCost,
  getArtistIncome,
  getArtistEnergyBonus,
  getTotalPassiveIncome,
  getTotalEnergyBonus,
} from "@/lib/game-state"
import { saveArtistUpgrade } from "@/lib/game-storage"
import type React from "react"

interface ArtistsScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
}

export function ArtistsScreen({ gameState, setGameState, onNavigate }: ArtistsScreenProps) {
  const handleUpgrade = async (artistId: keyof GameState["artists"]) => {
    const currentLevel = gameState.artists[artistId]
    const cost = getArtistUpgradeCost(artistId, currentLevel)

    const artistConfig = ARTISTS_CONFIG[artistId]
    if (artistConfig.requiresReputation && gameState.reputation < artistConfig.requiresReputation) {
      alert(`Требуется ${artistConfig.requiresReputation} репутации!`)
      return
    }

    if (currentLevel >= 5) {
      alert("Максимальный уровень!")
      return
    }

    if (gameState.money < cost) {
      alert("Недостаточно денег!")
      return
    }

    const newLevel = currentLevel + 1

    // Save to database
    const success = await saveArtistUpgrade(artistId, newLevel)
    if (!success) {
      alert("Ошибка сохранения!")
      return
    }

    setGameState((prev) => ({
      ...prev,
      money: prev.money - cost,
      artists: {
        ...prev.artists,
        [artistId]: newLevel,
      },
      totalCollabs: currentLevel === 0 ? prev.totalCollabs + 1 : prev.totalCollabs,
    }))
  }

  const totalIncome = getTotalPassiveIncome(gameState.artists)
  const totalEnergyBonus = getTotalEnergyBonus(gameState.artists)
  const hiredCount = Object.values(gameState.artists).filter((level) => level > 0).length

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b border-border/50 flex items-center gap-3 backdrop-blur-xl bg-card/80">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("home")}
          className="active:scale-95 transition-transform text-foreground hover:text-foreground/80"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Артисты</h1>
          <p className="text-xs text-muted-foreground">Найми таланты для пассивного дохода</p>
        </div>
        <div className="flex items-center gap-1 text-secondary">
          <Users className="w-4 h-4" />
          <span className="text-sm font-bold">{hiredCount}/4</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 text-center shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="w-4 h-4 text-primary" />
              <p className="text-xl font-bold text-primary">{totalIncome * 60}</p>
            </div>
            <p className="text-xs text-muted-foreground">$/час</p>
          </Card>
          <Card className="p-3 text-center shadow-md bg-gradient-to-br from-secondary/10 to-secondary/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-secondary" />
              <p className="text-xl font-bold text-secondary">+{totalEnergyBonus}%</p>
            </div>
            <p className="text-xs text-muted-foreground">Энергия</p>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Доступные артисты
          </h3>
          <div className="space-y-3">
            {Object.entries(ARTISTS_CONFIG).map(([artistId, artist]) => {
              const currentLevel = gameState.artists[artistId as keyof GameState["artists"]]
              const upgradeCost = getArtistUpgradeCost(artistId as keyof typeof ARTISTS_CONFIG, currentLevel)
              const currentIncome = getArtistIncome(artistId as keyof typeof ARTISTS_CONFIG, currentLevel)
              const nextIncome = getArtistIncome(artistId as keyof typeof ARTISTS_CONFIG, currentLevel + 1)
              const currentEnergyBonus = getArtistEnergyBonus(artistId as keyof typeof ARTISTS_CONFIG, currentLevel)
              const nextEnergyBonus = getArtistEnergyBonus(artistId as keyof typeof ARTISTS_CONFIG, currentLevel + 1)

              const isLocked = artist.requiresReputation && gameState.reputation < artist.requiresReputation
              const isMaxLevel = currentLevel >= 5

              return (
                <Card key={artistId} className={`p-4 shadow-md ${isLocked ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 shadow-md bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                      <img
                        src={artist.avatar || "/placeholder.svg"}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                      {currentLevel > 0 && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground border-2 border-card">
                          {currentLevel}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{artist.name}</p>
                          <p className="text-xs text-muted-foreground">{artist.genre}</p>
                        </div>
                        {isLocked && <span className="text-xs bg-muted px-2 py-1 rounded-lg">🔒</span>}
                        {currentLevel > 0 && !isMaxLevel && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-lg">
                            Уровень {currentLevel}
                          </span>
                        )}
                        {isMaxLevel && (
                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-lg">MAX</span>
                        )}
                      </div>

                      {currentLevel > 0 && (
                        <div className="bg-muted/50 rounded-lg p-2 mb-2 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Доход:</span>
                            <span className="font-semibold text-primary">${currentIncome * 60}/час</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Энергия:</span>
                            <span className="font-semibold text-secondary">+{currentEnergyBonus}%</span>
                          </div>
                        </div>
                      )}

                      {!isMaxLevel && currentLevel > 0 && (
                        <div className="bg-accent/10 rounded-lg p-2 mb-2 space-y-1 border border-accent/20">
                          <p className="text-xs font-semibold text-accent mb-1">Следующий уровень:</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Доход:</span>
                            <span className="font-semibold text-primary">
                              ${currentIncome * 60} → ${nextIncome * 60}/час
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Энергия:</span>
                            <span className="font-semibold text-secondary">
                              +{currentEnergyBonus}% → +{nextEnergyBonus}%
                            </span>
                          </div>
                        </div>
                      )}

                      <Button
                        size="sm"
                        className="w-full active:scale-95 transition-transform"
                        variant={isLocked ? "outline" : "default"}
                        disabled={isLocked || isMaxLevel}
                        onClick={() => handleUpgrade(artistId as keyof GameState["artists"])}
                      >
                        {isLocked ? (
                          `Требуется ${artist.requiresReputation} репутации`
                        ) : isMaxLevel ? (
                          "Максимальный уровень"
                        ) : currentLevel === 0 ? (
                          `Нанять (${upgradeCost})`
                        ) : (
                          <span className="flex items-center justify-center gap-1">
                            <ChevronUp className="w-4 h-4" />
                            Улучшить (${upgradeCost})
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <Card className="p-4 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30 shadow-md">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="font-semibold text-sm mb-1">Пассивный доход</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Артисты генерируют пассивный доход каждый час пока ты в игре, или до 4 часов когда ты оффлайн.
                Возвращайся каждые 4 часа чтобы забрать заработок!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
