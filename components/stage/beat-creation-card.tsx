"use client"

import { memo } from "react"
import { Play, Music, Sparkles, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Beat } from "@/lib/game-state"

interface BeatCreationCardProps {
  currentBeat: Beat | null
  isCreating: boolean
  isGeneratingName: boolean
  isGeneratingCover: boolean
  isSelling: boolean
  energyCost: number
  hasEnoughEnergy: boolean
  onStartCreating: () => void
  onSellBeat: () => void
  onCreateNFT: () => void
}

export const BeatCreationCard = memo(function BeatCreationCard({
  currentBeat,
  isCreating,
  isGeneratingName,
  isGeneratingCover,
  isSelling,
  energyCost,
  hasEnoughEnergy,
  onStartCreating,
  onSellBeat,
  onCreateNFT,
}: BeatCreationCardProps) {
  return (
    <Card className="p-8 bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/30 shadow-lg">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          {currentBeat ? (
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
                  src={currentBeat.cover || "/default-beat-cover.svg"}
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
            {isGeneratingName
              ? "Придумываю название..."
              : isGeneratingCover
                ? "Создаю обложку..."
                : isCreating
                  ? "Создаю бит..."
                  : currentBeat
                    ? `${currentBeat.name} готов!`
                    : "Готов создать новый хит"}
          </p>
          {currentBeat && (
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-muted-foreground">Качество: {currentBeat.quality}%</span>
              <span className="text-primary font-bold">${currentBeat.price}</span>
            </div>
          )}
        </div>

        {currentBeat ? (
          <div className="w-full space-y-2">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 shadow-md active:scale-95 transition-transform"
              onClick={onSellBeat}
              disabled={isGeneratingName || isGeneratingCover || isSelling}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isGeneratingName
                ? "Придумываю название..."
                : isGeneratingCover
                  ? "Создаю обложку..."
                  : isSelling
                    ? "Продаю..."
                    : `Продать бит ($${currentBeat?.price})`}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-primary/30 hover:bg-primary/10 bg-transparent"
              onClick={onCreateNFT}
              disabled={isGeneratingName || isGeneratingCover || isSelling}
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              Создать NFT
            </Button>
          </div>
        ) : (
          <div className="w-full space-y-2">
            <Button
              size="lg"
              className="w-full h-auto py-3 px-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 shadow-md active:scale-95 transition-transform whitespace-normal"
              onClick={onStartCreating}
              disabled={isCreating || !hasEnoughEnergy}
            >
              <Play className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>Начать создание (-{energyCost} энергии)</span>
            </Button>
            {!hasEnoughEnergy && (
              <p className="text-xs text-muted-foreground">Недостаточно энергии. Подожди немного!</p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
})
