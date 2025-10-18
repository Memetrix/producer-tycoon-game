# 📚 ENCYCLOPEDIA AUDIT GUIDE
## Справочник для проверки narrative-encyclopedia.html

**Создано:** 2025-10-18
**Цель:** Позволить Claude восстановить контекст игры и систематически проверить энциклопедию на соответствие с game design.

---

# 🎮 ЧТО ЗА ИГРА: PRODUCER TYCOON

## Общее описание

**Producer Tycoon** — это **rhythm game + idle tycoon + narrative RPG** для Telegram Mini App.

### Жанр-гибрид:
1. **Rhythm Game** — создание битов через OSU! beatmap игру (4 барабанные дорожки)
2. **Idle Tycoon** — апгрейд оборудования, найм артистов, пассивный доход
3. **Narrative RPG** — глубокая история с 7 персонажами, выборами, multiple endings

### Ключевые особенности:
- **Платформа:** Telegram Mini App (Next.js + React + Supabase)
- **Визуальный стиль:** **CEL SHADING** (Jet Set Radio, НЕ реализм!)
- **Ритм-игра:** OSU! beatmaps (.osz файлы), 29+ треков
- **Длительность:** 3-часовой нарративный journey (180 минут)
- **Монетизация:** Telegram Stars, NFTs, Battle Pass, $BEAT token

---

# ⚙️ КАК РАБОТАЕТ ГЕЙМПЛЕЙ

## Core Loop

```
1. Create Beats (rhythm game)
   → Earn money + reputation

2. Upgrade Equipment (6 категорий, 10 уровней)
   → Increase beat quality

3. Hire Artists (8 артистов, 10 уровней)
   → Passive income + energy bonus

4. Unlock Skills (9 навыков, 3 ветки)
   → Permanent bonuses

5. Sign Label Deals (3 лейбла)
   → Passive investment income

6. Complete Daily Tasks
   → Streak rewards

7. Accept Beat Contracts
   → Challenge-based rewards
```

---

## Ресурсы

### 1. Money ($)
- **Назначение:** Основная валюта для всех покупок
- **Источники:** Beat creation, passive income (artists + labels), daily tasks, contracts

### 2. Reputation
- **Назначение:** Прогрессия, гейтит контент
- **Источники:** Beat creation (~5-10 per beat), daily tasks, streak rewards, contracts
- **Важно:** Репутация определяет Tier (не отдельная прогрессия!)

### 3. Energy
- **Назначение:** Лимитирует активное создание битов
- **База:** 150 max, 15 cost per beat, 2/min regen
- **Полная перезарядка:** 75 минут
- **Битов за полную энергию:** 10 beats

---

## 6-Tier Reputation System

**КРИТИЧЕСКИ ВАЖНО:** Reputation определяет Tier, Tier определяет Stage.

| Tier | Reputation | Stage Name (RU) | Price Multiplier | Unlocks |
|------|------------|-----------------|------------------|---------|
| **Tier 1** | 0 - 500 | Уличный битмейкер | 1.0x | All Tier 1 artists, Tier 1 skills |
| **Tier 2** | 500 - 2,000 | Местный продюсер | 1.25x | Tier 2 artists, Tier 2 skills, Easy contracts |
| **Tier 3** | 2,000 - 5,000 | Региональный мастер | 1.5x | Tier 3 artists, Tier 3 skills, Medium contracts, Indie Label |
| **Tier 4** | 5,000 - 15,000 | Национальная звезда | 1.75x | All contracts, Small Label |
| **Tier 5** | 15,000 - 50,000 | Международный уровень | 2.0x | Major Label |
| **Tier 6** | 50,000+ | Легендарный продюсер | 2.5x | - |

**Ключевые пороги для энциклопедии:**
- 500 rep → Tier 2
- 2,000 rep → Tier 3
- 5,000 rep → Tier 4
- 15,000 rep → Tier 5
- 50,000+ rep → Tier 6

---

## Оборудование (Equipment)

**6 категорий, 10 уровней каждая:**

