# 🎮 Producer Tycoon - Game Systems Mindmap

## 📊 Overview: Все игровые сущности и их взаимосвязи

```
PLAYER
├── Resources (4)
│   ├── Money ($) ────────────────┐
│   ├── Reputation (rep) ─────────┤
│   ├── Energy (⚡) ──────────────┤
│   └── Gems (💎) ────────────────┤ [ПРОБЛЕМА: не используется!]
│
├── Core Mechanics (2)
│   ├── Beat Creation ────────────┐
│   │   ├── Input: Energy (15)   │
│   │   ├── Process: Rhythm Game  │
│   │   ├── Output: Beat          │
│   │   └── Rewards: $ + rep      │
│   │                              │
│   └── Progression ───────────────┤
│       ├── Stage (1-5) ───────────┤ [ПРОБЛЕМА: не влияет на геймплей!]
│       ├── Stage Progress (%) ────┤ [ПРОБЛЕМА: не используется!]
│       └── Total Stats ────────────┤
│           ├── totalBeatsCreated   │
│           ├── totalMoneyEarned    │
│           ├── totalBeatsEarnings  │
│           └── totalCollabs ───────┤ [ПРОБЛЕМА: не обновляется правильно!]
│
├── Upgrades (3 системы)
│   ├── Equipment (6 категорий) ───┐
│   │   ├── phone (10 lvl) ────────┤
│   │   ├── headphones (10 lvl) ───┤
│   │   ├── microphone (10 lvl) ───┤
│   │   ├── computer (10 lvl) ─────┤
│   │   ├── midi (10 lvl) ─────────┤ [ПРОБЛЕМА: не влияет на геймплей!]
│   │   └── audioInterface (10 lvl)┤ [ПРОБЛЕМА: не влияет на геймплей!]
│   │                               │
│   ├── Artists (8 персонажей) ────┤
│   │   ├── Tier 1 (0-500 rep) ────┤
│   │   │   ├── mc-flow ────────────┤
│   │   │   ├── lil-dreamer ────────┤
│   │   │   ├── street-poet ────────┤
│   │   │   └── young-legend (400)  │
│   │   ├── Tier 2 (500-2k rep) ───┤
│   │   │   ├── local-hero ─────────┤
│   │   │   └── scene-leader ───────┤
│   │   └── Tier 3 (2k-5k rep) ────┤
│   │       ├── city-star ──────────┤
│   │       └── state-champion ─────┤
│   │                               │
│   └── Skills (9 навыков) ────────┤
│       ├── Energy Branch ──────────┤
│       │   ├── caffeineRush (500) │
│       │   ├── stamina (2000) ────┤
│       │   └── flowState (5000) ──┤
│       ├── Quality Branch ─────────┤
│       │   ├── earTraining (500)  │
│       │   ├── musicTheory (2000) │
│       │   └── perfectionist (5k) │
│       └── Money Branch ───────────┤
│           ├── negotiator (500) ──┤
│           ├── businessman (2000) │
│           └── mogul (5000) ──────┤
│
├── Passive Systems (3)
│   ├── Daily Tasks ───────────────┐
│   │   ├── Day 1 tasks (3) ───────┤
│   │   ├── Day 2 tasks (3) ───────┤
│   │   └── Streak rewards (7) ────┤
│   │                               │
│   ├── Beat Contracts ─────────────┤ [ПРОБЛЕМА: не реализовано в UI!]
│   │   ├── Easy (2) Tier 2+ ──────┤
│   │   ├── Medium (2) Tier 3+ ────┤
│   │   └── Hard (2) Tier 4+ ──────┤
│   │                               │
│   └── Label Deals ────────────────┤ [ПРОБЛЕМА: не реализовано в UI!]
│       ├── Indie (2000 rep) ──────┤
│       ├── Small (5000 rep) ──────┤
│       └── Major (15000 rep) ─────┤
│
└── Meta Progression (2)
    ├── Training Progress ─────────┐ [ПРОБЛЕМА: одноразовые бонусы]
    │   ├── freeSeminar ────────────┤
    │   └── freeBookChapter ────────┤
    │                               │
    └── Character Creation ────────┤ [ПРОБЛЕМА: только при старте]
        ├── musicStyle (5 типов) ──┤
        └── startingBonus (4 типа) ┤
```

