import { loadGameState, saveGameState } from "../lib/game-storage"
import { ENERGY_CONFIG, getSkillMaxEnergyBonus } from "../lib/game-state"

async function restoreEnergy() {
  console.log("🔋 Restoring energy...")

  const gameState = await loadGameState()

  if (!gameState) {
    console.error("❌ No game state found. Start the game first.")
    return
  }

  // Calculate max energy with bonuses
  let maxEnergy = ENERGY_CONFIG.BASE_MAX_ENERGY
  maxEnergy += getSkillMaxEnergyBonus(gameState.skills)
  if (gameState.musicStyle === "electronic") maxEnergy += 30
  if (gameState.startingBonus === "energizer") maxEnergy += 50

  const oldEnergy = gameState.energy
  gameState.energy = maxEnergy

  await saveGameState(gameState)

  console.log(`✅ Energy restored: ${oldEnergy} → ${maxEnergy}`)
  console.log(`   Max energy: ${maxEnergy}`)
  console.log(`   Base: ${ENERGY_CONFIG.BASE_MAX_ENERGY}`)
  console.log(`   Skill bonus: +${getSkillMaxEnergyBonus(gameState.skills)}`)
  if (gameState.musicStyle === "electronic") console.log(`   Electronic style: +30`)
  if (gameState.startingBonus === "energizer") console.log(`   Energizer bonus: +50`)
}

restoreEnergy()
