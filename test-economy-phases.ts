#!/usr/bin/env tsx
/**
 * Synthetic Test Suite for Economy Phases 1-3
 * Tests all game state functions, configurations, and balance calculations
 */

import {
  INITIAL_GAME_STATE,
  ENERGY_CONFIG,
  REPUTATION_TIERS,
  TIER_PRICE_MULTIPLIERS,
  STREAK_REWARDS,
  EQUIPMENT_TIERS,
  ARTISTS_CONFIG,
  SKILLS_CONFIG,
  BEAT_CONTRACTS_POOL,
  LABEL_DEALS_CONFIG,
  getReputationTier,
  getTierPriceMultiplier,
  getEquipmentTier,
  getArtistUpgradeCost,
  getArtistIncome,
  getArtistEnergyBonus,
  getTotalPassiveIncome,
  getTotalEnergyBonus,
  getSkillQualityBonus,
  getSkillPriceMultiplier,
  getSkillEnergyCostReduction,
  getSkillMaxEnergyBonus,
  getSkillEnergyRegenBonus,
  getAvailableContracts,
  getLabelDealsPassiveIncome,
  type GameState,
} from "./lib/game-state"

// Test results tracking
let passedTests = 0
let failedTests = 0
const errors: string[] = []

function assert(condition: boolean, message: string) {
  if (condition) {
    passedTests++
    console.log(`✅ ${message}`)
  } else {
    failedTests++
    errors.push(message)
    console.error(`❌ ${message}`)
  }
}

function assertEquals(actual: any, expected: any, message: string) {
  if (actual === expected) {
    passedTests++
    console.log(`✅ ${message}: ${actual} === ${expected}`)
  } else {
    failedTests++
    errors.push(`${message}: expected ${expected}, got ${actual}`)
    console.error(`❌ ${message}: expected ${expected}, got ${actual}`)
  }
}

function assertRange(value: number, min: number, max: number, message: string) {
  if (value >= min && value <= max) {
    passedTests++
    console.log(`✅ ${message}: ${value} in range [${min}, ${max}]`)
  } else {
    failedTests++
    errors.push(`${message}: ${value} not in range [${min}, ${max}]`)
    console.error(`❌ ${message}: ${value} not in range [${min}, ${max}]`)
  }
}

console.log("\n🧪 Starting Synthetic Test Suite for Economy Phases 1-3\n")
console.log("=" .repeat(80))

// ============================================================================
// PHASE 1 TESTS: Energy, Reputation, Tiers
// ============================================================================
console.log("\n📊 PHASE 1: Energy & Reputation System")
console.log("-".repeat(80))

// Test 1.1: Energy Config
assertEquals(ENERGY_CONFIG.BASE_MAX_ENERGY, 150, "Base max energy should be 150")
assertEquals(ENERGY_CONFIG.ENERGY_REGEN_PER_MINUTE, 2, "Energy regen should be 2/min")
assertEquals(ENERGY_CONFIG.ENERGY_COST_PER_BEAT, 15, "Energy cost should be 15/beat")
assertEquals(ENERGY_CONFIG.FULL_RECHARGE_TIME_MINUTES, 75, "Full recharge should be 75 minutes")

// Test 1.2: Reputation Tiers
assertEquals(Object.keys(REPUTATION_TIERS).length, 6, "Should have 6 reputation tiers")
assertEquals(REPUTATION_TIERS[1].min, 0, "Tier 1 min should be 0")
assertEquals(REPUTATION_TIERS[1].max, 500, "Tier 1 max should be 500")
assertEquals(REPUTATION_TIERS[6].max, Infinity, "Tier 6 max should be Infinity")

// Test 1.3: Tier Functions
assertEquals(getReputationTier(0), 1, "0 rep should be Tier 1")
assertEquals(getReputationTier(499), 1, "499 rep should be Tier 1")
assertEquals(getReputationTier(500), 2, "500 rep should be Tier 2")
assertEquals(getReputationTier(2000), 3, "2000 rep should be Tier 3")
assertEquals(getReputationTier(5000), 4, "5000 rep should be Tier 4")
assertEquals(getReputationTier(15000), 5, "15000 rep should be Tier 5")
assertEquals(getReputationTier(50000), 6, "50000 rep should be Tier 6")

