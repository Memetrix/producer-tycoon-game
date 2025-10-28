"use client"

import { ArrowLeft, Headphones, Mic, Monitor, Zap, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"
import type React from "react"
import { saveEquipmentUpgrade } from "@/lib/game-storage"
import { EQUIPMENT_TIERS, getEquipmentTier, getReputationTier } from "@/lib/game-state"
import { DesktopLayout } from "@/components/desktop-layout"

interface StudioScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
}

const EQUIPMENT_IMAGES = {
  phone: {
    0: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/phone-0.png",
    1: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/phone-1.png",
    2: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/phone-2.png",
    3: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/phone-3.png",
    4: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/phone-4.png",
    5: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/phone-5.png",
    6: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/phone-6.png",
    7: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/phone-7.png",
    8: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/phone-8.png",
    9: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/phone-9.png",
    10: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/phone-10.png",
  },
  headphones: {
    0: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/headphones-0.png",
    1: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/headphones-1.png",
    2: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/headphones-2.png",
    3: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/headphones-3.png",
    4: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/headphones-4.png",
    5: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/headphones-5.png",
    6: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/headphones-6.png",
    7: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/headphones-7.png",
    8: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/headphones-8.png",
    9: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/headphones-9.png",
    10: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/headphones-10.png",
  },
  microphone: {
    0: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/microphone-0.png",
    1: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/microphone-1.png",
    2: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/microphone-2.png",
    3: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/microphone-3.png",
    4: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/microphone-4.png",
    5: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/microphone-5.png",
    6: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/microphone-6.png",
    7: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/microphone-7.png",
    8: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/microphone-8.png",
    9: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/microphone-9.png",
    10: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/microphone-10.png",
  },
  computer: {
    0: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/computer-0.png",
    1: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/computer-1.png",
    2: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/computer-2.png",
    3: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/computer-3.png",
    4: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/computer-4.png",
    5: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/computer-5.png",
    6: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/computer-6.png",
    7: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/computer-7.png",
    8: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/computer-8.png",
    9: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/computer-9.png",
    10: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/computer-10.png",
  },
  midi: {
    0: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/midi-0.png",
    1: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/midi-1.png",
    2: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/midi-2.png",
    3: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/midi-3.png",
    4: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/midi-4.png",
    5: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/midi-5.png",
    6: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/midi-6.png",
    7: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/midi-7.png",
    8: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/midi-8.png",
    9: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/midi-9.png",
    10: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/midi-10.png",
  },
  audioInterface: {
    0: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/audio-interface-0.png",
    1: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/audio-interface-1.png",
    2: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/audio-interface-2.png",
    3: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/audio-interface-3.png",
    4: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/audio-interface-4.png",
    5: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/audio-interface-5.png",
    6: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/audio-interface-6.png",
    7: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/audio-interface-7.png",
    8: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/audio-interface-8.png",
    9: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/audio-interface-9.png",
    10: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/audio-interface-10.png",
  },
}

export function StudioScreen({ gameState, setGameState, onNavigate }: StudioScreenProps) {
  const getUpgradeCost = (basePrice: number, level: number) => {
    return Math.floor(basePrice * Math.pow(1.4, level))
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
      name: EQUIPMENT_TIERS.phone.name,
      level: gameState.equipment.phone,
      maxLevel: 10,
      basePrice: 80,
      bonus: "+2 качество/уровень",
      icon: Monitor,
      color: "primary",
    },
    {
      key: "headphones" as keyof GameState["equipment"],
      name: EQUIPMENT_TIERS.headphones.name,
      level: gameState.equipment.headphones,
      maxLevel: 10,
      basePrice: 120,
      bonus: "+2 качество/уровень",
      icon: Headphones,
      color: "secondary",
    },
    {
      key: "microphone" as keyof GameState["equipment"],
      name: EQUIPMENT_TIERS.microphone.name,
      level: gameState.equipment.microphone,
      maxLevel: 10,
      basePrice: 200,
      bonus: "+3 качество/уровень",
      icon: Mic,
      color: "accent",
    },
    {
      key: "computer" as keyof GameState["equipment"],
      name: EQUIPMENT_TIERS.computer.name,
      level: gameState.equipment.computer,
      maxLevel: 10,
      basePrice: 400,
      bonus: "+5 качество/уровень",
      icon: Home,
      color: "primary",
    },
    {
      key: "midi" as keyof GameState["equipment"],
      name: "MIDI",
      level: gameState.equipment.midi || 0,
      maxLevel: 10,
      basePrice: 100,
      bonus: "+2 качество/уровень",
      icon: Zap,
      color: "secondary",
    },
    {
      key: "audioInterface" as keyof GameState["equipment"],
      name: "Audio Interface",
      level: gameState.equipment.audioInterface || 0,
      maxLevel: 10,
      basePrice: 250,
      bonus: "+4 качество/уровень",
      icon: Zap,
      color: "accent",
    },
  ]

  const totalQualityBonus = Math.floor(
    (gameState.equipment.phone * 2 +
      gameState.equipment.headphones * 2 +
      gameState.equipment.microphone * 3 +
      gameState.equipment.computer * 5 +
      (gameState.equipment.midi || 0) * 2 +
      (gameState.equipment.audioInterface || 0) * 4) *
      0.3,
  )

  const currentStage = getReputationTier(gameState.reputation)

  return (
    <DesktopLayout maxWidth="2xl">
      <div className="flex flex-col h-screen lg:h-auto">
        <div className="lg:hidden p-4 border-b border-border/50 flex items-center gap-3 backdrop-blur-xl bg-card/80">
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

        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Студия</h1>
            <p className="text-muted-foreground">Улучшай оборудование для создания качественных битов</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">${gameState.money.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Баланс</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-0 pb-20 lg:pb-0 space-y-4">
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
                  {currentStage === 1 ? "Уличная установка" : "Домашняя студия"}
                </h2>
                <p className="text-sm text-muted-foreground">Этап {currentStage}</p>
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
            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              {equipment.map((item, i) => {
                const Icon = item.icon
                const cost = getUpgradeCost(item.basePrice, item.level)
                const colorClass =
                  item.color === "primary"
                    ? "text-primary"
                    : item.color === "secondary"
                      ? "text-secondary"
                      : "text-accent"

                const currentTier = getEquipmentTier(item.key, item.level)
                const nextTier = getEquipmentTier(item.key, item.level + 1)

                const currentImage =
                  EQUIPMENT_IMAGES[item.key]?.[item.level as keyof (typeof EQUIPMENT_IMAGES)[typeof item.key]] ||
                  "/placeholder.svg"

                return (
                  <Card key={i} className="p-4 shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                        <img
                          src={currentImage || "/placeholder.svg"}
                          alt={currentTier?.name || item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm">{currentTier?.name || item.name}</p>
                            <p className="text-xs text-muted-foreground">{currentTier?.description || item.bonus}</p>
                          </div>
                        </div>

                        <div className="space-y-1 mb-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Уровень {item.level}/{item.maxLevel}
                            </span>
                            <span className={colorClass}>
                              {item.level === item.maxLevel
                                ? "МАКС"
                                : nextTier
                                  ? `${nextTier.name}: $${cost}`
                                  : `$${cost}`}
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
                          className="w-full h-auto py-2 whitespace-normal text-xs leading-tight active:scale-95 transition-transform"
                          disabled={item.level === item.maxLevel || gameState.money < cost}
                          onClick={() => handleUpgrade(item.key, item.basePrice)}
                        >
                          {item.level === item.maxLevel ? "Максимум" : `Купить ($${cost})`}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </DesktopLayout>
  )
}
