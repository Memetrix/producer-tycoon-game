"use client"

import React from "react"
import { useEffect } from "react"

import { Music2, Zap, Users, DollarSign, Star, Bolt, Trophy, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"
import { getStageTitle, getReputationTier } from "@/lib/game-state"
import { OfflineEarningsModal } from "@/components/offline-earnings-modal"
import { DesktopLayout } from "@/components/desktop-layout"

interface HomeScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
  offlineEarnings: { earnings: number; minutesAway: number } | null
  onOfflineEarningsShown: () => void
}

export function HomeScreen({
  gameState,
  setGameState,
  onNavigate,
  offlineEarnings,
  onOfflineEarningsShown,
}: HomeScreenProps) {
  const [showOfflineModal, setShowOfflineModal] = React.useState(false)

  const currentStage = getReputationTier(gameState.reputation)
  const currentStageTitle = getStageTitle(currentStage)

  useEffect(() => {
    if (offlineEarnings && offlineEarnings.earnings > 0) {
      setShowOfflineModal(true)
      onOfflineEarningsShown()
    }
  }, [offlineEarnings, onOfflineEarningsShown])

  const handleCloseOfflineModal = () => {
    setShowOfflineModal(false)
  }

  return (
    <DesktopLayout maxWidth="2xl">
      <div className="flex flex-col h-full pb-20 lg:pb-0">
        {showOfflineModal && offlineEarnings && (
          <OfflineEarningsModal
            earnings={offlineEarnings.earnings}
            minutesAway={offlineEarnings.minutesAway}
            onClose={handleCloseOfflineModal}
          />
        )}

        <div className="lg:hidden p-4 border-b border-border/50 backdrop-blur-xl bg-card/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg ring-2 ring-primary/30 flex-shrink-0">
              {gameState.playerAvatar ? (
                <img
                  src={gameState.playerAvatar || "/placeholder.svg"}
                  alt={`${gameState.playerName} avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <svg class="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                      </svg>
                    </div>
                  `
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Music2 className="w-6 h-6 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold tracking-tight truncate text-foreground">
                {gameState.playerName || "Producer"}
              </h1>
              <p className="text-sm text-muted-foreground">{currentStageTitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Money */}
            <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">Деньги</span>
              </div>
              <p className="text-lg font-bold text-primary">${gameState.money}</p>
            </div>

            {/* Reputation */}
            <div className="bg-secondary/10 rounded-xl p-3 border border-secondary/20">
              <div className="flex items-center gap-1.5 mb-1">
                <Star className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs text-muted-foreground">Репутация</span>
              </div>
              <p className="text-lg font-bold text-secondary">{gameState.reputation}</p>
            </div>

            {/* Energy */}
            <div className="bg-accent/10 rounded-xl p-3 border border-accent/20">
              <div className="flex items-center gap-1.5 mb-1">
                <Bolt className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs text-muted-foreground">Энергия</span>
              </div>
              <p className="text-lg font-bold text-accent">
                {Math.round(gameState.energy)}/{(() => {
                  const ENERGY_CONFIG = { BASE_MAX_ENERGY: 150 }
                  let maxEnergy = ENERGY_CONFIG.BASE_MAX_ENERGY
                  if (gameState.musicStyle === "electronic") maxEnergy += 30
                  if (gameState.startingBonus === "energizer") maxEnergy += 50
                  return maxEnergy
                })()}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:block mb-6">
          <h1 className="text-3xl font-bold mb-2">Добро пожаловать, {gameState.playerName}!</h1>
          <p className="text-muted-foreground">{currentStageTitle}</p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Деньги</span>
              </div>
              <p className="text-2xl font-bold text-primary">${gameState.money.toLocaleString()}</p>
            </div>

            <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-secondary" />
                <span className="text-sm text-muted-foreground">Репутация</span>
              </div>
              <p className="text-2xl font-bold text-secondary">{gameState.reputation.toLocaleString()}</p>
            </div>

            <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Bolt className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Энергия</span>
              </div>
              <p className="text-2xl font-bold text-accent">
                {Math.round(gameState.energy)}/{(() => {
                  const ENERGY_CONFIG = { BASE_MAX_ENERGY: 150 }
                  let maxEnergy = ENERGY_CONFIG.BASE_MAX_ENERGY
                  if (gameState.musicStyle === "electronic") maxEnergy += 30
                  if (gameState.startingBonus === "energizer") maxEnergy += 50
                  return maxEnergy
                })()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-4 pb-4">
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
            {/* Left Column */}
            <div className="space-y-4">
              <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/10 border-primary/30 shadow-lg animate-slide-in-up">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Этап {currentStage}: Улица</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ты начинаешь с нуля. Создавай биты на телефоне, продавай местным рэперам и зарабатывай репутацию.
                      Впереди путь от уличного битмейкера до мирового продюсера.
                    </p>
                  </div>
                  <div className="text-3xl animate-float">🎧</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">До домашней студии</span>
                    <span className="font-semibold text-primary">{gameState.stageProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse-glow rounded-full transition-all duration-300"
                      style={{ width: `${gameState.stageProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    className="col-span-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md active:scale-95 transition-transform"
                    size="lg"
                    onClick={() => onNavigate("stage")}
                  >
                    <Music2 className="w-4 h-4 mr-2" />
                    Создать бит
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border-primary/30 active:scale-95 transition-transform"
                    onClick={() => onNavigate("shop")}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Магазин
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-accent/10 hover:bg-accent/20 border-accent/30 active:scale-95 transition-transform"
                    onClick={() => onNavigate("leaderboards")}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Рейтинг
                  </Button>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card
                  className="p-4 cursor-pointer hover:bg-card/80 active:scale-95 transition-all shadow-md"
                  onClick={() => onNavigate("studio")}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Студия</p>
                      <p className="text-xs text-muted-foreground">Оборудование</p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-4 cursor-pointer hover:bg-card/80 active:scale-95 transition-all shadow-md"
                  onClick={() => onNavigate("artists")}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Артисты</p>
                      <p className="text-xs text-muted-foreground">Таланты</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                  Последняя активность
                </h3>
                <div className="space-y-2">
                  {gameState.beats.slice(0, 5).map((beat, i) => (
                    <Card key={beat.id} className="p-3 flex items-center gap-3 shadow-sm">
                      <span className="text-2xl">💰</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          Продал бит "{beat.name}" за ${beat.price}
                        </p>
                        <p className="text-xs text-muted-foreground">Только что</p>
                      </div>
                    </Card>
                  ))}
                  {gameState.beats.length === 0 && (
                    <Card className="p-3 flex items-center gap-3 shadow-sm">
                      <span className="text-2xl">🎵</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Начни создавать биты!</p>
                        <p className="text-xs text-muted-foreground">Твой путь к славе начинается здесь</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopLayout>
  )
}
