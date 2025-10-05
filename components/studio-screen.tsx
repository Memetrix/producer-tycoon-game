"use client"

import { ArrowLeft, Headphones, Mic, Monitor, Zap, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"
import type React from "react"
import { saveEquipmentUpgrade } from "@/lib/game-storage"

interface StudioScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
}

export function StudioScreen({ gameState, setGameState, onNavigate }: StudioScreenProps) {
  const getUpgradeCost = (basePrice: number, level: number) => {
    return Math.floor(basePrice * Math.pow(1.5, level))
  }

  const handleUpgrade = async (equipmentKey: keyof GameState["equipment"], basePrice: number) => {
    const currentLevel = gameState.equipment[equipmentKey]
    const cost = getUpgradeCost(basePrice, currentLevel)

    if (gameState.money < cost) {
      alert("Недостаточно денег!")
      return
    }

    const newLevel = currentLevel + 1

    setGameState((prev) => ({
      ...prev,
      money: prev.money - cost,
      equipment: {
        ...prev.equipment,
        [equipmentKey]: newLevel,
      },
    }))

    await saveEquipmentUpgrade(equipmentKey, newLevel)
  }

  const equipment = [
    {
      key: "phone" as keyof GameState["equipment"],
      name: "Телефон (FL Studio Mobile)",
      level: gameState.equipment.phone,
      maxLevel: 5,
      basePrice: 100,
      bonus: "+5% качество",
      icon: Monitor,
      color: "primary",
      image: "/smartphone-with-fl-studio-mobile-music-production-.jpg",
    },
    {
      key: "headphones" as keyof GameState["equipment"],
      name: "Студийные наушники",
      level: gameState.equipment.headphones,
      maxLevel: 5,
      basePrice: 150,
      bonus: "+5% качество",
      icon: Headphones,
      color: "secondary",
      image: "/black-studio-headphones-for-music-production.jpg",
    },
    {
      key: "microphone" as keyof GameState["equipment"],
      name: "USB микрофон",
      level: gameState.equipment.microphone,
      maxLevel: 5,
      basePrice: 250,
      bonus: "+10% качество",
      icon: Mic,
      color: "accent",
      image: "/usb-condenser-microphone-for-recording-vocals.jpg",
    },
    {
      key: "computer" as keyof GameState["equipment"],
      name: "Домашняя студия",
      level: gameState.equipment.computer,
      maxLevel: 5,
      basePrice: 500,
      bonus: "+15% качество",
      icon: Home,
      color: "primary",
      image: "/home-music-studio-setup-with-equipment-and-led-lig.jpg",
    },
  ]

  const totalQualityBonus =
    gameState.equipment.phone * 5 +
    gameState.equipment.headphones * 5 +
    gameState.equipment.microphone * 10 +
    gameState.equipment.computer * 15

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
          <h1 className="text-lg font-semibold">Студия</h1>
          <p className="text-xs text-muted-foreground">Улучши оборудование для роста</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">${gameState.money}</p>
          <p className="text-xs text-muted-foreground">Баланс</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
        <Card className="p-6 bg-gradient-to-br from-card to-primary/10 border-primary/30 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 opacity-20">
            <img
              src="/home-music-studio-setup-with-equipment-and-led-lig.jpg"
              alt="Studio"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative text-center space-y-3">
            <div className="text-6xl">🎧</div>
            <div>
              <h2 className="text-xl font-semibold">
                {gameState.currentStage === 1 ? "Уличная установка" : "Домашняя студия"}
              </h2>
              <p className="text-sm text-muted-foreground">Этап {gameState.currentStage}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Бонус качества:</span>
              <span className="font-semibold text-primary">+{totalQualityBonus}%</span>
            </div>
          </div>
        </Card>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Оборудование</h3>
          <div className="space-y-3">
            {equipment.map((item, i) => {
              const Icon = item.icon
              const cost = getUpgradeCost(item.basePrice, item.level)
              const colorClass =
                item.color === "primary"
                  ? "text-primary"
                  : item.color === "secondary"
                    ? "text-secondary"
                    : "text-accent"

              return (
                <Card key={i} className="p-4 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.bonus}</p>
                        </div>
                      </div>

                      <div className="space-y-1 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Уровень {item.level}/{item.maxLevel}
                          </span>
                          <span className={colorClass}>
                            {item.level === item.maxLevel ? "МАКС" : `Далее: $${cost}`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${
                              item.color === "primary"
                                ? "from-primary to-primary/60"
                                : item.color === "secondary"
                                  ? "from-secondary to-secondary/60"
                                  : "from-accent to-accent/60"
                            }`}
                            style={{ width: `${(item.level / item.maxLevel) * 100}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full active:scale-95 transition-transform"
                        disabled={item.level === item.maxLevel || gameState.money < cost}
                        onClick={() => handleUpgrade(item.key, item.basePrice)}
                      >
                        {item.level === item.maxLevel ? "Максимум" : `Улучшить ($${cost})`}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <Card className="p-4 bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30 shadow-md">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🏆</div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Путь к успеху</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Улучшай оборудование, создавай качественные биты и зарабатывай репутацию. Каждый апгрейд приближает тебя
                к статусу мирового продюсера!
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Следующий этап:</span>
                <span className="font-semibold text-secondary">
                  {gameState.currentStage === 1 ? "Домашняя студия" : "Первый контракт"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
