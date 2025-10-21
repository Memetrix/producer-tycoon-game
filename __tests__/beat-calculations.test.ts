/**
 * Unit Tests for Beat Calculation Functions
 * Tests the quality and price calculation formulas
 */

import { calculateBeatQuality, calculateBeatPrice } from "@/lib/beat-calculations"
import type { GameState } from "@/lib/game-state"

// Mock game state for testing
const mockGameState: GameState = {
  energy: 100,
  maxEnergy: 100,
  money: 1000,
  reputation: 50,
  skills: {
    beatmaking: 0,
    production: 0,
    promotion: 0,
  },
  equipment: {
    phone: 1,
    headphones: 1,
    microphone: 0,
    computer: 0,
    midi: 0,
    audioInterface: 0,
  },
  beats: [],
  releases: [],
  lastEnergyUpdate: Date.now(),
  totalBeatsCreated: 0,
  totalReleasesCreated: 0,
  totalMoneyEarned: 0,
  totalBeatsEarnings: 0,
  totalReleasesEarnings: 0,
  stageProgress: 0,
  achievements: [],
  beatContracts: {
    activeContracts: [],
    completedContracts: [],
    contractProgress: {},
  },
}

describe("calculateBeatQuality", () => {
  test("should return minimum quality with 0% accuracy and difficulty 1", () => {
    const quality = calculateBeatQuality(0, 1, mockGameState)
    // Base: 20, Rhythm: 0, Difficulty: 3, Equipment: minimal, Skills: 0
    // Expected: 20 + 0 + 3 + equipment bonus
    expect(quality).toBeGreaterThanOrEqual(20)
    expect(quality).toBeLessThanOrEqual(30)
  })

  test("should return high quality with 100% accuracy and difficulty 5", () => {
    const quality = calculateBeatQuality(100, 5, mockGameState)
    // Base: 20, Rhythm: 60, Difficulty: 15, Equipment: minimal, Skills: 0
    // Expected: 20 + 60 + 15 = 95 + equipment
    expect(quality).toBeGreaterThanOrEqual(90)
    expect(quality).toBeLessThanOrEqual(100)
  })

  test("should never exceed 100 quality", () => {
    const highSkillState: GameState = {
      ...mockGameState,
      skills: {
        beatmaking: 10,
        production: 10,
        promotion: 10,
      },
      equipment: {
        phone: 5,
        headphones: 5,
        microphone: 5,
        computer: 5,
        midi: 5,
        audioInterface: 5,
      },
    }
    const quality = calculateBeatQuality(100, 5, highSkillState)
    expect(quality).toBeLessThanOrEqual(100)
  })

  test("should increase quality with better equipment", () => {
    const lowEquipmentQuality = calculateBeatQuality(50, 3, mockGameState)

    const highEquipmentState: GameState = {
      ...mockGameState,
      equipment: {
        phone: 5,
        headphones: 5,
        microphone: 5,
        computer: 5,
        midi: 5,
        audioInterface: 5,
      },
    }
    const highEquipmentQuality = calculateBeatQuality(50, 3, highEquipmentState)

    expect(highEquipmentQuality).toBeGreaterThan(lowEquipmentQuality)
  })

  test("should increase quality with higher skills", () => {
    const lowSkillQuality = calculateBeatQuality(50, 3, mockGameState)

    const highSkillState: GameState = {
      ...mockGameState,
      skills: {
        beatmaking: 5,
        production: 5,
        promotion: 5,
      },
    }
    const highSkillQuality = calculateBeatQuality(50, 3, highSkillState)

    expect(highSkillQuality).toBeGreaterThan(lowSkillQuality)
  })

  test("should scale with rhythm accuracy", () => {
    const lowAccuracy = calculateBeatQuality(30, 3, mockGameState)
    const midAccuracy = calculateBeatQuality(60, 3, mockGameState)
    const highAccuracy = calculateBeatQuality(90, 3, mockGameState)

    expect(midAccuracy).toBeGreaterThan(lowAccuracy)
    expect(highAccuracy).toBeGreaterThan(midAccuracy)
  })

  test("should scale with difficulty", () => {
    const difficulty1 = calculateBeatQuality(50, 1, mockGameState)
    const difficulty3 = calculateBeatQuality(50, 3, mockGameState)
    const difficulty5 = calculateBeatQuality(50, 5, mockGameState)

    expect(difficulty3).toBeGreaterThan(difficulty1)
    expect(difficulty5).toBeGreaterThan(difficulty3)

    // Each difficulty adds +3 quality
    expect(difficulty3 - difficulty1).toBe(6) // 2 difficulty levels * 3
    expect(difficulty5 - difficulty3).toBe(6) // 2 difficulty levels * 3
  })
})

