"use client"

import type React from "react"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo, useCallback } from "react"
import type { Screen } from "@/app/page"
import {
  type GameState,
  type Beat,
  BEAT_NAMES,
  ENERGY_CONFIG,
  getSkillEnergyCostReduction,
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
import { TrackSelector } from "@/components/stage/track-selector"
import { DifficultySelector } from "@/components/stage/difficulty-selector"
import { BeatCreationCard } from "@/components/stage/beat-creation-card"
import { BeatStatsCards } from "@/components/stage/beat-stats-cards"
import { BeatHistory } from "@/components/stage/beat-history"
import { calculateBeatQuality, calculateBeatPrice } from "@/lib/beat-calculations"

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

  // Memoize expensive calculations
  const ENERGY_COST = useMemo(() => {
    const baseEnergyCost = ENERGY_CONFIG.ENERGY_COST_PER_BEAT
    const energyCostReduction = getSkillEnergyCostReduction(gameState.skills)
    return Math.floor(baseEnergyCost * (1 - energyCostReduction))
  }, [gameState.skills])

  const currentStage = useMemo(() => getReputationTier(gameState.reputation), [gameState.reputation])
  const currentStageTitle = useMemo(() => getStageTitle(currentStage), [currentStage])

  // Memoize callback functions to prevent unnecessary re-renders
  const handleSellBeat = useCallback(async () => {
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
  }, [currentBeat, isSelling, gameState.beatContracts, rhythmAccuracy])

  const handleResultsContinue = useCallback(async () => {
    setShowResults(false)
    setSelectedTrack(null)
    setIsCreating(true)

    // Calculate quality and price first
    const quality = calculateBeatQuality(rhythmAccuracy, selectedDifficulty, gameState)
    const price = calculateBeatPrice(quality, selectedDifficulty, gameState)

    // Create beat with placeholder data immediately
    const newBeat: Beat = {
      id: crypto.randomUUID(),
      name: "Создаю...", // Temporary name
      price: price,
      quality: quality,
      cover: "/default-beat-cover.svg", // Temporary cover
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
  }, [rhythmAccuracy, selectedDifficulty, selectedTrack, gameState])

  const startCreating = useCallback(() => {
    if (gameState.energy < ENERGY_COST) {
      alert("Недостаточно энергии! Подожди немного.")
      return
    }

    // Show track selector
    setShowTrackSelector(true)
    setCurrentBeat(null)
  }, [gameState.energy, ENERGY_COST])

  const handleTrackSelect = useCallback((track: OszTrack) => {
    setSelectedTrack(track)
    setShowTrackSelector(false)
    setIsLoadingDifficulties(true)
    setAvailableDifficulties(0)

    fetch(track.oszUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.arrayBuffer()
      })
      .then(async (buffer) => {
        try {
          const JSZip = (await import("jszip")).default
          const zip = await JSZip.loadAsync(buffer)
          const osuFiles = Object.keys(zip.files).filter((name) => name.endsWith(".osu"))

          if (osuFiles.length === 0) {
            throw new Error("No .osu files found in archive")
          }

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
        } catch (zipError) {
          console.error("[v0] Failed to parse OSZ file:", zipError)
          throw new Error("Corrupted or invalid OSZ file")
        }
      })
      .catch((error) => {
        console.error("[v0] Failed to load OSZ file:", error)
        alert(`Не удалось загрузить трек "${track.name}". Файл может быть поврежден. Попробуй выбрать другой трек.`)
        // Reset to track selector
        setSelectedTrack(null)
        setShowTrackSelector(true)
        setAvailableDifficulties(0)
      })
      .finally(() => {
        setIsLoadingDifficulties(false)
      })
  }, [gameState.equipment])

  const handleStartGame = useCallback(() => {
    console.log("[Stage] Starting game with track:", selectedTrack?.name, "difficulty:", selectedDifficulty)

    setGameState((prev) => ({
      ...prev,
      energy: prev.energy - ENERGY_COST,
      totalBeatsCreated: prev.totalBeatsCreated + 1,
    }))

    setIsPlayingRhythm(true)
    onRhythmGameStateChange?.(true)
  }, [setGameState, ENERGY_COST, onRhythmGameStateChange])

  const handleRhythmComplete = useCallback((accuracy: number) => {
    setRhythmAccuracy(accuracy)
    setShowResults(true)
    setIsPlayingRhythm(false)
    onRhythmGameStateChange?.(false)
  }, [onRhythmGameStateChange])

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
      <DifficultySelector
        selectedTrack={selectedTrack}
        selectedDifficulty={selectedDifficulty}
        availableDifficulties={availableDifficulties}
        isLoadingDifficulties={isLoadingDifficulties}
        onDifficultySelect={setSelectedDifficulty}
        onStartGame={handleStartGame}
        onBack={() => setSelectedTrack(null)}
      />
    )
  }

  // Track selection screen
  if (showTrackSelector) {
    return (
      <TrackSelector
        availableTracks={availableTracks}
        isLoadingTracks={isLoadingTracks}
        onTrackSelect={handleTrackSelect}
        onBack={() => setShowTrackSelector(false)}
      />
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
              <BeatCreationCard
                currentBeat={currentBeat}
                isCreating={isCreating}
                isGeneratingName={isGeneratingName}
                isGeneratingCover={isGeneratingCover}
                isSelling={isSelling}
                energyCost={ENERGY_COST}
                hasEnoughEnergy={gameState.energy >= ENERGY_COST}
                onStartCreating={startCreating}
                onSellBeat={handleSellBeat}
                onCreateNFT={() => setShowNftModal(true)}
              />

              <BeatStatsCards
                beatsCount={gameState.beats.length}
                totalEarnings={gameState.totalBeatsEarnings || 0}
                reputation={gameState.reputation}
              />
            </div>

            {/* Right Column - Beat History */}
            <div className="space-y-4">
              <BeatHistory beats={gameState.beats} />
            </div>
          </div>
        </div>

        {/* NFT Mint Modal */}
        {showNftModal && currentBeat && <NftMintModal beat={currentBeat} onClose={() => setShowNftModal(false)} />}
      </div>
    </DesktopLayout>
  )
}