| Equipment | Base Price | Bonus/Level | Total Cost (0→10) |
|-----------|------------|-------------|-------------------|
| Phone | $80 | +2 quality | $3,285 |
| Headphones | $120 | +2 quality | $4,928 |
| Microphone | $200 | +3 quality | $8,213 |
| Computer | $400 | +5 quality | $16,426 |
| MIDI Controller | $150 | +2 quality | $6,160 |
| Audio Interface | $250 | +4 quality | $10,267 |

**Total Equipment Cost (All Max):** $49,279

---

## Артисты (Artists)

**8 артистов, 3 тира:**

| Tier | Artist | Base Cost | Genre | Requires Rep |
|------|--------|-----------|-------|--------------|
| **Tier 1** | Street Poet | $70 | Conscious | 0 |
| | MC Flow | $80 | Hip-Hop | 0 |
| | Lil Dreamer | $100 | Trap | 0 |
| | Young Legend | $200 | Hip-Hop | 400 |
| **Tier 2** | Local Hero | $300 | R&B | 500 |
| | Scene Leader | $400 | Trap | 500 |
| **Tier 3** | City Star | $800 | Pop | 2,000 |
| | State Champion | $1,000 | Hip-Hop | 2,000 |

---

## Навыки (Skills)

**9 навыков, 3 ветки, 3 тира:**

| Branch | Skill | Cost | Rep Req | Effect | Tier |
|--------|-------|------|---------|--------|------|
| **Energy** | Caffeine Rush ☕ | $2,000 | 500 | -10% energy cost | 1 |
| | Stamina 💪 | $8,000 | 2,000 | +20% max energy | 2 |
| | Flow State 🌊 | $20,000 | 5,000 | +1 energy regen/min | 3 |
| **Quality** | Ear Training 👂 | $2,000 | 500 | +5% beat quality | 1 |
| | Music Theory 📚 | $8,000 | 2,000 | +10% beat quality | 2 |
| | Perfectionist ✨ | $20,000 | 5,000 | +20% beat quality | 3 |
| **Money** | Negotiator 🤝 | $2,000 | 500 | +10% beat price | 1 |
| | Businessman 💼 | $8,000 | 2,000 | +25% beat price | 2 |
| | Mogul 👑 | $20,000 | 5,000 | +50% beat price | 3 |

**Total Cost (All Skills):** $90,000

---

## Лейблы (Label Deals)

| Label | Cost | Passive Income | Requires Rep | Tier |
|-------|------|----------------|--------------|------|
| Indie Label 🎸 | $5,000 | $50/hour | 2,000 | Tier 3 |
| Small Label 🎤 | $20,000 | $200/hour | 5,000 | Tier 4 |
| Major Label 🏢 | $100,000 | $1,000/hour | 15,000 | Tier 5 |

---

# 🕐 ДЛИТЕЛЬНОСТЬ ГЕЙМПЛЕЯ

## Session Lengths

### Short Session (5-10 минут)
- Create beats (10 beats per full energy bar)
- Collect offline earnings
- Quick upgrades

### Medium Session (20-30 минут)
- Upgrade equipment chain
- Unlock skills
- Complete daily tasks

### Long Session (1-2 часа)
- Grind for next tier
- Complete beat contracts
- Multiple upgrade cycles

---

## Narrative Journey: 60 ДНЕЙ (эпизодический геймплей)

**КРИТИЧЕСКИ ВАЖНО:** Игра это НЕ 3-часовая сессия!

Это **60-дневный эпизодический journey** с daily check-ins:
- Casual: 2 логина/день × 10-20 мин = ~15 часов total
- Active: 6 логинов/день × 30-60 мин = ~30-40 часов total
- Whale: 12+ логинов/день × 2-4 часа = ~80-120 часов total

### Нарративная структура по неделям:

| Week | Days | Tier | Focus | Key Events |
|------|------|------|-------|------------|
| **1** | 1-7 | 1→2 | Tutorial, встреча с MC Flow & Young Legend | First beats, rivalry |
| **2** | 8-14 | 2 | Expanding (Street Poet, Lil Dreamer) | Mentor & protégé |
| **3** | 15-21 | 2→3 | Viral moment, Sofia offer | MAJOR choice |
| **4** | 22-28 | 3 | Consequences (betrayal OR loyalty) | DJ Nova |
| **5-6** | 29-42 | 3→4 | Character arc climaxes | Redemption |
| **7-8** | 43-56 | 4 | Main story completion | Awards |
| **9+** | 57-60 | 4-5 | TGE finale, post-game | $BEAT launch |