---

## 🔴 КРИТИЧЕСКИЕ ПРОБЛЕМЫ

### 1. **Gems (💎) - ПОЛНОСТЬЮ НЕ ИСПОЛЬЗУЕТСЯ**
```typescript
// GameState
gems: number  // ВСЕГДА 0, нигде не изменяется

// INITIAL_GAME_STATE
gems: 0  // Нет механик для заработка или траты
```

**Проблема**:
- ❌ Ресурс объявлен, но не используется
- ❌ Нет способа заработать gems
- ❌ Нет способа потратить gems

**Решение**:
- 🔧 Удалить из GameState (технический долг)
- 🔧 ИЛИ добавить механику (daily login rewards, achievements)

---

### 2. **Stage & Stage Progress - НЕ ВЛИЯЮТ НА ГЕЙМПЛЕЙ**
```typescript
// GameState
currentStage: number      // 1-5, отображается в UI
stageProgress: number     // 0-100, увеличивается при продаже битов

// Проблема: Stage не дает бонусов, не открывает контент
```

**Проблема**:
- ❌ `currentStage` отображается ("Этап 1: Уличный битмейкер"), но НЕ влияет на:
  - Доступность оборудования
  - Доступность артистов
  - Цены битов
  - Качество битов
- ❌ `stageProgress` растет, но никогда не переводит на следующий stage
- ❌ Stage titles есть (1-5), но смена stage не реализована

**Текущее использование**:
```typescript
// components/home-screen.tsx - только отображение
<p className="text-xs text-muted-foreground">
  {getStageTitle(gameState.currentStage)}
</p>

// components/stage-screen.tsx - stageProgress увеличивается
stageProgress: Math.min(100, prev.stageProgress + 5)
// НО никогда не проверяется и не переводит на следующий stage!
```

**Решение**:
```typescript
// Option 1: Сделать Stage функциональным
if (gameState.stageProgress >= 100) {
  gameState.currentStage += 1
  gameState.stageProgress = 0
  // Unlock new content, bonuses, etc.
}

// Option 2: Привязать к reputation tiers
currentStage = getReputationTier(gameState.reputation)
// Stage 1 = Tier 1-2 (0-2000 rep)
// Stage 2 = Tier 3 (2000-5000 rep)
// etc.

// Option 3: Удалить из GameState (заменить на reputation tiers)
```

---

### 3. **MIDI & Audio Interface - НЕ ВЛИЯЮТ НА КАЧЕСТВО БИТОВ**
```typescript
// lib/game-state.ts
equipment: {
  phone: number
  headphones: number
  microphone: number
  computer: number
  midi: number           // ❌ НЕ используется в calculateQuality
  audioInterface: number // ❌ НЕ используется в calculateQuality
}
```

**Проблема**:
```typescript
// components/stage-screen.tsx:71-82
const calculateQuality = (rhythmAccuracy: number, difficulty: number) => {
  const equipmentBonus = Math.floor(
    (gameState.equipment.phone * 2 +
     gameState.equipment.headphones * 2 +
     gameState.equipment.microphone * 3 +
     gameState.equipment.computer * 5) *  // ❌ MIDI и audioInterface НЕ учитываются!
    0.5,
  )
  return Math.min(100, baseQuality + rhythmBonus + difficultyBonus + equipmentBonus)
}
```

**Текущее состояние**:
- ✅ MIDI и audioInterface можно купить в Studio Screen
- ✅ Они стоят денег ($80-$300 база)
- ❌ НО они НЕ влияют на качество битов!
- ❌ Игрок тратит деньги впустую

