"use client"

import { Trophy, Star, Target, Zap } from "lucide-react"
import type { Score, ClearLamp } from "@/lib/beatoraja-timing"

interface ResultsScreenProps {
  score: Score
  exScore: number
  maxExScore: number
  exScoreRate: number
  djLevel: string
  clearLamp: ClearLamp
  totalNotes: number
  onClose: () => void
}

export function ResultsScreen({
  score,
  exScore,
  maxExScore,
  exScoreRate,
  djLevel,
  clearLamp,
  totalNotes,
  onClose,
}: ResultsScreenProps) {
  const getClearLampColor = (lamp: ClearLamp): string => {
    switch (lamp) {
      case "perfect":
        return "#FFD700"
      case "fullcombo":
        return "#4AFF88"
      case "exhard-clear":
        return "#FF4A4A"
      case "hard-clear":
        return "#FF884A"
      case "clear":
        return "#4A9EFF"
      case "easy-clear":
        return "#9E4AFF"
      case "failed":
        return "#666666"
      default:
        return "#888888"
    }
  }

  const getClearLampText = (lamp: ClearLamp): string => {
    switch (lamp) {
      case "perfect":
        return "PERFECT"
      case "fullcombo":
        return "FULL COMBO"
      case "exhard-clear":
        return "EX-HARD CLEAR"
      case "hard-clear":
        return "HARD CLEAR"
      case "clear":
        return "CLEAR"
      case "easy-clear":
        return "EASY CLEAR"
      case "failed":
        return "FAILED"
      default:
        return "NO PLAY"
    }
  }

  const lampColor = getClearLampColor(clearLamp)
  const lampText = getClearLampText(clearLamp)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-card to-background border-2 border-primary/30 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <div
            className="inline-block px-6 py-2 rounded-full mb-4"
            style={{
              backgroundColor: `${lampColor}20`,
              border: `2px solid ${lampColor}`,
            }}
          >
            <span className="text-2xl font-black tracking-wider" style={{ color: lampColor }}>
              {lampText}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-8 h-8 text-primary" />
            <h2 className="text-4xl font-black text-primary">{djLevel}</h2>
          </div>
          <p className="text-sm text-muted-foreground">DJ LEVEL</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-black/30 rounded-lg p-4 border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-muted-foreground">EX SCORE</span>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-2xl font-black text-yellow-500">
                  {exScore} / {maxExScore}
                </span>
              </div>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-500"
                style={{ width: `${exScoreRate}%` }}
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-xs text-muted-foreground">{exScoreRate.toFixed(2)}%</span>
            </div>
          </div>

          <div className="bg-black/30 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-muted-foreground">JUDGEMENTS</span>
            </div>
            <div className="space-y-2">
              <JudgeRow label="PERFECT" count={score.pgreat} color="#FFD700" />
              <JudgeRow label="GREAT" count={score.great} color="#4AFF88" />
              <JudgeRow label="GOOD" count={score.good} color="#4A9EFF" />
              <JudgeRow label="BAD" count={score.bad} color="#FF884A" />
              <JudgeRow label="POOR" count={score.poor} color="#FF4A4A" />
            </div>
          </div>

          <div className="bg-black/30 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-muted-foreground">COMBO</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Max Combo</span>
              <span className="text-2xl font-black text-primary">{score.maxCombo}x</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all active:scale-95"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

function JudgeRow({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold" style={{ color }}>
        {label}
      </span>
      <span className="text-sm font-mono font-bold text-white/90">{count}</span>
    </div>
  )
}