### Emotional Intensity (60-дневная):

| Day | Intensity | Moment |
|-----|-----------|---------|
| 1 | 2/10 | Tutorial anxiety |
| 7 | 4/10 | First streak |
| 14 | 4/10 | Tier 2 unlock |
| 21 | 9/10 | Sofia offer (PEAK DRAMA) |
| 28 | 5/10 | Consequences vary |
| 40 | 9/10 | Awards night CLIMAX |
| 60 | 10/10 | TGE MASSIVE EVENT |

**ВАЖНО для Tab 4:** Эмоциональная карта должна отражать 60-дневную структуру, НЕ 180 минут!

---

# 👥 СТРУКТУРА НАРРАТИВА

## 7 Персонажей

### 6 NPC + 1 Player Character

1. **MC Flow** (Hip-Hop) - Tier 1, 0 rep required
2. **Street Poet** (Conscious) - Tier 1, 0 rep required
3. **Lil Dreamer** (Trap) - Tier 1, 0 rep required
4. **Young Legend** (Hip-Hop) - Tier 1, 400 rep required
5. **Sofia** (Pop) - Tier 2+, 500 rep required
6. **DJ Nova** (Electronic) - Tier 2+, 500 rep required
7. **ГЛАВНЫЙ ГЕРОЙ (Ты)** - Player Character Arc

**ВАЖНО:** Энциклопедия должна показывать **7 персонажей**, не 6!

---

## 17 Jesse Schell Lenses

**Кто такой Jesse Schell:**
- Game designer, работал в Disney Imagineering и Pixar
- Автор книги "The Art of Game Design: A Book of Lenses"
- Профессор Carnegie Mellon University

**Что такое "линза":**
- Аналитический инструмент для анализа game design
- Каждая линза — это набор вопросов, которые помогают увидеть проблемы
- 17 линз применены к Producer Tycoon для глубокого анализа

**Список линз в энциклопедии:**
1. Эмоций 🎭
2. Челленджа ⚔️
3. Выбора 🎯
4. Фана 🎉
5. Любопытства 🔍
6. Истории 📖
7. Проблемы 💡
8. Удивления ✨
9. Игрока 👤
10. Удовольствия 😊
11. Флоу 🌊
12. Нужды 🎯
13. Внутренней мотивации 💪
14. Суждения 🎓
15. Воображения 💭
16. Экономики 💰
17. Навыка 🎮

---

## 48+ Detailed Scenes

Каждая сцена включает:
- Dialogue (на русском!)
- Choices (обычно 3 варианта)
- Consequences (relationship changes, unlocks)
- Setup → Payoff структуру

---

# 🎨 ВИЗУАЛЬНЫЙ СТИЛЬ

## CEL SHADING (КРИТИЧЕСКИ ВАЖНО!)

**НИКОГДА не реализм!** Всегда cel shading:

### Характеристики:
- **Thick black outlines** (comic book style)
- **Flat colors** (2-3 тона max per object)
- **Halftone patterns** for shading
- **Bold color blocking**

### Референсы:
- Jet Set Radio (PRIMARY!)
- Hi-Fi Rush
- Persona 5
- Spider-Man: Into the Spider-Verse
- Gorillaz art (Jamie Hewlett)

### Color Schemes по тирам:
- **Tier 1:** Orange, Yellow, Black (street hustle)
- **Tier 2:** Blue, Cyan, Purple (neon night city)
- **Tier 3:** Green, Magenta, Gold (success energy)
- **Tier 4-6:** Purple, Gold, White, Black (luxury prestige)

---

# ✅ STEP-BY-STEP AUDIT CHECKLIST

## Tab 0: Overview (Обзор)

