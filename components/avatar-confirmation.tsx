"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RefreshCw, Check } from "lucide-react"
import type { CharacterData } from "./character-creation"

interface AvatarConfirmationProps {
  character: CharacterData
  onConfirm: () => void
  onRegenerate: () => void
}

const MUSIC_STYLE_NAMES: Record<string, string> = {
  hiphop: "Hip-Hop",
  trap: "Trap",
  rnb: "R&B",
  pop: "Pop",
  electronic: "Electronic",
}

const STARTING_BONUS_NAMES: Record<string, string> = {
  producer: "Продюсер",
  hustler: "Хастлер",
  networker: "Коннектор",
  energetic: "Энерджайзер",
}

export function AvatarConfirmation({ character, onConfirm, onRegenerate }: AvatarConfirmationProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    await onRegenerate()
    setIsRegenerating(false)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[oklch(0.12_0_0)] via-[oklch(0.15_0_0)] to-[oklch(0.18_0_0)]">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold text-[oklch(0.98_0_0)]">Твой персонаж готов!</h1>
          <p className="text-[oklch(0.7_0_0)] text-balance">Проверь свой аватар и характеристики перед началом игры</p>
        </div>

        {/* Avatar Display */}
        <div className="flex justify-center pt-4">
          <div className="relative">
            <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-[oklch(0.65_0.25_250)] shadow-2xl">
              <img
                src={character.avatar || "/placeholder.svg"}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[oklch(0.2_0_0)] border border-[oklch(0.3_0_0)] text-[oklch(0.98_0_0)] hover:bg-[oklch(0.25_0_0)] shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
              {isRegenerating ? "Генерация..." : "Перегенерировать"}
            </Button>
          </div>
        </div>

        {/* Character Info */}
        <div className="space-y-3 pt-8">
          <Card className="p-4 bg-[oklch(0.18_0_0)] border-[oklch(0.25_0_0)]">
            <div className="flex items-center justify-between">
              <span className="text-[oklch(0.7_0_0)]">Имя</span>
              <span className="font-bold text-[oklch(0.98_0_0)]">{character.name}</span>
            </div>
          </Card>

          <Card className="p-4 bg-[oklch(0.18_0_0)] border-[oklch(0.25_0_0)]">
            <div className="flex items-center justify-between">
              <span className="text-[oklch(0.7_0_0)]">Пол</span>
              <span className="font-bold text-[oklch(0.98_0_0)]">
                {character.gender === "male" ? "Мужской" : "Женский"}
              </span>
            </div>
          </Card>

          <Card className="p-4 bg-[oklch(0.18_0_0)] border-[oklch(0.25_0_0)]">
            <div className="flex items-center justify-between">
              <span className="text-[oklch(0.7_0_0)]">Музыкальный стиль</span>
              <span className="font-bold text-[oklch(0.98_0_0)]">
                {MUSIC_STYLE_NAMES[character.musicStyle] || character.musicStyle}
              </span>
            </div>
          </Card>

          <Card className="p-4 bg-[oklch(0.18_0_0)] border-[oklch(0.25_0_0)]">
            <div className="flex items-center justify-between">
              <span className="text-[oklch(0.7_0_0)]">Стартовый бонус</span>
              <span className="font-bold text-[oklch(0.98_0_0)]">
                {STARTING_BONUS_NAMES[character.startingBonus] || character.startingBonus}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="p-6 border-t border-[oklch(0.25_0_0)] bg-[oklch(0.15_0_0)]/80 backdrop-blur-xl">
        <Button
          size="lg"
          onClick={onConfirm}
          disabled={isRegenerating}
          className="w-full bg-gradient-to-r from-[oklch(0.65_0.25_250)] to-[oklch(0.6_0.22_320)] text-[oklch(0.98_0_0)] hover:opacity-90 shadow-lg active:scale-95 transition-transform h-14 text-base font-semibold disabled:opacity-50"
        >
          <Check className="w-5 h-5 mr-2" />
          Начать путь к славе
        </Button>
      </div>
    </div>
  )
}