describe("calculateBeatPrice", () => {
  test("should return minimum price of 10", () => {
    const price = calculateBeatPrice(0, 1, mockGameState)
    expect(price).toBeGreaterThanOrEqual(10)
  })

  test("should increase price with higher quality", () => {
    const lowQualityPrice = calculateBeatPrice(40, 3, mockGameState)
    const highQualityPrice = calculateBeatPrice(80, 3, mockGameState)

    expect(highQualityPrice).toBeGreaterThan(lowQualityPrice)
  })

  test("should not give bonus for quality below 60", () => {
    const price50 = calculateBeatPrice(50, 1, mockGameState)
    const price60 = calculateBeatPrice(60, 1, mockGameState)

    // Both should be close (base price + reputation only, no quality bonus)
    expect(Math.abs(price60 - price50)).toBeLessThan(10)
  })

  test("should increase price with higher difficulty", () => {
    const difficulty1Price = calculateBeatPrice(70, 1, mockGameState)
    const difficulty3Price = calculateBeatPrice(70, 3, mockGameState)
    const difficulty5Price = calculateBeatPrice(70, 5, mockGameState)

    expect(difficulty3Price).toBeGreaterThan(difficulty1Price)
    expect(difficulty5Price).toBeGreaterThan(difficulty3Price)
  })

  test("should increase price with higher reputation", () => {
    const lowRepPrice = calculateBeatPrice(70, 3, mockGameState)

    const highRepState: GameState = {
      ...mockGameState,
      reputation: 200,
    }
    const highRepPrice = calculateBeatPrice(70, 3, highRepState)

    expect(highRepPrice).toBeGreaterThan(lowRepPrice)
  })

  test("should increase price with higher skills", () => {
    const lowSkillPrice = calculateBeatPrice(70, 3, mockGameState)

    const highSkillState: GameState = {
      ...mockGameState,
      skills: {
        beatmaking: 5,
        production: 5,
        promotion: 5,
      },
    }
    const highSkillPrice = calculateBeatPrice(70, 3, highSkillState)

    expect(highSkillPrice).toBeGreaterThan(lowSkillPrice)
  })

  test("should apply tier multiplier for high reputation", () => {
    const tier1State: GameState = { ...mockGameState, reputation: 50 } // Tier 1
    const tier2State: GameState = { ...mockGameState, reputation: 150 } // Tier 2
    const tier3State: GameState = { ...mockGameState, reputation: 300 } // Tier 3

    const tier1Price = calculateBeatPrice(70, 3, tier1State)
    const tier2Price = calculateBeatPrice(70, 3, tier2State)
    const tier3Price = calculateBeatPrice(70, 3, tier3State)

    expect(tier2Price).toBeGreaterThan(tier1Price)
    expect(tier3Price).toBeGreaterThan(tier2Price)
  })

  test("should handle edge cases correctly", () => {
    // Quality 0, difficulty 1, no reputation
    const minimalState: GameState = {
      ...mockGameState,
      reputation: 0,
      skills: {
        beatmaking: 0,
        production: 0,
        promotion: 0,
      },
    }
    const minPrice = calculateBeatPrice(0, 1, minimalState)
    expect(minPrice).toBeGreaterThanOrEqual(10) // Minimum price

    // Quality 100, difficulty 5, max reputation
    const maximalState: GameState = {
      ...mockGameState,
      reputation: 500,
      skills: {
        beatmaking: 10,
        production: 10,
        promotion: 10,
      },
    }
    const maxPrice = calculateBeatPrice(100, 5, maximalState)
    expect(maxPrice).toBeGreaterThan(100) // Should be high
  })
})

describe("Integration tests", () => {
  test("quality and price should correlate", () => {
    const rhythmAccuracy = 75
    const difficulty = 3

    const quality = calculateBeatQuality(rhythmAccuracy, difficulty, mockGameState)
    const price = calculateBeatPrice(quality, difficulty, mockGameState)

    // Higher quality should generally mean higher price
    const lowQuality = calculateBeatQuality(30, difficulty, mockGameState)
    const lowPrice = calculateBeatPrice(lowQuality, difficulty, mockGameState)

    if (quality > lowQuality) {
      expect(price).toBeGreaterThanOrEqual(lowPrice)
    }
  })

  test("progression should be balanced", () => {
    // Test typical progression scenario
    const beginnerState: GameState = {
      ...mockGameState,
      reputation: 10,
      skills: { beatmaking: 0, production: 0, promotion: 0 },
      equipment: { phone: 1, headphones: 1, microphone: 0, computer: 0, midi: 0, audioInterface: 0 },
    }

    const intermediateState: GameState = {
      ...mockGameState,
      reputation: 100,
      skills: { beatmaking: 3, production: 3, promotion: 2 },
      equipment: { phone: 3, headphones: 3, microphone: 2, computer: 2, midi: 1, audioInterface: 1 },
    }

    const advancedState: GameState = {
      ...mockGameState,
      reputation: 300,
      skills: { beatmaking: 7, production: 7, promotion: 5 },
      equipment: { phone: 5, headphones: 5, microphone: 5, computer: 5, midi: 4, audioInterface: 4 },
    }

    const beginnerQuality = calculateBeatQuality(60, 2, beginnerState)
    const intermediateQuality = calculateBeatQuality(75, 3, intermediateState)
    const advancedQuality = calculateBeatQuality(90, 4, advancedState)

    const beginnerPrice = calculateBeatPrice(beginnerQuality, 2, beginnerState)
    const intermediatePrice = calculateBeatPrice(intermediateQuality, 3, intermediateState)
    const advancedPrice = calculateBeatPrice(advancedQuality, 4, advancedState)

    // Quality progression
    expect(intermediateQuality).toBeGreaterThan(beginnerQuality)
    expect(advancedQuality).toBeGreaterThan(intermediateQuality)

    // Price progression
    expect(intermediatePrice).toBeGreaterThan(beginnerPrice)
    expect(advancedPrice).toBeGreaterThan(intermediatePrice)

    // Reasonable ranges
    expect(beginnerQuality).toBeGreaterThan(30)
    expect(beginnerQuality).toBeLessThan(60)
    expect(beginnerPrice).toBeGreaterThan(20)
    expect(beginnerPrice).toBeLessThan(80)

    expect(advancedQuality).toBeGreaterThan(80)
    expect(advancedPrice).toBeGreaterThan(100)
  })
})

// Run tests
console.log("Running beat-calculations tests...")
