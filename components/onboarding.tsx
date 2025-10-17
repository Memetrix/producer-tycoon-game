"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Добро пожаловать в Producer Tycoon",
      description: "Пройди путь от уличного битмейкера до мирового продюсера и владельца лейбла",
      image: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/loading-screen.png",
    },
    {
      title: "Создавай биты на улице",
      description: "Начни с телефона, продавай треки местным рэперам и зарабатывай первую репутацию",
      image: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/stage-bg.png",
    },
    {
      title: "Работай с артистами",
      description: "Находи таланты, создавай коллаборации и выпускай хиты, которые прославят тебя",
      image: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/mc-flow-0.png",
    },
    {
      title: "Построй музыкальную империю",
      description: "Открой свой лейбл, улучшай студию и становись легендой музыкальной индустрии",
      image: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/studio-bg.png",
    },
  ]

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[oklch(0.12_0_0)] via-[oklch(0.15_0_0)] to-[oklch(0.18_0_0)]">
      {/* Skip Button */}
      <div className="p-4 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-[oklch(0.6_0_0)] hover:text-[oklch(0.8_0_0)]"
        >
          Пропустить
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Image */}
        <div className="w-full max-w-sm mb-8 relative">
          <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[oklch(0.65_0.25_250)]/20 to-[oklch(0.6_0.22_320)]/20">
            <img
              src={slides[currentSlide].image || "/placeholder.svg"}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-[oklch(0.12_0_0)]/80 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Text Content */}
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-2xl font-bold text-balance text-[oklch(0.98_0_0)]">{slides[currentSlide].title}</h2>
          <p className="text-[oklch(0.7_0_0)] text-balance max-w-md leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Dots Indicator */}
        <div className="flex gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-8 bg-[oklch(0.65_0.25_250)]" : "w-2 bg-[oklch(0.25_0_0)]"
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <Button
          size="lg"
          onClick={handleNext}
          className="w-full max-w-sm bg-gradient-to-r from-[oklch(0.65_0.25_250)] to-[oklch(0.6_0.22_320)] text-[oklch(0.98_0_0)] hover:opacity-90 shadow-lg active:scale-95 transition-transform"
        >
          {currentSlide < slides.length - 1 ? (
            <>
              Далее
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            "Начать путь к славе"
          )}
        </Button>
      </div>
    </div>
  )
}