**Решение**:
```typescript
// FIX: Добавить в calculateQuality
const equipmentBonus = Math.floor(
  (gameState.equipment.phone * 2 +
   gameState.equipment.headphones * 2 +
   gameState.equipment.microphone * 3 +
   gameState.equipment.computer * 5 +
   gameState.equipment.midi * 1 +           // ДОБАВИТЬ
   gameState.equipment.audioInterface * 2)  // ДОБАВИТЬ
  * 0.5,
)

// ИЛИ сделать их специальными бонусами:
// - MIDI: +5% к rhythm accuracy
// - Audio Interface: +10% к final quality
```

---

### 4. **Beat Contracts - НЕТ UI (данные есть, интерфейса нет)**
```typescript
// lib/game-state.ts - конфигурация есть ✅
export const BEAT_CONTRACTS_POOL: BeatContract[] = [
  { id: "easy_volume", name: "Набор битов", ... },
  // ... 6 контрактов
]

// GameState - данные есть ✅
beatContracts: {
  availableContracts: string[]
  activeContracts: string[]
  completedContracts: string[]
  lastRefreshDate: string
}

// UI - НЕТ ❌
// Нет экрана для просмотра/принятия контрактов
// Нет отображения прогресса
// Нет claim rewards
```

**Проблема**:
- ✅ Backend готов (contracts config, functions)
- ✅ Storage готов (save/load)
- ❌ UI НЕ РЕАЛИЗОВАН
- ❌ Игрок не может взаимодействовать с системой

**Решение**: Создать ContractsScreen component

---

### 5. **Label Deals - НЕТ UI (данные есть, интерфейса нет)**
```typescript
// lib/game-state.ts - конфигурация есть ✅
export const LABEL_DEALS_CONFIG = {
  indie: { cost: 5000, passiveIncomePerHour: 50, ... },
  small: { cost: 20000, passiveIncomePerHour: 200, ... },
  major: { cost: 100000, passiveIncomePerHour: 1000, ... },
}

// GameState - данные есть ✅
labelDeals: {
  indie: boolean
  small: boolean
  major: boolean
}

// UI - НЕТ ❌
```

**Проблема**:
- ✅ Backend готов
- ✅ Storage готов
- ❌ UI НЕ РЕАЛИЗОВАН
- ❌ Игрок не может покупать label deals

**Решение**: Добавить в UpgradesScreen или создать отдельный LabelsScreen

---

### 6. **Skills - НЕТ UI (данные есть, интерфейса нет)**
```typescript
// lib/game-state.ts - конфигурация есть ✅
export const SKILLS_CONFIG: Record<keyof GameState["skills"], SkillNode> = {
  caffeineRush: { cost: 2000, requiredReputation: 500, ... },
  // ... 9 навыков
}

// GameState - данные есть ✅
skills: {
  caffeineRush: boolean
  stamina: boolean
  // ... 9 навыков
}

// UI - НЕТ ❌
```

**Проблема**: То же самое - backend готов, UI нет

**Решение**: Создать SkillsScreen component

---

### 7. **totalCollabs - НЕПРАВИЛЬНО ОБНОВЛЯЕТСЯ**
```typescript
// components/artists-screen.tsx:62
totalCollabs: currentLevel === 0 ? prev.totalCollabs + 1 : prev.totalCollabs

// Проблема: Увеличивается только при НАЙМЕ (0 → 1)
// НО не увеличивается при апгрейде артиста (1 → 2, 2 → 3, etc.)
```

**Проблема**:
- ❌ `totalCollabs` показывает количество НАНЯТЫХ артистов
- ❌ НО название предполагает "total collaborations" (общее кол-во работ с артистами)
- ❌ После найма 8 артистов, `totalCollabs = 8` и больше не растет

**Решение**:
```typescript
// Option 1: Переименовать
totalArtistsHired: number  // Более точное название

// Option 2: Считать по-другому
totalCollabs += 1  // При каждом создании бита с артистом
// НО тогда нужна механика "создать бит С артистом"
```

---

### 8. **Training Progress - ОДНОРАЗОВЫЕ БОНУСЫ**
```typescript
trainingProgress: {
  freeSeminar: boolean       // Одноразовый бонус (+300$, +100 rep, +5% energy)
  freeBookChapter: boolean   // Одноразовый бонус (+400$, +150 rep, +5% quality)
}
```

