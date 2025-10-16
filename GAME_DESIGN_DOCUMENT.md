# Producer Tycoon - Game Design Document

**Version:** 3.0 (October 2025)
**Last Updated:** Post Phase 1-3 Rebalancing + Skills/Label Deals Integration

## Table of Contents
1. [Core Mechanics Overview](#core-mechanics-overview)
2. [Economy System V3](#economy-system-v3)
3. [Progression Timeline](#progression-timeline)
4. [Phase 3 Systems](#phase-3-systems)
5. [Detailed Systems Breakdown](#detailed-systems-breakdown)
6. [Balance Analysis](#balance-analysis)

---

## Core Mechanics Overview

### Primary Gameplay Loop
1. **Create Beats** (Rhythm Game) → Earn money + reputation
2. **Upgrade Equipment** (6 categories, 10 levels each) → Increase beat quality
3. **Hire/Upgrade Artists** (8 artists, 10 levels each) → Passive income + energy bonus
4. **Unlock Skills** (9 skills, 3 branches) → Permanent gameplay bonuses
5. **Sign Label Deals** (3 labels) → Passive income investments
6. **Complete Daily Tasks** → Consistent rewards + streak bonuses
7. **Accept Beat Contracts** → Targeted challenges with big rewards

### Resource Types
- **Money ($)** - Primary currency for all purchases
- **Reputation** - Gates content and determines stage/tier
- **Energy** - Limits active beat creation (regenerates 2/min)

**Removed Resources:**
- ~~Gems~~ - Removed from game (was never used)

---

## Economy System V3

### Reputation Tier System
Reputation determines your tier, which affects stage, unlocks, and price multipliers:

| Tier | Reputation Range | Stage Name | Price Multiplier | Unlocks |
|------|-----------------|------------|------------------|---------|
| **Tier 1** | 0 - 500 | Уличный битмейкер | 1.0x | All Tier 1 artists, Tier 1 skills |
| **Tier 2** | 500 - 2,000 | Местный продюсер | 1.25x | Tier 2 artists, Tier 2 skills, Easy contracts |
| **Tier 3** | 2,000 - 5,000 | Региональный мастер | 1.5x | Tier 3 artists, Tier 3 skills, Medium contracts, Indie Label |
| **Tier 4** | 5,000 - 15,000 | Национальная звезда | 1.75x | All contracts, Small Label |
| **Tier 5** | 15,000 - 50,000 | Международный уровень | 2.0x | Major Label |
| **Tier 6** | 50,000+ | Легендарный продюсер | 2.5x | - |

**Key Changes from V2:**
- Stage now **auto-calculated** from reputation tier (no longer separate progression)
- Price multipliers increase with tier (prevents inflation issues)
- Clear content gates at each tier

---

### Income Sources

#### 1. Active Income (Beat Creation via Rhythm Game)

**Rhythm Game Mechanics:**
- Based on OSU! beatmap format (.osz files)
- 4 drum lanes (Kick/D, Snare/F, Hi-Hat/J, Tom/K)
- Real music tracks with professional beatmaps
- Canvas-based isometric 3D rendering
- Touch and keyboard controls

**Hit Detection:**
- **Perfect Hit**: ±12px from hit line → 100 points
- **Good Hit**: ±25px from hit line → 50 points
- **Offbeat**: ±50px → 25 points
- **Miss**: >50px or no tap → 0 points, combo breaks

**Track & Difficulty Selection:**
- Player chooses track from library (29+ uploaded tracks)
- Player chooses difficulty (1-5):
  - Лёгкая (1): 1.0x price, +5 quality bonus
  - Нормальная (2): 1.3x price, +10 quality bonus
  - Сложная (3): 1.6x price, +15 quality bonus
  - Экспертная (4): 1.9x price, +20 quality bonus
  - Мастер (5): 2.2x price, +25 quality bonus

**Beat Quality Calculation (UPDATED):**
```javascript
// Base quality from rhythm
baseQuality = 20
rhythmBonus = Math.floor(accuracy * 0.6) // Up to 60 points

// Difficulty bonus
difficultyBonus = difficulty * 3 // Up to 15 points

// Equipment bonus (reduced from v2)
equipmentBonus = Math.floor(
  (phone * 2 + headphones * 2 + mic * 3 + computer * 5 +
   midi * 2 + audioInterface * 4) * 0.3
)

// Skill bonus (Phase 3)
skillBonus = getSkillQualityBonus(skills) // +5/+10/+20%

finalQuality = Math.min(100, baseQuality + rhythmBonus + difficultyBonus +
                              equipmentBonus + skillBonus)
```

**Beat Price Calculation (UPDATED):**
```javascript
basePrice = 30
qualityBonus = Math.floor((quality - 60) * 1.5)
difficultyMultiplier = 1 + (difficulty - 1) * 0.3
reputationBonus = Math.floor(reputation * 0.05)

// Phase 1: Tier price multiplier
tierMultiplier = getTierPriceMultiplier(reputation) // 1.0x - 2.5x

// Phase 3: Skill price multiplier
skillMultiplier = getSkillPriceMultiplier(skills) // +10/+25/+50%

finalPrice = Math.floor(
  (basePrice + qualityBonus + reputationBonus) *
  difficultyMultiplier * tierMultiplier * skillMultiplier
)
```

**Energy System (UPDATED in Phase 1):**
- Base cost: **15 energy per beat** (was 20)
- Base max energy: **150** (was 100)
- Regen rate: **2 energy/min** (was 1/min)
- Full recharge time: **75 minutes** (was 100 minutes)
- Skill reduction: Caffeine Rush (-10% cost)

**Time Investment:**
- ~30-60 seconds per beat (depends on song length)
- ~3-5 minutes for full energy bar (10 beats)

**Examples (Tier 3, Master difficulty, 90% accuracy):**
- No equipment, no skills: Quality 75, Price $180
- Max equipment (10/10/10/10/10/10), no skills: Quality 95, Price $380
- Max equipment + all skills: Quality 130, Price $950+

---

#### 2. Passive Income (Artists)

**8 Artists, 3 Tiers, 10 Levels Each (UPDATED):**

| Tier | Artist | Base Cost | Genre | Income ($/min) | Energy Bonus | Requires Rep |
|------|--------|-----------|-------|----------------|--------------|--------------|
| **Tier 1** | Street Poet | $70 | Conscious | 5 → 85 | 8% → 50% | 0 |
| | MC Flow | $80 | Hip-Hop | 6 → 108 | 10% → 58% | 0 |
| | Lil Dreamer | $100 | Trap | 8 → 136 | 15% → 88% | 0 |
| | Young Legend | $200 | Hip-Hop | 12 → 222 | 25% → 150% | 400 |
| **Tier 2** | Local Hero | $300 | R&B | 20 → 298 | 30% → 156% | 500 |
| | Scene Leader | $400 | Trap | 25 → 376 | 35% → 180% | 500 |
| **Tier 3** | City Star | $800 | Pop | 50 → 698 | 50% → 260% | 2,000 |
| | State Champion | $1,000 | Hip-Hop | 60 → 834 | 55% → 284% | 2,000 |

**Cost Scaling:**
- Formula: `baseCost * 1.6^currentLevel`
- Each level costs 1.6x more than previous

**Offline Earnings:**
- Passive income accumulates for up to **4 hours** while offline
- Formula: `minutesAway (max 240) * totalPassiveIncome`
- Example: All 8 artists at max level = ~2,000/min = $480,000 for 4 hours

---

#### 3. Label Deals (Phase 3 - NEW)

Investment-based passive income system unlocked by reputation:

| Label | Cost | Passive Income | Requires Rep | Tier |
|-------|------|----------------|--------------|------|
| **Indie Label** 🎸 | $5,000 | $50/hour | 2,000 | Tier 3 |
| **Small Label** 🎤 | $20,000 | $200/hour | 5,000 | Tier 4 |
| **Major Label** 🏢 | $100,000 | $1,000/hour | 15,000 | Tier 5 |

**Total Passive Income (All Labels):**
- $1,250/hour = ~$21/min = $5,000 for 4 hours offline

**Combined with Artists:**
- Max artists (~2,000/min) + Labels (~21/min) = ~2,021/min total passive

---

#### 4. Daily Tasks System (Phase 2 - IMPLEMENTED)

**Task Types:**
- **Day 1 (Subscribe):** 3 tasks, $200 + 50 rep each = **$600 + 150 rep total**
- **Day 2 (Like):** 3 tasks, $300 + 75 rep + 30 energy each = **$900 + 225 rep + 90 energy total**

**Streak Rewards (IMPLEMENTED):**
- **7 days:** $500 + 100 reputation
- **14 days:** $1,500 + 300 reputation
- **21 days:** $3,000 + 800 reputation
- **30 days:** $5,000 + 2,000 reputation
- **40 days:** $8,000 + 4,000 reputation
- **50 days:** $12,000 + 8,000 reputation
- **60 days:** $20,000 + 15,000 reputation (Legendary tier!)

**Streak Mechanics:**
- Breaks if player misses a full day
- Auto-claims rewards when milestone reached
- Resets claimed rewards if streak breaks

---

#### 5. Beat Contracts (Phase 3 - NEW)

Challenge-based system with specific requirements and big rewards:

**Easy Contracts** (Tier 2+, 500 rep):
- "Набор битов": Create 10 beats → $2,000 + 200 rep
- "Качественный звук": Create 5 beats with 70%+ quality → $2,500 + 250 rep

**Medium Contracts** (Tier 3+, 2,000 rep):
- "Точность исполнения": Create 5 beats with 85%+ accuracy → $5,000 + 500 rep
- "Недельный план": Create 20 beats in 7 days → $6,000 + 600 rep

**Hard Contracts** (Tier 4+, 5,000 rep):
- "Перфекционизм": Create 10 beats with 90%+ quality → $10,000 + 1,000 rep
- "Мастер-класс": Create 5 beats with 95%+ accuracy AND 85%+ quality → $15,000 + 1,500 rep

---

#### 6. Free Training (One-Time, Phase 2)

**Seminar:**
- Reward: $300 + 100 reputation + 5 max energy bonus
- Duration: Instant

**Book Chapter:**
- Reward: $400 + 150 reputation + 5% quality bonus
- Duration: Instant

**Total One-Time:** $700 + 250 reputation

---

### Costs & Upgrades

#### Equipment Upgrades (6 Categories, 10 Levels Each)

**Cost Formula:** `basePrice * 1.4^currentLevel`

| Equipment | Base Price | Bonus/Level | Total Cost (0→10) |
|-----------|------------|-------------|-------------------|
| **Phone** | $80 | +2 quality | $3,285 |
| **Headphones** | $120 | +2 quality | $4,928 |
| **Microphone** | $200 | +3 quality | $8,213 |
| **Computer** | $400 | +5 quality | $16,426 |
| **MIDI Controller** | $150 | +2 quality | $6,160 |
| **Audio Interface** | $250 | +4 quality | $10,267 |

**Total Equipment Cost (All Max):** **$49,279**

**Quality Bonus at Max (all level 10):**
- Phone: +20 quality
- Headphones: +20 quality
- Microphone: +30 quality
- Computer: +50 quality
- MIDI: +20 quality
- Audio Interface: +40 quality
- **Equipment bonus (at 0.3x):** ~54 quality points

**Visual Equipment Tiers:**
Equipment now has visual images for each tier (0-10):
- `/public/equipment/phone-1.jpg` through `phone-10.jpg`
- `/public/equipment/headphones-0.jpg` through `headphones-10.jpg`
- etc.

---

#### Skills Tree (Phase 3 - NEW)

**9 Skills, 3 Branches, 3 Tiers:**

| Branch | Skill | Cost | Rep Req | Effect | Tier |
|--------|-------|------|---------|--------|------|
| **Energy** | Caffeine Rush ☕ | $2,000 | 500 | -10% energy cost per beat | 1 |
| | Stamina 💪 | $8,000 | 2,000 | +20% max energy | 2 |
| | Flow State 🌊 | $20,000 | 5,000 | +1 energy regen/min | 3 |
| **Quality** | Ear Training 👂 | $2,000 | 500 | +5% beat quality | 1 |
| | Music Theory 📚 | $8,000 | 2,000 | +10% beat quality | 2 |
| | Perfectionist ✨ | $20,000 | 5,000 | +20% beat quality | 3 |
| **Money** | Negotiator 🤝 | $2,000 | 500 | +10% beat price | 1 |
| | Businessman 💼 | $8,000 | 2,000 | +25% beat price | 2 |
| | Mogul 👑 | $20,000 | 5,000 | +50% beat price | 3 |

**Total Cost (All Skills):** $90,000

**Maximum Bonuses:**
- Energy: -10% cost, +20% max, +1/min regen
- Quality: +35% quality (additive: +5 +10 +20)
- Money: +85% price (multiplicative: 1.1 * 1.25 * 1.5 = 2.06x)

**Skill Unlock Strategy:**
1. **Early (500 rep, Tier 1):** Unlock Negotiator first (+10% price = immediate ROI)
2. **Mid (2,000 rep, Tier 2):** Businessman (+25% price) or Music Theory (+10% quality)
3. **Late (5,000 rep, Tier 3):** Mogul (+50% price) for massive income boost

---

## Progression Timeline

### Starting Resources (UPDATED)

**Base Start:**
- Money: $800 (was $500)
- Reputation: 0
- Energy: 150 (was 100)
- Equipment: Phone Level 1

**Music Style Bonuses:**
- Hip-Hop: +$200
- Trap: +100 reputation
- R&B: Free Headphones Level 1 + $100
- Pop: +$150 + 50 reputation
- Electronic: +30 max energy + $100

**Starting Bonus:**
- Producer: Free Headphones Level 1 + $200
- Hustler: +$400
- Connector: +200 reputation + $100
- Energizer: +50 max energy + $200

**Best Start Combo:** Hustler + Hip-Hop = **$1,400 starting money**

---

### Early Game (0-30 minutes)

**Goals:**
- Learn rhythm game mechanics
- Create first 10-20 beats
- Complete free training
- Unlock first Tier 1 skill
- Hire first artist

**Income:**
- Active: ~$80-150 per beat (60-70% accuracy, Easy difficulty, minimal equipment)
- 10 beats = $800-1,500 per energy bar (150 energy)
- Energy recharge: 75 minutes

**Spending Priority:**
1. Complete free training: +$700 + 250 rep
2. Unlock Negotiator skill (+10% price): $2,000
3. Upgrade Phone to Level 2-3: $112 + $157
4. Hire Street Poet (Level 1): $70

**Expected Progress:**
- Money earned: ~$3,000-5,000
- Reputation: ~300-500 (approaching Tier 2)
- Equipment: Phone Lvl 2-3, maybe Headphones Lvl 1
- Skills: Negotiator unlocked
- Artists: Street Poet Lvl 1

---

### Mid Game (30 minutes - 2 hours)

**Goals:**
- Reach Tier 2 (500 rep) → 1.25x price multiplier
- Unlock Tier 2 skills (Businessman or Music Theory)
- Hire 2-3 artists
- Upgrade equipment to Level 4-6
- Complete daily tasks
- Accept first Beat Contracts

**Income:**
- Active: $250-400 per beat (75-85% accuracy, Normal/Hard difficulty, 30-50% equipment)
- 10 beats = $2,500-4,000 per energy bar
- Passive: 2-3 artists at Level 2-4 = ~50-100/min = $3,000-6,000/hour

**Spending Priority:**
1. Unlock Businessman ($8,000) or Music Theory ($8,000)
2. Upgrade artists to Level 3-5
3. Upgrade Microphone and Computer (highest quality bonuses)
4. Save for Tier 2 artists (Local Hero or Scene Leader)

**Expected Progress:**
- Money earned: ~$20,000-40,000
- Reputation: ~1,000-2,500 (Tier 2-3)
- Equipment: Phone/Headphones Lvl 4-5, Mic/Computer Lvl 3-4
- Skills: Negotiator + Businessman/Music Theory
- Artists: 2-3 artists at Level 3-5

---

### Late Game (2+ hours)

**Goals:**
- Reach Tier 3+ (2,000+ rep) → 1.5x+ price multiplier
- Unlock all Tier 3 skills
- Sign Label Deals (Indie/Small/Major)
- Max out key equipment
- Hire Tier 3 artists (City Star, State Champion)
- Complete Hard Beat Contracts

**Income:**
- Active: $600-1,200+ per beat (90-95% accuracy, Expert/Master difficulty, max equipment + skills)
- 10 beats = $6,000-12,000+ per energy bar
- Passive: 5-6 artists at Level 6-10 = ~500-1,000/min = $30,000-60,000/hour
- Label Deals: +$1,250/hour

**Spending Priority:**
1. Unlock all Tier 3 skills (Mogul priority for +50% price)
2. Sign Indie Label ($5,000) → Small Label ($20,000)
3. Max out Computer and Microphone (to Level 10)
4. Hire and upgrade Tier 3 artists
5. Complete Hard contracts for reputation boosts

**Expected Progress:**
- Money earned: $200,000-1,000,000+
- Reputation: 5,000-50,000+ (Tier 4-6)
- Equipment: Most at Level 8-10
- Skills: All 9 unlocked
- Artists: 6-8 artists, many at Level 7-10
- Labels: Indie + Small (or all 3)

---

## Phase 3 Systems

### Skills Tree System

**UI Location:** New "Skills" screen accessible from Upgrades → "Древо навыков" card

**Unlock Flow:**
1. Player gains reputation through beat creation
2. Skills unlock at reputation gates (500, 2,000, 5,000)
3. Player spends money to unlock skill
4. Skill provides **permanent passive bonus**

**Visual Design:**
- 3 branches with color coding:
  - Energy Branch: Secondary color (⚡)
  - Quality Branch: Primary color (📈)
  - Money Branch: Accent color (💰)
- Locked skills show reputation requirement
- Unlocked skills show "✓ Активен" badge
- Cards display icon, name, description, effect, cost

**Balance Notes:**
- Skills are **expensive** but provide **permanent bonuses**
- Total investment: $90,000 (roughly 150-200 beats worth)
- ROI is long-term but very high
- Money branch has best ROI (direct income boost)

---

### Label Deals System

**UI Location:** Upgrades screen → "Контракты с лейблами" section

**Unlock Flow:**
1. Player reaches Tier 3+ (2,000+ reputation)
2. Indie Label becomes available for purchase
3. Player invests one-time cost
4. Label provides **permanent passive income**

**Visual Design:**
- 3 cards with label icons (🎸 🎤 🏢)
- Shows passive income per hour and per minute
- Locked labels show reputation requirement
- Owned labels show "Контракт активен" + checkmark

**Balance Notes:**
- Labels are **one-time investments** with **infinite passive return**
- Indie Label ROI: 100 hours ($50/hr, $5k cost)
- Small Label ROI: 100 hours ($200/hr, $20k cost)
- Major Label ROI: 100 hours ($1k/hr, $100k cost)
- Combined with artist income for massive passive earnings

---

### Beat Contracts System

**UI Location:** (Not yet implemented in UI, config exists in game-state.ts)

**Mechanics:**
- Contracts refresh daily
- 3 difficulty tiers (Easy/Medium/Hard)
- Each contract has specific requirements
- Completing contract gives big money + reputation reward

**Contract Types:**
- Volume-based: "Create X beats"
- Quality-based: "Create X beats with Y% quality"
- Accuracy-based: "Create X beats with Y% accuracy"
- Combined: "Create X beats with Y% quality AND Z% accuracy"
- Time-limited: "Create X beats in Y days"

**Balance Notes:**
- Contracts provide **targeted challenges** for skilled players
- Rewards scale with difficulty (2x-7x normal beat earnings)
- Hard contracts require near-perfect play (95% accuracy, 90% quality)
- Adds structured goals beyond "create more beats"

---

## Detailed Systems Breakdown

### 1. Beat Creation System (Rhythm Game)

**OSU! Beatmap Integration:**
- Loads `.osz` files (ZIP archives with audio + beatmap)
- Parses beatmap to extract note timing and lane data
- Supports multiple game modes (Taiko, Standard)
- Converts hit objects to 4-lane drum format

**Current Track Library:**
29+ uploaded tracks including:
- Lenny Kravitz - Fly Away
- Various hip-hop, rock, and EDM tracks
- Stored in Supabase storage: `tracks/*.osz`
- Metadata in database: `songs` table

**Lane Distribution (from X coordinate):**
- X < 128: Lane 0 (Kick/D)
- X < 256: Lane 1 (Snare/F)
- X < 384: Lane 2 (Hat/J)
- X >= 384: Lane 3 (Tom/K)

**Hit Detection (UPDATED):**
- Hit window: 100px tolerance (was 50px)
- Makes game more forgiving for mobile players

**Touch Controls:**
- 4 touch buttons at bottom of highway
- Each button positioned exactly on lane
- Color-coded to match lanes
- Active state with gradient feedback

**Visual Design:**
- Canvas-based rendering (770x488)
- Highway with 4 lanes
- Golden hit line at 85% height
- Notes scroll from top to bottom
- Highway background gradient (#1a1a2e → #0a0a0f)

**Results Screen:**
- Shows accuracy percentage
- Animated confetti for high scores
- "Продолжить" button to generate beat
- Full-screen modal overlay

---

### 2. Energy System (Phase 1 Rebalance)

**Updated Values:**
- Base max: 150 (was 100)
- Cost per beat: 15 (was 20)
- Regen rate: 2/min (was 1/min)
- Beats per full bar: 10 (was 5)
- Full recharge time: 75 minutes (was 100 minutes)

**Skill Bonuses:**
- Caffeine Rush: -10% cost (15 → 13.5 energy per beat)
- Stamina: +20% max energy (150 → 180 base max)
- Flow State: +1/min regen (2 → 3/min)

**Artist Bonuses:**
- Artists provide % bonus to max energy
- Formula: `baseMax * (1 + artistBonus%)`
- All 8 artists at max: +1,000%+ bonus = 1,650 max energy!

**Balance Impact:**
- 2x more beats per session (10 vs 5)
- 25% faster recharge (75min vs 100min)
- Energy now less of a bottleneck
- Active play more rewarding per session

---

### 3. Equipment System (6 Categories)

**NEW: MIDI & Audio Interface Added**

All equipment now functional and affects quality:
- Phone: +2 quality/level
- Headphones: +2 quality/level
- Microphone: +3 quality/level
- Computer: +5 quality/level
- **MIDI Controller: +2 quality/level** (NEW)
- **Audio Interface: +4 quality/level** (NEW)

**Equipment Multiplier:** 0.3x (reduced from 0.5x in v2)
- Prevents equipment from overpowering skill-based gameplay
- Quality bonus capped at ~54 points with all max equipment

**Visual Assets:**
- All equipment has images for levels 0-10
- Stored in `/public/equipment/`
- Example: `phone-1.jpg` through `phone-10.jpg`
- Shows progression from basic to legendary gear

**Upgrade Strategy (Updated):**
1. Phone to Lvl 3 (cheap, immediate quality boost)
2. Headphones to Lvl 3 (cheap, immediate quality boost)
3. Computer to Lvl 5-7 (highest quality/level bonus)
4. Microphone to Lvl 5-7 (second highest bonus)
5. Audio Interface to Lvl 5-7 (new, high bonus)
6. MIDI to Lvl 5-7 (new, medium bonus)
7. Max out in order: Computer > Audio Interface > Mic > others

---

### 4. Artist System (8 Artists, 10 Levels)

**Artist Tier Distribution:**
- **Tier 1 (0 rep):** Street Poet, MC Flow, Lil Dreamer, Young Legend (400 rep)
- **Tier 2 (500 rep):** Local Hero, Scene Leader
- **Tier 3 (2,000 rep):** City Star, State Champion

**Income Scaling:**
- Each artist has array of 11 income values (Level 0-10)
- Income increases exponentially with level
- Example: MC Flow = [0, 6, 9, 13, 18, 25, 34, 46, 62, 82, 108]

**Energy Bonus Scaling:**
- Each artist also provides % max energy bonus
- Bonus increases with level
- Example: MC Flow = [0, 10, 12, 14, 16, 20, 25, 31, 38, 47, 58]%

**Total Passive Income (All Max):**
- Street Poet Lvl 10: 85/min
- MC Flow Lvl 10: 108/min
- Lil Dreamer Lvl 10: 136/min
- Young Legend Lvl 10: 222/min
- Local Hero Lvl 10: 298/min
- Scene Leader Lvl 10: 376/min
- City Star Lvl 10: 698/min
- State Champion Lvl 10: 834/min
- **Total: ~2,757/min = $165,420/hour = $661,680 for 4 hours**

**UI Display:**
- Shows current income per hour ($/hour)
- Shows energy bonus percentage
- Shows next level stats in preview
- Artist portraits (placeholders currently)

---

### 5. Reputation & Stage System

**Stage Auto-Calculation (Phase 1 Fix):**
```javascript
currentStage = Math.min(6, getReputationTier(reputation))
```
- Stage is now **calculated** from reputation tier, not stored separately
- Removes "stageProgress" system (deprecated)
- Stage always matches tier (1-6)

**Reputation Sources:**
- Beat creation: ~5-10 rep per beat (based on quality)
- Daily tasks: 150-225 rep per day
- Streak rewards: 100-15,000 rep (7-60 day milestones)
- Free training: 250 rep (one-time)
- Beat contracts: 200-1,500 rep per contract

**Reputation Sinks:**
- None (reputation is pure progression resource)
- Gates content at 500, 2k, 5k, 15k, 50k rep

**Stage Titles:**
- Tier 1: Уличный битмейкер
- Tier 2: Местный продюсер
- Tier 3: Региональный мастер
- Tier 4: Национальная звезда
- Tier 5: Международный уровень
- Tier 6: Легендарный продюсер

---

### 6. Daily Tasks System (Phase 2)

**Implementation Status:** ✅ **FULLY IMPLEMENTED**

**Task Reset:**
- Resets at midnight local time
- Checks on app load if new day
- Breaks streak if >1 day passed

**Task Types:**
- Alternates between Subscribe (odd days) and Like (even days)
- 3 tasks per day
- Must complete all 3 to increment streak

**Streak Storage:**
- `daily_tasks_completed`: Array of completed task IDs
- `daily_tasks_last_reset`: ISO timestamp of last completion
- `daily_streak`: Current streak count
- `claimed_streak_rewards`: Array of claimed milestone numbers

**Auto-Claim Rewards:**
- Checks for unclaimed milestones on streak update
- Automatically claims and shows alert
- Adds money + reputation to player
- Marks milestone as claimed

**UI Features:**
- Progress bar showing tasks completed
- Countdown timer to next reset
- Streak flame icon with day count
- Streak milestone progress card
- List of all streak rewards with claimed status

---

### 7. Offline Earnings System

**Calculation:**
```javascript
minutesAway = Math.min(actualMinutesAway, 240) // Cap at 4 hours
artistIncome = getTotalPassiveIncome(artists) // Sum of all artist income
labelIncome = getLabelDealsPassiveIncome(labelDeals) // Sum of label income
totalPassiveIncome = artistIncome + labelIncome
offlineEarnings = minutesAway * totalPassiveIncome
```

**Modal Display:**
- Shows time away (formatted as Xh Ym)
- Shows total earnings
- Confetti animation for big earnings
- Auto-adds to player money

**Balance Notes:**
- 4-hour cap prevents extreme idle advantages
- Encourages 3-4 check-ins per day
- Rewards artist/label investment
- Offline earnings can exceed active earnings at high levels

---

## Balance Analysis

### Current State (Post Phase 1-3 Rebalancing)

#### ✅ **FIXED: Energy System**
**Problem (V2):** Energy regeneration too slow, only 5 beats per session

**Solution (V3):**
- Doubled regen rate (1 → 2/min)
- Increased base max (100 → 150)
- Reduced cost per beat (20 → 15)
- Result: **10 beats per session, 75min recharge**

**Impact:** Active play much more rewarding, less waiting

---

#### ✅ **FIXED: Equipment Usefulness**
**Problem (V2):** MIDI and Audio Interface existed but didn't affect quality

**Solution (V3):**
- Added MIDI (+2 quality/level) to calculation
- Added Audio Interface (+4 quality/level) to calculation
- All 6 equipment categories now functional

**Impact:** Players no longer waste money on useless upgrades

---

#### ✅ **FIXED: Stage Progression**
**Problem (V2):** Stage and stageProgress disconnected from gameplay

**Solution (V3):**
- Stage now auto-calculated from reputation tier
- Removed stageProgress (deprecated)
- Stage always matches player's actual progression

**Impact:** Stage now meaningful indicator of progress

---

#### ✅ **FIXED: Reputation Underutilized**
**Problem (V2):** Reputation only gated Young Legend (500 rep), no other use

**Solution (V3):**
- 6 reputation tiers with clear breakpoints
- Tiers gate artists, skills, contracts, labels
- Tiers provide price multipliers (1.0x → 2.5x)
- Major milestones at 500, 2k, 5k, 15k, 50k rep

**Impact:** Reputation now central progression mechanic

---

#### ✅ **IMPROVED: Active vs Passive Income Balance**
**Problem (V2):** Late-game passive income >> active income

**Solution (V3):**
- Reduced equipment multiplier (0.5x → 0.3x)
- Increased active income via:
  - Difficulty multipliers (1.0x → 2.2x)
  - Tier multipliers (1.0x → 2.5x)
  - Skill multipliers (up to +85% with Mogul)
- Result: **Active income can reach $1,000+ per beat at high tier**

**Comparison (Tier 5, Max Equipment + Skills, Master difficulty, 95% accuracy):**
- Active: ~$1,200 per beat * 10 beats = $12,000 per session (75min)
- Active hourly: ~$9,600/hour
- Passive (max): ~$165,000/hour (all artists + labels)
- **Passive still higher, but active is 16x better than V2**

**Balance Notes:**
- Passive still dominates at max levels (intentional for idle mechanics)
- Active is competitive and more rewarding in mid-game
- Skill bonuses make active play scale better into late game

---

#### ✅ **NEW: Skills Tree (Phase 3)**
**Addition:** 9 skills providing permanent bonuses across 3 branches

**Impact:**
- Adds long-term money sink ($90k total)
- Provides meaningful power increases
- Creates strategic choices (which branch to prioritize)
- Mogul skill (+50% price) is game-changing for active players

**Balance:**
- Skills are expensive but permanent
- Money branch has best ROI for active players
- Energy branch reduces bottleneck
- Quality branch provides raw power

---

#### ✅ **NEW: Label Deals (Phase 3)**
**Addition:** 3 investment-based passive income sources

**Impact:**
- Adds major money sink ($125k total)
- Provides permanent passive income boost
- Creates progression goals (save for next label)
- Rewards long-term play

**Balance:**
- 100-hour ROI for each label (fair for idle mechanic)
- Combined with artists for massive passive earnings
- Reputation gates prevent early abuse

---

#### ✅ **NEW: Beat Contracts (Phase 3)**
**Addition:** Challenge-based system with targeted requirements

**Impact (Future - not yet in UI):**
- Adds structured challenges
- Rewards skill-based play
- Provides alternative reputation source
- Creates variety in objectives

**Balance:**
- Rewards scale with difficulty (2x-7x normal earnings)
- Hard contracts require near-perfect play
- Time-limited contracts add urgency

---

### Remaining Issues

#### ⚠️ **Inflation at High Tiers**
**Problem:** Tier 6 players with max skills can earn $1,000+ per beat

**Impact:**
- Money loses meaning at extreme late game
- All upgrades trivially affordable
- No challenge remaining

**Potential Solutions:**
- Add prestige/rebirth system
- Add cosmetic money sinks (studio customization)
- Add competitive elements (leaderboards, tournaments)
- Cap tier multiplier at Tier 5 (2.0x max)

---

#### ⚠️ **Beat Contracts Not in UI**
**Problem:** System fully implemented in code but no UI to access

**Impact:**
- Players can't access Phase 3 content
- No contract refresh mechanics
- Missing gameplay variety

**Solution:** Add Contracts screen with:
- Available contracts list
- Active contracts tracker
- Completed contracts history
- Daily refresh system

---

#### ⚠️ **Artist Portraits Placeholders**
**Problem:** Most artists use placeholder images

**Impact:**
- Less visual appeal
- Harder to distinguish artists
- Professional feel reduced

**Solution:**
- Generate AI portraits for all 8 artists
- Use art-generator system already in place
- Match artist descriptions (genre, tier, vibe)

---

## Recommendations

### High Priority (Next Sprint)

1. **Add Beat Contracts UI**
   - Create Contracts screen
   - Show available/active/completed contracts
   - Add progress tracking
   - Implement daily refresh

2. **Generate Artist Portraits**
   - Use existing art-generator
   - Create portraits for all 8 artists
   - Match genre and tier descriptions

3. **Add Tutorial/Onboarding**
   - Explain rhythm game mechanics
   - Show track + difficulty selection
   - Introduce energy system
   - Guide first equipment upgrade

### Medium Priority (Future Sprints)

4. **Prestige/Rebirth System**
   - Reset progress for permanent bonuses
   - Add prestige currency
   - Scale difficulty for replayability

5. **Leaderboards**
   - Global leaderboards (money, reputation, beats created)
   - Weekly challenges
   - Friend comparisons

6. **More Tracks**
   - Expand OSU beatmap library
   - Add track variety (more genres)
   - Community submissions?

7. **Studio Customization**
   - Cosmetic studio themes
   - Equipment visual upgrades
   - Money sink for late game

### Low Priority (Nice to Have)

8. **Social Features**
   - Share beats on social media
   - Challenge friends
   - Co-op features?

9. **Events & Seasons**
   - Limited-time events
   - Seasonal artists
   - Special rewards

10. **Mobile App**
    - Native iOS/Android apps
    - Push notifications for energy refills
    - Offline beat creation

---

## Conclusion

**Version 3.0 State:**
Producer Tycoon has evolved from a simple rhythm game to a **deep progression tycoon** with multiple interlocking systems:

✅ **Core Strengths:**
- Engaging rhythm gameplay (OSU! beatmaps)
- Multiple progression paths (equipment, artists, skills, labels)
- Clear tier-based progression (6 tiers, reputation-gated)
- Balanced active/passive income (active competitive in mid-game)
- Long-term goals (skills, labels, max equipment)
- Consistent rewards (daily tasks, streaks)

✅ **Major Improvements from V2:**
- Energy system 2x more generous
- Equipment all functional (MIDI, Audio Interface)
- Stage auto-calculated from reputation
- Reputation now central progression mechanic
- Skills tree adds strategic depth
- Label deals provide investment goals
- Active income scales much better

⚠️ **Remaining Work:**
- Beat Contracts UI implementation
- Artist portrait generation
- Tutorial/onboarding flow
- Prestige system for late-game
- Leaderboards and social features

**Target Audience:**
- Casual mobile gamers who enjoy rhythm games
- Idle/tycoon game fans
- Music enthusiasts
- Players who like progression systems

**Session Length:**
- Short sessions: 5-10 minutes (create beats, collect offline earnings)
- Medium sessions: 20-30 minutes (upgrade equipment, unlock skills)
- Long sessions: 1-2 hours (grind for next tier, complete contracts)

**Monetization Potential (Future):**
- Energy refills (if re-adding gems)
- Cosmetic studio themes
- Exclusive tracks/artists
- Ad watching for bonus rewards
- Battle pass system

**Final Assessment:**
The game successfully combines **skill-based active play** (rhythm game) with **strategic long-term planning** (equipment, artists, skills, labels). Phase 1-3 rebalancing has created a much more cohesive and rewarding experience compared to V2.

---

**Last Updated:** October 16, 2025
**Document Version:** 3.0
**Game Version:** Phase 3 Complete (Skills + Label Deals Integrated)
