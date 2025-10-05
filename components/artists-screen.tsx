"use client"

import { ArrowLeft, Star, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"
import type React from "react"

interface ArtistsScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
}

export function ArtistsScreen({ gameState, setGameState, onNavigate }: ArtistsScreenProps) {
  const handleHire = (artistId: string, cost: number) => {
    if (gameState.money < cost) {
      alert("Недостаточно денег!")
      return
    }

    setGameState((prev) => ({
      ...prev,
      money: prev.money - cost,
      hiredArtists: [...prev.hiredArtists, artistId],
      totalCollabs: prev.totalCollabs + 1,
    }))
  }

  const artists = [
    {
      id: "mc-flow",
      name: "MC Flow",
      avatar: "/hip-hop-rapper-portrait-mc-flow--young-male-artist.jpg",
      skill: 65,
      popularity: 45,
      cost: 100,
      genre: "Хип-хоп",
      status: gameState.hiredArtists.includes("mc-flow") ? "working" : "available",
    },
    {
      id: "lil-dreamer",
      name: "Lil Dreamer",
      avatar: "/trap-artist-portrait-lil-dreamer--stylish-young-ra.jpg",
      skill: 72,
      popularity: 38,
      cost: 120,
      genre: "Трэп",
      status: gameState.hiredArtists.includes("lil-dreamer") ? "working" : "available",
    },
    {
      id: "street-poet",
      name: "Street Poet",
      avatar: "/conscious-hip-hop-artist-portrait--thoughtful-rapp.jpg",
      skill: 58,
      popularity: 52,
      cost: 90,
      genre: "Сознательный",
      status: gameState.hiredArtists.includes("street-poet") ? "working" : "available",
    },
    {
      id: "young-legend",
      name: "Young Legend",
      avatar: "/famous-hip-hop-star-portrait--successful-rapper-wi.jpg",
      skill: 85,
      popularity: 70,
      cost: 250,
      genre: "Хип-хоп",
      status:
        gameState.reputation < 500
          ? "locked"
          : gameState.hiredArtists.includes("young-legend")
            ? "working"
            : "available",
    },
  ]

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b border-border/50 flex items-center gap-3 backdrop-blur-xl bg-card/80">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("home")}
          className="active:scale-95 transition-transform text-foreground hover:text-foreground/80"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Артисты</h1>
          <p className="text-xs text-muted-foreground">Найди таланты для коллабораций</p>
        </div>
        <div className="flex items-center gap-1 text-secondary">
          <Users className="w-4 h-4" />
          <span className="text-sm font-bold">{gameState.hiredArtists.length}/10</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center shadow-md">
            <p className="text-xl font-bold text-primary">{gameState.totalCollabs}</p>
            <p className="text-xs text-muted-foreground mt-1">Коллабов</p>
          </Card>
          <Card className="p-3 text-center shadow-md">
            <p className="text-xl font-bold text-secondary">4.3</p>
            <p className="text-xs text-muted-foreground mt-1">Ср. рейтинг</p>
          </Card>
          <Card className="p-3 text-center shadow-md">
            <p className="text-xl font-bold text-accent">+15%</p>
            <p className="text-xs text-muted-foreground mt-1">Успех</p>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Доступные артисты
          </h3>
          <div className="space-y-3">
            {artists.map((artist, i) => (
              <Card key={i} className={`p-4 shadow-md ${artist.status === "locked" ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 shadow-md bg-gradient-to-br from-primary/20 to-secondary/20">
                    <img
                      src={artist.avatar || "/placeholder.svg"}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{artist.name}</p>
                        <p className="text-xs text-muted-foreground">{artist.genre}</p>
                      </div>
                      {artist.status === "locked" && <span className="text-xs bg-muted px-2 py-1 rounded-lg">🔒</span>}
                      {artist.status === "working" && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-lg">Работает</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 text-primary" />
                        <span className="text-muted-foreground">Навык:</span>
                        <span className="font-semibold">{artist.skill}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3 h-3 text-secondary" />
                        <span className="text-muted-foreground">Популярность:</span>
                        <span className="font-semibold">{artist.popularity}%</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full active:scale-95 transition-transform"
                      variant={artist.status === "locked" ? "outline" : "default"}
                      disabled={artist.status === "working" || artist.status === "locked"}
                      onClick={() => handleHire(artist.id, artist.cost)}
                    >
                      {artist.status === "locked"
                        ? "Требуется 500 репутации"
                        : artist.status === "working"
                          ? "В студии..."
                          : `Нанять ($${artist.cost})`}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-4 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30 shadow-md">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="font-semibold text-sm mb-1">Совет профи</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Артисты с высоким навыком создают качественные треки, но популярные артисты быстрее повышают твою
                репутацию и открывают путь к большим лейблам!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