**Проблема**:
- ❌ После использования один раз - бесполезно
- ❌ Нет recurring benefit
- ❌ Занимает место в GameState навсегда

**Решение**:
```typescript
// Option 1: Удалить после получения бонуса
// Option 2: Сделать permanent bonuses (как skills)
// Option 3: Переместить в achievements/milestones
```

---

## ✅ ЧТО РАБОТАЕТ ПРАВИЛЬНО

### 1. **Equipment (phone, headphones, microphone, computer)**
```
✅ 4 категории полностью функциональны
✅ Влияют на quality битов (calculateQuality)
✅ 10 уровней прогрессии
✅ Tier names и descriptions
✅ UI в StudioScreen
✅ Storage (save/load)
```

### 2. **Artists (8 персонажей)**
```
✅ Passive income работает (getTotalPassiveIncome)
✅ Energy bonus работает (getTotalEnergyBonus)
✅ Tier gates по reputation
✅ 10 уровней прогрессии
✅ UI в ArtistsScreen
✅ Storage (save/load)
✅ Offline earnings (4 hours cap)
```

### 3. **Energy System**
```
✅ BASE_MAX_ENERGY: 150
✅ REGEN: 2/min
✅ COST: 15/beat
✅ Бонусы от артистов
✅ Бонусы от musicStyle/startingBonus
✅ UI отображение
✅ Auto-regen каждые 10 секунд
```

### 4. **Reputation Tiers**
```
✅ 6 тиров (0→500→2k→5k→15k→50k)
✅ Price multipliers (1.0x → 2.5x)
✅ Unlock gates для артистов
✅ Unlock gates для contracts/skills/labels
```

### 5. **Daily Tasks & Streaks**
```
✅ Day 1 tasks (subscribe × 3)
✅ Day 2 tasks (like × 3)
✅ Streak tracking
✅ Streak rewards (7, 14, 21, 30, 40, 50, 60 days)
✅ UI в HomeScreen
✅ Storage (save/load)
```

---

## 🔗 ЗАВИСИМОСТИ И ВЛИЯНИЕ

### Money ($) влияет на:
```
→ Equipment upgrades (покупка)
→ Artist hiring/upgrades (покупка)
→ Skills unlock (покупка) [НЕТ UI]
→ Label Deals (покупка) [НЕТ UI]
```

### Money ($) зарабатывается через:
```
← Beat sales (основной источник)
← Artists passive income (hourly)
← Label Deals passive income [НЕТ UI]
← Daily tasks rewards
← Streak rewards
← Beat Contracts rewards [НЕТ UI]
```

### Reputation влияет на:
```
→ Tier (1-6)
→ Price multiplier (1.0x - 2.5x)
→ Artist unlocks (Tier 2-3)
→ Skills unlocks (500, 2000, 5000 rep) [НЕТ UI]
→ Contracts availability [НЕТ UI]
→ Label Deals unlocks [НЕТ UI]
```

### Reputation зарабатывается через:
```
← Beat sales (quality / 5)
← Daily tasks rewards
← Streak rewards
← Beat Contracts rewards [НЕТ UI]
```

### Energy влияет на:
```
→ Beats creation frequency (15 energy/beat)
```

### Energy восстанавливается через:
```
← Auto-regen (2/min base)
← Artist bonuses (+8% to +284% total possible)
← Skills bonuses (Flow State: +1/min) [НЕТ UI]
← Daily tasks rewards (30 energy)
```

### Beat Quality влияет на:
```
→ Beat price (higher quality = higher price)
→ Reputation gain (quality / 5)
```

### Beat Quality зависит от:
```
← Rhythm accuracy (0-100%)
← Difficulty (1-5)
← Equipment (phone, headphones, mic, computer) ✅
← Equipment (midi, audioInterface) ❌ НЕ РАБОТАЕТ
← Skills (earTraining, musicTheory, perfectionist) [НЕТ UI]
```

### Beat Price зависит от:
```
← Quality
← Difficulty (multiplier 1.0x - 2.2x)
← Reputation tier (multiplier 1.0x - 2.5x)
← Skills (negotiator, businessman, mogul) [НЕТ UI]
```