// Test 1.4: Price Multipliers
assertEquals(TIER_PRICE_MULTIPLIERS.length, 7, "Should have 7 price multipliers (0-6)")
assertEquals(getTierPriceMultiplier(0), 1.0, "Tier 1 multiplier should be 1.0x")
assertEquals(getTierPriceMultiplier(500), 1.25, "Tier 2 multiplier should be 1.25x")
assertEquals(getTierPriceMultiplier(2000), 1.5, "Tier 3 multiplier should be 1.5x")
assertEquals(getTierPriceMultiplier(50000), 2.5, "Tier 6 multiplier should be 2.5x")

// Test 1.5: Streak Rewards
assertEquals(Object.keys(STREAK_REWARDS).length, 7, "Should have 7 streak milestones")
assert(STREAK_REWARDS[7] !== undefined, "Should have 7-day streak reward")
assert(STREAK_REWARDS[60] !== undefined, "Should have 60-day streak reward")
assertEquals(STREAK_REWARDS[60].money, 20000, "60-day streak should give $20,000")
assertEquals(STREAK_REWARDS[60].reputation, 15000, "60-day streak should give 15,000 rep")

// ============================================================================
// PHASE 2 TESTS: Equipment & Artists
// ============================================================================
console.log("\n📊 PHASE 2: Equipment & Artists Expansion")
console.log("-".repeat(80))

// Test 2.1: Equipment Categories
const equipmentCategories = Object.keys(EQUIPMENT_TIERS)
assertEquals(equipmentCategories.length, 6, "Should have 6 equipment categories")
assert(equipmentCategories.includes("phone"), "Should have phone category")
assert(equipmentCategories.includes("midi"), "Should have midi category")
assert(equipmentCategories.includes("audioInterface"), "Should have audioInterface category")

// Test 2.2: Equipment Levels (all should have 11 tiers: 0-10)
equipmentCategories.forEach((category) => {
  const tiers = EQUIPMENT_TIERS[category as keyof typeof EQUIPMENT_TIERS].tiers
  assertEquals(tiers.length, 11, `${category} should have 11 tiers (0-10)`)
  assertEquals(tiers[0].level, 0, `${category} tier 0 should exist`)
  assertEquals(tiers[10].level, 10, `${category} tier 10 should exist`)
})

// Test 2.3: getEquipmentTier function
const phoneLevel5 = getEquipmentTier("phone", 5)
assert(phoneLevel5 !== null, "Phone level 5 should exist")
assertEquals(phoneLevel5?.level, 5, "Phone level 5 tier should have level 5")

const phoneLevel10 = getEquipmentTier("phone", 10)
assert(phoneLevel10 !== null, "Phone level 10 should exist")
assertEquals(phoneLevel10?.level, 10, "Phone level 10 tier should have level 10")

// Test 2.4: Artists Count
const artistIds = Object.keys(ARTISTS_CONFIG)
assertEquals(artistIds.length, 8, "Should have 8 artists")

// Tier 1 artists (0-500 rep)
const tier1Artists = Object.values(ARTISTS_CONFIG).filter((a) => a.tier === 1)
assertEquals(tier1Artists.length, 4, "Should have 4 Tier 1 artists")

// Tier 2 artists (500-2000 rep)
const tier2Artists = Object.values(ARTISTS_CONFIG).filter((a) => a.tier === 2)
assertEquals(tier2Artists.length, 2, "Should have 2 Tier 2 artists")

// Tier 3 artists (2000-5000 rep)
const tier3Artists = Object.values(ARTISTS_CONFIG).filter((a) => a.tier === 3)
assertEquals(tier3Artists.length, 2, "Should have 2 Tier 3 artists")