**Проверить:**
- [ ] Объяснение Jesse Schell (Disney, Pixar, CMU)
- [ ] Что такое "линза" (analytical tool, не physical lens)
- [ ] Описание всех 7 табов
- [ ] Указание на 7 персонажей (не 6!)
- [ ] Инструкция как пользоваться энциклопедией
- [ ] Всё на русском языке

**Ключевые факты:**
- 17 линз (не больше, не меньше)
- 7 персонажей (6 NPC + 1 player)
- 48+ сцен
- 180-минутный journey

---

## Tab 1: 17 Лінз Шелла

**Проверить каждую линзу:**
- [ ] Название на русском
- [ ] "Сейчас" (current state) соответствует текущему design
- [ ] "Цель" (target state) реалистична
- [ ] "Как улучшить" содержит конкретные механики
- [ ] Примеры сцен согласуются с game mechanics

**Специфические проверки:**

### Линза #13: Внутренней мотивации
- [ ] Упоминает tier system (6 tiers)
- [ ] Репутация: 500/2k/5k/15k/50k
- [ ] Не упоминает "gems" (removed resource!)

### Линза #16: Экономики
- [ ] Energy: 150 base, 15 cost, 2/min regen
- [ ] Equipment: 6 categories (включая MIDI & Audio Interface)
- [ ] Artists: 8 total (3 tiers)
- [ ] Skills: 9 total, 3 branches
- [ ] Labels: 3 total

### Линза #17: Навыка
- [ ] Упоминает difficulty levels (1-5)
- [ ] Hit window: 100px (не 50px!)
- [ ] OSU! beatmaps
- [ ] Touch controls для мобильной версии

---

## Tab 2: Персонажи (ОБЯЗАТЕЛЬНО 7!)

**Проверить структуру:**
- [ ] Заголовок: "7 Персонажей" (не 6!)
- [ ] Все 6 NPC cards присутствуют
- [ ] Player Character card ("ГЛАВНЫЙ ГЕРОЙ (Ты)") присутствует
- [ ] Порядок логичный (обычно Player последний)

**Проверить каждую карточку персонажа:**

### MC Flow
- [ ] Genre: Hip-Hop
- [ ] Tier: 1
- [ ] Requires: 0 reputation
- [ ] Архетип: The Loyal Brother
- [ ] Ключевая сцена: "Первый хит" (viral hit)

### Street Poet
- [ ] Genre: Conscious
- [ ] Tier: 1
- [ ] Requires: 0 reputation
- [ ] Архетип: The Fallen Mentor
- [ ] Ключевая тема: Addiction/Redemption

### Lil Dreamer
- [ ] Genre: Trap
- [ ] Tier: 1
- [ ] Requires: 0 reputation
- [ ] Архетип: The Vulnerable Artist
- [ ] Ключевая тема: Losing hearing, passion vs reality

### Young Legend
- [ ] Genre: Hip-Hop
- [ ] Tier: 1
- [ ] Requires: 400 reputation (НЕ 500!)
- [ ] Архетип: The Rival
- [ ] Ключевая тема: Competition, jealousy, respect

### Sofia
- [ ] Genre: Pop
- [ ] Tier: 2
- [ ] Requires: 500 reputation
- [ ] Архетип: The Industry Insider
- [ ] Ключевая тема: Art vs Commerce

### DJ Nova
- [ ] Genre: Electronic
- [ ] Tier: 2
- [ ] Requires: 500 reputation
- [ ] Архетип: The Visionary
- [ ] Ключевая тема: Creative freedom, experimentation

### ГЛАВНЫЙ ГЕРОЙ (Ты)
- [ ] Присутствует карточка
- [ ] Архетип: The Transforming Hero
- [ ] 5 актов: Nobody → Beginner → Rising Star → Crossroads → Redemption/Triumph
- [ ] Центральный вопрос: "Что такое success?"
- [ ] Ключевые сцены: First meeting with MC Flow, First hit, Major label offer, Final choice

**Проверка rep requirements:**
- [ ] Tier 1: 0 rep (MC Flow, Street Poet, Lil Dreamer)
- [ ] Tier 1: 400 rep (Young Legend) — ВАЖНО: не 500!
- [ ] Tier 2: 500 rep (Sofia, DJ Nova)

