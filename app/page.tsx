"use client"

import { useState, useEffect, useRef } from "react"
import { HomeScreen } from "@/components/home-screen"
import { StageScreen } from "@/components/stage-screen"
import { StudioScreen } from "@/components/studio-screen"
import { ArtistsScreen } from "@/components/artists-screen"
import { UpgradesScreen } from "@/components/upgrades-screen"
import { SkillsScreen } from "@/components/skills-screen"
import { ContractsScreen } from "@/components/contracts-screen"
import { LeaderboardsScreen } from "@/components/leaderboards-screen"
import { ShopScreen } from "@/components/shop-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { Onboarding } from "@/components/onboarding"
import { CharacterCreation, type CharacterData } from "@/components/character-creation"
import { AvatarConfirmation } from "@/components/avatar-confirmation"
import { TutorialOverlay } from "@/components/tutorial-overlay"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import {
  getTotalEnergyBonus,
  getTotalPassiveIncome,
  calculateOfflineEarnings,
  getLabelDealsPassiveIncome,
  getSkillMaxEnergyBonus,
  getSkillEnergyRegenBonus,
  BEAT_CONTRACTS_POOL,
  type Contract,
} from "@/lib/game-state"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { type GameState, INITIAL_GAME_STATE, ENERGY_CONFIG } from "@/lib/game-state"
import { loadGameState, saveGameState, createPlayer } from "@/lib/game-storage"

