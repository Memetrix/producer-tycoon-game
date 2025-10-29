"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { type GameState } from "@/lib/game-state"
import {
  User,
  Music,
  DollarSign,
  Trophy,
  Users,
  Zap,
  TrendingUp,
  Award,
  Calendar,
  Target,
  Star
} from "lucide-react"
import { getTotalEnergyBonus, getTotalPassiveIncome } from "@/lib/game-state"

interface ProfileScreenProps {
  gameState: GameState
  onLogout: () => void
}

export function ProfileScreen({ gameState, onLogout }: ProfileScreenProps) {
  const totalArtists = Object.values(gameState.artists).reduce((sum, level) => sum + level, 0)
  const totalSkills = Object.values(gameState.skills).filter(Boolean).length
  const totalPassiveIncome = getTotalPassiveIncome(gameState.artists)
  const totalEnergyBonus = getTotalEnergyBonus(gameState.artists)

  // Calculate player level based on reputation
  const playerLevel = Math.floor(gameState.reputation / 500) + 1
  const nextLevelRep = playerLevel * 500
  const currentLevelRep = (playerLevel - 1) * 500
  const levelProgress = ((gameState.reputation - currentLevelRep) / (nextLevelRep - currentLevelRep)) * 100

  // Get music style display name
  const musicStyleNames = {
    hip_hop: "Hip-Hop",
    electronic: "Electronic",
    pop: "Pop",
    rock: "Rock",
  }

  const startingBonusNames = {
    energizer: "Энергайзер",
    rich_kid: "Богатенький",
    networker: "Сетевик",
    prodigy: "Продиджи",
  }

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header with Avatar */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 shadow-xl border-2">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Large Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-primary shadow-2xl">
                <AvatarImage src={gameState.playerAvatar} alt={gameState.playerName} />
                <AvatarFallback className="text-4xl">
                  {gameState.playerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                {playerLevel}
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h1 className="text-3xl font-bold">{gameState.playerName}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                  <Badge variant="secondary" className="text-sm">
                    {musicStyleNames[gameState.musicStyle]}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {startingBonusNames[gameState.startingBonus]}
                  </Badge>
                </div>
              </div>

              {/* Level Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Уровень {playerLevel}</span>
                  <span className="text-muted-foreground">{gameState.reputation} / {nextLevelRep} REP</span>
                </div>
                <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center hover:shadow-lg transition-shadow">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">${gameState.money.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Деньги</p>
          </Card>

          <Card className="p-4 text-center hover:shadow-lg transition-shadow">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold">{gameState.reputation.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Репутация</p>
          </Card>

          <Card className="p-4 text-center hover:shadow-lg transition-shadow">
            <Zap className="w-8 h-8 mx-auto mb-2 text-secondary" />
            <p className="text-2xl font-bold">{Math.round(gameState.energy)}</p>
            <p className="text-xs text-muted-foreground">Энергия</p>
          </Card>

          <Card className="p-4 text-center hover:shadow-lg transition-shadow">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{gameState.currentStage}</p>
            <p className="text-xs text-muted-foreground">Стадия</p>
          </Card>
        </div>

        {/* Career Statistics */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Статистика карьеры
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Music className="w-4 h-4" />
                <span className="text-sm">Битов создано</span>
              </div>
              <p className="text-2xl font-bold">{gameState.totalBeatsCreated}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Всего заработано</span>
              </div>
              <p className="text-2xl font-bold">${gameState.totalMoneyEarned.toLocaleString()}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">От продажи битов</span>
              </div>
              <p className="text-2xl font-bold">${gameState.totalBeatsEarnings.toLocaleString()}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">Артистов нанято</span>
              </div>
              <p className="text-2xl font-bold">{totalArtists}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="w-4 h-4" />
                <span className="text-sm">Навыков изучено</span>
              </div>
              <p className="text-2xl font-bold">{totalSkills} / 10</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Music className="w-4 h-4" />
                <span className="text-sm">Битов в хранилище</span>
              </div>
              <p className="text-2xl font-bold">{gameState.beats.length}</p>
            </div>
          </div>
        </Card>

        {/* Passive Income Stats */}
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Пассивный доход
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">В минуту</p>
              <p className="text-3xl font-bold text-green-500">${totalPassiveIncome.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">В час</p>
              <p className="text-3xl font-bold text-green-500">${(totalPassiveIncome * 60).toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">В день (24ч)</p>
              <p className="text-2xl font-bold text-green-500">${(totalPassiveIncome * 60 * 24).toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Бонус энергии</p>
              <p className="text-2xl font-bold text-secondary">+{totalEnergyBonus}</p>
            </div>
          </div>
        </Card>

        {/* Equipment Summary */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Оборудование
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(gameState.equipment).map(([key, level]) => {
              const names: Record<string, string> = {
                phone: "Телефон",
                headphones: "Наушники",
                microphone: "Микрофон",
                computer: "Компьютер",
                midi: "MIDI-клавиатура",
                audioInterface: "Аудиоинтерфейс",
              }
              return (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-secondary/10">
                  <span className="text-sm">{names[key]}</span>
                  <Badge variant="outline">Ур. {level}</Badge>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Contract Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Контракты
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1 text-center">
              <p className="text-sm text-muted-foreground">Активных</p>
              <p className="text-2xl font-bold">{gameState.beatContracts.activeContracts.length}</p>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm text-muted-foreground">Доступных</p>
              <p className="text-2xl font-bold">{gameState.beatContracts.availableContracts.length}</p>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm text-muted-foreground">Завершено</p>
              <p className="text-2xl font-bold">{gameState.beatContracts.completedContracts}</p>
            </div>
          </div>
        </Card>

        {/* Logout Button */}
        <Card className="p-4">
          <Button
            onClick={onLogout}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            <User className="w-4 h-4 mr-2" />
            Выйти из аккаунта
          </Button>
        </Card>
      </div>
    </div>
  )
}