---

## Tab 3: Сцены

**Проверить:**
- [ ] Все диалоги на русском (NO ENGLISH!)
- [ ] Choices обычно 3 варианта (не 2, не 4+)
- [ ] Consequences логичны (relationship changes, unlocks)
- [ ] Примеры соответствуют actual game mechanics

**Специфические проверки:**

### Energy/Money numbers
Если сцена упоминает:
- [ ] Energy cost: должно быть 15 (не 20!)
- [ ] Max energy: должно быть 150 (не 100!)
- [ ] Regen: должно быть 2/min (не 1/min!)

### Reputation gates
Если сцена упоминает unlock requirements:
- [ ] Tier 2: 500 rep
- [ ] Tier 3: 2,000 rep
- [ ] Tier 4: 5,000 rep
- [ ] Tier 5: 15,000 rep
- [ ] Tier 6: 50,000+ rep

### Equipment mentions
- [ ] Если упоминаются категории, должно быть 6 (Phone, Headphones, Mic, Computer, MIDI, Audio Interface)
- [ ] Не упоминать "useless" оборудование (все 6 functional!)

---

## Tab 4: Эмоциональная карта

**Проверить:**
- [ ] Объяснение что такое emotional map
- [ ] Принцип "roller coaster" (peaks & valleys)
- [ ] 6 stages соответствуют 180-минутной структуре
- [ ] Тайминг: 0-30, 30-60, 60-90, 90-120, 120-150, 150-180
- [ ] Chart.js график присутствует
- [ ] Данные графика: [3, 5, 9, 4, 8, 10, 6]
- [ ] Timeline визуализация
- [ ] Всё на русском языке

**Эмоциональные intensity values:**
- [ ] 0-30 min: 3/10 (введение)
- [ ] 30-60 min: 5/10 (восхождение)
- [ ] 60-90 min: 9/10 (кризис PEAK)
- [ ] 90-120 min: 4/10 (падение)
- [ ] 120-150 min: 8/10 (искупление)
- [ ] 150-180 min: 10/10 (триумф CLIMAX)

**5 ключевых принципов pacing:**
1. Roller Coaster (не flat line)
2. Setup → Payoff
3. Breathing Room (после peaks)
4. Escalation (каждый peak выше предыдущего)
5. Satisfying Resolution

---

## Tab 5: Гайд писателя

**Проверить:**
- [ ] 5 правил написания диалогов (с примерами good/bad)
- [ ] 3-choice философия объяснена (почему не 2, почему не 4+)
- [ ] Setup → Payoff принцип с примерами
- [ ] 6-point checklist для каждой сцены
- [ ] Всё на русском языке

**5 правил диалогов:**
1. Каждая реплика раскрывает персонажа
2. Конфликт в каждом диалоге
3. Subtekt (говорят одно, думают другое)
4. Речь уникальна для каждого персонажа
5. Избегай exposition dumps

**3-Choice Structure:**
- [ ] Безопасный вариант (safe)
- [ ] Рискованный вариант (risky)
- [ ] Креативный вариант (creative)
- [ ] Нет "правильного" ответа
- [ ] Trade-offs, не obvious wins

**6-Point Scene Checklist:**
1. Emotion goal
2. Character reveal
3. Story progression
4. Player agency (choice)
5. Consequences
6. Setup for future payoff

---

## Global Checks (Все табы)

### Reputation Numbers
Везде где упоминается:
- [ ] Tier 1: 0 rep
- [ ] Tier 2: 500 rep (НЕ 400!)
- [ ] Tier 3: 2,000 rep (НЕ 2k/2500!)
- [ ] Tier 4: 5,000 rep (НЕ 5k/4000!)
- [ ] Tier 5: 15,000 rep (НЕ 10k!)
- [ ] Tier 6: 50,000+ rep (НЕ 30k!)

### Tier Names (Russian)
- [ ] Tier 1: "Уличный битмейкер"
- [ ] Tier 2: "Местный продюсер"
- [ ] Tier 3: "Региональный мастер"
- [ ] Tier 4: "Национальная звезда"
- [ ] Tier 5: "Международный уровень"
- [ ] Tier 6: "Легендарный продюсер"

