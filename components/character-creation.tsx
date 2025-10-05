"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronRight, Music, Zap, TrendingUp, Users } from "lucide-react"

interface CharacterCreationProps {
  onComplete: (character: CharacterData) => void
}

export interface CharacterData {
  name: string
  avatar: string
  musicStyle: string
  startingBonus: string
  gender: string
}

const MUSIC_STYLES = [
  {
    id: "hiphop",
    name: "Hip-Hop",
    description: "Классический хип-хоп с сильным битом",
    bonus: "+$100 стартовых денег",
    color: "from-orange-500 to-red-500",
    prompt: "hip hop music producer, urban style, confident pose, studio headphones",
  },
  {
    id: "trap",
    name: "Trap",
    description: "Современный трэп с 808 басами",
    bonus: "+50 репутации",
    color: "from-purple-500 to-pink-500",
    prompt: "trap music producer, modern streetwear, stylish, purple aesthetic",
  },
  {
    id: "rnb",
    name: "R&B",
    description: "Мелодичный R&B с душой",
    bonus: "Бесплатные наушники",
    color: "from-blue-500 to-cyan-500",
    prompt: "rnb music producer, smooth style, elegant, soulful vibe",
  },
  {
    id: "pop",
    name: "Pop",
    description: "Коммерческий поп для масс",
    bonus: "+$50 и +25 репутации",
    color: "from-pink-500 to-rose-500",
    prompt: "pop music producer, bright colorful style, energetic, mainstream appeal",
  },
  {
    id: "electronic",
    name: "Electronic",
    description: "Электронная музыка и EDM",
    bonus: "+20 макс. энергии",
    color: "from-cyan-500 to-blue-500",
    prompt: "electronic music producer, futuristic style, neon aesthetic, tech-savvy",
  },
]

const STARTING_BONUSES = [
  {
    id: "producer",
    name: "Продюсер",
    description: "Мастер создания битов",
    bonus: "Старт с улучшенными наушниками",
    icon: Music,
  },
  {
    id: "hustler",
    name: "Хастлер",
    description: "Умеешь делать деньги",
    bonus: "+$200 к стартовому капиталу",
    icon: TrendingUp,
  },
  {
    id: "connector",
    name: "Коннектор",
    description: "Знаешь нужных людей",
    bonus: "+100 репутации",
    icon: Users,
  },
  {
    id: "energizer",
    name: "Энерджайзер",
    description: "Неиссякаемая энергия",
    bonus: "+50 к максимальной энергии",
    icon: Zap,
  },
]