// Test 2.5: Artist Levels (all should have 11 levels: 0-10)
artistIds.forEach((artistId) => {
  const artist = ARTISTS_CONFIG[artistId as keyof typeof ARTISTS_CONFIG]
  assertEquals(
    artist.incomePerLevel.length,
    11,
    `${artistId} should have 11 income levels (0-10)`,
  )
  assertEquals(
    artist.energyBonusPerLevel.length,
    11,
    `${artistId} should have 11 energy bonus levels (0-10)`,
  )
})

// Test 2.6: Artist Functions
const mcFlowCost0 = getArtistUpgradeCost("mc-flow", 0)
assertRange(mcFlowCost0, 80, 80, "MC Flow level 0→1 cost should be $80")

const mcFlowCost9 = getArtistUpgradeCost("mc-flow", 9)
assertRange(mcFlowCost9, 500, 10000, "MC Flow level 9→10 cost should be in range")

const mcFlowCost10 = getArtistUpgradeCost("mc-flow", 10)
assertEquals(mcFlowCost10, 0, "MC Flow level 10 (max) should return 0 cost")

const mcFlowIncome5 = getArtistIncome("mc-flow", 5)
assertRange(mcFlowIncome5, 1, 100, "MC Flow level 5 income should be > 0")

const mcFlowEnergy5 = getArtistEnergyBonus("mc-flow", 5)
assertRange(mcFlowEnergy5, 1, 100, "MC Flow level 5 energy bonus should be > 0")

// Test 2.7: Total Passive Income
const testArtists: GameState["artists"] = {
  "mc-flow": 5,
  "lil-dreamer": 3,
  "street-poet": 0,
  "young-legend": 0,
  "local-hero": 0,
  "scene-leader": 0,
  "city-star": 0,
  "state-champion": 0,
}
const totalIncome = getTotalPassiveIncome(testArtists)
assertRange(totalIncome, 20, 200, "Total passive income should be reasonable")

// Test 2.8: Total Energy Bonus
const totalEnergyBonus = getTotalEnergyBonus(testArtists)
assertRange(totalEnergyBonus, 10, 200, "Total energy bonus should be reasonable")

// Test 2.9: New Artists (Tier 2-3) Reputation Gates
const localHero = ARTISTS_CONFIG["local-hero"]
assertEquals(localHero.requiresReputation, 500, "Local Hero should require 500 rep")

const cityStAr = ARTISTS_CONFIG["city-star"]
assertEquals(cityStAr.requiresReputation, 2000, "City Star should require 2000 rep")

// ============================================================================
// PHASE 3 TESTS: Skills, Contracts, Labels
// ============================================================================
console.log("\n📊 PHASE 3: Skills, Contracts, Labels")
console.log("-".repeat(80))

// Test 3.1: Skills Configuration
const skillIds = Object.keys(SKILLS_CONFIG)
assertEquals(skillIds.length, 9, "Should have 9 skills")

// Energy branch
assert(SKILLS_CONFIG.caffeineRush !== undefined, "Caffeine Rush skill should exist")
assertEquals(SKILLS_CONFIG.caffeineRush.requiredReputation, 500, "Caffeine Rush should require 500 rep")
assertEquals(SKILLS_CONFIG.caffeineRush.cost, 2000, "Caffeine Rush should cost $2,000")

assert(SKILLS_CONFIG.stamina !== undefined, "Stamina skill should exist")
assertEquals(SKILLS_CONFIG.stamina.requiredReputation, 2000, "Stamina should require 2000 rep")

assert(SKILLS_CONFIG.flowState !== undefined, "Flow State skill should exist")
assertEquals(SKILLS_CONFIG.flowState.requiredReputation, 5000, "Flow State should require 5000 rep")

// Quality branch
assert(SKILLS_CONFIG.earTraining !== undefined, "Ear Training skill should exist")
assert(SKILLS_CONFIG.musicTheory !== undefined, "Music Theory skill should exist")
assert(SKILLS_CONFIG.perfectionist !== undefined, "Perfectionist skill should exist")

