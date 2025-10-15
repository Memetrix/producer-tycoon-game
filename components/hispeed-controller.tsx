"use client"

import { Minus, Plus, Gauge } from "lucide-react"

interface HispeedControllerProps {
  hispeed: number
  onHispeedChange: (hispeed: number) => void
  disabled?: boolean
}

export function HispeedController({ hispeed, onHispeedChange, disabled = false }: HispeedControllerProps) {
  const adjustHispeed = (delta: number) => {
    const newHispeed = Math.max(0.5, Math.min(10.0, hispeed + delta))
    onHispeedChange(newHispeed)
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-border/30">
      <div className="flex items-center gap-2 mb-2">
        <Gauge className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-muted-foreground">HISPEED</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => adjustHispeed(-0.1)}
          disabled={disabled || hispeed <= 0.5}
          className="w-8 h-8 rounded-lg bg-card hover:bg-card/80 border border-border flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="flex-1 text-center">
          <div className="text-2xl font-black text-primary tabular-nums">{hispeed.toFixed(1)}x</div>
          <div className="text-[8px] text-muted-foreground">Note Speed</div>
        </div>

        <button
          onClick={() => adjustHispeed(0.1)}
          disabled={disabled || hispeed >= 10.0}
          className="w-8 h-8 rounded-lg bg-card hover:bg-card/80 border border-border flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2 flex gap-1">
        {[0.5, 1.0, 1.5, 2.0, 3.0].map((preset) => (
          <button
            key={preset}
            onClick={() => onHispeedChange(preset)}
            disabled={disabled}
            className={`flex-1 py-1 text-[10px] font-bold rounded transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              Math.abs(hispeed - preset) < 0.05
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:bg-card/80 text-muted-foreground"
            }`}
          >
            {preset}x
          </button>
        ))}
      </div>
    </div>
  )
}
