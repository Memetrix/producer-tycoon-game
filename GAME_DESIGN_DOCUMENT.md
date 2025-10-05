# Producer Tycoon - Game Design Document

## Table of Contents
1. [Core Mechanics Overview](#core-mechanics-overview)
2. [Economy System](#economy-system)
3. [Progression Timeline](#progression-timeline)
4. [Balance Analysis](#balance-analysis)
5. [Detailed Systems Breakdown](#detailed-systems-breakdown)

---

## Core Mechanics Overview

### Primary Gameplay Loop
1. **Create Beats** (Active) → Earn money + reputation
2. **Upgrade Equipment** → Increase beat quality
3. **Hire/Upgrade Artists** → Generate passive income
4. **Complete Daily Tasks** → Bonus rewards
5. **Repeat & Progress** → Unlock new stages

### Resource Types
- **Money ($)** - Primary currency for upgrades and purchases
- **Reputation** - Unlocks artists and progression milestones
- **Energy** - Limits active beat creation (regenerates over time)
- **Gems** - Premium currency (currently unused in economy)

---

## Economy System

### Income Sources

#### 1. Active Income (Beat Creation)
**Rhythm Game Mechanics:**
- Player taps 4 drum lanes in rhythm
- 16 notes per beat (from 5 different patterns)
- Accuracy determines rewards:
  - **Perfect Hit** (≤12px from target): 100 points
  - **Good Hit** (≤25px from target): 50 points
  - **Miss** (>25px or no tap): 0 points

**Beat Quality Calculation:**
\`\`\`
Base Quality = 50 + (Accuracy% × 0.5)
Equipment Bonus = Phone×5% + Headphones×5% + Mic×10% + Studio×15%
Final Quality = Base Quality × (1 + Equipment Bonus)
\`\`\`

**Beat Pricing:**
\`\`\`
Base Price = $50 + (Quality × 2)
Example: 80% accuracy + 35% equipment bonus = Quality 94 = $238 per beat
\`\`\`

**Energy Cost:**
- 20 energy per beat creation
- Base max energy: 100 (5 beats)
- Energy recovery: 1 per minute (100 minutes for full recharge)
- Artist energy bonus: Up to +50% max energy at max levels

**Time Investment:**
- ~30-45 seconds per beat creation
- ~2-3 minutes for 5 beats (full energy bar)

#### 2. Passive Income (Artists)
Artists generate money automatically while offline (capped at 4 hours).

| Artist | Base Cost | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 | Total Cost |
|--------|-----------|---------|---------|---------|---------|---------|------------|
| **Street Poet** | $90 | $3/min | $4/min | $5/min | $6/min | $8/min | $1,458 |
| **MC Flow** | $100 | $4/min | $5/min | $6/min | $8/min | $10/min | $1,620 |
| **Lil Dreamer** | $120 | $5/min | $6/min | $8/min | $10/min | $13/min | $1,944 |
| **Young Legend** | $250 | $8/min | $10/min | $13/min | $16/min | $20/min | $5,063 |

**Cost Scaling:**
- Street Poet, MC Flow, Lil Dreamer: Cost × 1.8^level
- Young Legend: Cost × 2.0^level (requires 500 reputation)

**Maximum Passive Income:**
- All artists at Level 5: **$51/min** = **$3,060/hour** = **$12,240/4 hours**

#### 3. Daily Tasks System
**Day 1 (Subscribe Tasks):**
- 3 tasks: Telegram, Twitter, Instagram subscriptions
- Reward per task: $50 + 10 reputation
- Total: **$150 + 30 reputation**

**Day 2 (Like Tasks):**
- 3 tasks: Like posts on Telegram, Twitter, Instagram
- Reward per task: $75 + 15 reputation + 10 energy
- Total: **$225 + 45 reputation + 30 energy**

**Streak System:**
- Alternates between Day 1 and Day 2 tasks
- Streak breaks if player misses a day
- Planned rewards (not yet implemented):
  - 7 days: $500 + 100 reputation
  - 14 days: $1,500 + 300 reputation
  - 30 days: Exclusive artist + 5,000 reputation

#### 4. Free Training (One-Time)
**Seminar:**
- Reward: $100 + 50 reputation + 5% energy bonus
- Duration: 15 minutes (instant in-game)

**Book Chapter:**
- Reward: $150 + 75 reputation + 5% quality bonus
- Duration: 10 minutes (instant in-game)

**Total One-Time:** $250 + 125 reputation

---

### Costs & Upgrades

#### Equipment Upgrades
Formula: `Base Cost × 1.5^Current Level`

| Equipment | Base Cost | Bonus | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 | Total Cost |
|-----------|-----------|-------|---------|---------|---------|---------|---------|------------|
| **Phone** | $100 | +5%/lvl | $100 | $150 | $225 | $338 | $506 | **$1,319** |
| **Headphones** | $150 | +5%/lvl | $150 | $225 | $338 | $506 | $759 | **$1,978** |
| **Microphone** | $250 | +10%/lvl | $250 | $375 | $563 | $844 | $1,266 | **$3,298** |
| **Studio** | $500 | +15%/lvl | $500 | $750 | $1,125 | $1,688 | $2,531 | **$6,594** |

**Total Equipment Cost (All Max):** **$13,189**

**Quality Bonus at Max:**
- Phone: +25%
- Headphones: +25%
- Microphone: +50%
- Studio: +75%
- **Total: +175% quality bonus**

---

## Progression Timeline

### Starting Resources
**Base Start:**
- Money: $500
- Reputation: 0
- Energy: 100
- Equipment: Phone Level 1

**Music Style Bonuses:**
- Hip-Hop: +$100
- Trap: +50 reputation
- R&B: Free Headphones Level 1
- Pop: +$50 + 25 reputation
- Electronic: +20 max energy

**Starting Bonus:**
- Producer: Free Headphones Level 1
- Hustler: +$200
- Connector: +100 reputation
- Energizer: +50 max energy

**Best Start Combo:** Hustler + Hip-Hop = **$800 starting money**

---

### Early Game (0-30 minutes)

**Goals:**
- Learn rhythm game mechanics
- Create first 5-10 beats
- Complete free training
- Start first equipment upgrades

**Income:**
- Active: ~$150-200 per beat (50-60% accuracy, minimal equipment)
- 5 beats = $750-1,000 per energy bar
- Energy recharge: 100 minutes (1h 40m)

**Spending Priority:**
1. Complete free training: +$250
2. Upgrade Phone to Level 2: $100
3. Save for Headphones Level 1-2: $150-225

**Expected Progress:**
- Money earned: ~$1,500-2,000
- Reputation: ~150-200
- Equipment: Phone Lvl 2, Headphones Lvl 1-2

---

### Mid Game (30 minutes - 2 hours)

**Goals:**
- Hire first artist for passive income
- Upgrade equipment to Level 3-4
- Improve rhythm game accuracy (70-80%)
- Complete daily tasks

**Income:**
- Active: ~$250-300 per beat (70-80% accuracy, 50-75% equipment bonus)
- 5 beats = $1,250-1,500 per energy bar
- Passive: First artist Level 1-2 = $3-5/min = $180-300/hour

**Spending Priority:**
1. Hire Street Poet or MC Flow: $90-100
2. Upgrade artist to Level 2: $162-180
3. Continue equipment upgrades (Phone/Headphones to Lvl 3)
4. Start Microphone upgrades

**Expected Progress:**
- Money earned: ~$5,000-8,000
- Reputation: ~400-600
- Equipment: Phone Lvl 3, Headphones Lvl 3, Mic Lvl 1-2
- Artists: 1-2 artists at Level 2-3

---

### Late Game (2+ hours)

**Goals:**
- Unlock Young Legend (500 reputation)
- Max out equipment
- Multiple artists at high levels
- Optimize passive income

**Income:**
- Active: ~$350-450 per beat (85-95% accuracy, 100-150% equipment bonus)
- 5 beats = $1,750-2,250 per energy bar
- Passive: 2-3 artists at Level 3-4 = $20-35/min = $1,200-2,100/hour

**Spending Priority:**
1. Unlock Young Legend: $250 (requires 500 reputation)
2. Max out Microphone and Studio (highest quality bonuses)
3. Upgrade all artists to Level 4-5
4. Complete equipment to max levels

**Expected Progress:**
- Money earned: $20,000-50,000+
- Reputation: 1,000-2,000+
- Equipment: All Level 4-5
- Artists: 3-4 artists at Level 3-5

---

## Balance Analysis

### Current Issues

#### 1. Energy System Bottleneck
**Problem:** Energy regeneration is extremely slow (100 minutes for full bar), creating long wait times between active play sessions.

**Impact:**
- Players can only create 5 beats per session
- 1h 40m wait for next session
- Heavily pushes players toward passive income

**Recommendations:**
- Reduce energy cost per beat: 20 → 15 (6-7 beats per bar)
- Increase energy regen rate: 1/min → 1.5/min (67 minutes for full bar)
- Add energy refill options (daily task rewards, gems)
- Consider energy overflow system (store up to 150-200 energy)

#### 2. Passive Income Dominance
**Problem:** Late-game passive income ($3,000/hour) far exceeds active income potential ($2,250 per 100 minutes).

**Math:**
- Active: $2,250 per 100 minutes = $1,350/hour
- Passive: $3,060/hour (all artists maxed)
- Passive is 2.3x more efficient

**Impact:**
- Active gameplay becomes less rewarding
- Players incentivized to "check in" rather than play
- Rhythm game becomes less central to experience

**Recommendations:**
- Increase beat prices by 50-100%
- Add combo/streak bonuses for consecutive perfect beats
- Reduce passive income by 30-40%
- Add active gameplay multipliers (e.g., "Hot streak" bonus)

#### 3. Equipment Cost Scaling
**Problem:** Equipment costs scale exponentially (1.5x per level) but benefits are linear (+5-15% per level).

**Math:**
- Phone Level 5: Costs $506, gives +25% quality
- Studio Level 5: Costs $2,531, gives +75% quality
- Total investment: $13,189 for +175% quality

**Impact:**
- Late-game upgrades feel unrewarding
- Players may stop upgrading after Level 3-4
- ROI decreases significantly at higher levels

**Recommendations:**
- Reduce cost scaling: 1.5x → 1.4x per level
- Increase quality bonuses: +5/10/15% → +8/15/25% per level
- Add additional benefits (energy cost reduction, reputation bonuses)
- Consider prestige/rebirth system for long-term progression

#### 4. Reputation System Underutilized
**Problem:** Reputation only gates Young Legend (500 rep) and has no other meaningful use.

**Current Sources:**
- Beat creation: ~5-10 per beat
- Daily tasks: 30-45 per day
- Free training: 125 one-time

**Impact:**
- Players reach 500 reputation quickly (1-2 hours)
- No long-term reputation goals
- Resource feels wasted after early game

**Recommendations:**
- Add reputation-gated content:
  - Exclusive equipment tiers (1,000+ rep)
  - Special artists (2,000+ rep)
  - Studio upgrades (5,000+ rep)
- Add reputation-based multipliers (quality, income)
- Create reputation leaderboards/rankings
- Add reputation decay for inactive players

#### 5. Daily Tasks Lack Variety
**Problem:** Only 2 task types (subscribe/like) that alternate daily.

**Impact:**
- Repetitive gameplay
- Low engagement after first week
- Streak rewards not yet implemented

**Recommendations:**
- Implement planned streak rewards (7/14/30 days)
- Add more task variety:
  - "Create 3 beats today"
  - "Reach 90% accuracy"
  - "Earn $1,000 today"
  - "Upgrade any equipment"
- Rotate task types more frequently
- Add weekly/monthly challenges

#### 6. Gems Currency Unused
**Problem:** Gems exist in game state but have no purpose.

**Recommendations:**
- Energy refills (50 gems = full energy)
- Speed up artist work (reduce offline time cap)
- Exclusive cosmetics (beat covers, studio themes)
- Premium artists or equipment
- Daily task skips/rerolls

---

### Positive Design Elements

#### 1. Rhythm Game Core
**Strengths:**
- Engaging, skill-based gameplay
- Clear feedback (perfect/good/miss)
- Multiple beat patterns for variety
- Satisfying audio feedback

**Maintains Interest:**
- Players improve accuracy over time
- Higher accuracy = better rewards
- Combo system adds tension

#### 2. Multiple Progression Paths
**Strengths:**
- Equipment upgrades (quality)
- Artist upgrades (passive income)
- Skill improvement (accuracy)
- Daily tasks (consistent rewards)

**Player Choice:**
- Focus on active or passive income
- Prioritize different equipment
- Choose which artists to upgrade

#### 3. Offline Progression
**Strengths:**
- 4-hour cap prevents excessive advantage
- Encourages regular check-ins
- Rewards player investment in artists

**Balance:**
- Not too punishing for casual players
- Not too rewarding for idle play
- Maintains active gameplay value

---

## Detailed Systems Breakdown

### 1. Beat Creation System

**Rhythm Game Mechanics:**
- 4 lanes representing drum sounds (Kick, Snare, Hi-Hat, Tom)
- Notes scroll from top to bottom
- Hit zone at 85% of screen height
- Tap window: ±35px from hit zone

**Accuracy Zones:**
- Perfect: ±12px (100 points, combo continues)
- Good: ±25px (50 points, combo continues)
- Miss: >25px or no tap (0 points, combo breaks)

**Beat Patterns:**
5 pre-defined patterns rotate randomly:
1. Basic 4/4 rock beat
2. Hip-hop pattern
3. Complex pattern
4. Trap pattern
5. Drum & Bass pattern

**Difficulty Scaling:**
- Difficulty 1-5 affects:
  - Note speed: 1.2 + (difficulty × 0.1)
  - Spawn interval: 800ms - (difficulty × 50ms)
- Currently difficulty is fixed (not player-selectable)

**Quality Calculation:**
\`\`\`javascript
baseQuality = 50 + (accuracy * 0.5)
equipmentBonus = (phone * 5) + (headphones * 5) + (mic * 10) + (studio * 15)
finalQuality = baseQuality * (1 + equipmentBonus / 100)
\`\`\`

**Price Calculation:**
\`\`\`javascript
beatPrice = 50 + (quality * 2)
\`\`\`

**Examples:**
- 50% accuracy, 0% equipment: Quality 75, Price $200
- 80% accuracy, 50% equipment: Quality 105, Price $260
- 100% accuracy, 175% equipment: Quality 275, Price $600

---

### 2. Energy System

**Base Values:**
- Starting energy: 100
- Max energy: 100 + artist bonuses
- Energy per beat: 20
- Regen rate: 1 per minute

**Artist Energy Bonuses:**
| Artist | Lvl 1 | Lvl 2 | Lvl 3 | Lvl 4 | Lvl 5 |
|--------|-------|-------|-------|-------|-------|
| Street Poet | +10% | +12% | +14% | +16% | +20% |
| MC Flow | +15% | +18% | +21% | +24% | +30% |
| Lil Dreamer | +8% | +10% | +12% | +14% | +18% |
| Young Legend | +25% | +30% | +35% | +40% | +50% |

**Maximum Energy:**
- Base: 100
- All artists maxed: +118% = 218 energy
- Beats per full bar: 10-11 beats

**Regeneration Time:**
- 100 energy: 100 minutes (1h 40m)
- 218 energy: 218 minutes (3h 38m)

---

### 3. Artist System

**Artist Profiles:**

**Street Poet** (Budget Option)
- Genre: Conscious Hip-Hop
- Skill: 58, Popularity: 52
- Base cost: $90
- Income: $3-8/min (Lvl 1-5)
- Energy bonus: +10-20%
- Best for: Early game passive income

**MC Flow** (Balanced)
- Genre: Hip-Hop
- Skill: 65, Popularity: 45
- Base cost: $100
- Income: $4-10/min (Lvl 1-5)
- Energy bonus: +15-30%
- Best for: Mid-game all-rounder

**Lil Dreamer** (Energy Focus)
- Genre: Trap
- Skill: 72, Popularity: 38
- Base cost: $120
- Income: $5-13/min (Lvl 1-5)
- Energy bonus: +8-18%
- Best for: Active players who need energy

**Young Legend** (Premium)
- Genre: Hip-Hop
- Skill: 85, Popularity: 70
- Base cost: $250
- Requires: 500 reputation
- Income: $8-20/min (Lvl 1-5)
- Energy bonus: +25-50%
- Best for: Late-game optimization

**Upgrade Strategy:**
1. Hire Street Poet first (cheapest passive income)
2. Upgrade to Level 2-3 for better returns
3. Add MC Flow for energy bonus
4. Save for Young Legend unlock
5. Focus on Young Legend upgrades (best ROI)

---

### 4. Equipment System

**Equipment Categories:**

**Phone (Recording Device)**
- Levels: 1-5
- Quality bonus: +5% per level (+25% max)
- Cost: $100 base, $1,319 total
- Tiers: Smartphone → Tablet → Laptop → Gaming Laptop → Workstation

**Headphones (Monitoring)**
- Levels: 0-5
- Quality bonus: +5% per level (+25% max)
- Cost: $150 base, $1,978 total
- Tiers: None → Wired → Bluetooth → Studio → Monitor → Hi-End

**Microphone (Recording)**
- Levels: 0-5
- Quality bonus: +10% per level (+50% max)
- Cost: $250 base, $3,298 total
- Tiers: None → USB → Condenser → Studio → Tube → Top Studio

**Studio (Production Environment)**
- Levels: 0-5
- Quality bonus: +15% per level (+75% max)
- Cost: $500 base, $6,594 total
- Tiers: None → Audio Interface → Home Studio → Pro Studio → Recording Studio → Top Studio

**Upgrade Priority:**
1. Phone to Level 2-3 (cheap quality boost)
2. Headphones to Level 2-3 (cheap quality boost)
3. Microphone to Level 3-4 (high quality bonus)
4. Studio to Level 3-4 (highest quality bonus)
5. Max out Studio first (best ROI)
6. Max out Microphone second
7. Finish Phone and Headphones

---

### 5. Daily Tasks System

**Task Structure:**
- 3 tasks per day
- Alternates between "Subscribe" and "Like" days
- Resets at midnight local time
- Streak increments when all tasks completed

**Subscribe Day (Odd Days):**
- Task 1: Subscribe to Telegram ($50 + 10 rep)
- Task 2: Subscribe to Twitter ($50 + 10 rep)
- Task 3: Subscribe to Instagram ($50 + 10 rep)
- Total: $150 + 30 reputation

**Like Day (Even Days):**
- Task 1: Like Telegram post ($75 + 15 rep + 10 energy)
- Task 2: Like Twitter post ($75 + 15 rep + 10 energy)
- Task 3: Like Instagram post ($75 + 15 rep + 10 energy)
- Total: $225 + 45 reputation + 30 energy

**Streak Mechanics:**
- Streak breaks if player misses a full day
- Completing all 3 tasks increments streak
- Partial completion doesn't count

**Planned Streak Rewards (Not Implemented):**
- 7 days: $500 + 100 reputation
- 14 days: $1,500 + 300 reputation
- 30 days: Exclusive artist + 5,000 reputation

---

### 6. Offline Earnings System

**Mechanics:**
- Calculates time away since last active
- Caps at 4 hours (240 minutes)
- Based on total passive income from artists
- Shows modal on return with earnings

**Calculation:**
\`\`\`javascript
minutesAway = min(actualMinutesAway, 240)
passiveIncome = sum of all artist income per minute
offlineEarnings = minutesAway * passiveIncome
\`\`\`

**Examples:**
- 1 artist at Level 3 ($5/min): 4 hours = $1,200
- 2 artists at Level 4 ($14/min): 4 hours = $3,360
- All artists maxed ($51/min): 4 hours = $12,240

**Modal Display:**
- Shows time away (formatted as hours/minutes)
- Shows total earnings
- Shows breakdown by artist
- Auto-adds to player money

---

### 7. Progression Stages

**Stage System:**
Currently has 5 stages defined but not fully implemented:

1. **Уличный битмейкер** (Street Beatmaker)
2. **Домашний продюсер** (Home Producer)
3. **Студийный мастер** (Studio Master)
4. **Известный продюсер** (Famous Producer)
5. **Звездный продюсер** (Star Producer)

**Stage Progression:**
- Based on `stageProgress` value (0-100)
- Currently no clear progression mechanics
- No rewards or unlocks tied to stages

**Recommendations:**
- Define clear stage requirements (money, reputation, beats created)
- Add stage-specific unlocks (artists, equipment, features)
- Create visual progression feedback
- Add stage completion rewards

---

## Monetization Opportunities (Future)

### Gems Economy
Currently gems exist but are unused. Potential uses:

**Energy Management:**
- 50 gems: Full energy refill
- 100 gems: 2x energy for 1 hour
- 200 gems: Unlimited energy for 24 hours

**Time Skips:**
- 30 gems: Skip 1 hour of offline time cap
- 100 gems: Skip 4 hours (full cap)

**Cosmetics:**
- 50-200 gems: Custom beat covers
- 100-500 gems: Studio themes/backgrounds
- 500+ gems: Exclusive artist skins

**Gameplay Boosts:**
- 100 gems: 2x money for 1 hour
- 150 gems: 2x reputation for 1 hour
- 200 gems: Perfect accuracy assist for 5 beats

**Premium Artists:**
- 500-1000 gems: Exclusive high-tier artists
- Special abilities or bonuses

### Gem Acquisition:
- Daily login rewards
- Streak milestones
- Achievement completions
- In-app purchases ($0.99-$99.99)
- Ad watching (optional)

---

## Recommendations Summary

### High Priority
1. **Implement streak rewards** - Already designed, needs implementation
2. **Balance energy system** - Reduce costs or increase regen rate
3. **Rebalance passive vs active income** - Make active play more rewarding
4. **Add reputation sinks** - Give long-term purpose to reputation

### Medium Priority
5. **Improve equipment ROI** - Better scaling or additional benefits
6. **Expand daily tasks** - More variety and gameplay-focused tasks
7. **Implement stage progression** - Clear goals and rewards
8. **Add gems economy** - Monetization and player convenience

### Low Priority
9. **Add difficulty selection** - Let players choose rhythm game difficulty
10. **Create achievement system** - Long-term goals and rewards
11. **Add social features** - Leaderboards, sharing, competitions
12. **Expand artist roster** - More artists with unique abilities

---

## Conclusion

Producer Tycoon has a solid foundation with engaging rhythm gameplay and multiple progression systems. The main balance issues revolve around energy constraints and passive income dominance. Addressing these issues while expanding the reputation and gems systems will create a more engaging long-term experience.

The game successfully combines active skill-based gameplay with idle progression mechanics, but needs tuning to ensure active play remains rewarding throughout the player's journey.
