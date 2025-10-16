"use client"

import { ArrowLeft, Target, Clock, Trophy, CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"
import { getAvailableContracts, BEAT_CONTRACTS_POOL, getReputationTier } from "@/lib/game-state"
import type React from "react"
import { useState, useEffect } from "react"

interface ContractsScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
}

export function ContractsScreen({ gameState, setGameState, onNavigate }: ContractsScreenProps) {
  const [selectedTab, setSelectedTab] = useState<"available" | "active" | "completed">("available")

  const currentTier = getReputationTier(gameState.reputation)
  const availableContracts = getAvailableContracts(gameState.reputation)

  // Initialize contracts on first visit (if tier >= 2 and no contracts)
  useEffect(() => {
    if (currentTier >= 2 && gameState.beatContracts.availableContracts.length === 0 && gameState.beatContracts.activeContracts.length === 0) {
      refreshContracts()
    }
  }, [currentTier])

  const refreshContracts = () => {
    // Refresh available contracts (2-3 random contracts from available pool)
    const contractPool = availableContracts
    const numContracts = Math.min(3, contractPool.length)
    const shuffled = [...contractPool].sort(() => Math.random() - 0.5)
    const newContracts = shuffled.slice(0, numContracts).map(c => c.id)

    setGameState((prev) => ({
      ...prev,
      beatContracts: {
        ...prev.beatContracts,
        availableContracts: newContracts,
        lastRefreshDate: new Date().toISOString(),
      },
    }))
  }

  const handleAcceptContract = (contractId: string) => {
    if (gameState.beatContracts.activeContracts.length >= 3) {
      alert("У тебя уже 3 активных контракта! Заверши один, чтобы взять новый.")
      return
    }

    setGameState((prev) => ({
      ...prev,
      beatContracts: {
        ...prev.beatContracts,
        availableContracts: prev.beatContracts.availableContracts.filter((id) => id !== contractId),
        activeContracts: [...prev.beatContracts.activeContracts, contractId],
      },
    }))
  }

  const handleCancelContract = (contractId: string) => {
    setGameState((prev) => ({
      ...prev,
      beatContracts: {
        ...prev.beatContracts,
        activeContracts: prev.beatContracts.activeContracts.filter((id) => id !== contractId),
        availableContracts: [...prev.beatContracts.availableContracts, contractId],
      },
    }))
  }

  const getContractProgress = (contractId: string) => {
    const contract = BEAT_CONTRACTS_POOL.find((c) => c.id === contractId)
    if (!contract) return { current: 0, required: 0, percentage: 0 }

    // TODO: Track actual progress in gameState
    // For now, return mock data
    const current = 0
    const required = contract.requirements.beats || 1
    const percentage = (current / required) * 100

    return { current, required, percentage }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500 bg-green-500/20 border-green-500/30"
      case "medium":
        return "text-yellow-500 bg-yellow-500/20 border-yellow-500/30"
      case "hard":
        return "text-red-500 bg-red-500/20 border-red-500/30"
      default:
        return "text-primary bg-primary/20 border-primary/30"
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Легко"
      case "medium":
        return "Средне"
      case "hard":
        return "Сложно"
      default:
        return difficulty
    }
  }

  const activeContractsList = BEAT_CONTRACTS_POOL.filter((c) =>
    gameState.beatContracts.activeContracts.includes(c.id),
  )
  const availableContractsList = availableContracts.filter((c) =>
    gameState.beatContracts.availableContracts.includes(c.id),
  )
  const completedContractsList = BEAT_CONTRACTS_POOL.filter((c) =>
    gameState.beatContracts.completedContracts.includes(c.id),
  )

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
          <h1 className="text-lg font-semibold">Контракты</h1>
          <p className="text-xs text-muted-foreground">Выполняй задания и получай награды</p>
        </div>
        <div className="flex items-center gap-1 text-secondary">
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-bold">{completedContractsList.length}</span>
        </div>
      </div>

      {currentTier < 2 && (
        <div className="p-4">
          <Card className="p-4 bg-muted border-muted-foreground/20">
            <div className="flex gap-3">
              <div className="text-3xl">🔒</div>
              <div>
                <p className="font-semibold mb-1">Контракты заблокированы</p>
                <p className="text-sm text-muted-foreground">
                  Достигни Tier 2 (500+ репутации), чтобы получать контракты от клиентов!
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Твоя репутация: {gameState.reputation}/500
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {currentTier >= 2 && (
        <>
          {/* Refresh Button */}
          <div className="p-4 pb-0">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshContracts}
              className="w-full"
              disabled={activeContractsList.length > 0}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {activeContractsList.length > 0
                ? "Завершите активные контракты для обновления"
                : "Обновить доступные контракты"}
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 p-4 border-b border-border/50">
            <Button
              variant={selectedTab === "available" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTab("available")}
              className="flex-1"
            >
              Доступные ({availableContractsList.length})
            </Button>
            <Button
              variant={selectedTab === "active" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTab("active")}
              className="flex-1"
            >
              Активные ({activeContractsList.length})
            </Button>
            <Button
              variant={selectedTab === "completed" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTab("completed")}
              className="flex-1"
            >
              Завершены ({completedContractsList.length})
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3">
            {/* Available Contracts */}
            {selectedTab === "available" && (
              <>
                {availableContractsList.length === 0 && (
                  <Card className="p-4 text-center text-muted-foreground">
                    <p>Нет доступных контрактов</p>
                    <p className="text-xs mt-1">Возвращайся позже или повышай репутацию для новых контрактов!</p>
                  </Card>
                )}
                {availableContractsList.map((contract) => (
                  <Card key={contract.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{contract.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{contract.name}</p>
                            <p className="text-xs text-muted-foreground">{contract.description}</p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-lg border flex-shrink-0 ml-2 ${getDifficultyColor(contract.difficulty)}`}
                          >
                            {getDifficultyLabel(contract.difficulty)}
                          </span>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-2 mb-3 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Награда:</span>
                            <span className="font-semibold text-primary">
                              ${contract.reward.money} + {contract.reward.reputation} репутации
                            </span>
                          </div>
                          {contract.requirements.beats && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Битов:</span>
                              <span className="font-semibold">{contract.requirements.beats}</span>
                            </div>
                          )}
                          {contract.requirements.minQuality && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Минимальное качество:</span>
                              <span className="font-semibold">{contract.requirements.minQuality}%</span>
                            </div>
                          )}
                          {contract.requirements.minAccuracy && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Минимальная точность:</span>
                              <span className="font-semibold">{contract.requirements.minAccuracy}%</span>
                            </div>
                          )}
                          {contract.requirements.timeLimit && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Ограничение времени:</span>
                              <span className="font-semibold">
                                {Math.floor(contract.requirements.timeLimit / 24)} дней
                              </span>
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleAcceptContract(contract.id)}
                          disabled={activeContractsList.length >= 3}
                        >
                          {activeContractsList.length >= 3 ? "Макс. контрактов (3)" : "Принять контракт"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}

            {/* Active Contracts */}
            {selectedTab === "active" && (
              <>
                {activeContractsList.length === 0 && (
                  <Card className="p-4 text-center text-muted-foreground">
                    <p>Нет активных контрактов</p>
                    <p className="text-xs mt-1">Выбери контракт из доступных, чтобы начать!</p>
                  </Card>
                )}
                {activeContractsList.map((contract) => {
                  const progress = getContractProgress(contract.id)
                  return (
                    <Card key={contract.id} className="p-4 bg-primary/5 border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{contract.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold">{contract.name}</p>
                              <p className="text-xs text-muted-foreground">{contract.description}</p>
                            </div>
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-lg flex-shrink-0 ml-2">
                              В процессе
                            </span>
                          </div>

                          <div className="bg-muted/50 rounded-lg p-2 mb-3 space-y-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Прогресс:</span>
                              <span className="font-semibold text-primary">
                                {progress.current}/{progress.required}
                              </span>
                            </div>
                            <Progress value={progress.percentage} className="h-2" />
                            {contract.requirements.timeLimit && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>Осталось: 6 дней (TODO: real timer)</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleCancelContract(contract.id)}>
                              <XCircle className="w-4 h-4 mr-1" />
                              Отменить
                            </Button>
                            <Button size="sm" className="flex-1" disabled>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Завершить
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </>
            )}

            {/* Completed Contracts */}
            {selectedTab === "completed" && (
              <>
                {completedContractsList.length === 0 && (
                  <Card className="p-4 text-center text-muted-foreground">
                    <p>Нет завершенных контрактов</p>
                    <p className="text-xs mt-1">Завершай контракты, чтобы увидеть их здесь!</p>
                  </Card>
                )}
                {completedContractsList.map((contract) => (
                  <Card key={contract.id} className="p-4 bg-accent/5 border-accent/20 opacity-80">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{contract.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{contract.name}</p>
                            <p className="text-xs text-muted-foreground">{contract.description}</p>
                          </div>
                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-lg flex-shrink-0 ml-2">
                            ✓ Выполнен
                          </span>
                        </div>

                        <div className="bg-accent/10 rounded-lg p-2">
                          <p className="text-xs font-semibold text-accent">
                            Получено: ${contract.reward.money} + {contract.reward.reputation} репутации
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}

            {/* Help Card */}
            <Card className="p-4 bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/30">
              <div className="flex gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <p className="font-semibold text-sm mb-1">О контрактах</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Контракты - это задания от клиентов. Выполняй их, чтобы получать деньги и репутацию. Можно иметь до
                    3 активных контрактов одновременно. Чем выше репутация, тем сложнее (и выгоднее!) контракты!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
