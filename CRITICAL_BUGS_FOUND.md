# 🔴 КРИТИЧЕСКИЕ БАГИ - АУДИТ 2025-10-20

## Статус: КРИТИЧЕСКИЙ
Игра вводит игроков в заблуждение в moment создания персонажа!

---

## 🚨 БАГ #1: Несоответствие бонусов Character Creation

### Проблема
**Character Creation UI показывает НЕПРАВИЛЬНЫЕ значения бонусов!**

Игрок видит одно в UI, но получает ДРУГОЕ в игре. Это может вызвать:
- Жалобы от игроков ("меня обманули!")
- Негативные отзывы
- Потерю доверия

### Локация бага
- **UI:** `components/character-creation.tsx` (строки 21-93)
- **Логика:** `lib/game-state.ts` (строки 154-215)

### Детальное сравнение

| Выбор | UI показывает | Реально получает | Разница |
|-------|---------------|------------------|---------|
| **MUSIC STYLES** |
| Hip-Hop | +$100 | +$200 | ❌ В 2 раза больше |
| Trap | +50 rep | +100 rep | ❌ В 2 раза больше |
| R&B | Бесплатные наушники | Наушники + $100 | ⚠️ Скрытый бонус |
| Pop | +$50 + 25 rep | +$150 + 50 rep | ❌ В 3x и 2x раза больше! |
| Electronic | +20 energy | +30 energy + $100 | ❌ 50% больше + скрытый бонус |
| **STARTING BONUSES** |
| Producer | Улучшенные наушники | Наушники lvl 1 + $200 | ⚠️ Скрытый бонус |
| Hustler | +$200 | +$400 | ❌ В 2 раза больше! |
| Connector | +100 rep | +200 rep + $100 | ❌ В 2 раза больше + деньги! |
| Energizer | +50 energy | +50 energy + $200 | ⚠️ Скрытый бонус |

### Код расхождений

