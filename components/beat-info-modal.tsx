"use client"

import { X, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Beat } from "@/lib/game-state"

interface BeatInfoModalProps {
  beat: Beat
  onClose: () => void
  onMintNFT: () => void
}

export function BeatInfoModal({ beat, onClose, onMintNFT }: BeatInfoModalProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="p-6 bg-gradient-to-br from-background via-background to-primary/5">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Rotating Album Card */}
          <div className="mb-6 flex justify-center">
            <div className="rotating-album-container">
              <div className="rotating-album">
                {/* Front - Album Cover */}
                <div className="album-face album-front">
                  <img
                    src={beat.cover || "/placeholder.svg"}
                    alt={beat.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Back - Beat Name */}
                <div className="album-face album-back">
                  <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent rounded-lg flex items-center justify-center p-8">
                    <h2 className="text-4xl md:text-5xl font-black text-white text-center rotate-[-15deg] leading-tight drop-shadow-2xl uppercase tracking-wider" style={{ fontFamily: "'Impact', 'Arial Black', 'Bebas Neue', sans-serif", textShadow: '4px 4px 0px rgba(0,0,0,0.5), 8px 8px 0px rgba(0,0,0,0.2)' }}>
                      {beat.name}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Beat Information */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-1">{beat.name}</h3>
              <p className="text-sm text-muted-foreground">{formatDate(beat.createdAt)}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                <p className="text-xs text-muted-foreground mb-1">Качество</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
                      style={{ width: `${beat.quality}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold">{beat.quality}%</span>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
                <p className="text-xs text-muted-foreground mb-1">Цена продажи</p>
                <p className="text-2xl font-bold text-green-500">${beat.price}</p>
              </Card>
            </div>

            {/* Quality Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
                <span className="text-2xl">
                  {beat.quality >= 90 ? "🔥" : beat.quality >= 70 ? "⭐" : beat.quality >= 50 ? "✨" : "💫"}
                </span>
                <span className="font-semibold">
                  {beat.quality >= 90
                    ? "Огонь!"
                    : beat.quality >= 70
                      ? "Отличное качество"
                      : beat.quality >= 50
                        ? "Хорошее качество"
                        : "Нормальное качество"}
                </span>
              </div>
            </div>

            {/* NFT Button */}
            <Button
              onClick={onMintNFT}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
            >
              <Coins className="w-5 h-5 mr-2" />
              Создать NFT
            </Button>

            {/* Close Button */}
            <Button onClick={onClose} variant="outline" className="w-full">
              Закрыть
            </Button>
          </div>
        </Card>
      </div>

      <style jsx>{`
        .rotating-album-container {
          perspective: 1500px;
          width: 300px;
          height: 300px;
        }

        .rotating-album {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: rotate-y 6s linear infinite;
        }

        .album-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          box-shadow:
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 0 8px rgba(0, 0, 0, 0.1),
            0 0 0 10px rgba(0, 0, 0, 0.05);
        }

        .album-front {
          transform: rotateY(0deg) translateZ(5px);
        }

        .album-back {
          transform: rotateY(180deg) translateZ(5px);
        }

        /* Thickness sides */
        .rotating-album::before,
        .rotating-album::after {
          content: '';
          position: absolute;
          background: linear-gradient(90deg, rgba(0,0,0,0.8), rgba(0,0,0,0.4), rgba(0,0,0,0.8));
          transform-origin: left;
        }

        /* Top edge */
        .rotating-album::before {
          width: 100%;
          height: 10px;
          top: 0;
          left: 0;
          transform: rotateX(90deg) translateZ(-5px);
        }

        /* Bottom edge */
        .rotating-album::after {
          width: 100%;
          height: 10px;
          bottom: 0;
          left: 0;
          transform: rotateX(-90deg) translateZ(-5px);
        }

        @keyframes rotate-y {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        @media (max-width: 640px) {
          .rotating-album-container {
            width: 250px;
            height: 250px;
          }
        }
      `}</style>
    </div>
  )
}