export function CharacterCreation({ onComplete }: CharacterCreationProps) {
  const [step, setStep] = useState(1)
  const [playerName, setPlayerName] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("")
  const [selectedBonus, setSelectedBonus] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleNext = () => {
    if (step === 1 && playerName.trim()) {
      setStep(2)
    } else if (step === 2 && selectedGender) {
      setStep(3)
    } else if (step === 3 && selectedStyle) {
      setStep(4)
    }
  }

  const handleComplete = async () => {
    if (!selectedBonus) return

    setIsGenerating(true)

    try {
      const style = MUSIC_STYLES.find((s) => s.id === selectedStyle)
      const genderText = selectedGender === "male" ? "male" : "female"

      console.log("[v0] Generating avatar for:", { name: playerName, gender: genderText, style: style?.name })

      const response = await fetch("/api/generate-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playerName,
          gender: genderText,
          prompt: style?.prompt || "music producer portrait",
        }),
      })

      console.log("[v0] Avatar API response status:", response.status)
      const data = await response.json()
      console.log("[v0] Avatar API response data:", data)

      if (!data.imageUrl) {
        throw new Error("Avatar generation failed: no imageUrl in response")
      }

      console.log("[v0] Successfully generated avatar:", data.imageUrl)

      onComplete({
        name: playerName.trim() || "Продюсер",
        avatar: data.imageUrl,
        musicStyle: selectedStyle,
        startingBonus: selectedBonus,
        gender: selectedGender,
      })
    } catch (error) {
      console.error("[v0] Failed to generate avatar:", error)
      alert("Не удалось создать аватар. Попробуйте еще раз.")
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[oklch(0.12_0_0)] via-[oklch(0.15_0_0)] to-[oklch(0.18_0_0)]">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-center gap-2 pt-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? "w-8 bg-[oklch(0.65_0.25_250)]"
                  : s < step
                    ? "w-6 bg-[oklch(0.65_0.25_250)]/50"
                    : "w-6 bg-[oklch(0.3_0_0)]"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2 pt-8">
              <h1 className="text-3xl font-bold text-[oklch(0.98_0_0)]">Как тебя зовут?</h1>
              <p className="text-[oklch(0.7_0_0)] text-balance">
                Начни свой путь от уличного битмейкера до мирового продюсера
              </p>
            </div>

            <div className="space-y-2 pt-8">
              <Input
                type="text"
                placeholder="Введи свое имя..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-[oklch(0.2_0_0)] border-[oklch(0.3_0_0)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.5_0_0)] h-14 text-lg text-center"
                maxLength={20}
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2 pt-8">
              <h1 className="text-3xl font-bold text-[oklch(0.98_0_0)]">Твой пол?</h1>
              <p className="text-[oklch(0.7_0_0)] text-balance">Это поможет создать твой уникальный аватар</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8">
              <Card
                onClick={() => setSelectedGender("male")}
                className={`p-8 cursor-pointer transition-all active:scale-95 ${
                  selectedGender === "male"
                    ? "bg-gradient-to-br from-[oklch(0.65_0.25_250)]/20 to-[oklch(0.6_0.22_320)]/20 border-[oklch(0.65_0.25_250)] border-2 shadow-lg"
                    : "bg-[oklch(0.18_0_0)] border-[oklch(0.25_0_0)] hover:border-[oklch(0.35_0_0)]"
                }`}
              >
                <div className="text-center space-y-3">
                  <div className="text-5xl">👨</div>
                  <h3 className="font-bold text-lg text-[oklch(0.98_0_0)]">Мужской</h3>
                </div>
              </Card>

              <Card
                onClick={() => setSelectedGender("female")}
                className={`p-8 cursor-pointer transition-all active:scale-95 ${
                  selectedGender === "female"
                    ? "bg-gradient-to-br from-[oklch(0.65_0.25_250)]/20 to-[oklch(0.6_0.22_320)]/20 border-[oklch(0.65_0.25_250)] border-2 shadow-lg"
                    : "bg-[oklch(0.18_0_0)] border-[oklch(0.25_0_0)] hover:border-[oklch(0.35_0_0)]"
                }`}
              >
                <div className="text-center space-y-3">
                  <div className="text-5xl">👩</div>
                  <h3 className="font-bold text-lg text-[oklch(0.98_0_0)]">Женский</h3>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Music Style */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2 pt-4">
              <h1 className="text-3xl font-bold text-[oklch(0.98_0_0)]">Твой стиль?</h1>
              <p className="text-[oklch(0.7_0_0)] text-balance">Выбери любимый музыкальный жанр</p>
            </div>

            <div className="grid gap-3 pt-4">
              {MUSIC_STYLES.map((style) => (
                <Card
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 cursor-pointer transition-all active:scale-95 ${
                    selectedStyle === style.id
                      ? `bg-gradient-to-r ${style.color}/20 border-2 shadow-lg`
                      : "bg-[oklch(0.18_0_0)] border-[oklch(0.25_0_0)] hover:border-[oklch(0.35_0_0)]"
                  }`}
                  style={
                    selectedStyle === style.id
                      ? {
                          borderColor: `oklch(0.65 0.25 ${style.id === "hiphop" ? "30" : style.id === "trap" ? "320" : style.id === "rnb" ? "250" : style.id === "pop" ? "350" : "200"})`,
                        }
                      : undefined
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-[oklch(0.98_0_0)]">{style.name}</h3>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${style.color} text-white`}
                      >
                        {style.bonus}
                      </div>
                    </div>
                    <p className="text-sm text-[oklch(0.7_0_0)]">{style.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Starting Bonus */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2 pt-4">
              <h1 className="text-3xl font-bold text-[oklch(0.98_0_0)]">Твоя сила?</h1>
              <p className="text-[oklch(0.7_0_0)] text-balance">Выбери стартовое преимущество</p>
            </div>

            <div className="grid gap-3 pt-4">
              {STARTING_BONUSES.map((bonus) => {
                const Icon = bonus.icon
                return (
                  <Card
                    key={bonus.id}
                    onClick={() => setSelectedBonus(bonus.id)}
                    className={`p-4 cursor-pointer transition-all active:scale-95 ${
                      selectedBonus === bonus.id
                        ? "bg-gradient-to-r from-[oklch(0.65_0.25_250)]/20 to-[oklch(0.6_0.22_320)]/20 border-[oklch(0.65_0.25_250)] border-2 shadow-lg"
                        : "bg-[oklch(0.18_0_0)] border-[oklch(0.25_0_0)] hover:border-[oklch(0.35_0_0)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          selectedBonus === bonus.id
                            ? "bg-gradient-to-br from-[oklch(0.65_0.25_250)] to-[oklch(0.6_0.22_320)]"
                            : "bg-[oklch(0.25_0_0)]"
                        }`}
                      >
                        <Icon className="w-6 h-6 text-[oklch(0.98_0_0)]" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-bold text-[oklch(0.98_0_0)]">{bonus.name}</h3>
                        <p className="text-sm text-[oklch(0.7_0_0)]">{bonus.description}</p>
                        <p className="text-xs text-[oklch(0.65_0.25_250)] font-medium">{bonus.bonus}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="p-6 border-t border-[oklch(0.25_0_0)] bg-[oklch(0.15_0_0)]/80 backdrop-blur-xl">
        {step < 4 ? (
          <Button
            size="lg"
            onClick={handleNext}
            disabled={
              (step === 1 && !playerName.trim()) || (step === 2 && !selectedGender) || (step === 3 && !selectedStyle)
            }
            className="w-full bg-gradient-to-r from-[oklch(0.65_0.25_250)] to-[oklch(0.6_0.22_320)] text-[oklch(0.98_0_0)] hover:opacity-90 shadow-lg active:scale-95 transition-transform h-14 text-base font-semibold disabled:opacity-50"
          >
            Далее
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleComplete}
            disabled={!selectedBonus || isGenerating}
            className="w-full bg-gradient-to-r from-[oklch(0.65_0.25_250)] to-[oklch(0.6_0.22_320)] text-[oklch(0.98_0_0)] hover:opacity-90 shadow-lg active:scale-95 transition-transform h-14 text-base font-semibold disabled:opacity-50"
          >
            {isGenerating ? "Создаем персонажа..." : "Создать персонажа"}
          </Button>
        )}
      </div>
    </div>
  )
}