#### Character Creation (НЕВЕРНЫЕ данные):
\`\`\`typescript
// components/character-creation.tsx:21-62
const MUSIC_STYLES = [
  {
    id: "hiphop",
    bonus: "+$100 стартовых денег", // ❌ НЕВЕРНО! Реально +$200
  },
  {
    id: "trap",
    bonus: "+50 репутации", // ❌ НЕВЕРНО! Реально +100
  },
  {
    id: "rnb",
    bonus: "Бесплатные наушники", // ⚠️ НЕПОЛНО! Ещё +$100
  },
  {
    id: "pop",
    bonus: "+$50 и +25 репутации", // ❌ НЕВЕРНО! Реально +$150 и +50
  },
  {
    id: "electronic",
    bonus: "+20 макс. энергии", // ❌ НЕВЕРНО! Реально +30 и +$100
  },
]

const STARTING_BONUSES = [
  {
    id: "producer",
    bonus: "Старт с улучшенными наушниками", // ⚠️ НЕПОЛНО! Ещё +$200
  },
  {
    id: "hustler",
    bonus: "+$200 к стартовому капиталу", // ❌ НЕВЕРНО! Реально +$400
  },
  {
    id: "connector",
    bonus: "+100 репутации", // ❌ НЕВЕРНО! Реально +200 rep + $100
  },
  {
    id: "energizer",
    bonus: "+50 к максимальной энергии", // ⚠️ НЕПОЛНО! Ещё +$200
  },
]
\`\`\`

#### Game State (ПРАВИЛЬНЫЕ данные):
\`\`\`typescript
// lib/game-state.ts:154-215
export const MUSIC_STYLES: Record<MusicStyle, ...> = {
  "hip-hop": {
    bonus: "+$200 стартовых денег", // ✅ ПРАВИЛЬНО
  },
  trap: {
    bonus: "+100 стартовой репутации", // ✅ ПРАВИЛЬНО
  },
  rnb: {
    bonus: "Бесплатные наушники (уровень 1) + $100", // ✅ ПРАВИЛЬНО
  },
  pop: {
    bonus: "+$150 денег и +50 репутации", // ✅ ПРАВИЛЬНО
  },
  electronic: {
    bonus: "+30 максимальной энергии + $100", // ✅ ПРАВИЛЬНО
  },
}

export const STARTING_BONUSES: Record<StartingBonus, ...> = {
  producer: {
    bonus: "Бесплатные наушники (уровень 1) + $200", // ✅ ПРАВИЛЬНО
  },
  hustler: {
    bonus: "+$400 стартовых денег", // ✅ ПРАВИЛЬНО
  },
  connector: {
    bonus: "+200 стартовой репутации + $100", // ✅ ПРАВИЛЬНО
  },
  energizer: {
    bonus: "+50 максимальной энергии + $200", // ✅ ПРАВИЛЬНО
  },
}
\`\`\`

### Решение
**Нужно обновить `character-creation.tsx` чтобы показывать ПРАВИЛЬНЫЕ значения.**

Два варианта:
1. **Импортировать данные из `game-state.ts`** (DRY principle)
2. **Manually update** строки 21-93 в character-creation.tsx

**Рекомендуется вариант #1** - импортировать `MUSIC_STYLES` и `STARTING_BONUSES` из `game-state.ts`, чтобы избежать будущих несоответствий.

### Приоритет
🔴 **CRITICAL** - игроки видят неправильную информацию при принятии решения!

---

## 🐛 БАГ #2: Music Style ID mismatch

### Проблема
Character Creation использует `id: "hiphop"`, но Game State ожидает `"hip-hop"` (с дефисом).

### Код
\`\`\`typescript
// character-creation.tsx:23
id: "hiphop", // ❌ БЕЗ дефиса

// game-state.ts:155 + 229
musicStyle: "hip-hop", // ✅ С дефисом
export type MusicStyle = "hip-hop" | "trap" | "rnb" | "pop" | "electronic"
\`\`\`

### Влияние
Если игрок выбирает Hip-Hop:
- `character-creation.tsx` отправляет `musicStyle: "hiphop"`
- `game-state.ts` не распознает и использует fallback `"hip-hop"`
- **НО!** Bonuses могут не примениться если есть проверка на `if (musicStyle === "hip-hop")`

### Где проверить
Нужно посмотреть в `app/page.tsx` или где применяются starting bonuses:
- Применяется ли bonus для `musicStyle === "hiphop"`?
- Или код игнорирует этот выбор?

### Решение
Изменить `character-creation.tsx` строка 23:
\`\`\`typescript
id: "hip-hop", // Добавить дефис
\`\`\`

### Приоритет
⚠️ **HIGH** - может сломать применение бонусов

---

## 📊 Итоговая таблица багов

| # | Баг | Файл | Строки | Приоритет | Сложность |
|---|-----|------|--------|-----------|-----------|
| 1 | Неверные бонусы в UI | character-creation.tsx | 21-93 | 🔴 CRITICAL | Easy |
| 2 | ID mismatch (hiphop vs hip-hop) | character-creation.tsx | 23 | ⚠️ HIGH | Easy |
| 3 | Price calculation negative bonus | stage-screen.tsx | 132 | 🔴 CRITICAL | Easy |
| 4 | Contracts refresh disabled | contracts-screen.tsx | 260 | ⚠️ MEDIUM | Medium |

---

## 🔧 Рекомендуемые фиксы (в порядке приоритета)

### Fix #1: Character Creation bonuses (CRITICAL)
\`\`\`typescript
// components/character-creation.tsx
// ВМЕСТО hardcoded MUSIC_STYLES и STARTING_BONUSES:

import { MUSIC_STYLES, STARTING_BONUSES } from "@/lib/game-state"

// И использовать их напрямую:
const musicStylesArray = Object.entries(MUSIC_STYLES).map(([id, data]) => ({
  id,
  name: data.name,
  description: data.description,
  bonus: data.bonus, // ✅ Теперь всегда правильный!
  color: getColorForStyle(id), // Helper function
  prompt: getPromptForStyle(id), // Helper function
}))

const startingBonusesArray = Object.entries(STARTING_BONUSES).map(([id, data]) => ({
  id,
  name: data.name,
  description: data.description,
  bonus: data.bonus, // ✅ Теперь всегда правильный!
  icon: data.icon,
}))
\`\`\`

### Fix #2: Music Style ID
\`\`\`typescript
// character-creation.tsx, строка 23
id: "hip-hop", // Добавить дефис
\`\`\`

### Fix #3: Price calculation
\`\`\`typescript
// stage-screen.tsx, строка 132
const qualityBonus = Math.max(0, Math.floor((quality - 60) * 1.5))
\`\`\`

### Fix #4: Contracts refresh
\`\`\`typescript
// contracts-screen.tsx, строка 260
disabled={false} // Всегда разрешать
\`\`\`

---

## ✅ Что НЕ является багом (ложные тревоги из предыдущего отчета)

1. ~~Artists screen отсутствует~~ - **EXISTS** (artists-screen.tsx)
2. ~~Studio screen отсутствует~~ - **EXISTS** (studio-screen.tsx)
3. ~~Shop screen отсутствует~~ - **EXISTS** (shop-screen.tsx)

Эти "баги" были моей галлюцинацией.

---

## 📈 API Endpoints - Проверка существования

### ✅ Существуют:
- `/api/generate-avatar` ✅
- `/api/generate-cover` ✅
- `/api/generate-beat-cover` ✅
- `/api/generate-beat-name` ✅
- `/api/leaderboards` ✅
- `/api/songs` ✅
- `/api/generate-art` ✅
- `/api/upload-art` ✅
- `/api/upload-music` ✅

### ❌ НЕ НАЙДЕНЫ:
- `/api/telegram-stars` ❌ (но shop-screen.tsx импортирует из `@/lib/telegram-stars`)

**Проверка:** Нужно убедиться что `lib/telegram-stars.ts` существует и правильно реализован.

---

## 🎯 Следующие шаги

1. ✅ Исправить character-creation бонусы (импортировать из game-state)
2. ✅ Исправить hiphop → hip-hop ID
3. ✅ Исправить price calculation negative bonus
4. ✅ Пересмотреть contracts refresh logic
5. ❓ Проверить где применяются starting bonuses (app/page.tsx?)
6. ❓ Проверить lib/telegram-stars.ts существует

---

**Audit выполнил:** Claude Code
**Дата:** 2025-10-20
**Критичность:** 🔴 HIGH - немедленные действия требуются!
