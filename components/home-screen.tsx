"use client"

import type React from "react"

import { Music2, Zap, Users, DollarSign, Star, Bolt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"

interface HomeScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
}

export function HomeScreen({ gameState, setGameState, onNavigate }: HomeScreenProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50 backdrop-blur-xl bg-card/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{gameState.playerName || "Producer Tycoon"}</h1>
            <p className="text-sm text-muted-foreground">Путь к славе: Уличный битмейкер</p>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg ring-2 ring-primary/30">
            {gameState.playerAvatar ? (
              <img
                src={gameState.playerAvatar || "/placeholder.svg"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Music2 className="w-6 h-6 text-primary-foreground" />
              </div>
            )}
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
            <p className="text-lg font-bold text-accent">{gameState.energy}/100</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
        <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/10 border-primary/30 shadow-lg animate-slide-in-up">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Этап {gameState.currentStage}: Улица</h2>
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

          <Button
            className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md active:scale-95 transition-transform"
            size="lg"
            onClick={() => onNavigate("stage")}
          >
            <Music2 className="w-4 h-4 mr-2" />
            Создать бит
          </Button>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card
            className="p-4 cursor-pointer hover:bg-card/80 active:scale-95 transition-all shadow-md"
            onClick={() => onNavigate("studio")}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Студия</p>
                <p className="text-xs text-muted-foreground">Улучшить оборудование</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:bg-card/80 active:scale-95 transition-all shadow-md"
            onClick={() => onNavigate("artists")}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="font-semibold">Артисты</p>
                <p className="text-xs text-muted-foreground">Найти таланты</p>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Последняя активность
          </h3>
          <div className="space-y-2">
            {gameState.beats.slice(0, 3).map((beat, i) => (
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
  )
}
