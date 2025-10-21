/**
 * Beat Quality and Price Calculation Utilities
 * Extracted from stage-screen.tsx for reusability and testing
 */

import type { GameState } from "@/lib/game-state"
import {
  getSkillQualityBonus,
  getSkillPriceMultiplier,
  getTierPriceMultiplier,
} from "@/lib/game-state"

/**
 * Calculate beat quality based on rhythm accuracy, difficulty, and game state
 * @param rhythmAccuracy - Player's rhythm game accuracy (0-100)
 * @param difficulty - Selected difficulty level (1-5)
 * @param gameState - Current game state (equipment, skills)
 * @returns Quality score (0-100)
 */
export function calculateBeatQuality(
  rhythmAccuracy: number,
  difficulty: number,
  gameState: GameState
): number {
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
      0.3 // Reduced from 0.5 to 0.3
  )

  const skillBonus = getSkillQualityBonus(gameState.skills)

  return Math.min(100, baseQuality + rhythmBonus + difficultyBonus + equipmentBonus + skillBonus)
}

/**
 * Calculate beat price based on quality, difficulty, and game state
 * @param quality - Beat quality (0-100)
 * @param difficulty - Selected difficulty level (1-5)
 * @param gameState - Current game state (reputation, skills)
 * @returns Price in dollars
 */
export function calculateBeatPrice(
  quality: number,
  difficulty: number,
  gameState: GameState
): number {
  const basePrice = 30
  const qualityBonus = Math.max(0, Math.floor((quality - 60) * 1.5)) // Prevent negative bonus
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.3
  const reputationBonus = Math.floor(gameState.reputation * 0.05)

  const tierMultiplier = getTierPriceMultiplier(gameState.reputation)
  const skillMultiplier = getSkillPriceMultiplier(gameState.skills)

  const finalPrice = Math.floor(
    (basePrice + qualityBonus + reputationBonus) * difficultyMultiplier * tierMultiplier * skillMultiplier
  )

  return Math.max(10, finalPrice)
}
