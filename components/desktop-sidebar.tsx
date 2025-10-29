"use client"

import { Home, Music, Zap, Users, Target, Trophy, ShoppingBag, TrendingUp, Settings } from "lucide-react"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"

interface DesktopSidebarProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
  gameState: GameState
}

export function DesktopSidebar({ currentScreen, onNavigate, gameState }: DesktopSidebarProps) {
  const navItems = [
    { id: "home" as Screen, icon: Home, label: "Главная" },
    { id: "stage" as Screen, icon: Music, label: "Создать" },
    { id: "studio" as Screen, icon: Zap, label: "Студия" },
    { id: "artists" as Screen, icon: Users, label: "Артисты" },
    { id: "contracts" as Screen, icon: Target, label: "Контракты" },
    { id: "skills" as Screen, icon: TrendingUp, label: "Навыки" },
    { id: "upgrades" as Screen, icon: Settings, label: "Улучшения" },
    { id: "leaderboards" as Screen, icon: Trophy, label: "Рейтинг" },
    { id: "shop" as Screen, icon: ShoppingBag, label: "Магазин" },
  ]

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-64 lg:border-r lg:border-border/50 lg:bg-card/95 lg:backdrop-blur-xl lg:z-40">
      {/* Player Profile Section */}
      <button
        onClick={() => onNavigate("profile")}
        className="p-6 border-b border-border/50 w-full text-left hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50">
            <img
              src={gameState.playerAvatar || "/placeholder.svg?height=48&width=48"}
              alt={gameState.playerName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{gameState.playerName}</h3>
            <p className="text-xs text-muted-foreground">Уровень {Math.floor(gameState.reputation / 500) + 1}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-background/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Деньги</p>
            <p className="text-sm font-bold text-primary">${gameState.money.toLocaleString()}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Энергия</p>
            <p className="text-sm font-bold text-secondary">{Math.round(gameState.energy)}</p>
          </div>
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentScreen === item.id

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">Producer Tycoon v1.0</p>
      </div>
    </aside>
  )
}