### Energy Numbers
- [ ] Base max: 150 (НЕ 100!)
- [ ] Cost per beat: 15 (НЕ 20!)
- [ ] Regen rate: 2/min (НЕ 1/min!)
- [ ] Full recharge: 75 minutes (НЕ 100!)
- [ ] Beats per full bar: 10 (НЕ 5!)

### Artists
- [ ] Total: 8 artists (НЕ 6!)
- [ ] Tier 1: Street Poet, MC Flow, Lil Dreamer, Young Legend (4 artists)
- [ ] Tier 2: Local Hero, Scene Leader (2 artists)
- [ ] Tier 3: City Star, State Champion (2 artists)

### Equipment
- [ ] Total: 6 categories (НЕ 4!)
- [ ] Phone, Headphones, Mic, Computer, MIDI Controller, Audio Interface
- [ ] Все 6 functional (affect quality!)

### Skills
- [ ] Total: 9 skills (НЕ 6!)
- [ ] 3 branches: Energy, Quality, Money
- [ ] 3 tiers: Tier 1 (500 rep), Tier 2 (2k rep), Tier 3 (5k rep)

### Labels
- [ ] Total: 3 labels
- [ ] Indie (2k rep), Small (5k rep), Major (15k rep)

### Language
- [ ] 100% Russian (NO ENGLISH phrases!)
- [ ] Dialogue в code blocks на русском
- [ ] UI text на русском
- [ ] Technical terms могут быть на английском если это genre terms (Hip-Hop, Trap, etc.)

---

# 🔧 COMMON ISSUES TO FIX

## Issue 1: English Text
**Problem:** Диалоги, explanations, или UI text на английском
**Fix:** Перевести на русский, сохраняя tone и emotion

## Issue 2: Wrong Reputation Numbers
**Problem:** Упоминаются старые numbers (400 для Tier 2, 10k для Tier 5)
**Fix:** Использовать правильные: 500, 2k, 5k, 15k, 50k

## Issue 3: Old Energy Values
**Problem:** 100 max, 20 cost, 1/min regen (Phase 2 values)
**Fix:** Использовать Phase 3 values: 150 max, 15 cost, 2/min regen

## Issue 4: Missing Player Character
**Problem:** Только 6 персонажей (забыли главного героя)
**Fix:** Добавить "ГЛАВНЫЙ ГЕРОЙ (Ты)" card

## Issue 5: Wrong Equipment Count
**Problem:** Упоминается 4 equipment categories (old design)
**Fix:** 6 categories (включая MIDI & Audio Interface)

## Issue 6: "Gems" Resource
**Problem:** Упоминаются Gems как валюта
**Fix:** Gems removed! Только Money, Reputation, Energy

## Issue 7: Wrong Artist Count
**Problem:** "6 артистов" вместо 8
**Fix:** 8 total artists (4 Tier 1, 2 Tier 2, 2 Tier 3)

## Issue 8: Visual Style Confusion
**Problem:** Упоминается реализм или photorealistic style
**Fix:** ТОЛЬКО cel shading (Jet Set Radio style)

## Issue 9: Wrong Journey Duration
**Problem:** Упоминается 120 минут или другие числа
**Fix:** 180 минут (3 часа) emotional journey

## Issue 10: Chart Data Mismatch
**Problem:** Emotional intensity graph имеет неправильные данные
**Fix:** Должно быть [3, 5, 9, 4, 8, 10, 6] (7 точек для 6 stages)

---

# 📊 QUICK REFERENCE TABLE

## Resources Summary
| Resource | Max | Cost | Regen | Notes |
|----------|-----|------|-------|-------|
| Energy | 150 | 15/beat | 2/min | 10 beats per full bar |
| Money | ∞ | - | Passive income | Equipment, Artists, Skills, Labels |
| Reputation | ∞ | - | ~5-10/beat | Gates tiers: 500/2k/5k/15k/50k |