---

## 🎯 ПРИОРИТЕТЫ ИСПРАВЛЕНИЙ

### 🔴 КРИТИЧНО (ломает баланс):
1. **MIDI & Audio Interface не влияют на качество** - игрок тратит деньги впустую
2. **Skills НЕТ UI** - 9 навыков не доступны игроку (огромная часть Phase 3!)
3. **Beat Contracts НЕТ UI** - 6 контрактов не доступны (нет weekly content)
4. **Label Deals НЕТ UI** - 3 лейбла не доступны (нет endgame passive income)

### 🟡 ВАЖНО (недоделанные фичи):
5. **Stage & Stage Progress** - решить что делать (использовать или удалить)
6. **Gems** - решить что делать (использовать или удалить)
7. **totalCollabs** - исправить логику или переименовать

### 🟢 НИЗКИЙ ПРИОРИТЕТ (полировка):
8. **Training Progress** - решить судьбу (permanent bonuses или удалить)

---

## 📋 РЕКОМЕНДАЦИИ

### Вариант 1: БЫСТРОЕ ИСПРАВЛЕНИЕ (1-2 часа)
```typescript
// 1. FIX: MIDI & Audio Interface влияние на качество
const equipmentBonus = Math.floor(
  (phone * 2 + headphones * 2 + microphone * 3 +
   computer * 5 + midi * 1 + audioInterface * 2) * 0.5
)

// 2. REMOVE: Gems из GameState (технический долг)
// Удалить поле, чтобы не вводить в заблуждение

// 3. FIX: Stage = Reputation Tier
currentStage = Math.min(5, getReputationTier(reputation))
// Удалить stageProgress (не используется)

// 4. FIX: totalCollabs → totalArtistsHired (rename)
```

### Вариант 2: ПОЛНАЯ РЕАЛИЗАЦИЯ PHASE 3 (4-6 часов)
```typescript
// 1. Создать SkillsScreen component
// 2. Создать ContractsScreen component
// 3. Добавить Label Deals в UpgradesScreen
// 4. Подключить skill bonuses к calculateQuality/calculatePrice
// 5. Реализовать contract progress tracking
// 6. Реализовать contract completion & rewards
```

### Вариант 3: ГИБРИДНЫЙ (2-3 часа)
```typescript
// FAST FIXES (30 мин):
// - MIDI/Audio Interface в calculateQuality
// - Удалить gems
// - Stage = reputation tier
// - totalCollabs rename

// PRIORITY UI (2 часа):
// - SkillsScreen (самое важное - 9 навыков!)
// - Label Deals в UpgradesScreen (простое добавление)
//
// ОТЛОЖИТЬ:
// - Beat Contracts (более сложный UI с progress tracking)
```

---

## 🎮 ИТОГОВАЯ СХЕМА (как должно быть)

```
ИГРОК ПРОГРЕССИРУЕТ ЧЕРЕЗ:
├── Beat Creation (основной геймплей)
│   └── Требует: Energy
│   └── Дает: Money + Reputation
│
├── Money тратится на:
│   ├── Equipment (quality boost) ✅
│   ├── Artists (passive income + energy bonus) ✅
│   ├── Skills (permanent bonuses) ❌ НЕТ UI
│   └── Label Deals (passive income) ❌ НЕТ UI
│
├── Reputation открывает:
│   ├── Tier (price multiplier) ✅
│   ├── Artists (Tier 2-3) ✅
│   ├── Skills (gated by rep) ❌ НЕТ UI
│   ├── Contracts (gated by tier) ❌ НЕТ UI
│   └── Label Deals (gated by rep) ❌ НЕТ UI
│
└── Daily Engagement через:
    ├── Daily Tasks (subscribe, like) ✅
    ├── Streak Rewards (7-60 days) ✅
    └── Beat Contracts (weekly missions) ❌ НЕТ UI
```

**Проблема**: 50% систем Phase 3 не доступны игроку (Skills, Contracts, Labels)!
