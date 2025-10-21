/**
 * Simple test runner for beat calculations
 * Runs without Jest for faster execution
 */

import { calculateBeatQuality, calculateBeatPrice } from "../lib/beat-calculations"
import type { GameState } from "../lib/game-state"

// Test utilities
let testsPassed = 0
let testsFailed = 0
let currentSuite = ""

function describe(suiteName: string, fn: () => void) {
  currentSuite = suiteName
  console.log(`\n📦 ${suiteName}`)
  fn()
}

function test(testName: string, fn: () => void) {
  try {
    fn()
    testsPassed++
    console.log(`  ✅ ${testName}`)
  } catch (error) {
    testsFailed++
    console.log(`  ❌ ${testName}`)
    console.log(`     ${error instanceof Error ? error.message : String(error)}`)
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`)
      }
    },
    toBeGreaterThan(expected: number) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`)
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be >= ${expected}`)
      }
    },
    toBeLessThan(expected: number) {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`)
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (actual > expected) {
        throw new Error(`Expected ${actual} to be <= ${expected}`)
      }
    },
  }
}

// Mock game state
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

// Tests
describe("calculateBeatQuality", () => {
  test("should return minimum quality with 0% accuracy", () => {
    const quality = calculateBeatQuality(0, 1, mockGameState)
    expect(quality).toBeGreaterThanOrEqual(20)
    expect(quality).toBeLessThanOrEqual(30)
  })

  test("should return high quality with 100% accuracy", () => {
    const quality = calculateBeatQuality(100, 5, mockGameState)
    expect(quality).toBeGreaterThanOrEqual(90)
    expect(quality).toBeLessThanOrEqual(100)
  })

  test("should never exceed 100 quality", () => {
    const highSkillState: GameState = {
      ...mockGameState,
      skills: { beatmaking: 10, production: 10, promotion: 10 },
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

  test("should increase with better equipment", () => {
    const lowQuality = calculateBeatQuality(50, 3, mockGameState)
    const highState: GameState = {
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
    const highQuality = calculateBeatQuality(50, 3, highState)
    expect(highQuality).toBeGreaterThan(lowQuality)
  })

  test("should scale with difficulty", () => {
    const diff1 = calculateBeatQuality(50, 1, mockGameState)
    const diff3 = calculateBeatQuality(50, 3, mockGameState)
    const diff5 = calculateBeatQuality(50, 5, mockGameState)
    expect(diff3).toBeGreaterThan(diff1)
    expect(diff5).toBeGreaterThan(diff3)
  })
})

describe("calculateBeatPrice", () => {
  test("should return minimum price of 10", () => {
    const price = calculateBeatPrice(0, 1, mockGameState)
    expect(price).toBeGreaterThanOrEqual(10)
  })

  test("should increase with higher quality", () => {
    const lowPrice = calculateBeatPrice(40, 3, mockGameState)
    const highPrice = calculateBeatPrice(80, 3, mockGameState)
    expect(highPrice).toBeGreaterThan(lowPrice)
  })

  test("should increase with higher difficulty", () => {
    const diff1 = calculateBeatPrice(70, 1, mockGameState)
    const diff3 = calculateBeatPrice(70, 3, mockGameState)
    const diff5 = calculateBeatPrice(70, 5, mockGameState)
    expect(diff3).toBeGreaterThan(diff1)
    expect(diff5).toBeGreaterThan(diff3)
  })

  test("should increase with higher reputation", () => {
    const lowRep = calculateBeatPrice(70, 3, mockGameState)
    const highRep = calculateBeatPrice(70, 3, { ...mockGameState, reputation: 200 })
    expect(highRep).toBeGreaterThan(lowRep)
  })
})

describe("Integration tests", () => {
  test("quality and price should correlate", () => {
    const quality = calculateBeatQuality(75, 3, mockGameState)
    const price = calculateBeatPrice(quality, 3, mockGameState)
    const lowQuality = calculateBeatQuality(30, 3, mockGameState)
    const lowPrice = calculateBeatPrice(lowQuality, 3, mockGameState)

    if (quality > lowQuality) {
      expect(price).toBeGreaterThanOrEqual(lowPrice)
    }
  })

  test("progression should be balanced", () => {
    const beginner: GameState = {
      ...mockGameState,
      reputation: 10,
      skills: { beatmaking: 0, production: 0, promotion: 0 },
      equipment: { phone: 1, headphones: 1, microphone: 0, computer: 0, midi: 0, audioInterface: 0 },
    }

    const advanced: GameState = {
      ...mockGameState,
      reputation: 300,
      skills: { beatmaking: 7, production: 7, promotion: 5 },
      equipment: { phone: 5, headphones: 5, microphone: 5, computer: 5, midi: 4, audioInterface: 4 },
    }

    const beginnerQuality = calculateBeatQuality(60, 2, beginner)
    const advancedQuality = calculateBeatQuality(90, 4, advanced)
    const beginnerPrice = calculateBeatPrice(beginnerQuality, 2, beginner)
    const advancedPrice = calculateBeatPrice(advancedQuality, 4, advanced)

    expect(advancedQuality).toBeGreaterThan(beginnerQuality)
    expect(advancedPrice).toBeGreaterThan(beginnerPrice)
  })
})

// Summary
console.log(`\n${"=".repeat(50)}`)
console.log(`\n✅ Passed: ${testsPassed}`)
console.log(`❌ Failed: ${testsFailed}`)
console.log(`📊 Total: ${testsPassed + testsFailed}`)

if (testsFailed > 0) {
  console.log(`\n⚠️  Some tests failed!`)
  process.exit(1)
} else {
  console.log(`\n🎉 All tests passed!`)
  process.exit(0)
}
