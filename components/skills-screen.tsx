"use client"

import { ArrowLeft, Sparkles, Zap, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Screen } from "@/app/page"
import type { GameState } from "@/lib/game-state"
import { SKILLS_CONFIG, getReputationTier } from "@/lib/game-state"
import type React from "react"
import { DesktopLayout } from "@/components/desktop-layout"

interface SkillsScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
}

export function SkillsScreen({ gameState, setGameState, onNavigate }: SkillsScreenProps) {
  const handleUnlockSkill = (skillId: keyof GameState["skills"]) => {
    const skill = SKILLS_CONFIG[skillId]

    if (gameState.reputation < skill.requiredReputation) {
      alert(`Требуется ${skill.requiredReputation} репутации!`)
      return
    }

    if (gameState.money < skill.cost) {
      alert("Недостаточно денег!")
      return
    }

    if (gameState.skills[skillId]) {
      alert("Этот навык уже разблокирован!")
      return
    }

    setGameState((prev) => ({
      ...prev,
      money: prev.money - skill.cost,
      skills: {
        ...prev.skills,
        [skillId]: true,
      },
    }))
  }

  const energySkills = Object.values(SKILLS_CONFIG).filter((s) => s.branch === "energy")
  const qualitySkills = Object.values(SKILLS_CONFIG).filter((s) => s.branch === "quality")
  const moneySkills = Object.values(SKILLS_CONFIG).filter((s) => s.branch === "money")

  const currentTier = getReputationTier(gameState.reputation)

  const renderSkillBranch = (skills: typeof energySkills, branchName: string, icon: React.ReactNode) => {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{branchName}</h3>
        </div>
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {skills.map((skill) => {
            const isUnlocked = gameState.skills[skill.id]
            const isLocked = gameState.reputation < skill.requiredReputation
            const canAfford = gameState.money >= skill.cost

            return (
              <Card
                key={skill.id}
                className={`p-4 shadow-md transition-all ${
                  isUnlocked ? "bg-primary/10 border-primary/50" : isLocked ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">{skill.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{skill.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                      </div>
                      {isUnlocked && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-lg flex-shrink-0">
                          ✓ Активен
                        </span>
                      )}
                      {isLocked && !isUnlocked && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-lg flex-shrink-0">🔒</span>
                      )}
                    </div>

                    <div className="bg-muted/50 rounded-lg p-2 mb-3">
                      <p className="text-xs font-semibold text-accent">{skill.effect}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground">
                        Требуется: {skill.requiredReputation} репутации (Tier{" "}
                        {Math.ceil(skill.requiredReputation / 500)})
                      </span>
                      <span className="font-semibold text-primary">${skill.cost}</span>
                    </div>

                    <Button
                      size="sm"
                      className="w-full active:scale-95 transition-transform"
                      variant={isLocked ? "outline" : isUnlocked ? "secondary" : "default"}
                      disabled={isLocked || isUnlocked || !canAfford}
                      onClick={() => handleUnlockSkill(skill.id)}
                    >
                      {isUnlocked
                        ? "Разблокирован"
                        : isLocked
                          ? `Требуется ${skill.requiredReputation} репутации`
                          : !canAfford
                            ? "Недостаточно денег"
                            : `Разблокировать ($${skill.cost})`}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const unlockedCount = Object.values(gameState.skills).filter((s) => s).length
  const totalSkills = Object.keys(SKILLS_CONFIG).length

  return (
    <DesktopLayout maxWidth="2xl">
      <div className="flex flex-col h-screen lg:h-auto">
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
            <h1 className="text-lg font-semibold">Навыки</h1>
            <p className="text-xs text-muted-foreground">Улучши свои способности</p>
          </div>
          <div className="flex items-center gap-1 text-secondary">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold">
              {unlockedCount}/{totalSkills}
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Навыки</h1>
            <p className="text-muted-foreground">Улучши свои способности</p>
          </div>
          <div className="flex items-center gap-2 text-secondary">
            <Sparkles className="w-6 h-6" />
            <span className="text-2xl font-bold">
              {unlockedCount}/{totalSkills}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-0 pb-20 lg:pb-0 space-y-6">
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 shadow-lg">
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold">Текущий уровень: Tier {currentTier}</p>
              <p className="text-xs text-muted-foreground">Репутация: {gameState.reputation}</p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Tier 1</p>
                  <p className="text-sm font-bold text-primary">500</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Tier 2</p>
                  <p className="text-sm font-bold text-secondary">2000</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Tier 3</p>
                  <p className="text-sm font-bold text-accent">5000</p>
                </div>
              </div>
            </div>
          </Card>

          {renderSkillBranch(energySkills, "Энергия", <Zap className="w-4 h-4 text-secondary" />)}
          {renderSkillBranch(qualitySkills, "Качество", <TrendingUp className="w-4 h-4 text-primary" />)}
          {renderSkillBranch(moneySkills, "Деньги", <DollarSign className="w-4 h-4 text-accent" />)}

          <Card className="p-4 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30 shadow-md">
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="font-semibold text-sm mb-1">Древо навыков</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Навыки открываются по мере роста репутации. Tier 1 (500 rep), Tier 2 (2000 rep), Tier 3 (5000 rep).
                  Каждая ветка дает уникальные бонусы: Энергия (больше битов), Качество (лучшие биты), Деньги (выше
                  цены).
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DesktopLayout>
  )
}
