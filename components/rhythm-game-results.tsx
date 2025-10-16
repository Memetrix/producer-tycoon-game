"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Trophy, Star, TrendingUp } from "lucide-react"

interface RhythmGameResultsProps {
  accuracy: number
  onContinue: () => void
}

export function RhythmGameResults({ accuracy, onContinue }: RhythmGameResultsProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Delay content appearance for dramatic effect
    const timer = setTimeout(() => setShowContent(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // Determine performance tier
  const getPerformanceTier = (acc: number) => {
    if (acc >= 90) return { title: "Идеально!", color: "from-yellow-400 to-orange-500", icon: Trophy, emoji: "🔥" }
    if (acc >= 70) return { title: "Отлично!", color: "from-green-400 to-emerald-500", icon: Star, emoji: "⭐" }
    if (acc >= 50) return { title: "Хорошо", color: "from-blue-400 to-cyan-500", icon: TrendingUp, emoji: "👍" }
    return { title: "Попробуй ещё", color: "from-gray-400 to-slate-500", icon: Sparkles, emoji: "💪" }
  }

  const tier = getPerformanceTier(accuracy)
  const Icon = tier.icon

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {accuracy >= 70 &&
          [...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400 opacity-60" />
            </div>
          ))}
      </div>

      {/* Main content */}
      <div
        className={`relative max-w-md w-full mx-4 transition-all duration-700 ${
          showContent ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        {/* Performance icon with glow */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div
              className={`absolute inset-0 bg-gradient-to-r ${tier.color} rounded-full blur-2xl opacity-50 animate-pulse`}
            />
            <div
              className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-2xl`}
            >
              <Icon className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Performance title */}
        <div className="text-center mb-6">
          <h1
            className={`text-5xl font-bold mb-2 bg-gradient-to-r ${tier.color} bg-clip-text text-transparent animate-pulse`}
          >
            {tier.title}
          </h1>
          <p className="text-6xl mb-4 animate-bounce">{tier.emoji}</p>
        </div>

        {/* Accuracy display */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 mb-6 border border-white/10">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Точность</p>
            <p className="text-6xl font-bold text-white mb-4">{accuracy.toFixed(1)}%</p>

            {/* Progress bar */}
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${tier.color} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(100, accuracy)}%` }}
              />
            </div>
          </div>

          {/* Performance message */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              {accuracy >= 90
                ? "Невероятное выступление! Ты настоящий профессионал!"
                : accuracy >= 70
                  ? "Отличная работа! Продолжай в том же духе!"
                  : accuracy >= 50
                    ? "Хороший результат! Есть куда расти!"
                    : "Не сдавайся! Практика делает мастера!"}
            </p>
          </div>
        </div>

        {/* Continue button */}
        <Button
          size="lg"
          className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${tier.color} hover:opacity-90 transition-all shadow-lg`}
          onClick={onContinue}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Продолжить
        </Button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  )
}