// Money branch
assert(SKILLS_CONFIG.negotiator !== undefined, "Negotiator skill should exist")
assert(SKILLS_CONFIG.businessman !== undefined, "Businessman skill should exist")
assert(SKILLS_CONFIG.mogul !== undefined, "Mogul skill should exist")

// Test 3.2: Skill Functions - Quality
const noSkillsQuality: GameState["skills"] = {
  caffeineRush: false,
  stamina: false,
  flowState: false,
  earTraining: false,
  musicTheory: false,
  perfectionist: false,
  negotiator: false,
  businessman: false,
  mogul: false,
}
assertEquals(getSkillQualityBonus(noSkillsQuality), 0, "No skills should give 0% quality bonus")

const allQualitySkills: GameState["skills"] = {
  ...noSkillsQuality,
  earTraining: true,
  musicTheory: true,
  perfectionist: true,
}
assertEquals(
  getSkillQualityBonus(allQualitySkills),
  35,
  "All quality skills should give 35% bonus (5+10+20)",
)

// Test 3.3: Skill Functions - Price
assertEquals(getSkillPriceMultiplier(noSkillsQuality), 1.0, "No skills should give 1.0x price")

const allMoneySkills: GameState["skills"] = {
  ...noSkillsQuality,
  negotiator: true,
  businessman: true,
  mogul: true,
}
assertEquals(
  getSkillPriceMultiplier(allMoneySkills),
  1.85,
  "All money skills should give 1.85x price (1.0 + 0.1 + 0.25 + 0.5)",
)

// Test 3.4: Skill Functions - Energy
assertEquals(getSkillEnergyCostReduction(noSkillsQuality), 0, "No skills should give 0% energy reduction")

const caffeineSkill: GameState["skills"] = { ...noSkillsQuality, caffeineRush: true }
assertEquals(getSkillEnergyCostReduction(caffeineSkill), 0.1, "Caffeine Rush should give 10% reduction")

assertEquals(getSkillMaxEnergyBonus(noSkillsQuality), 0, "No skills should give 0% max energy bonus")

const staminaSkill: GameState["skills"] = { ...noSkillsQuality, stamina: true }
assertEquals(getSkillMaxEnergyBonus(staminaSkill), 0.2, "Stamina should give 20% max energy bonus")

assertEquals(getSkillEnergyRegenBonus(noSkillsQuality), 0, "No skills should give 0 energy regen bonus")

const flowSkill: GameState["skills"] = { ...noSkillsQuality, flowState: true }
assertEquals(getSkillEnergyRegenBonus(flowSkill), 1, "Flow State should give +1 energy/min")

// Test 3.5: Beat Contracts
assertEquals(BEAT_CONTRACTS_POOL.length, 6, "Should have 6 beat contracts")

const easyContracts = BEAT_CONTRACTS_POOL.filter((c) => c.difficulty === "easy")
assertEquals(easyContracts.length, 2, "Should have 2 easy contracts")

const mediumContracts = BEAT_CONTRACTS_POOL.filter((c) => c.difficulty === "medium")
assertEquals(mediumContracts.length, 2, "Should have 2 medium contracts")

const hardContracts = BEAT_CONTRACTS_POOL.filter((c) => c.difficulty === "hard")
assertEquals(hardContracts.length, 2, "Should have 2 hard contracts")

// Test 3.6: Available Contracts by Tier
const tier1Contracts = getAvailableContracts(0) // Tier 1
assertEquals(tier1Contracts.length, 0, "Tier 1 (0 rep) should have 0 contracts")

const tier2Contracts = getAvailableContracts(500) // Tier 2
assertEquals(tier2Contracts.length, 2, "Tier 2 (500 rep) should have 2 easy contracts")

const tier3Contracts = getAvailableContracts(2000) // Tier 3
assertEquals(tier3Contracts.length, 4, "Tier 3 (2000 rep) should have 4 contracts (easy + medium)")

