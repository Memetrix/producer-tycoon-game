"use client"

import { formatTimingError, type GreenNumber as GreenNumberType } from "@/lib/beatoraja-timing"

interface GreenNumberProps {
  greenNumber: GreenNumberType
  lane: number
}

export function GreenNumber({ greenNumber, lane }: GreenNumberProps) {
  if (!greenNumber.show) return null

  const isFast = greenNumber.fast
  const color = isFast ? "#4A9EFF" : "#4AFF88"
  const label = isFast ? "FAST" : "SLOW"
  const value = formatTimingError(isFast ? greenNumber.value : -greenNumber.value)

  return (
    <div
      className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none z-20"
      style={{
        opacity: greenNumber.opacity,
        transition: "opacity 0.5s ease-out",
      }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <div
          className="text-[10px] font-bold tracking-wider"
          style={{
            color: color,
            textShadow: `0 0 8px ${color}80, 0 2px 4px rgba(0,0,0,0.5)`,
          }}
        >
          {label}
        </div>
        <div
          className="text-lg font-black tabular-nums"
          style={{
            color: color,
            textShadow: `0 0 12px ${color}80, 0 0 24px ${color}40, 0 2px 6px rgba(0,0,0,0.7)`,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  )
}

interface GreenNumberContainerProps {
  greenNumbers: GreenNumberType[]
}

export function GreenNumberContainer({ greenNumbers }: GreenNumberContainerProps) {
  return (
    <div className="absolute inset-0 flex pt-24 pb-20 pointer-events-none z-15">
      {greenNumbers.map((gn, lane) => (
        <div key={lane} className="flex-1 relative">
          <GreenNumber greenNumber={gn} lane={lane} />
        </div>
      ))}
    </div>
  )
}
