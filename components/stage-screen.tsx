"use client"

import type React from "react"

import { ArrowLeft, Play, Music, Sparkles, ImageIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import type { Screen } from "@/app/page"
import {
  type GameState,
  type Beat,
  BEAT_NAMES,
  ENERGY_CONFIG,
  getSkillQualityBonus,
  getSkillPriceMultiplier,
  getSkillEnergyCostReduction,
  getTierPriceMultiplier,
  getReputationTier,
  getStageTitle,
  BEAT_CONTRACTS_POOL,
  doesBeatQualifyForContract,
} from "@/lib/game-state"
import { saveBeat, sellBeats, saveGameState } from "@/lib/game-storage"
import { RhythmGameResults } from "@/components/rhythm-game-results"
import { OSZ_TRACKS, type OszTrack } from "@/lib/music-config"
import { NftMintModal } from "@/components/nft-mint-modal"
import { DesktopLayout } from "@/components/desktop-layout"
import { RhythmGameRhythmPlus } from "@/components/rhythm-game-rhythm-plus"

interface StageScreenProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNavigate: (screen: Screen) => void
  onRhythmGameStateChange?: (isPlaying: boolean) => void
}

export function StageScreen({ gameState, setGameState, onNavigate, onRhythmGameStateChange }: StageScreenProps) {
  const [isPlayingRhythm, setIsPlayingRhythm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null)
  const [isGeneratingName, setIsGeneratingName] = useState(false)
  const [isGeneratingCover, setIsGeneratingCover] = useState(false)
  const [isSelling, setIsSelling] = useState(false)

  const [showResults, setShowResults] = useState(false)
  const [rhythmAccuracy, setRhythmAccuracy] = useState(0)

  const [showNftModal, setShowNftModal] = useState(false)

  // Track and difficulty selection
  const [showTrackSelector, setShowTrackSelector] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<OszTrack | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState(1)

  const [availableTracks, setAvailableTracks] = useState<OszTrack[]>(OSZ_TRACKS)
  const [isLoadingTracks, setIsLoadingTracks] = useState(false)
  const [availableDifficulties, setAvailableDifficulties] = useState(0)
  const [isLoadingDifficulties, setIsLoadingDifficulties] = useState(false)
  const [loadTracksError, setLoadTracksError] = useState<string | null>(null)

  const currentStage = getReputationTier(gameState.reputation)
  const currentStageTitle = getStageTitle(currentStage)

  useEffect(() => {
    const loadTracks = async () => {
      setIsLoadingTracks(true)
      setLoadTracksError(null)
      try {
        const response = await fetch("/api/songs")

        if (!response.ok) {
          throw new Error(`Failed to fetch songs: ${response.status}`)
        }

        const data = await response.json()

        if (data.songs && Array.isArray(data.songs)) {
          const dbTracks: OszTrack[] = data.songs.map((song: any) => ({
            id: song.id,
            name: song.name,
            artist: song.artist,
            genre: song.genre,
            type: "osz" as const,
            oszUrl: song.osz_url,
          }))

          setAvailableTracks([...OSZ_TRACKS, ...dbTracks])
          console.log("[v0] Loaded tracks:", OSZ_TRACKS.length + dbTracks.length, "total")
        }
      } catch (error) {
        console.error("[v0] Failed to load tracks from database:", error)
        setLoadTracksError("Не удалось загрузить треки из базы данных")
        // Keep using hardcoded tracks if database fetch fails
      } finally {
        setIsLoadingTracks(false)
      }
    }

    loadTracks()
  }, [])

  const baseEnergyCost = ENERGY_CONFIG.ENERGY_COST_PER_BEAT
  const energyCostReduction = getSkillEnergyCostReduction(gameState.skills)
  const ENERGY_COST = Math.floor(baseEnergyCost * (1 - energyCostReduction))

  const calculateQuality = (rhythmAccuracy: number, difficulty: number) => {
    const baseQuality = 20
    const rhythmBonus = Math.floor(rhythmAccuracy * 0.6) // Up to 60 points from rhythm
    const difficultyBonus = difficulty * 3

    // Equipment bonus (reduced impact)
    const equipmentBonus = Math.floor(
      (gameState.equipment.phone * 2 +
        gameState.equipment.headphones * 2 +
        gameState.equipment.microphone * 3 +
        gameState.equipment.computer * 5 +
        (gameState.equipment.midi || 0) * 2 +
        (gameState.equipment.audioInterface || 0) * 4) *
        0.3, // Reduced from 0.5 to 0.3
    )

    const skillBonus = getSkillQualityBonus(gameState.skills)

    return Math.min(100, baseQuality + rhythmBonus + difficultyBonus + equipmentBonus + skillBonus)
  }

  const calculatePrice = (quality: number, difficulty: number) => {
    const basePrice = 30
    const qualityBonus = Math.floor((quality - 60) * 1.5)
    const difficultyMultiplier = 1 + (difficulty - 1) * 0.3
    const reputationBonus = Math.floor(gameState.reputation * 0.05)

    const tierMultiplier = getTierPriceMultiplier(gameState.reputation)

    const skillMultiplier = getSkillPriceMultiplier(gameState.skills)

    const finalPrice = Math.floor(
      (basePrice + qualityBonus + reputationBonus) * difficultyMultiplier * tierMultiplier * skillMultiplier,
    )

    return Math.max(10, finalPrice)
  }

  const handleSellBeat = async () => {
    if (!currentBeat || isSelling) return

    setIsSelling(true)
    console.log("[v0] Selling beat:", currentBeat.id, "Quality:", currentBeat.quality, "Price:", currentBeat.price)

    try {
      await sellBeats([currentBeat.id])
      console.log("[v0] Beat sold successfully")

      const reputationGain = Math.floor(currentBeat.quality / 5)
      console.log("[v0] Reputation gain:", reputationGain, "(quality:", currentBeat.quality, "/ 5)")

      const updatedContractProgress = { ...gameState.beatContracts.contractProgress }
      let contractsUpdated = false

      for (const contractId of gameState.beatContracts.activeContracts) {
        const contract = BEAT_CONTRACTS_POOL.find((c) => c.id === contractId)
        if (!contract) continue

        const progress = updatedContractProgress[contractId]
        if (!progress) continue

        // Check if beat qualifies for this contract
        if (doesBeatQualifyForContract(contract, currentBeat.quality, rhythmAccuracy)) {
          progress.qualifyingBeats.push(currentBeat.id)
          progress.beatsCreated += 1
          contractsUpdated = true
          console.log(
            "[v0] Beat qualifies for contract:",
            contractId,
            "Progress:",
            progress.qualifyingBeats.length,
            "/",
            contract.requirements.beats,
          )
        }
      }

      setGameState((prev) => {
        const newState = {
          ...prev,
          beats: [currentBeat, ...prev.beats],
          money: prev.money + currentBeat.price,
          reputation: prev.reputation + reputationGain,
          totalMoneyEarned: prev.totalMoneyEarned + currentBeat.price,
          totalBeatsEarnings: (prev.totalBeatsEarnings || 0) + currentBeat.price,
          stageProgress: Math.min(100, prev.stageProgress + 5),
          beatContracts: contractsUpdated
            ? {
                ...prev.beatContracts,
                contractProgress: updatedContractProgress,
              }
            : prev.beatContracts,
        }

        // Save to database
        if (contractsUpdated) {
          saveGameState(newState)
        }

        return newState
      })

      setCurrentBeat(null)
    } catch (error) {
      console.error("[v0] Failed to sell beat:", error)
      alert("Ошибка при продаже бита. Попробуй еще раз.")
    } finally {
      setIsSelling(false)
    }
  }

  const handleResultsContinue = async () => {
    setShowResults(false)
    setSelectedTrack(null)
    setIsCreating(true)

    // Calculate quality and price first
    const quality = calculateQuality(rhythmAccuracy, selectedDifficulty)
    const price = calculatePrice(quality, selectedDifficulty)

    // Create beat with placeholder data immediately
    const newBeat: Beat = {
      id: crypto.randomUUID(),
      name: "Создаю...", // Temporary name
      price: price,
      quality: quality,
      cover: "/placeholder.svg?height=400&width=400", // Temporary cover
      createdAt: Date.now(),
    }

    setCurrentBeat(newBeat)

    // Now generate AI assets in the background
    setIsGeneratingName(true)
    let beatName = BEAT_NAMES[Math.floor(Math.random() * BEAT_NAMES.length)]

    try {
      console.log("[v0] Generating beat name for track:", selectedTrack?.name, "by", selectedTrack?.artist)

      const nameResponse = await fetch("/api/generate-beat-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalTrackName: selectedTrack?.name,
          artistName: selectedTrack?.artist,
        }),
      })

      console.log("[v0] Beat name API response status:", nameResponse.status)
      const responseText = await nameResponse.text()
      console.log("[v0] Beat name API response body:", responseText)

      if (nameResponse.ok) {
        const nameData = JSON.parse(responseText)
        beatName = nameData.beatName
        console.log("[v0] Generated beat name:", beatName)

        // Update beat name immediately
        setCurrentBeat((prev) => (prev ? { ...prev, name: beatName } : null))
      } else {
        console.error("[v0] Failed to generate beat name. Status:", nameResponse.status, "Body:", responseText)
      }
    } catch (error) {
      console.error("[v0] Error generating beat name:", error)
      console.error("[v0] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    } finally {
      setIsGeneratingName(false)
    }

    setIsGeneratingCover(true)

    try {
      console.log("[v0] Generating cover art for beat:", beatName)

      const coverResponse = await fetch("/api/generate-beat-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beatName: beatName,
        }),
      })

      console.log("[v0] Cover API response status:", coverResponse.status)
      const coverResponseText = await coverResponse.text()
      console.log("[v0] Cover API response body:", coverResponseText)

      if (coverResponse.ok) {
        const coverData = JSON.parse(coverResponseText)
        console.log("[v0] Generated cover URL:", coverData.coverUrl)

        // Update beat with final data
        setCurrentBeat((prev) => {
          if (!prev) return null
          const finalBeat = {
            ...prev,
            name: beatName,
            cover: coverData.coverUrl,
          }
          // Save to database
          saveBeat(finalBeat)
          console.log("[v0] Beat created with AI assets:", finalBeat.id)
          return finalBeat
        })
      } else {
        console.error("[v0] Failed to generate cover. Status:", coverResponse.status, "Body:", coverResponseText)
        // Keep placeholder cover
        setCurrentBeat((prev) => {
          if (!prev) return null
          const finalBeat = { ...prev, name: beatName }
          saveBeat(finalBeat)
          return finalBeat
        })
      }
    } catch (error) {
      console.error("[v0] Failed to generate cover:", error)
      console.error("[v0] Cover error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      // Keep placeholder cover
      setCurrentBeat((prev) => {
        if (!prev) return null
        const finalBeat = { ...prev, name: beatName }
        saveBeat(finalBeat)
        return finalBeat
      })
    } finally {
      setIsGeneratingCover(false)
      setIsCreating(false)
    }
  }

  const startCreating = () => {
    if (gameState.energy < ENERGY_COST) {
      alert("Недостаточно энергии! Подожди немного.")
      return
    }

    // Show track selector
    setShowTrackSelector(true)
    setCurrentBeat(null)
  }

  const handleTrackSelect = (track: OszTrack) => {
    setSelectedTrack(track)
    setShowTrackSelector(false)
    setIsLoadingDifficulties(true)
    setAvailableDifficulties(0)

    fetch(track.oszUrl)
      .then((res) => res.arrayBuffer())
      .then(async (buffer) => {
        const JSZip = (await import("jszip")).default
        const zip = await JSZip.loadAsync(buffer)
        const osuFiles = Object.keys(zip.files).filter((name) => name.endsWith(".osu"))
        const numDifficulties = osuFiles.length
        console.log("[v0] OSZ file has", numDifficulties, "difficulties")
        setAvailableDifficulties(numDifficulties)

        // Auto-select difficulty based on equipment, but cap at available difficulties
        const equipmentLevel =
          gameState.equipment.phone +
          gameState.equipment.headphones +
          gameState.equipment.microphone +
          gameState.equipment.computer
        const suggestedDifficulty = Math.min(numDifficulties, Math.max(1, Math.floor(equipmentLevel / 3) + 1))
        setSelectedDifficulty(suggestedDifficulty)
      })
      .catch((error) => {
        console.error("[v0] Failed to load OSZ file:", error)
        setAvailableDifficulties(5)
        const equipmentLevel =
          gameState.equipment.phone +
          gameState.equipment.headphones +
          gameState.equipment.microphone +
          gameState.equipment.computer
        const suggestedDifficulty = Math.min(5, Math.max(1, Math.floor(equipmentLevel / 3) + 1))
        setSelectedDifficulty(suggestedDifficulty)
      })
      .finally(() => {
        setIsLoadingDifficulties(false)
      })
  }

  const handleStartGame = () => {
    console.log("[Stage] Starting game with track:", selectedTrack?.name, "difficulty:", selectedDifficulty)

    setGameState((prev) => ({
      ...prev,
      energy: prev.energy - ENERGY_COST,
      totalBeatsCreated: prev.totalBeatsCreated + 1,
    }))

    setIsPlayingRhythm(true)
    onRhythmGameStateChange?.(true)
  }

  const handleRhythmComplete = (accuracy: number) => {
    setRhythmAccuracy(accuracy)
    setShowResults(true)
    setIsPlayingRhythm(false)
    onRhythmGameStateChange?.(false)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Только что"
    if (diffMins < 60) return `${diffMins} мин назад`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} ч назад`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays} дн назад`

    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
  }

  // Render rhythm game when isPlayingRhythm is true
  if (isPlayingRhythm && selectedTrack) {
    return (
      <RhythmGameRhythmPlus
        difficulty={selectedDifficulty}
        beatmapUrl={selectedTrack.oszUrl}
        onComplete={handleRhythmComplete}
        onClose={() => {
          setIsPlayingRhythm(false)
          onRhythmGameStateChange?.(false)
          setSelectedTrack(null)
        }}
      />
    )
  }

  if (showResults) {
    return <RhythmGameResults accuracy={rhythmAccuracy} onContinue={handleResultsContinue} />
  }

  // Show difficulty selection when track is selected but game hasn't started yet
  if (selectedTrack && !isPlayingRhythm && !showResults) {
    return (
      <DesktopLayout maxWidth="xl">
        <div className="fixed inset-0 lg:relative lg:inset-auto flex flex-col bg-gradient-to-b from-background to-background/95">
          <div className="lg:hidden p-4 border-b border-border/50 flex items-center gap-3 backdrop-blur-xl bg-card/80 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedTrack(null)}
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
                    <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setSelectedTrack(null)}>
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
                          onClick={() => setSelectedDifficulty(diff)}
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
                      onClick={handleStartGame}
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
  }

  // Track selection screen
  if (showTrackSelector) {
    return (
      <DesktopLayout maxWidth="xl">
        <div className="flex flex-col h-screen lg:h-auto bg-gradient-to-b from-background to-background/95">
          <div className="lg:hidden p-4 border-b border-border/50 flex items-center gap-3 backdrop-blur-xl bg-card/80">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTrackSelector(false)}
              className="active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Выбери трек</h1>
              <p className="text-xs text-muted-foreground">Выбери музыку для создания бита</p>
            </div>
          </div>

          <div className="hidden lg:block mb-6">
            <h1 className="text-3xl font-bold mb-2">Выбери трек</h1>
            <p className="text-muted-foreground">Выбери музыку для создания бита</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {isLoadingTracks && (
              <div className="lg:col-span-2 flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm text-muted-foreground">Загружаю треки...</p>
                </div>
              </div>
            )}

            {!isLoadingTracks && availableTracks.length === 0 && (
              <div className="lg:col-span-2 text-center py-8">
                <p className="text-muted-foreground">Нет доступных треков</p>
                <p className="text-xs text-muted-foreground mt-2">Загрузи треки в разделе "Загрузка музыки"</p>
              </div>
            )}

            {!isLoadingTracks &&
              availableTracks.map((track) => (
                <Card
                  key={track.id}
                  className="p-4 hover:bg-card/80 cursor-pointer transition-all active:scale-95"
                  onClick={() => handleTrackSelect(track)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {track.artist} - {track.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{track.genre}</p>
                    </div>
                    <Music className="w-6 h-6 text-primary" />
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </DesktopLayout>
    )
  }

  return (
    <DesktopLayout maxWidth="xl">
      <div className="flex flex-col h-screen lg:h-auto bg-gradient-to-b from-background to-background/95">
        <div className="lg:hidden p-4 border-b border-border/50 flex items-center gap-3 backdrop-blur-xl bg-card/80">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("home")}
            className="active:scale-95 transition-transform text-foreground hover:text-foreground/80"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Создать бит</h1>
            <p className="text-xs text-muted-foreground">
              Этап {currentStage}: {currentStageTitle}
            </p>
          </div>
        </div>

        <div className="hidden lg:block mb-6">
          <h1 className="text-3xl font-bold mb-2">Создать бит</h1>
          <p className="text-muted-foreground">
            Этап {currentStage}: {currentStageTitle}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-0 pb-20 lg:pb-0 space-y-4">
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
            {/* Left Column - Beat Creation */}
            <div className="space-y-4">
              <Card className="p-8 bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/30 shadow-lg">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    {currentBeat ? (
                      <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-primary/30">
                        {isGeneratingCover ? (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                              <p className="text-xs text-muted-foreground">Генерирую обложку...</p>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={currentBeat.cover || "/placeholder.svg"}
                            alt={currentBeat.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <>
                        <div
                          className={`w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl ${isCreating ? "animate-pulse" : ""}`}
                        >
                          <Music className="w-16 h-16 text-primary-foreground" />
                        </div>
                        {isCreating && (
                          <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
                        )}
                      </>
                    )}
                  </div>

                  <div className="w-full space-y-2">
                    <p className="text-lg font-semibold">
                      {isGeneratingName
                        ? "Придумываю название..."
                        : isGeneratingCover
                          ? "Создаю обложку..."
                          : isCreating
                            ? "Создаю бит..."
                            : currentBeat
                              ? `${currentBeat.name} готов!`
                              : "Готов создать новый хит"}
                    </p>
                    {currentBeat && (
                      <div className="flex items-center justify-center gap-4 text-sm">
                        <span className="text-muted-foreground">Качество: {currentBeat.quality}%</span>
                        <span className="text-primary font-bold">${currentBeat.price}</span>
                      </div>
                    )}
                  </div>

                  {currentBeat ? (
                    <div className="w-full space-y-2">
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 shadow-md active:scale-95 transition-transform"
                        onClick={handleSellBeat}
                        disabled={isGeneratingName || isGeneratingCover || isSelling}
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        {isGeneratingName
                          ? "Придумываю название..."
                          : isGeneratingCover
                            ? "Создаю обложку..."
                            : isSelling
                              ? "Продаю..."
                              : `Продать бит ($${currentBeat?.price})`}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-primary/30 hover:bg-primary/10 bg-transparent"
                        onClick={() => setShowNftModal(true)}
                        disabled={isGeneratingName || isGeneratingCover || isSelling}
                      >
                        <ImageIcon className="w-5 h-5 mr-2" />
                        Создать NFT
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full space-y-2">
                      <Button
                        size="lg"
                        className="w-full h-auto py-3 px-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 shadow-md active:scale-95 transition-transform whitespace-normal"
                        onClick={startCreating}
                        disabled={isCreating || gameState.energy < ENERGY_COST}
                      >
                        <Play className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>Начать создание (-{ENERGY_COST} энергии)</span>
                      </Button>
                      {gameState.energy < ENERGY_COST && (
                        <p className="text-xs text-muted-foreground">Недостаточно энергии. Подожди немного!</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <Card className="p-4 text-center shadow-md">
                  <p className="text-2xl font-bold text-primary">{gameState.beats.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Битов создано</p>
                </Card>
                <Card className="p-4 text-center shadow-md">
                  <p className="text-2xl font-bold text-secondary">${gameState.totalBeatsEarnings || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Заработано</p>
                </Card>
                <Card className="p-4 text-center shadow-md">
                  <p className="text-2xl font-bold text-accent">{gameState.reputation}</p>
                  <p className="text-xs text-muted-foreground mt-1">Репутация</p>
                </Card>
              </div>
            </div>

            {/* Right Column - Beat History */}
            <div className="space-y-4">
              {gameState.beats.length > 0 && (
                <div>
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Твои биты</h3>
                  </div>
                  <div className="space-y-2">
                    {gameState.beats.map((beat) => (
                      <Card key={beat.id} className="p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                            <img
                              src={beat.cover || "/placeholder.svg"}
                              alt={beat.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{beat.name}</p>
                            <p className="text-xs text-muted-foreground">Качество: {beat.quality}%</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatDate(beat.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">${beat.price}</p>
                            <p className="text-xs text-muted-foreground">Продано</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NFT Mint Modal */}
        {showNftModal && currentBeat && <NftMintModal beat={currentBeat} onClose={() => setShowNftModal(false)} />}
      </div>
    </DesktopLayout>
  )
}