## Progression Tiers
| Tier | Rep | Name (RU) | Price Mult | Key Unlocks |
|------|-----|-----------|------------|-------------|
| 1 | 0 | Уличный битмейкер | 1.0x | Tier 1 artists/skills |
| 2 | 500 | Местный продюсер | 1.25x | Tier 2 artists/skills |
| 3 | 2,000 | Региональный мастер | 1.5x | Tier 3 artists/skills, Indie Label |
| 4 | 5,000 | Национальная звезда | 1.75x | Small Label |
| 5 | 15,000 | Международный уровень | 2.0x | Major Label |
| 6 | 50,000+ | Легендарный продюсер | 2.5x | Endgame |

## Characters Summary
| # | Name | Genre | Tier | Rep Req | Archetype |
|---|------|-------|------|---------|-----------|
| 1 | MC Flow | Hip-Hop | 1 | 0 | Loyal Brother |
| 2 | Street Poet | Conscious | 1 | 0 | Fallen Mentor |
| 3 | Lil Dreamer | Trap | 1 | 0 | Vulnerable Artist |
| 4 | Young Legend | Hip-Hop | 1 | 400 | Rival |
| 5 | Sofia | Pop | 2 | 500 | Industry Insider |
| 6 | DJ Nova | Electronic | 2 | 500 | Visionary |
| 7 | ГЛАВНЫЙ ГЕРОЙ | - | - | - | Transforming Hero |

## Emotional Journey (180 min)
| Time | Intensity | Theme |
|------|-----------|-------|
| 0-30 | 3/10 | Начало |
| 30-60 | 5/10 | Восхождение |
| 60-90 | 9/10 | Кризис |
| 90-120 | 4/10 | Падение |
| 120-150 | 8/10 | Искупление |
| 150-180 | 10/10 | Триумф |

---

# 💡 HOW TO USE THIS GUIDE

## Step 1: Restore Context
Когда теряешь контекст, читай этот файл полностью:
- Секцию "ЧТО ЗА ИГРА"
- Секцию "КАК РАБОТАЕТ ГЕЙМПЛЕЙ"
- Quick Reference Tables

## Step 2: Systematic Audit
Иди по чеклисту step-by-step:
1. Tab 0 (Overview)
2. Tab 1 (17 Lenses)
3. Tab 2 (Characters) — ОБЯЗАТЕЛЬНО проверь 7 персонажей!
4. Tab 3 (Scenes)
5. Tab 4 (Emotional Map)
6. Tab 5 (Writer's Guide)
7. Global Checks

## Step 3: Fix Issues
Для каждой найденной проблемы:
1. Отметь в чеклисте
2. Определи тип проблемы (см. COMMON ISSUES)
3. Примени Fix
4. Verify fix

## Step 4: Final Verification
После всех fixes:
- [ ] Прочитай HTML полностью
- [ ] Проверь все числа (rep, energy, counts)
- [ ] Проверь 100% Russian language
- [ ] Проверь 7 персонажей visible
- [ ] Проверь Chart.js graph работает
- [ ] Проверь все collapsible sections открываются

---

# 🎯 SUCCESS CRITERIA

Энциклопедия считается "в порядке" если:

✅ **Полнота:**
- 17 линз (все присутствуют)
- 7 персонажей (6 NPC + 1 player)
- 48+ сцен с диалогами
- Emotional map (6 stages, 180 min)
- Writer's guide (complete)

✅ **Точность:**
- Все reputation numbers правильные (500/2k/5k/15k/50k)
- Все energy values правильные (150/15/2)
- Все tier names на русском правильные
- Все counts правильные (8 artists, 6 equipment, 9 skills, 3 labels)

✅ **Язык:**
- 100% Russian (except technical genre terms)
- Все диалоги на русском
- Все explanations на русском
- NO ENGLISH PHRASES

✅ **Consistency:**
- Все примеры соответствуют actual game mechanics
- Нет противоречий между табами
- Нет упоминаний removed features (gems)
- Visual style описан как cel shading

✅ **Completeness:**
- Все табы заполнены
- Chart.js график работает
- Timeline визуализация присутствует
- Все collapsible sections functional

---

**КОНЕЦ ГАЙДА**

Используй этот документ каждый раз когда теряешь контекст игры.
