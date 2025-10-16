"use client"

import { useState, useEffect } from "react"
import { HomeScreen } from "@/components/home-screen"
import { StageScreen } from "@/components/stage-screen"
import { StudioScreen } from "@/components/studio-screen"
import { ArtistsScreen } from "@/components/artists-screen"
import { UpgradesScreen } from "@/components/upgrades-screen"
import { SkillsScreen } from "@/components/skills-screen"
import { Onboarding } from "@/components/onboarding"
import { CharacterCreation, type CharacterData } from "@/components/character-creation"
import { AvatarConfirmation } from "@/components/avatar-confirmation"
import { BottomNav } from "@/components/bottom-nav"
import { type GameState, INITIAL_GAME_STATE, ENERGY_CONFIG } from "@/lib/game-state"
import { loadGameState, saveGameState, createPlayer } from "@/lib/game-storage"
import { getTotalEnergyBonus, getTotalPassiveIncome, calculateOfflineEarnings } from "@/lib/game-state"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export type Screen = "home" | "stage" | "studio" | "artists" | "upgrades" | "skills"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [authChecked, setAuthChecked] = useState<boolean>(false)
  const router = useRouter()

  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE)
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isRhythmGameActive, setIsRhythmGameActive] = useState(false) // Add state to track if rhythm game is active
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showCharacterSelection, setShowCharacterSelection] = useState(false)
  const [showAvatarConfirmation, setShowAvatarConfirmation] = useState(false)
  const [pendingCharacter, setPendingCharacter] = useState<CharacterData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [offlineEarnings, setOfflineEarnings] = useState<{ earnings: number; minutesAway: number } | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true)
      } else {
        router.push("/auth/login")
      }
      setAuthChecked(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setIsAuthenticated(true)
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false)
        router.push("/auth/login")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    if (isAuthenticated !== true) return

    async function initGame() {
      const savedState = await loadGameState()
      if (savedState) {
        const passiveIncome = getTotalPassiveIncome(savedState.artists)
        const offlineData = calculateOfflineEarnings(savedState.lastActive, passiveIncome)

        if (offlineData.earnings > 0) {
          savedState.money += offlineData.earnings
          savedState.totalMoneyEarned += offlineData.earnings
          setOfflineEarnings(offlineData)
        }

        savedState.lastActive = new Date().toISOString()

        setGameState(savedState)
        setShowOnboarding(false)
        setShowCharacterSelection(false)
        setShowAvatarConfirmation(false)
      } else {
        setShowOnboarding(true)
      }
      setIsLoading(false)
    }
    initGame()
  }, [isAuthenticated])

  useEffect(() => {
    if (isLoading || showOnboarding || showCharacterSelection || showAvatarConfirmation) return

    const saveInterval = setInterval(() => {
      saveGameState(gameState)
    }, 5000)

    return () => clearInterval(saveInterval)
  }, [gameState, isLoading, showOnboarding, showCharacterSelection, showAvatarConfirmation])

  useEffect(() => {
    if (isLoading || showOnboarding || showCharacterSelection || showAvatarConfirmation) return

    const interval = setInterval(() => {
      setGameState((prev) => {
        const energyBonus = getTotalEnergyBonus(prev.artists)
        // UPDATED: New energy regen system - 2 energy per minute (was 1)
        const baseRecovery = ENERGY_CONFIG.ENERGY_REGEN_PER_MINUTE / 6 // Divided by 6 because interval runs every 10 seconds (6 times per minute)
        const bonusMultiplier = 1 + energyBonus / 100
        const recoveryAmount = baseRecovery * bonusMultiplier

        // UPDATED: New max energy - 150 base (was 100)
        let maxEnergy = ENERGY_CONFIG.BASE_MAX_ENERGY
        if (prev.musicStyle === "electronic") maxEnergy = 150 + 30 // Electronic style bonus
        if (prev.startingBonus === "energizer") maxEnergy = 150 + 50 // Energizer bonus

        const newEnergy = Math.min(maxEnergy, Math.round(prev.energy + recoveryAmount))

        return {
          ...prev,
          energy: newEnergy,
        }
      })
    }, 10000)
    return () => {
      clearInterval(interval)
    }
  }, [isLoading, showOnboarding, showCharacterSelection, showAvatarConfirmation])

  useEffect(() => {
    if (isLoading || showOnboarding || showCharacterSelection || showAvatarConfirmation) return

    const incomeInterval = setInterval(() => {
      setGameState((prev) => {
        const passiveIncome = getTotalPassiveIncome(prev.artists)
        if (passiveIncome === 0) return prev

        return {
          ...prev,
          money: prev.money + passiveIncome,
          totalMoneyEarned: prev.totalMoneyEarned + passiveIncome,
        }
      })
    }, 60000)

    return () => clearInterval(incomeInterval)
  }, [isLoading, showOnboarding, showCharacterSelection, showAvatarConfirmation])

  useEffect(() => {
    if (isLoading || showOnboarding || showCharacterSelection || showAvatarConfirmation) return

    const updateLastActive = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        lastActive: new Date().toISOString(),
      }))
    }, 60000)

    return () => clearInterval(updateLastActive)
  }, [isLoading, showOnboarding, showCharacterSelection, showAvatarConfirmation])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setShowCharacterSelection(true)
  }

  const handleCharacterComplete = async (character: CharacterData) => {
    setPendingCharacter(character)
    setShowCharacterSelection(false)
    setShowAvatarConfirmation(true)
  }

  const handleAvatarRegenerate = async () => {
    if (!pendingCharacter) return

    try {
      const style = pendingCharacter.musicStyle
      const genderText = pendingCharacter.gender === "male" ? "male" : "female"

      const MUSIC_STYLES = [
        { id: "hiphop", prompt: "hip hop music producer, urban style, confident pose, studio headphones" },
        { id: "trap", prompt: "trap music producer, modern streetwear, stylish, purple aesthetic" },
        { id: "rnb", prompt: "rnb music producer, smooth style, elegant, soulful vibe" },
        { id: "pop", prompt: "pop music producer, bright colorful style, energetic, mainstream appeal" },
        { id: "electronic", prompt: "electronic music producer, futuristic style, neon aesthetic, tech-savvy" },
      ]

      const styleData = MUSIC_STYLES.find((s) => s.id === style)

      const response = await fetch("/api/generate-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pendingCharacter.name,
          gender: genderText,
          prompt: styleData?.prompt || "music producer portrait",
        }),
      })

      const data = await response.json()

      if (data.imageUrl) {
        setPendingCharacter({
          ...pendingCharacter,
          avatar: data.imageUrl,
        })
      }
    } catch (error) {
      console.error("[v0] Failed to regenerate avatar:", error)
      alert("Не удалось перегенерировать аватар. Попробуйте еще раз.")
    }
  }

  const handleAvatarConfirm = async () => {
    if (!pendingCharacter) return

    const success = await createPlayer(
      pendingCharacter.name,
      pendingCharacter.avatar,
      pendingCharacter.musicStyle,
      pendingCharacter.startingBonus,
    )

    if (success) {
      const updatedState = {
        ...gameState,
        playerName: pendingCharacter.name,
        playerAvatar: pendingCharacter.avatar,
        musicStyle: pendingCharacter.musicStyle,
        startingBonus: pendingCharacter.startingBonus,
      }

      if (pendingCharacter.musicStyle === "hiphop") {
        updatedState.money += 200
      } else if (pendingCharacter.musicStyle === "trap") {
        updatedState.reputation += 100
      } else if (pendingCharacter.musicStyle === "rnb") {
        updatedState.equipment = { ...updatedState.equipment, headphones: 1 }
        updatedState.money += 100
      } else if (pendingCharacter.musicStyle === "pop") {
        updatedState.money += 150
        updatedState.reputation += 50
      } else if (pendingCharacter.musicStyle === "electronic") {
        updatedState.energy = 130
        updatedState.money += 100
      }

      if (pendingCharacter.startingBonus === "producer") {
        updatedState.equipment = { ...updatedState.equipment, headphones: 1 }
        updatedState.money += 200
      } else if (pendingCharacter.startingBonus === "hustler") {
        updatedState.money += 400
      } else if (pendingCharacter.startingBonus === "connector") {
        updatedState.reputation += 200
        updatedState.money += 100
      } else if (pendingCharacter.startingBonus === "energizer") {
        updatedState.energy = 150
        updatedState.money += 200
      }

      setGameState(updatedState)
      setShowAvatarConfirmation(false)
      setPendingCharacter(null)
    }
  }

  const navigateTo = (screen: Screen) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentScreen(screen)
      setIsTransitioning(false)
    }, 150)
  }

  const handleOfflineEarningsShown = () => {
    setOfflineEarnings(null)
  }

  if (!authChecked || (isAuthenticated && isLoading)) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[oklch(0.65_0.25_250)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[oklch(0.7_0_0)]">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  if (showCharacterSelection) {
    return <CharacterCreation onComplete={handleCharacterComplete} />
  }

  if (showAvatarConfirmation && pendingCharacter) {
    return (
      <AvatarConfirmation
        character={pendingCharacter}
        onConfirm={handleAvatarConfirm}
        onRegenerate={handleAvatarRegenerate}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background dark">
      <div className={`h-screen transition-opacity duration-150 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
        {currentScreen === "home" && (
          <HomeScreen
            gameState={gameState}
            setGameState={setGameState}
            onNavigate={navigateTo}
            offlineEarnings={offlineEarnings}
            onOfflineEarningsShown={handleOfflineEarningsShown}
          />
        )}
        {currentScreen === "stage" && (
          <StageScreen
            gameState={gameState}
            setGameState={setGameState}
            onNavigate={navigateTo}
            onRhythmGameStateChange={setIsRhythmGameActive}
          />
        )}
        {currentScreen === "studio" && (
          <StudioScreen gameState={gameState} setGameState={setGameState} onNavigate={navigateTo} />
        )}
        {currentScreen === "artists" && (
          <ArtistsScreen gameState={gameState} setGameState={setGameState} onNavigate={navigateTo} />
        )}
        {currentScreen === "upgrades" && (
          <UpgradesScreen gameState={gameState} setGameState={setGameState} onNavigate={navigateTo} />
        )}
        {currentScreen === "skills" && (
          <SkillsScreen gameState={gameState} setGameState={setGameState} onNavigate={navigateTo} />
        )}
      </div>
      {!isRhythmGameActive && <BottomNav currentScreen={currentScreen} onNavigate={navigateTo} />}
    </div>
  )
}
