"use client"

import { ArrowLeft, Star, Zap, DollarSign, TrendingUp, Gift, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"
import { useState } from "react"
import {
  TELEGRAM_STARS_PRODUCTS,
  purchaseTelegramStarsProduct,
  isTelegramStarsAvailable,
  type TelegramStarsProduct,
} from "@/lib/telegram-stars"
import { saveGameState } from "@/lib/game-storage"

interface ShopScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
}

export function ShopScreen({ gameState, setGameState, onNavigate }: ShopScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<"energy" | "money" | "reputation" | "combo">("combo")
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const isTelegramAvailable = isTelegramStarsAvailable()

  const handlePurchase = async (product: TelegramStarsProduct) => {
    setPurchasing(product.id)

    try {
      const result = await purchaseTelegramStarsProduct(product.id)

      if (result.success && result.reward) {
        // Apply rewards to game state
        const updatedState = {
          ...gameState,
          money: gameState.money + (result.reward.money || 0),
          energy: Math.min(
            gameState.energy + (result.reward.energy || 0),
            200, // Max energy cap (TODO: calculate properly)
          ),
          reputation: gameState.reputation + (result.reward.reputation || 0),
        }

        setGameState(updatedState)
        await saveGameState(updatedState)

        alert(`✅ Покупка успешна!\n\n${getRewardText(result.reward)}`)
      } else {
        alert(`❌ Ошибка покупки: ${result.error || "Неизвестная ошибка"}`)
      }
    } catch (error) {
      console.error("[Shop] Purchase error:", error)
      alert("❌ Не удалось завершить покупку")
    } finally {
      setPurchasing(null)
    }
  }

  const getRewardText = (reward: TelegramStarsProduct["reward"]) => {
    const parts = []
    if (reward.money) parts.push(`💵 +$${reward.money}`)
    if (reward.energy) parts.push(`⚡ +${reward.energy} энергии`)
    if (reward.reputation) parts.push(`🌟 +${reward.reputation} репутации`)
    return parts.join("\n")
  }

  const filterProducts = (category: typeof selectedCategory) => {
    return TELEGRAM_STARS_PRODUCTS.filter((product) => {
      if (category === "energy") return product.reward.energy && !product.reward.money
      if (category === "money") return product.reward.money && !product.reward.energy
      if (category === "reputation") return product.reward.reputation && !product.reward.money && !product.reward.energy
      if (category === "combo")
        return (
          (product.reward.money && product.reward.energy) ||
          (product.reward.money && product.reward.reputation) ||
          (product.reward.energy && product.reward.reputation) ||
          (product.reward.money && product.reward.energy && product.reward.reputation)
        )
      return false
    })
  }

  const products = filterProducts(selectedCategory)

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
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
          <h1 className="text-lg font-semibold">Магазин</h1>
          <p className="text-xs text-muted-foreground">Получи бонусы за Telegram Stars</p>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <ShoppingBag className="w-4 h-4" />
        </div>
      </div>

      {/* Telegram Stars Info */}
      {!isTelegramAvailable && (
        <div className="p-4">
          <Card className="p-4 bg-accent/10 border-accent/30">
            <div className="flex gap-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <p className="font-semibold text-sm mb-1">Режим разработки</p>
                <p className="text-xs text-muted-foreground">
                  Telegram Stars доступны только в Telegram WebApp. Сейчас покупки симулируются для тестирования.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 p-4 pb-2 border-b border-border/50 overflow-x-auto">
        <Button
          variant={selectedCategory === "combo" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedCategory("combo")}
          className="flex-shrink-0"
        >
          <Gift className="w-4 h-4 mr-2" />
          Наборы
        </Button>
        <Button
          variant={selectedCategory === "energy" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedCategory("energy")}
          className="flex-shrink-0"
        >
          <Zap className="w-4 h-4 mr-2" />
          Энергия
        </Button>
        <Button
          variant={selectedCategory === "money" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedCategory("money")}
          className="flex-shrink-0"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Деньги
        </Button>
        <Button
          variant={selectedCategory === "reputation" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedCategory("reputation")}
          className="flex-shrink-0"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Репутация
        </Button>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3">
        {products.map((product) => (
          <Card
            key={product.id}
            className={`p-4 ${product.popular ? "bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/30 ring-2 ring-primary/20" : "bg-card/50"}`}
          >
            {product.popular && (
              <div className="flex justify-end mb-2">
                <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  🔥 Популярно
                </span>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="text-4xl flex-shrink-0">{product.icon}</div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{product.description}</p>

                {/* Rewards Display */}
                <div className="bg-muted/50 rounded-lg p-2 mb-3 space-y-1">
                  {product.reward.money && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-primary">💵</span>
                      <span className="font-semibold">+${product.reward.money}</span>
                    </div>
                  )}
                  {product.reward.energy && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-accent">⚡</span>
                      <span className="font-semibold">+{product.reward.energy} энергии</span>
                    </div>
                  )}
                  {product.reward.reputation && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-secondary">🌟</span>
                      <span className="font-semibold">+{product.reward.reputation} репутации</span>
                    </div>
                  )}
                </div>

                {/* Purchase Button */}
                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  size="sm"
                  onClick={() => handlePurchase(product)}
                  disabled={purchasing !== null}
                >
                  {purchasing === product.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      Покупаем...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      {product.price} Stars
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Info Cards */}
        <Card className="p-4 bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/30">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="font-semibold text-sm mb-1">О Telegram Stars</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Telegram Stars - это внутриигровая валюта Telegram. Покупай их в приложении и получай мгновенные
                бонусы для ускорения прогресса!
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/30">
          <div className="flex gap-3">
            <div className="text-2xl">🎁</div>
            <div>
              <p className="font-semibold text-sm mb-1">Специальные предложения</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Следи за обновлениями! Скоро будут доступны лимитированные предложения, сезонные акции и эксклюзивные
                паки!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
