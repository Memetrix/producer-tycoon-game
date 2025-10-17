"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, ArrowRight, CheckCircle2 } from "lucide-react"

interface TutorialStep {
  id: string
  title: string
  description: string
  highlightElement?: string // CSS selector for element to highlight
  position: "top" | "center" | "bottom"
  action?: "tap" | "swipe" | "none"
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Добро пожаловать!",
    description:
      "Ты начинаешь свой путь от уличного битмейкера до мирового продюсера. Давай покажу как играть!",
    position: "center",
    action: "none",
  },
  {
    id: "energy",
    title: "Энергия",
    description:
      "Энергия нужна для создания битов. Она восстанавливается автоматически (2/мин). Следи за ней в правом верхнем углу!",
    position: "top",
    action: "none",
  },
  {
    id: "create-beat",
    title: "Создать бит",
    description:
      'Нажми кнопку "Создать бит" чтобы начать! Выбери трек и сложность. Чем сложнее - тем выше цена бита!',
    position: "center",
    action: "tap",
  },
  {
    id: "rhythm-game",
    title: "Ритм-игра",
    description:
      "В ритм-игре нажимай кнопки D, F, J, K (или тапай на экране) в такт музыке. Попадай точно чтобы заработать больше!",
    position: "bottom",
    action: "tap",
  },
  {
    id: "quality-price",
    title: "Качество = Деньги",
    description:
      "Твоя точность в ритм-игре влияет на качество бита (20-100%). Чем выше качество - тем выше цена при продаже!",
    position: "center",
    action: "none",
  },
  {
    id: "reputation",
    title: "Репутация",
    description:
      "За каждый проданный бит ты получаешь репутацию (качество/5). Репутация открывает новые возможности!",
    position: "top",
    action: "none",
  },
  {
    id: "upgrades",
    title: "Улучшения",
    description:
      "Покупай оборудование (Студия), нанимай артистов для пассивного дохода, изучай навыки для бонусов!",
    position: "center",
    action: "none",
  },
  {
    id: "contracts",
    title: "Контракты",
    description:
      "После 500 репутации (Tier 2) получай контракты от клиентов! Выполняй их для больших наград.",
    position: "center",
    action: "none",
  },
  {
    id: "ready",
    title: "Готов!",
    description:
      "Теперь ты знаешь основы! Создавай биты, зарабатывай деньги, повышай репутацию. Удачи на пути к славе! 🎵",
    position: "center",
    action: "none",
  },
]

interface TutorialOverlayProps {
  onComplete: () => void
  onSkip: () => void
}

export function TutorialOverlay({ onComplete, onSkip }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const step = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1

  const handleNext = () => {
    if (isLastStep) {
      setIsVisible(false)
      setTimeout(onComplete, 300)
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleSkip = () => {
    setIsVisible(false)
    setTimeout(onSkip, 300)
  }

  const getPositionClasses = () => {
    switch (step.position) {
      case "top":
        return "top-20"
      case "bottom":
        return "bottom-28"
      case "center":
      default:
        return "top-1/2 -translate-y-1/2"
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleSkip} />

      {/* Tutorial card */}
      <div className={`absolute left-4 right-4 ${getPositionClasses()} pointer-events-auto`}>
        <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/10 border-primary/30 shadow-2xl animate-slide-in-up">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {currentStep + 1}/{TUTORIAL_STEPS.length}
                </span>
              </div>
              <h2 className="text-xl font-semibold">{step.title}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip} className="flex-shrink-0">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{step.description}</p>

          {/* Action hint */}
          {step.action !== "none" && (
            <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-xs font-semibold text-accent flex items-center gap-2">
                {step.action === "tap" && (
                  <>
                    <span className="text-lg">👆</span>
                    Нажми чтобы продолжить
                  </>
                )}
                {step.action === "swipe" && (
                  <>
                    <span className="text-lg">👉</span>
                    Свайпни чтобы продолжить
                  </>
                )}
              </p>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-primary"
                    : index < currentStep
                      ? "w-2 bg-primary/50"
                      : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-2">
            {!isLastStep && (
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Пропустить
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-primary to-secondary">
              {isLastStep ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Понятно!
                </>
              ) : (
                <>
                  Далее
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