const tier4Contracts = getAvailableContracts(5000) // Tier 4
assertEquals(tier4Contracts.length, 6, "Tier 4 (5000 rep) should have all 6 contracts")

// Test 3.7: Label Deals Configuration
const labelIds = Object.keys(LABEL_DEALS_CONFIG)
assertEquals(labelIds.length, 3, "Should have 3 label deals")

assertEquals(LABEL_DEALS_CONFIG.indie.cost, 5000, "Indie label should cost $5,000")
assertEquals(LABEL_DEALS_CONFIG.indie.passiveIncomePerHour, 50, "Indie label should give $50/hour")
assertEquals(LABEL_DEALS_CONFIG.indie.requiredReputation, 2000, "Indie label should require 2000 rep")

assertEquals(LABEL_DEALS_CONFIG.small.cost, 20000, "Small label should cost $20,000")
assertEquals(LABEL_DEALS_CONFIG.small.passiveIncomePerHour, 200, "Small label should give $200/hour")

assertEquals(LABEL_DEALS_CONFIG.major.cost, 100000, "Major label should cost $100,000")
assertEquals(LABEL_DEALS_CONFIG.major.passiveIncomePerHour, 1000, "Major label should give $1,000/hour")
assertEquals(LABEL_DEALS_CONFIG.major.requiredReputation, 15000, "Major label should require 15000 rep")

// Test 3.8: Label Deals Passive Income
const noLabels: GameState["labelDeals"] = {
  indie: false,
  small: false,
  major: false,
}
assertEquals(getLabelDealsPassiveIncome(noLabels), 0, "No labels should give 0 passive income")

const indieOnly: GameState["labelDeals"] = {
  indie: true,
  small: false,
  major: false,
}
assertEquals(
  getLabelDealsPassiveIncome(indieOnly),
  Math.floor(50 / 60),
  "Indie only should give ~0-1/min",
)

const allLabels: GameState["labelDeals"] = {
  indie: true,
  small: true,
  major: true,
}
assertEquals(
  getLabelDealsPassiveIncome(allLabels),
  Math.floor(1250 / 60),
  "All labels should give ~20/min (1250/hour)",
)

// ============================================================================
// INTEGRATION TESTS: Cross-phase functionality
// ============================================================================
console.log("\n📊 INTEGRATION: Cross-Phase Functionality")
console.log("-".repeat(80))

// Test I.1: Initial Game State Completeness
assert(INITIAL_GAME_STATE.skills !== undefined, "Initial state should have skills")
assert(INITIAL_GAME_STATE.beatContracts !== undefined, "Initial state should have beatContracts")
assert(INITIAL_GAME_STATE.labelDeals !== undefined, "Initial state should have labelDeals")

assertEquals(INITIAL_GAME_STATE.energy, 150, "Initial energy should be 150 (Phase 1)")
assertEquals(
  Object.keys(INITIAL_GAME_STATE.artists).length,
  8,
  "Initial artists should have 8 entries (Phase 2)",
)
assertEquals(
  Object.keys(INITIAL_GAME_STATE.skills).length,
  9,
  "Initial skills should have 9 entries (Phase 3)",
)

// Test I.2: Energy Calculation with Skills
const baseEnergyCost = ENERGY_CONFIG.ENERGY_COST_PER_BEAT // 15
const withCaffeineReduction = baseEnergyCost * (1 - getSkillEnergyCostReduction(caffeineSkill)) // 15 * 0.9 = 13.5
assertRange(withCaffeineReduction, 13, 14, "Energy cost with Caffeine Rush should be ~13.5")

const baseMaxEnergy = ENERGY_CONFIG.BASE_MAX_ENERGY // 150
const withStaminaBonus = baseMaxEnergy * (1 + getSkillMaxEnergyBonus(staminaSkill)) // 150 * 1.2 = 180
assertEquals(withStaminaBonus, 180, "Max energy with Stamina should be 180")

