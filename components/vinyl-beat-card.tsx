"use client"

import { Card } from "@/components/ui/card"
import { Clock, DollarSign } from "lucide-react"
import { useState } from "react"
import type { Beat } from "@/lib/game-state"

interface VinylBeatCardProps {
  beat: Beat
}

export function VinylBeatCard({ beat }: VinylBeatCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "только что"
    if (diffInHours < 24) return `${diffInHours}ч назад`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "вчера"
    if (diffInDays < 7) return `${diffInDays}д назад`
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
  }

  return (
    <div
      className="vinyl-card-container perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`vinyl-card-inner ${isFlipped ? "flipped" : ""}`}>
        {/* Front - Vinyl Cover */}
        <Card className="vinyl-card-face vinyl-card-front p-0 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
          {/* Vinyl Record Background with Grooves */}
          <div className="relative w-full aspect-square bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Album Cover */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl border-4 border-gray-700">
                <img
                  src={beat.cover || "/placeholder.svg"}
                  alt={beat.name}
                  className="w-full h-full object-cover"
                />
                {/* Vinyl peeking out effect */}
                <div className="absolute -right-2 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-gray-900 to-black opacity-80" />
              </div>
            </div>

            {/* Vinyl Disc (partially visible on right) */}
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-gradient-to-br from-gray-900 via-black to-gray-800 shadow-2xl vinyl-spin">
              {/* Grooves */}
              <div className="absolute inset-0 rounded-full">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border border-gray-700/30"
                    style={{
                      margin: `${i * 5}px`,
                    }}
                  />
                ))}
              </div>
              {/* Center Label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-red-900 to-red-700 shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-black" />
              </div>
            </div>

            {/* Quality Badge */}
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                <span className="text-xs font-bold text-white">
                  {beat.quality >= 90 ? "🔥" : beat.quality >= 70 ? "⭐" : "✨"} {beat.quality}%
                </span>
              </div>
            </div>
          </div>

          {/* Info Bar */}
          <div className="p-3 bg-gradient-to-r from-gray-900 to-black border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate">{beat.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(beat.createdAt)}
                </p>
              </div>
              <div className="ml-3 text-right">
                <div className="flex items-center gap-1 text-green-400 font-bold">
                  <DollarSign className="w-4 h-4" />
                  {beat.price}
                </div>
                <p className="text-xs text-gray-500">Продано</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Back - Details */}
        <Card className="vinyl-card-face vinyl-card-back p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white shadow-xl">
          <div className="h-full flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-3">{beat.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Качество:</span>
                  <span className="font-semibold">{beat.quality}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Цена:</span>
                  <span className="font-semibold text-green-400">${beat.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Создан:</span>
                  <span className="font-semibold">{formatDate(beat.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Vinyl grooves decoration on back */}
            <div className="opacity-10">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-px bg-white mb-2"
                  style={{ width: `${100 - i * 15}%` }}
                />
              ))}
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              Нажми, чтобы перевернуть
            </p>
          </div>
        </Card>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        .vinyl-card-inner {
          position: relative;
          width: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .vinyl-card-inner.flipped {
          transform: rotateY(180deg);
        }

        .vinyl-card-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .vinyl-card-back {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          transform: rotateY(180deg);
        }

        @keyframes vinyl-spin {
          from {
            transform: translateY(-50%) rotate(0deg);
          }
          to {
            transform: translateY(-50%) rotate(360deg);
          }
        }

        .vinyl-spin {
          animation: vinyl-spin 3s linear infinite;
        }

        .vinyl-card-container:hover .vinyl-spin {
          animation: vinyl-spin 1.5s linear infinite;
        }
      `}</style>
    </div>
  )
}
