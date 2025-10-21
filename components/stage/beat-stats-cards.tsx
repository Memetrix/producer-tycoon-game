"use client"

import { memo } from "react"
import { Card } from "@/components/ui/card"

interface BeatStatsCardsProps {
  beatsCount: number
  totalEarnings: number
  reputation: number
}

export const BeatStatsCards = memo(function BeatStatsCards({ beatsCount, totalEarnings, reputation }: BeatStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="p-4 text-center shadow-md">
        <p className="text-2xl font-bold text-primary">{beatsCount}</p>
        <p className="text-xs text-muted-foreground mt-1">Битов создано</p>
      </Card>
      <Card className="p-4 text-center shadow-md">
        <p className="text-2xl font-bold text-secondary">${totalEarnings}</p>
        <p className="text-xs text-muted-foreground mt-1">Заработано</p>
      </Card>
      <Card className="p-4 text-center shadow-md">
        <p className="text-2xl font-bold text-accent">{reputation}</p>
        <p className="text-xs text-muted-foreground mt-1">Репутация</p>
      </Card>
    </div>
  )
})
