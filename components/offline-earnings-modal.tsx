"use client"

import { DollarSign, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OfflineEarningsModalProps {
  earnings: number
  minutesAway: number
  onClose: () => void
}

export function OfflineEarningsModal({ earnings, minutesAway, onClose }: OfflineEarningsModalProps) {
  const hours = Math.floor(minutesAway / 60)
  const minutes = minutesAway % 60

  const timeText =
    hours > 0 ? `${hours} ${hours === 1 ? "час" : hours < 5 ? "часа" : "часов"} ${minutes} мин` : `${minutes} мин`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-24 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[oklch(0.25_0.05_250)] to-[oklch(0.2_0.05_250)] rounded-3xl border-2 border-[oklch(0.35_0.1_250)] shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Decorative glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[oklch(0.65_0.25_250)] via-[oklch(0.7_0.2_280)] to-[oklch(0.65_0.25_250)] rounded-3xl opacity-20 blur-xl animate-pulse" />

        <div className="relative p-6 space-y-4">
          {/* Header with icon */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full bg-[oklch(0.65_0.25_250)] opacity-20 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-[oklch(0.65_0.25_250)] opacity-30 animate-pulse" />

              {/* Icon container */}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[oklch(0.65_0.25_250)] to-[oklch(0.6_0.25_270)] flex items-center justify-center shadow-lg">
                <TrendingUp className="w-10 h-10 text-white animate-in zoom-in duration-500 delay-150" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white">С возвращением!</h2>
              <p className="text-[oklch(0.7_0.05_250)] text-sm">Твои артисты работали пока тебя не было</p>
            </div>
          </div>

          {/* Earnings display */}
          <div className="bg-[oklch(0.15_0.05_250)] rounded-2xl p-5 border border-[oklch(0.3_0.1_250)] space-y-3">
            <div className="flex items-center justify-center space-x-3">
              <DollarSign className="w-7 h-7 text-[oklch(0.75_0.2_150)]" />
              <div className="text-4xl font-bold text-[oklch(0.75_0.2_150)] font-mono animate-in slide-in-from-bottom duration-500 delay-300">
                ${earnings}
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-[oklch(0.65_0.05_250)]">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Заработано за {timeText}</span>
            </div>
          </div>

          {/* Info text */}
          <div className="text-center text-xs text-[oklch(0.6_0.05_250)] bg-[oklch(0.2_0.05_250)] rounded-lg p-3 border border-[oklch(0.3_0.05_250)]">
            💡 Пассивный доход начисляется максимум за 4 часа оффлайн
          </div>

          {/* Confirm button */}
          <Button
            onClick={onClose}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[oklch(0.65_0.25_250)] to-[oklch(0.6_0.25_270)] hover:from-[oklch(0.7_0.25_250)] hover:to-[oklch(0.65_0.25_270)] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Забрать деньги
          </Button>
        </div>
      </div>
    </div>
  )
}
