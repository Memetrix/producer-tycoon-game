"use client"

import { ArrowLeft, BookOpen, GraduationCap, Sparkles, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"
import type React from "react"

interface UpgradesScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
}

export function UpgradesScreen({ gameState, setGameState, onNavigate }: UpgradesScreenProps) {
  const handlePurchase = (upgradeId: string, price: number) => {
    if (gameState.money < price) {
      alert("Недостаточно денег!")
      return
    }

    setGameState((prev) => ({
      ...prev,
      money: prev.money - price,
      purchasedUpgrades: [...prev.purchasedUpgrades, upgradeId],
    }))

    alert("Курс куплен! Бонусы активированы!")
  }

  const realUpgrades = [
    {
      id: "basics",
      name: "Книга: Основы продакшена",
      description: "Изучи фундаментальные техники производства музыки",
      price: 500,
      bonus: "+20% скорость производства, открой новые стили битов",
      icon: BookOpen,
      color: "primary",
      available: true,
      purchased: gameState.purchasedUpgrades.includes("basics"),
    },
    {
      id: "homestudio",
      name: "Мини-курс: Домашняя студия",
      description: "Полное руководство по настройке профессиональной студии",
      price: 2500,
      bonus: "Открой новые жанры, +30% бонус качества треков",
      icon: GraduationCap,
      color: "secondary",
      available: gameState.currentStage >= 2,
      requirement: "Достигни этапа 2: Домашняя студия",
      purchased: gameState.purchasedUpgrades.includes("homestudio"),
    },
    {
      id: "professional",
      name: "Курс: Профессиональный продюсер",
      description: "Освой профессиональные техники мировых продюсеров",
      price: 15000,
      bonus: "Открой режим реального продюсера, +50% дохода, доступ к топ-артистам",
      icon: Trophy,
      color: "accent",
      available: gameState.currentStage >= 3,
      requirement: "Достигни этапа 3: Первый контракт",
      purchased: gameState.purchasedUpgrades.includes("professional"),
    },
  ]

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
          <h1 className="text-lg font-semibold">Обучение</h1>
          <p className="text-xs text-muted-foreground">Реальные знания для игрового успеха</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
        <Card className="p-6 bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground shadow-xl">
          <div className="text-center space-y-3">
            <div className="text-4xl">🎓</div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Прокачай свои навыки</h2>
              <p className="text-sm opacity-90 leading-relaxed">
                Покупай реальные курсы и книги по продакшену, чтобы открыть мощные бонусы в игре и стать настоящим
                профессионалом
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Реальное обучение = Игровой успех</span>
            </div>
          </div>
        </Card>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Доступные курсы</h3>
          <div className="space-y-3">
            {realUpgrades.map((upgrade, i) => {
              const Icon = upgrade.icon
              const colorClass =
                upgrade.color === "primary"
                  ? "text-primary"
                  : upgrade.color === "secondary"
                    ? "text-secondary"
                    : "text-accent"
              const bgClass =
                upgrade.color === "primary"
                  ? "bg-primary/20"
                  : upgrade.color === "secondary"
                    ? "bg-secondary/20"
                    : "bg-accent/20"
              const gradientClass =
                upgrade.color === "primary"
                  ? "from-primary/20 to-primary/5"
                  : upgrade.color === "secondary"
                    ? "from-secondary/20 to-secondary/5"
                    : "from-accent/20 to-accent/5"

              return (
                <Card
                  key={i}
                  className={`p-4 bg-gradient-to-br ${gradientClass} shadow-md ${!upgrade.available || upgrade.purchased ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${colorClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{upgrade.name}</p>
                          <p className="text-xs text-muted-foreground">{upgrade.description}</p>
                        </div>
                        {!upgrade.available && (
                          <span className="text-xs bg-muted px-2 py-1 rounded-lg whitespace-nowrap">🔒</span>
                        )}
                        {upgrade.purchased && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-lg whitespace-nowrap">
                            ✓ Куплено
                          </span>
                        )}
                      </div>

                      <div className="mb-3 p-2 rounded-lg bg-background/50 border border-border">
                        <p className="text-xs font-medium">
                          <span className="text-muted-foreground">Игровой бонус: </span>
                          <span className={colorClass}>{upgrade.bonus}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className={`text-lg font-bold ${colorClass}`}>{upgrade.price}</p>
                          {!upgrade.available && <p className="text-xs text-muted-foreground">{upgrade.requirement}</p>}
                        </div>
                        <Button
                          size="sm"
                          variant={upgrade.available && !upgrade.purchased ? "default" : "outline"}
                          disabled={!upgrade.available || upgrade.purchased}
                          onClick={() => handlePurchase(upgrade.id, upgrade.price)}
                          className={
                            upgrade.available && !upgrade.purchased
                              ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground active:scale-95 transition-transform"
                              : ""
                          }
                        >
                          {upgrade.purchased ? "Куплено" : upgrade.available ? "Купить" : "Закрыто"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <Card className="p-4 border-primary/30 shadow-md">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Зачем покупать курсы?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Изучи реальные навыки продакшена от профессионалов индустрии</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Открой эксклюзивный контент, новые жанры и мощные бонусы в игре</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Ускорь свой путь от уличного битмейкера до владельца лейбла</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Получи доступ к режиму реального продюсера с уникальными челленджами</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
