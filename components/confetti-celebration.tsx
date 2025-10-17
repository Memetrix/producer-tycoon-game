"use client"

import { useEffect, useState } from "react"

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  delay: number
  duration: number
}

export function ConfettiCelebration({ onComplete }: { onComplete?: () => void }) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    // Generate confetti pieces
    const pieces: ConfettiPiece[] = []
    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"]

    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100, // percentage
        y: -10, // start above screen
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4, // 4-12px
        delay: Math.random() * 200, // 0-200ms delay
        duration: Math.random() * 1000 + 2000, // 2-3s duration
      })
    }

    setConfetti(pieces)

    // Auto-complete after animation
    const timer = setTimeout(() => {
      onComplete?.()
    }, 3500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: "2px",
            animation: `confetti-fall ${piece.duration}ms ease-in forwards`,
            animationDelay: `${piece.delay}ms`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Simpler coin/money celebration
export function CoinCelebration({ amount, onComplete }: { amount: number; onComplete?: () => void }) {
  const [coins, setCoins] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    // Generate coins
    const pieces: ConfettiPiece[] = []
    const numCoins = Math.min(Math.floor(amount / 100), 20) // 1 coin per $100, max 20

    for (let i = 0; i < numCoins; i++) {
      pieces.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 40, // center spread
        y: 50,
        rotation: Math.random() * 360,
        color: "#f59e0b", // gold color
        size: 24,
        delay: i * 50, // staggered
        duration: 1000,
      })
    }

    setCoins(pieces)

    const timer = setTimeout(() => {
      onComplete?.()
    }, 2000)

    return () => clearTimeout(timer)
  }, [amount])

  return (
    <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute flex items-center justify-center text-2xl"
          style={{
            left: `${coin.x}%`,
            top: `${coin.y}%`,
            animation: `coin-burst ${coin.duration}ms ease-out forwards`,
            animationDelay: `${coin.delay}ms`,
          }}
        >
          💰
        </div>
      ))}
      <style jsx>{`
        @keyframes coin-burst {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
          }
          50% {
            transform: translate(
                ${Math.random() * 200 - 100}px,
                ${-Math.random() * 100 - 50}px
              )
              scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(
                ${Math.random() * 200 - 100}px,
                ${Math.random() * 100}px
              )
              scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
