"use client"

import { memo, useMemo } from "react"
import { Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Beat } from "@/lib/game-state"

interface BeatHistoryProps {
  beats: Beat[]
}

export const BeatHistory = memo(function BeatHistory({ beats }: BeatHistoryProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Только что"
    if (diffMins < 60) return `${diffMins} мин назад`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} ч назад`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays} дн назад`

    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
  }

  if (beats.length === 0) {
    return null
  }

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Твои биты</h3>
      </div>
      <div className="space-y-2">
        {beats.map((beat) => (
          <Card key={beat.id} className="p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                <img
                  src={beat.cover || "/default-beat-cover.svg"}
                  alt={beat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{beat.name}</p>
                <p className="text-xs text-muted-foreground">Качество: {beat.quality}%</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {formatDate(beat.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">${beat.price}</p>
                <p className="text-xs text-muted-foreground">Продано</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
})