export type Screen =
  | "home"
  | "stage"
  | "studio"
  | "artists"
  | "upgrades"
  | "skills"
  | "contracts"
  | "leaderboards"
  | "shop"
  | "profile"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [authChecked, setAuthChecked] = useState<boolean>(false)
  const router = useRouter()

  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE)
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isRhythmGameActive, setIsRhythmGameActive] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showCharacterSelection, setShowCharacterSelection] = useState(false)
  const [showAvatarConfirmation, setShowAvatarConfirmation] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [pendingCharacter, setPendingCharacter] = useState<CharacterData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [offlineEarnings, setOfflineEarnings] = useState<{ earnings: number; minutesAway: number } | null>(null)
  const hasInitialized = useRef(false)

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
    if (isAuthenticated !== true || hasInitialized.current) return

    hasInitialized.current = true

    async function initGame() {
      const timeoutId = setTimeout(() => {
        console.error("[v0] Game state loading timeout - showing onboarding")
        setShowOnboarding(true)
        setIsLoading(false)
      }, 7000) // 7 second timeout (longer than DB timeout of 5s)

      try {
        console.log("[v0] Loading game state...")
        const savedState = await loadGameState()

        clearTimeout(timeoutId)

        if (savedState) {
          console.log("[v0] Game state loaded successfully")
          const artistIncome = getTotalPassiveIncome(savedState.artists)
          const labelIncome = getLabelDealsPassiveIncome(savedState.labelDeals)
          const totalPassiveIncome = artistIncome + labelIncome
          const offlineData = calculateOfflineEarnings(savedState.lastActive, totalPassiveIncome)

          if (offlineData.earnings > 0) {
            savedState.money += offlineData.earnings
            savedState.totalMoneyEarned += offlineData.earnings
            setOfflineEarnings(offlineData)
          }

          if (savedState.beatContracts.activeContracts && savedState.beatContracts.activeContracts.length > 0) {
            const now = Date.now()
            const expiredContractIds: string[] = []
            const validContractIds: string[] = []

            savedState.beatContracts.activeContracts.forEach((contractId) => {
              // Get contract object from pool by ID
              const contract = BEAT_CONTRACTS_POOL.find((c) => c.id === contractId)
              const progress = savedState.beatContracts.contractProgress[contractId]

              if (contract && contract.requirements.timeLimit && progress?.startedAt) {
                const timeElapsed = now - new Date(progress.startedAt).getTime()
                const timeLimitMs = contract.requirements.timeLimit * 60 * 60 * 1000 // hours to ms

                if (timeElapsed >= timeLimitMs) {
                  expiredContractIds.push(contractId)
                } else {
                  validContractIds.push(contractId)
                }
              } else {
                validContractIds.push(contractId)
              }
            })

            if (expiredContractIds.length > 0) {
              console.log(`[v0] ${expiredContractIds.length} contract(s) expired while offline`)

              // Remove progress for expired contracts
              const newProgress = { ...savedState.beatContracts.contractProgress }
              expiredContractIds.forEach((id) => delete newProgress[id])

              savedState.beatContracts = {
                ...savedState.beatContracts,
                activeContracts: validContractIds,
                contractProgress: newProgress,
              }
            }
          }

          savedState.lastActive = new Date().toISOString()

          setGameState(savedState)
          setShowOnboarding(false)
          setShowCharacterSelection(false)
          setShowAvatarConfirmation(false)
          setShowTutorial(false)
          setIsLoading(false)
        } else {
          console.log("[v0] No saved state found - showing onboarding")
          setShowOnboarding(true)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("[v0] Failed to load game state:", error)
        clearTimeout(timeoutId)
        setShowOnboarding(true)
        setIsLoading(false)
      }
    }
    initGame()
  }, [isAuthenticated])

  useEffect(() => {
    if (isLoading || showOnboarding || showCharacterSelection || showAvatarConfirmation || showTutorial) return

    const saveInterval = setInterval(() => {
      saveGameState(gameState)
    }, 5000)

    return () => clearInterval(saveInterval)
  }, [gameState, isLoading, showOnboarding, showCharacterSelection, showAvatarConfirmation, showTutorial])

  useEffect(() => {
    if (isLoading || showOnboarding || showCharacterSelection || showAvatarConfirmation || showTutorial) return

    const interval = setInterval(() => {
      setGameState((prev) => {
        const energyBonus = getTotalEnergyBonus(prev.artists)
        const skillRegenBonus = getSkillEnergyRegenBonus(prev.skills)
        const baseRecovery = (ENERGY_CONFIG.ENERGY_REGEN_PER_MINUTE + skillRegenBonus) / 6
        const bonusMultiplier = 1 + energyBonus / 100
        const recoveryAmount = baseRecovery * bonusMultiplier

        let maxEnergy = ENERGY_CONFIG.BASE_MAX_ENERGY
        const skillMaxEnergyBonus = getSkillMaxEnergyBonus(prev.skills)
        maxEnergy = Math.floor(maxEnergy * (1 + skillMaxEnergyBonus))

        if (prev.musicStyle === "electronic") maxEnergy += 30
        if (prev.startingBonus === "energizer") maxEnergy += 50

        // Add artist energy bonuses (additive)
        const artistEnergyBonus = getTotalEnergyBonus(prev.artists)
        maxEnergy += artistEnergyBonus

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
  }, [isLoading, showOnboarding, showCharacterSelection, showAvatarConfirmation, showTutorial])

  useEffect(() => {
    if (isLoading || showOnboarding || showCharacterSelection || showAvatarConfirmation || showTutorial) return

    const incomeInterval = setInterval(() => {
      setGameState((prev) => {
        const artistIncome = getTotalPassiveIncome(prev.artists)
        const labelIncome = getLabelDealsPassiveIncome(prev.labelDeals)
        const totalPassiveIncome = artistIncome + labelIncome

        if (totalPassiveIncome === 0) return prev

        return {
          ...prev,
          money: prev.money + totalPassiveIncome,
          totalMoneyEarned: prev.totalMoneyEarned + totalPassiveIncome,
        }
      })
    }, 60000)

    return () => clearInterval(incomeInterval)
  }, [isLoading, showOnboarding, showCharacterSelection, showAvatarConfirmation, showTutorial])

  useEffect(() => {
    if (isLoading || showOnboarding || showCharacterSelection || showAvatarConfirmation || showTutorial) return

    const updateLastActive = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        lastActive: new Date().toISOString(),
      }))
    }, 60000)

    return () => clearInterval(updateLastActive)
  }, [isLoading, showOnboarding, showCharacterSelection, showAvatarConfirmation, showTutorial])

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
        { id: "hip-hop", prompt: "hip hop music producer, urban style, confident pose, studio headphones" },
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

      if (pendingCharacter.musicStyle === "hip-hop") {
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

      setShowTutorial(true)
    }
  }

  const handleTutorialComplete = async () => {
    setShowTutorial(false)
    const updatedState = {
      ...gameState,
      tutorialCompleted: true,
    }
    setGameState(updatedState)
    await saveGameState(updatedState)
  }

  const handleTutorialSkip = async () => {
    setShowTutorial(false)
    const updatedState = {
      ...gameState,
      tutorialCompleted: true,
    }
    setGameState(updatedState)
    await saveGameState(updatedState)
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

  const handleLogout = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (!authChecked || (isAuthenticated && isLoading)) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 border-4 border-[oklch(0.65_0.25_250)] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <p className="text-[oklch(0.7_0_0)] text-lg font-semibold">Загрузка...</p>
            <p className="text-xs text-[oklch(0.6_0_0)]">Если загрузка затягивается, попробуй начать заново</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log("[v0] Reset button clicked - clearing hasInitialized flag")
              hasInitialized.current = false
              setIsLoading(false)
              setShowOnboarding(true)
            }}
            className="w-full px-6 py-3 bg-[oklch(0.65_0.25_250)] text-white rounded-lg text-sm font-semibold hover:bg-[oklch(0.6_0.25_250)] active:scale-95 transition-all cursor-pointer pointer-events-auto"
            type="button"
          >
            Начать заново
          </button>
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

  if (showTutorial) {
    return (
      <div className="min-h-screen bg-background dark">
        <HomeScreen
          gameState={gameState}
          setGameState={setGameState}
          onNavigate={navigateTo}
          offlineEarnings={null}
          onOfflineEarningsShown={handleOfflineEarningsShown}
        />
        <TutorialOverlay onComplete={handleTutorialComplete} onSkip={handleTutorialSkip} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark">
      {!showOnboarding && !showCharacterSelection && !showAvatarConfirmation && !showTutorial && (
        <DesktopSidebar currentScreen={currentScreen} onNavigate={navigateTo} gameState={gameState} />
      )}

      <div
        className={`min-h-screen bg-background transition-opacity duration-150 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
      >
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
        {currentScreen === "contracts" && (
          <ContractsScreen gameState={gameState} setGameState={setGameState} onNavigate={navigateTo} />
        )}
        {currentScreen === "leaderboards" && <LeaderboardsScreen gameState={gameState} onNavigate={navigateTo} />}
        {currentScreen === "shop" && (
          <ShopScreen gameState={gameState} setGameState={setGameState} onNavigate={navigateTo} />
        )}
        {currentScreen === "profile" && <ProfileScreen gameState={gameState} onLogout={handleLogout} />}
      </div>
      {!isRhythmGameActive && <BottomNav currentScreen={currentScreen} onNavigate={navigateTo} />}
    </div>
  )
}
