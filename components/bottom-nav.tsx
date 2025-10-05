"use client"

import { Home, Music, Zap, Users, BookOpen } from "lucide-react"
import type { Screen } from "@/app/page"

interface BottomNavProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: "home" as Screen, icon: Home, label: "Главная" },
    { id: "stage" as Screen, icon: Music, label: "Создать" },
    { id: "studio" as Screen, icon: Zap, label: "Студия" },
    { id: "artists" as Screen, icon: Users, label: "Артисты" },
    { id: "upgrades" as Screen, icon: BookOpen, label: "Обучение" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentScreen === item.id

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[60px] active:scale-95 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "scale-110" : ""} transition-transform`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
