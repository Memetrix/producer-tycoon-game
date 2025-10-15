"use client"

import { getGaugeColor, type GaugeType } from "@/lib/beatoraja-timing"

interface GrooveGaugeProps {
  value: number
  type: GaugeType
  isFailed?: boolean
}

export function GrooveGauge({ value, type, isFailed = false }: GrooveGaugeProps) {
  const color = getGaugeColor(value, type)
  const isHardGauge = ["hard", "exhard", "hazard"].includes(type)
  const clearThreshold = isHardGauge ? 0 : 80

  return (
    <div className="w-full">
      <div className="relative h-4 bg-black/40 rounded-full overflow-hidden border border-border/30 shadow-inner">
        <div
          className="absolute inset-0 transition-all duration-200 ease-out"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          <div className="absolute inset-0 bg-white/10 animate-pulse" />
        </div>

        {!isHardGauge && (
          <div className="absolute left-[80%] top-0 bottom-0 w-0.5 bg-white/50 z-10">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white/70 whitespace-nowrap">
              CLEAR
            </div>
          </div>
        )}

        {isFailed && (
          <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center">
            <span className="text-xs font-black text-white tracking-wider">FAILED</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-muted-foreground tracking-wider">GROOVE GAUGE</span>
          <span
            className="text-[8px] font-bold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${color}30`,
              color: color,
            }}
          >
            {type.toUpperCase()}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold tabular-nums" style={{ color }}>
          {value.toFixed(1)}%
        </span>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}
