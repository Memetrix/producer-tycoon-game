"use client"

import { memo } from "react"
import { ArrowLeft, Play, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DesktopLayout } from "@/components/desktop-layout"
import type { OszTrack } from "@/lib/music-config"

interface DifficultySelectorProps {
  selectedTrack: OszTrack
  selectedDifficulty: number
  availableDifficulties: number
  isLoadingDifficulties: boolean
  onDifficultySelect: (difficulty: number) => void
  onStartGame: () => void
  onBack: () => void
}

export const DifficultySelector = memo(function DifficultySelector({
  selectedTrack,
  selectedDifficulty,
  availableDifficulties,
  isLoadingDifficulties,
  onDifficultySelect,
  onStartGame,
  onBack,
}: DifficultySelectorProps) {
  return (
    <DesktopLayout maxWidth="xl">
      <div className="fixed inset-0 lg:relative lg:inset-auto flex flex-col bg-gradient-to-b from-background to-background/95">
        <div className="lg:hidden p-4 border-b border-border/50 flex items-center gap-3 backdrop-blur-xl bg-card/80 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Выбери сложность</h1>
            <p className="text-xs text-muted-foreground">
              {selectedTrack.artist} - {selectedTrack.name}
            </p>
          </div>
        </div>

        <div className="hidden lg:block mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold mb-2">Выбери сложность</h1>
          <p className="text-muted-foreground">
            {selectedTrack.artist} - {selectedTrack.name}
          </p>
        </div>

        <div className="flex-1 overflow-hidden p-4 lg:p-0">
          <Card className="h-full flex flex-col p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="flex flex-col h-full">
              <div className="text-center mb-4 flex-shrink-0">
                <Music className="w-16 h-16 mx-auto text-primary mb-4" />
                <h2 className="text-xl font-bold mb-2">Выбери сложность</h2>
                <p className="text-sm text-muted-foreground">Чем выше сложность, тем больше качество и цена бита</p>
              </div>

              {isLoadingDifficulties ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-sm text-muted-foreground">Загружаю сложности...</p>
                  </div>
                </div>
              ) : availableDifficulties === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Не удалось загрузить сложности</p>
                  <Button variant="outline" className="mt-4 bg-transparent" onClick={onBack}>
                    Выбрать другой трек
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 -mx-2 px-2">
                    {Array.from({ length: availableDifficulties }, (_, i) => i + 1).map((diff) => (
                      <Card
                        key={diff}
                        className={`p-4 cursor-pointer transition-all hover:bg-card/80 ${
                          selectedDifficulty === diff ? "ring-2 ring-primary bg-primary/10" : ""
                        }`}
                        onClick={() => onDifficultySelect(diff)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              Сложность {diff}
                              {diff === 1 && " - Легко"}
                              {diff === 2 && " - Нормально"}
                              {diff === 3 && " - Сложно"}
                              {diff === 4 && " - Очень сложно"}
                              {diff === 5 && " - Эксперт"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Бонус к качеству: +{diff * 3}%</p>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: diff }).map((_, i) => (
                              <div key={i} className="w-2 h-8 bg-primary rounded-full" />
                            ))}
                            {Array.from({ length: availableDifficulties - diff }).map((_, i) => (
                              <div key={i} className="w-2 h-8 bg-muted rounded-full" />
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button
                    size="lg"
                    className="w-full flex-shrink-0 bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90"
                    onClick={onStartGame}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Начать игру
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DesktopLayout>
  )
})
