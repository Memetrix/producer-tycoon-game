"use client"

import { ArrowLeft, Trophy, TrendingUp, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"
import { useState, useEffect } from "react"
import { DesktopLayout } from "@/components/desktop-layout"

interface LeaderboardsScreenProps {
  gameState: GameState
  onNavigate: (screen: Screen) => void
}

interface LeaderboardEntry {
  rank: number
  playerId: string
  playerName: string
  playerAvatar: string
  score: number
  reputation: number
  beatsCreated: number
  isCurrentPlayer?: boolean
}

export function LeaderboardsScreen({ gameState, onNavigate }: LeaderboardsScreenProps) {
  const [selectedTab, setSelectedTab] = useState<"global" | "weekly">("global")
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [playerRank, setPlayerRank] = useState<number>(0)
  const [playerScore, setPlayerScore] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        console.log("[v0] Fetching leaderboard, type:", selectedTab)
        const url = gameState.playerId
          ? `/api/leaderboards?type=${selectedTab}&playerId=${gameState.playerId}`
          : `/api/leaderboards?type=${selectedTab}`

        const response = await fetch(url)
        console.log("[v0] Response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.error("[v0] API error response:", errorData)
          throw new Error(errorData.error || "Failed to fetch leaderboard")
        }

        const data = await response.json()
        console.log("[v0] Leaderboard data received:", data)
        setLeaderboard(data.leaderboard)
        setPlayerRank(data.playerRank)
        setPlayerScore(data.playerScore)
      } catch (error: any) {
        console.error("[v0] Failed to fetch leaderboard:", error.message, error)
        // Keep empty leaderboard on error
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [selectedTab, gameState.playerId]) // Added playerId dependency

  const getVinylDisc = (rank: number) => {
    const colors = {
      1: {
        // Platinum
        outer: "from-slate-100 via-slate-200 to-slate-300",
        inner: "from-slate-200 via-slate-300 to-slate-400",
        shine: "from-white/40 via-transparent to-transparent",
        shadow: "shadow-slate-400/50",
      },
      2: {
        // Gold
        outer: "from-yellow-200 via-yellow-300 to-yellow-400",
        inner: "from-yellow-300 via-yellow-400 to-yellow-500",
        shine: "from-yellow-100/60 via-transparent to-transparent",
        shadow: "shadow-yellow-400/50",
      },
      3: {
        // Silver
        outer: "from-gray-200 via-gray-300 to-gray-400",
        inner: "from-gray-300 via-gray-400 to-gray-500",
        shine: "from-gray-100/50 via-transparent to-transparent",
        shadow: "shadow-gray-400/50",
      },
    }

    const color = colors[rank as keyof typeof colors]
    if (!color) return null

    return (
      <div className="relative w-10 h-10 flex-shrink-0">
        {/* Outer glow */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${color.outer} blur-sm opacity-60`} />

        {/* Main disc */}
        <div
          className={`relative w-full h-full rounded-full bg-gradient-to-br ${color.inner} ${color.shadow} shadow-lg`}
        >
          {/* Vinyl grooves (concentric circles) */}
          <div className="absolute inset-[2px] rounded-full border border-black/10" />
          <div className="absolute inset-[4px] rounded-full border border-black/10" />
          <div className="absolute inset-[6px] rounded-full border border-black/10" />
          <div className="absolute inset-[8px] rounded-full border border-black/10" />

          {/* Center label */}
          <div className="absolute inset-[30%] rounded-full bg-gradient-to-br from-gray-800 to-black shadow-inner" />

          {/* Metallic shine effect */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${color.shine} opacity-80`}
            style={{ transform: "rotate(-45deg)" }}
          />

          {/* Radial shine */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
            }}
          />
        </div>
      </div>
    )
  }

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return getVinylDisc(rank)
    }
    return (
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
      </div>
    )
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-900 shadow-lg shadow-slate-400/50"
      case 2:
        return "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 text-yellow-900 shadow-lg shadow-yellow-400/50"
      case 3:
        return "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-gray-900 shadow-lg shadow-gray-400/50"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <DesktopLayout maxWidth="xl">
      <div className="flex flex-col h-screen lg:h-auto">
        {/* Header */}
        <div className="lg:hidden p-4 border-b border-border/50 flex items-center gap-3 backdrop-blur-xl bg-card/80">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("home")}
            className="active:scale-95 transition-transform text-foreground hover:text-foreground/80"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Рейтинг</h1>
            <p className="text-xs text-muted-foreground">Лучшие продюсеры</p>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-bold">#{playerRank || "—"}</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Рейтинг</h1>
            <p className="text-muted-foreground">Лучшие продюсеры</p>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Trophy className="w-6 h-6" />
            <span className="text-2xl font-bold">#{playerRank || "—"}</span>
          </div>
        </div>

        {/* Player Card */}
        <div className="p-4 lg:p-0 pb-2 lg:mb-4">
          <Card className="p-4 bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-primary/50"
                  style={{ backgroundImage: `url(${gameState.playerAvatar || "/placeholder-avatar.jpg"})` }}
                />
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  #{playerRank || "—"}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{gameState.playerName}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {gameState.reputation} rep
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />${gameState.totalMoneyEarned.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{playerScore.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">очков</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-4 lg:p-0 pb-2 lg:mb-4 border-b border-border/50 lg:border-0">
          <Button
            variant={selectedTab === "global" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedTab("global")}
            className="flex-1"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Глобальный
          </Button>
          <Button
            variant={selectedTab === "weekly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedTab("weekly")}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Недельный
          </Button>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-0 pb-20 lg:pb-0 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Загрузка рейтинга...</p>
              </div>
            </div>
          ) : leaderboard.length === 0 ? (
            <Card className="p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-semibold mb-1">Рейтинг пуст</p>
              <p className="text-sm text-muted-foreground">Будь первым в списке лучших продюсеров!</p>
            </Card>
          ) : (
            leaderboard.map((entry) => (
              <Card
                key={entry.playerId}
                className={`p-3 transition-all ${
                  entry.rank <= 3 ? "bg-gradient-to-r from-card via-card to-primary/5 border-primary/30" : "bg-card/50"
                } ${entry.isCurrentPlayer ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(entry.rank)}

                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full bg-cover bg-center border border-border flex-shrink-0"
                    style={{ backgroundImage: `url(${entry.playerAvatar})` }}
                  />

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${entry.rank <= 3 ? "text-primary" : ""}`}>
                      {entry.playerName}
                      {entry.isCurrentPlayer && <span className="ml-1 text-xs text-accent">(Ты)</span>}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{entry.reputation.toLocaleString()} rep</span>
                      <span>•</span>
                      <span>{entry.beatsCreated} битов</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold">{entry.score.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">очков</p>
                  </div>
                </div>
              </Card>
            ))
          )}

          {/* Info Card */}
          {!loading && leaderboard.length > 0 && (
            <>
              <Card className="p-4 bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/30 mt-4">
                <div className="flex gap-3">
                  <div className="text-2xl">ℹ️</div>
                  <div>
                    <p className="font-semibold text-sm mb-1">О рейтинге</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedTab === "global"
                        ? "Глобальный рейтинг показывает лучших продюсеров всех времен. Очки рассчитываются на основе заработка и репутации."
                        : "Недельный рейтинг обновляется каждую неделю. Соревнуйся за топ-позиции и получай специальные награды!"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Coming Soon: Rewards */}
              <Card className="p-4 bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/30">
                <div className="flex gap-3">
                  <div className="text-2xl">🎁</div>
                  <div>
                    <p className="font-semibold text-sm mb-1">Скоро: Награды за топ-позиции!</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Топ-10 игроков недельного рейтинга будут получать эксклюзивные награды: деньги, репутацию, энергию
                      и специальные бонусы!
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </DesktopLayout>
  )
}
