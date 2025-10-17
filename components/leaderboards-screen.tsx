"use client"

import { ArrowLeft, Trophy, Medal, Crown, TrendingUp, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"
import { useState } from "react"

interface LeaderboardsScreenProps {
  gameState: GameState
  onNavigate: (screen: Screen) => void
}

interface LeaderboardEntry {
  rank: number
  playerName: string
  playerAvatar: string
  score: number
  reputation: number
  beatsCreated: number
  isCurrentPlayer?: boolean
}

// Mock data for global leaderboard
const MOCK_GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    playerName: "DJ Supreme",
    playerAvatar: "/placeholder-artist-1.jpg",
    score: 125000,
    reputation: 45000,
    beatsCreated: 1250,
  },
  {
    rank: 2,
    playerName: "Beat Master",
    playerAvatar: "/placeholder-artist-2.jpg",
    score: 98000,
    reputation: 38000,
    beatsCreated: 980,
  },
  {
    rank: 3,
    playerName: "Producer King",
    playerAvatar: "/placeholder-artist-3.jpg",
    score: 87000,
    reputation: 32000,
    beatsCreated: 870,
  },
  {
    rank: 4,
    playerName: "Sound Wizard",
    playerAvatar: "/placeholder-artist-1.jpg",
    score: 76000,
    reputation: 28000,
    beatsCreated: 760,
  },
  {
    rank: 5,
    playerName: "Mix Machine",
    playerAvatar: "/placeholder-artist-2.jpg",
    score: 65000,
    reputation: 24000,
    beatsCreated: 650,
  },
]

// Mock data for weekly leaderboard
const MOCK_WEEKLY_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    playerName: "Rising Star",
    playerAvatar: "/placeholder-artist-1.jpg",
    score: 12500,
    reputation: 4500,
    beatsCreated: 125,
  },
  {
    rank: 2,
    playerName: "Hot Streak",
    playerAvatar: "/placeholder-artist-2.jpg",
    score: 9800,
    reputation: 3800,
    beatsCreated: 98,
  },
  {
    rank: 3,
    playerName: "Weekly Grinder",
    playerAvatar: "/placeholder-artist-3.jpg",
    score: 8700,
    reputation: 3200,
    beatsCreated: 87,
  },
  {
    rank: 4,
    playerName: "Hustler Pro",
    playerAvatar: "/placeholder-artist-1.jpg",
    score: 7600,
    reputation: 2800,
    beatsCreated: 76,
  },
  {
    rank: 5,
    playerName: "Speed Demon",
    playerAvatar: "/placeholder-artist-2.jpg",
    score: 6500,
    reputation: 2400,
    beatsCreated: 65,
  },
]

export function LeaderboardsScreen({ gameState, onNavigate }: LeaderboardsScreenProps) {
  const [selectedTab, setSelectedTab] = useState<"global" | "weekly">("global")

  // Calculate player's position (mock)
  const playerScore = gameState.totalMoneyEarned + gameState.reputation * 10
  const playerRank = 127 // Mock rank

  // Get current leaderboard data
  const currentLeaderboard = selectedTab === "global" ? MOCK_GLOBAL_LEADERBOARD : MOCK_WEEKLY_LEADERBOARD

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black"
      case 2:
        return "bg-gradient-to-br from-gray-300 to-gray-500 text-black"
      case 3:
        return "bg-gradient-to-br from-amber-500 to-amber-700 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
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
          <h1 className="text-lg font-semibold">Рейтинг</h1>
          <p className="text-xs text-muted-foreground">Лучшие продюсеры</p>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-bold">#{playerRank}</span>
        </div>
      </div>

      {/* Player Card */}
      <div className="p-4 pb-2">
        <Card className="p-4 bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-primary/50"
                style={{ backgroundImage: `url(${gameState.playerAvatar || "/placeholder-avatar.jpg"})` }}
              />
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                #{playerRank}
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
                  <TrendingUp className="w-3 h-3" />
                  ${gameState.totalMoneyEarned.toLocaleString()}
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
      <div className="flex items-center gap-2 p-4 pb-2 border-b border-border/50">
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
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-2">
        {currentLeaderboard.map((entry) => (
          <Card
            key={entry.rank}
            className={`p-3 transition-all ${
              entry.rank <= 3
                ? "bg-gradient-to-r from-card via-card to-primary/5 border-primary/30"
                : "bg-card/50"
            } ${entry.isCurrentPlayer ? "ring-2 ring-primary" : ""}`}
          >
            <div className="flex items-center gap-3">
              {/* Rank Badge */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getRankBadgeColor(entry.rank)}`}
              >
                {getRankIcon(entry.rank)}
              </div>

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
        ))}

        {/* Info Card */}
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
                Топ-10 игроков недельного рейтинга будут получать эксклюзивные награды: деньги, репутацию, энергию и
                специальные бонусы!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
