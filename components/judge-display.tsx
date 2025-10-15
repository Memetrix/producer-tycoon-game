"use client"

import { useEffect, useState } from "react"
import { getJudgementColor, getJudgementText, type BeatJudgement } from "@/lib/beatoraja-timing"

interface JudgeDisplayProps {
  judgement: BeatJudgement | null
  onComplete?: () => void
}

export function JudgeDisplay({ judgement, onComplete }: JudgeDisplayProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (judgement) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onComplete?.()
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [judgement, onComplete])

  if (!show || !judgement) return null

  const color = getJudgementColor(judgement)
  const text = getJudgementText(judgement)

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <div
        className="animate-in zoom-in-50 fade-in duration-100"
        style={{
          animation: "judgePopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div
          className="relative text-6xl font-black tracking-wider drop-shadow-2xl"
          style={{
            color: color,
            textShadow: `0 0 20px ${color}80, 0 0 40px ${color}40, 0 4px 8px rgba(0,0,0,0.5)`,
          }}
        >
          {text}
          <div
            className="absolute inset-0 blur-xl opacity-50"
            style={{
              color: color,
            }}
          >
            {text}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes judgePopIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  )
}

interface JudgeCounterProps {
  pgreat: number
  great: number
  good: number
  bad: number
  poor: number
}

export function JudgeCounter({ pgreat, great, good, bad, poor }: JudgeCounterProps) {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-border/30">
      <div className="space-y-0.5">
        <JudgeCountRow label="PERFECT" count={pgreat} color="#FFD700" />
        <JudgeCountRow label="GREAT" count={great} color="#4AFF88" />
        <JudgeCountRow label="GOOD" count={good} color="#4A9EFF" />
        <JudgeCountRow label="BAD" count={bad} color="#FF884A" />
        <JudgeCountRow label="POOR" count={poor} color="#FF4A4A" />
      </div>
    </div>
  )
}

function JudgeCountRow({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="font-bold" style={{ color }}>
        {label}
      </span>
      <span className="font-mono text-white/90 min-w-[2ch] text-right">{count}</span>
    </div>
  )
}
