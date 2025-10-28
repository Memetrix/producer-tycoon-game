"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Sparkles, Image as ImageIcon, Lock, Coins } from "lucide-react"
import type { Beat } from "@/lib/game-state"
import { getNFTRarity, calculateNFTMintCost } from "@/lib/game-state"

interface NftMintModalProps {
  beat: Beat
  onClose: () => void
  onMint?: (beatId: string) => Promise<void>
}

export function NftMintModal({ beat, onClose, onMint }: NftMintModalProps) {
  const [isMinting, setIsMinting] = useState(false)

  const rarity = getNFTRarity(beat.quality)
  const mintCost = calculateNFTMintCost(beat.quality)

  const handleMint = async () => {
    setIsMinting(true)
    try {
      if (onMint) {
        await onMint(beat.id)
      } else {
        // Placeholder - simulate mint delay
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
      alert("✅ NFT успешно создан! (заглушка)")
      onClose()
    } catch (error) {
      console.error("[NFT] Mint error:", error)
      alert("❌ Ошибка при создании NFT")
    } finally {
      setIsMinting(false)
    }
  }

  const getRarityColor = () => {
    if (rarity === "legendary") return "text-yellow-500"
    if (rarity === "epic") return "text-purple-500"
    if (rarity === "rare") return "text-blue-500"
    return "text-gray-500"
  }

  const getRarityLabel = () => {
    if (rarity === "legendary") return "Legendary"
    if (rarity === "epic") return "Epic"
    if (rarity === "rare") return "Rare"
    return "Common"
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <Card className="relative w-full max-w-md bg-gradient-to-br from-card via-card to-primary/10 border-primary/30 shadow-2xl animate-slide-in-up">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Создать NFT</h2>
                <p className="text-xs text-muted-foreground">Превратите бит в цифровой актив</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Beat Preview */}
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden shadow-lg ring-2 ring-primary/30">
              <img src={beat.cover || "/placeholder.svg"} alt={beat.name} className="w-full h-48 object-cover" />
              <div className="absolute top-2 right-2">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xl bg-black/50 ${getRarityColor()}`}
                >
                  ✨ {getRarityLabel()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{beat.name}</h3>

              {/* Attributes */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground">Качество</p>
                  <p className="text-lg font-bold text-primary">{beat.quality}%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground">Цена</p>
                  <p className="text-lg font-bold text-secondary">${beat.price}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <Card className="p-4 bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/30">
            <div className="flex gap-3">
              <div className="text-2xl">💎</div>
              <div className="space-y-1">
                <p className="font-semibold text-sm">TON NFT Collection</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Твой бит будет сохранён как уникальный NFT на блокчейне TON. Ты сможешь торговать им на маркетплейсе!
                </p>
              </div>
            </div>
          </Card>

          {/* Pricing (Placeholder) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <span className="text-sm text-muted-foreground">Стоимость минта</span>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span className="font-semibold">{mintCost} Stars</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-2 text-sm">
                <Coins className="w-4 h-4 text-primary" />
                <span className="font-semibold text-primary">Скоро доступно!</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Интеграция с TON и Telegram Stars находится в разработке
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button
              onClick={handleMint}
              disabled={isMinting}
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
            >
              {isMinting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Создаю NFT...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Создать NFT
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
