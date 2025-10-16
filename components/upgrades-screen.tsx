"use client"

import { ArrowLeft, Calendar, CheckCircle2, Clock, Flame, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"
import {
  FREE_TRAINING_CONFIG,
  getTimeUntilDailyReset,
  shouldResetDailyTasks,
  shouldBreakStreak,
  getDailyTasksForDay,
  STREAK_REWARDS,
  getUnclaimedStreakRewards,
  LABEL_DEALS_CONFIG,
  getReputationTier,
} from "@/lib/game-state"
import type React from "react"
import { useEffect, useState } from "react"

interface UpgradesScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
}

export function UpgradesScreen({ gameState, setGameState, onNavigate }: UpgradesScreenProps) {
  const [timeUntilReset, setTimeUntilReset] = useState(getTimeUntilDailyReset())
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null)

  const dailyTasks = gameState.dailyTasks || {
    lastCompletedDate: "",
    currentStreak: 0,
    completedTaskIds: [],
    claimedStreakRewards: [],
  }

  const trainingProgress = gameState.trainingProgress || {
    freeSeminar: false,
    freeBookChapter: false,
  }

  useEffect(() => {
    if (shouldResetDailyTasks(dailyTasks.lastCompletedDate)) {
      const breakStreak = shouldBreakStreak(dailyTasks.lastCompletedDate)

      // Check if user completed all tasks yesterday
      const completedAllTasksYesterday = dailyTasks.completedTaskIds.length > 0 && dailyTasks.lastCompletedDate !== ""

      // Increment streak only if they completed all tasks yesterday and didn't break the streak
      const newStreak = breakStreak
        ? 0
        : completedAllTasksYesterday
          ? dailyTasks.currentStreak + 1
          : dailyTasks.currentStreak

      setGameState((prev) => ({
        ...prev,
        dailyTasks: {
          lastCompletedDate: "",
          currentStreak: newStreak,
          completedTaskIds: [],
          claimedStreakRewards: breakStreak ? [] : prev.dailyTasks?.claimedStreakRewards || [],
        },
      }))
    }

    const interval = setInterval(() => {
      setTimeUntilReset(getTimeUntilDailyReset())
    }, 1000)

    return () => clearInterval(interval)
  }, [dailyTasks.lastCompletedDate, dailyTasks.currentStreak, dailyTasks.completedTaskIds.length, setGameState])

  useEffect(() => {
    const unclaimedRewards = getUnclaimedStreakRewards(dailyTasks.currentStreak, dailyTasks.claimedStreakRewards || [])

    if (unclaimedRewards.length > 0) {
      const milestone = unclaimedRewards[0]
      const reward = STREAK_REWARDS[milestone as keyof typeof STREAK_REWARDS]

      setGameState((prev) => ({
        ...prev,
        money: prev.money + reward.money,
        reputation: prev.reputation + reward.reputation,
        dailyTasks: {
          ...prev.dailyTasks,
          claimedStreakRewards: [...(prev.dailyTasks?.claimedStreakRewards || []), milestone],
        },
      }))

      alert(
        `🔥 Награда за стрик ${milestone} дней!\n\nПолучено:\n+$${reward.money}\n+${reward.reputation} репутации\n\n${reward.description}`,
      )
    }
  }, [dailyTasks.currentStreak, dailyTasks.claimedStreakRewards, setGameState])

  const formatTimeUntilReset = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const handleFreeTraining = (trainingId: "seminar" | "bookChapter") => {
    const training = FREE_TRAINING_CONFIG[trainingId]
    const key = trainingId === "seminar" ? "freeSeminar" : "freeBookChapter"

    if (trainingProgress[key]) {
      alert("Вы уже прошли это обучение!")
      return
    }

    setGameState((prev) => ({
      ...prev,
      money: prev.money + training.reward.money,
      reputation: prev.reputation + training.reward.reputation,
      trainingProgress: {
        ...prev.trainingProgress,
        [key]: true,
      },
    }))

    alert(`Обучение завершено! Получено: $${training.reward.money}, +${training.reward.reputation} репутации`)
  }

  const handleLabelDeal = (labelId: "indie" | "small" | "major") => {
    const deal = LABEL_DEALS_CONFIG[labelId]

    if (gameState.labelDeals[labelId]) {
      alert("Вы уже купили этот контракт!")
      return
    }

    if (gameState.reputation < deal.requiredReputation) {
      alert(`Требуется ${deal.requiredReputation} репутации!`)
      return
    }

    if (gameState.money < deal.cost) {
      alert("Недостаточно денег!")
      return
    }

    setGameState((prev) => ({
      ...prev,
      money: prev.money - deal.cost,
      labelDeals: {
        ...prev.labelDeals,
        [labelId]: true,
      },
    }))

    alert(`Контракт с ${deal.name} заключен! Пассивный доход: +${deal.passiveIncomePerHour}/час`)
  }

  const currentDayTasks = getDailyTasksForDay(dailyTasks.currentStreak)
  const totalTasksForDay = currentDayTasks.length

  const handleDailyTask = (taskId: string, task: (typeof currentDayTasks)[0]) => {
    if (dailyTasks.completedTaskIds.includes(taskId)) {
      alert("Вы уже выполнили это задание сегодня!")
      return
    }

    if (processingTaskId === taskId) {
      return
    }

    setProcessingTaskId(taskId)

    window.open(task.url, "_blank")

    setTimeout(() => {
      const newCompletedIds = [...(dailyTasks.completedTaskIds || []), taskId]
      const allTasksWillBeCompleted = newCompletedIds.length === totalTasksForDay

      setGameState((prev) => ({
        ...prev,
        money: prev.money + task.reward.money,
        reputation: prev.reputation + task.reward.reputation,
        energy: Math.min(prev.energy + (task.reward.energy || 0), 100),
        dailyTasks: {
          // Only set lastCompletedDate when ALL tasks are done, don't increment streak yet
          lastCompletedDate: allTasksWillBeCompleted
            ? new Date().toISOString()
            : prev.dailyTasks?.lastCompletedDate || "",
          currentStreak: prev.dailyTasks?.currentStreak || 0, // Don't increment here
          completedTaskIds: newCompletedIds,
          claimedStreakRewards: prev.dailyTasks?.claimedStreakRewards || [],
        },
      }))

      setProcessingTaskId(null)

      alert(
        `Задание выполнено! Получено: $${task.reward.money}, +${task.reward.reputation} репутации${task.reward.energy ? `, +${task.reward.energy} энергии` : ""}`,
      )
    }, 1000)
  }

  const completedTasksCount = dailyTasks.completedTaskIds.length
  const allTasksCompleted = completedTasksCount === totalTasksForDay

  const isSubscribeDay = dailyTasks.currentStreak % 2 === 0
  const dayTypeText = isSubscribeDay ? "Подписки" : "Лайки"

  const nextStreakMilestone = [7, 14, 30].find((m) => m > dailyTasks.currentStreak) || 30
  const progressToNextMilestone =
    dailyTasks.currentStreak >= 30 ? 100 : (dailyTasks.currentStreak / nextStreakMilestone) * 100

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
          <h1 className="text-lg font-semibold">Обучение и задания</h1>
          <p className="text-xs text-muted-foreground">Развивайся и получай награды</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
        {/* Daily Tasks Section */}
        <Card className="p-6 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border-primary/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Ежедневные задания</h2>
                  <p className="text-xs text-muted-foreground">
                    {completedTasksCount}/{totalTasksForDay} выполнено • День {dailyTasks.currentStreak + 1}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                  <Flame className="w-4 h-4" />
                  <span className="font-mono">{dailyTasks.currentStreak} дней</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">{formatTimeUntilReset(timeUntilReset)}</span>
                </div>
              </div>
            </div>

            <Progress value={(completedTasksCount / totalTasksForDay) * 100} className="h-2" />

            {allTasksCompleted && (
              <div className="p-3 rounded-lg bg-primary/20 border border-primary/30 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium">
                  Все задания выполнены! Возвращайся завтра чтобы продолжить стрик 🔥
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Streak Progress Card */}
        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-accent" />
                Прогресс стрика
              </h3>
              <span className="text-sm text-muted-foreground">
                {dailyTasks.currentStreak}/{nextStreakMilestone} дней
              </span>
            </div>
            <Progress value={progressToNextMilestone} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {dailyTasks.currentStreak >= 30
                ? "Максимальный стрик достигнут! 🏆"
                : `До следующей награды: ${nextStreakMilestone - dailyTasks.currentStreak} дней`}
            </p>
          </div>
        </Card>

        {/* Daily Tasks List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {dayTypeText} • День {dailyTasks.currentStreak + 1}
          </h3>
          {currentDayTasks.map((task) => {
            const isCompleted = dailyTasks.completedTaskIds.includes(task.id)
            const isProcessing = processingTaskId === task.id
            return (
              <Card key={task.id} className={`p-4 ${isCompleted ? "bg-primary/10 border-primary/30" : "bg-card"}`}>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{task.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{task.name}</p>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-primary font-medium">+${task.reward.money}</span>
                      <span className="text-secondary font-medium">+{task.reward.reputation} репутации</span>
                      {task.reward.energy && (
                        <span className="text-accent font-medium">+{task.reward.energy} энергии</span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={isCompleted || isProcessing}
                    onClick={() => handleDailyTask(task.id, task)}
                    className="active:scale-95 transition-transform"
                  >
                    {isCompleted ? "Готово" : isProcessing ? "..." : "Выполнить"}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Free Training Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Бесплатное обучение</h3>
          {Object.entries(FREE_TRAINING_CONFIG).map(([key, training]) => {
            const isCompleted = key === "seminar" ? trainingProgress.freeSeminar : trainingProgress.freeBookChapter
            return (
              <Card
                key={key}
                className={`p-4 bg-gradient-to-br ${isCompleted ? "from-primary/10 to-primary/5 border-primary/30" : "from-secondary/10 to-secondary/5"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <div className="text-2xl">{training.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{training.name}</p>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{training.description}</p>
                    <p className="text-xs text-muted-foreground mb-3">⏱️ {training.duration}</p>

                    <div className="mb-3 p-2 rounded-lg bg-background/50 border border-border">
                      <p className="text-xs font-medium">
                        <span className="text-muted-foreground">Награда: </span>
                        <span className="text-primary">
                          +${training.reward.money}, +{training.reward.reputation} репутации
                        </span>
                      </p>
                    </div>

                    <Button
                      size="sm"
                      disabled={isCompleted}
                      onClick={() => handleFreeTraining(key as "seminar" | "bookChapter")}
                      className="w-full active:scale-95 transition-transform"
                    >
                      {isCompleted ? "Пройдено" : "Начать обучение"}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Skills Navigation Card */}
        <Card
          className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 cursor-pointer hover:border-primary/50 transition-all active:scale-95"
          onClick={() => onNavigate("skills")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✨</div>
              <div>
                <p className="font-semibold">Древо навыков</p>
                <p className="text-xs text-muted-foreground">Разблокируй уникальные способности</p>
              </div>
            </div>
            <Button size="sm" variant="secondary">
              Открыть
            </Button>
          </div>
        </Card>

        {/* Label Deals Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Контракты с лейблами
          </h3>
          {Object.entries(LABEL_DEALS_CONFIG).map(([labelId, deal]) => {
            const isOwned = gameState.labelDeals[labelId as "indie" | "small" | "major"]
            const isLocked = gameState.reputation < deal.requiredReputation
            const currentTier = getReputationTier(gameState.reputation)

            return (
              <Card
                key={labelId}
                className={`p-4 ${isOwned ? "bg-primary/10 border-primary/30" : isLocked ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{deal.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{deal.name}</p>
                      {isOwned && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      {isLocked && <span className="text-xs bg-muted px-2 py-1 rounded-lg">🔒</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{deal.description}</p>

                    <div className="bg-muted/50 rounded-lg p-2 mb-3">
                      <p className="text-xs font-semibold text-accent">
                        Пассивный доход: +${deal.passiveIncomePerHour}/час (${Math.floor(deal.passiveIncomePerHour / 60)}/мин)
                      </p>
                    </div>

                    <Button
                      size="sm"
                      disabled={isOwned || isLocked}
                      onClick={() => handleLabelDeal(labelId as "indie" | "small" | "major")}
                      className="w-full active:scale-95 transition-transform"
                    >
                      {isOwned
                        ? "Контракт активен"
                        : isLocked
                          ? `Требуется ${deal.requiredReputation} репутации`
                          : `Купить ($${deal.cost})`}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Streak Rewards Info */}
        <Card className="p-4 border-accent/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-accent" />
            Награды за стрики
          </h3>
          <ul className="space-y-2 text-sm">
            {Object.entries(STREAK_REWARDS).map(([milestone, reward]) => {
              const isClaimed = (dailyTasks.claimedStreakRewards || []).includes(Number(milestone))
              const isReached = dailyTasks.currentStreak >= Number(milestone)
              return (
                <li
                  key={milestone}
                  className={`flex items-start gap-2 ${isClaimed ? "text-muted-foreground line-through" : isReached ? "text-primary font-medium" : ""}`}
                >
                  <span className="text-accent">{isClaimed ? "✅" : "🔥"}</span>
                  <span>
                    {milestone} дней: +${reward.money} и +{reward.reputation} репутации
                    {isClaimed && " (получено)"}
                  </span>
                </li>
              )
            })}
            <li className="flex items-start gap-2 text-red-500">
              <span>⚠️</span>
              <span>Пропустишь день - стрик сбрасывается!</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