// Test I.3: Total Passive Income (Artists + Labels)
const artistIncome = getTotalPassiveIncome(testArtists) // ~20-200/min
const labelIncome = getLabelDealsPassiveIncome(allLabels) // ~20/min
const totalPassiveIncome = artistIncome + labelIncome
assertRange(totalPassiveIncome, 30, 300, "Combined passive income should be reasonable")

// Test I.4: Reputation Gating
const player500Rep = 500 // Tier 2
assert(getReputationTier(player500Rep) === 2, "500 rep should be Tier 2")
assert(tier2Contracts.length > 0, "Tier 2 should unlock contracts")
assert(
  LABEL_DEALS_CONFIG.indie.requiredReputation <= 2000,
  "Indie label should be accessible in early tiers",
)

// Test I.5: Price Calculation with All Bonuses
const basePrice = 100
const tierMultiplier = getTierPriceMultiplier(2000) // 1.5x for Tier 3
const skillMultiplier = getSkillPriceMultiplier(allMoneySkills) // 1.85x
const finalPrice = Math.floor(basePrice * tierMultiplier * skillMultiplier)
// 100 * 1.5 * 1.85 = 277.5 → 277
assertRange(finalPrice, 250, 300, "Price with all bonuses should be ~277")

// ============================================================================
// BACKWARD COMPATIBILITY TESTS
// ============================================================================
console.log("\n📊 BACKWARD COMPATIBILITY")
console.log("-".repeat(80))

// Test BC.1: Old artists should still work
const oldArtists = ["mc-flow", "lil-dreamer", "street-poet", "young-legend"]
oldArtists.forEach((artistId) => {
  assert(
    ARTISTS_CONFIG[artistId as keyof typeof ARTISTS_CONFIG] !== undefined,
    `Old artist ${artistId} should still exist`,
  )
})

// Test BC.2: Old equipment should still work
const oldEquipment = ["phone", "headphones", "microphone", "computer"]
oldEquipment.forEach((equipmentId) => {
  assert(
    EQUIPMENT_TIERS[equipmentId as keyof typeof EQUIPMENT_TIERS] !== undefined,
    `Old equipment ${equipmentId} should still exist`,
  )
})

// Test BC.3: Old levels (1-5) should still work
oldEquipment.forEach((equipmentId) => {
  for (let level = 1; level <= 5; level++) {
    const tier = getEquipmentTier(equipmentId as keyof GameState["equipment"], level)
    assert(tier !== null, `${equipmentId} level ${level} should still work`)
  }
})

oldArtists.forEach((artistId) => {
  for (let level = 1; level <= 5; level++) {
    const income = getArtistIncome(artistId as keyof typeof ARTISTS_CONFIG, level)
    assert(income > 0, `${artistId} level ${level} income should be > 0`)
  }
})

// Test BC.4: INITIAL_GAME_STATE should have all new fields with defaults
assertEquals(
  INITIAL_GAME_STATE.skills.caffeineRush,
  false,
  "Initial skills should default to false",
)
assertEquals(
  INITIAL_GAME_STATE.beatContracts.availableContracts.length,
  0,
  "Initial contracts should be empty",
)
assertEquals(INITIAL_GAME_STATE.labelDeals.indie, false, "Initial labels should default to false")

// ============================================================================
// SUMMARY
// ============================================================================
console.log("\n" + "=".repeat(80))
console.log("📊 TEST SUMMARY")
console.log("=".repeat(80))
console.log(`\n✅ Passed: ${passedTests}`)
console.log(`❌ Failed: ${failedTests}`)
console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(2)}%\n`)

if (failedTests > 0) {
  console.log("❌ FAILED TESTS:")
  errors.forEach((error, i) => {
    console.log(`   ${i + 1}. ${error}`)
  })
  console.log("")
  process.exit(1)
} else {
  console.log("🎉 ALL TESTS PASSED! Economy Phases 1-3 are ready for deployment.\n")
  process.exit(0)
}
