# Полный аудит приложения - 29 октября 2025

## Методология
Проведен полный систематический аудит всего кода приложения, включая:
- Главный файл app/page.tsx
- Систему энергии и регенерации
- Систему сохранения game-storage.ts
- Все экраны (home, stage, studio, artists, skills, contracts)
- Игровую логику game-state.ts
- API роуты
- Систему контрактов
- Систему артистов и лейблов
- Систему навыков
- Ритм-игру

---

## 🐛 КРИТИЧЕСКИЕ БАГИ

### БАГ #1: Регенерация энергии в реальном времени не учитывает бонусы артистов

**Приоритет**: 🔴 КРИТИЧЕСКИЙ

**Файл**: `app/page.tsx:180-209`

**Проблема**:
Код регенерации энергии (каждые 10 секунд) **НЕ** добавляет бонусы от артистов к максимальной энергии. Это приводит к тому, что энергия не регенерируется выше базового максимума даже если у игрока есть артисты.

**Код (строка 191-198)**:
```typescript
let maxEnergy = ENERGY_CONFIG.BASE_MAX_ENERGY
const skillMaxEnergyBonus = getSkillMaxEnergyBonus(prev.skills)
maxEnergy = Math.floor(maxEnergy * (1 + skillMaxEnergyBonus))

if (prev.musicStyle === "electronic") maxEnergy += 30
if (prev.startingBonus === "energizer") maxEnergy += 50

// ❌ ОТСУТСТВУЕТ: бонусы от артистов НЕ добавляются
const newEnergy = Math.min(maxEnergy, Math.round(prev.energy + recoveryAmount))
```

**Исправление**:
```typescript
let maxEnergy = ENERGY_CONFIG.BASE_MAX_ENERGY
const skillMaxEnergyBonus = getSkillMaxEnergyBonus(prev.skills)
maxEnergy = Math.floor(maxEnergy * (1 + skillMaxEnergyBonus))

if (prev.musicStyle === "electronic") maxEnergy += 30
if (prev.startingBonus === "energizer") maxEnergy += 50

// ✅ Добавить бонусы от артистов
const artistEnergyBonus = getTotalEnergyBonus(prev.artists)
maxEnergy += artistEnergyBonus

const newEnergy = Math.min(maxEnergy, Math.round(prev.energy + recoveryAmount))
```

**Последствия**:
- Игрок не получает преимущество от найма артистов в онлайн режиме
- Энергия застревает на базовом максимуме (150-200)
- Противоречит исправлению offline энергии в game-storage.ts

---

### БАГ #2: Несоответствие в конфигурации ENERGY_REGEN_PER_MINUTE

**Приоритет**: 🟡 СРЕДНИЙ

**Файл**: `lib/game-state.ts:220`

**Проблема**:
В коде установлено `ENERGY_REGEN_PER_MINUTE: 2`, но в комментариях и в коммитах упоминалось значение 2.5.

**Код**:
```typescript
export const ENERGY_CONFIG = {
  BASE_MAX_ENERGY: 150,
  ENERGY_REGEN_PER_MINUTE: 2, // ❓ Было обещано 2.5
  ENERGY_COST_PER_BEAT: 15,
  FULL_RECHARGE_TIME_MINUTES: 75,
}
```

**Решение**:
Либо изменить на 2.5, либо обновить документацию чтобы она соответствовала коду.

---

### БАГ #3: Race condition при сохранении контрактов

**Приоритет**: 🔴 КРИТИЧЕСКИЙ

**Файл**: `components/contracts-screen.tsx:61-68`

**Проблема**:
При обновлении контрактов вызывается `saveGameState` с **старым** `gameState` вместо обновленного. Это race condition - сохраняется устаревшее состояние.

**Код**:
```typescript
const refreshContracts = () => {
  // ... логика создания newContracts ...

  setGameState((prev) => ({
    ...prev,
    beatContracts: {
      ...prev.beatContracts,
      availableContracts: newContracts,
      lastRefreshDate: new Date().toISOString(),
    },
  }))

  // ❌ НЕПРАВИЛЬНО: использует старый gameState, не обновленный
  saveGameState({
    ...gameState,  // ← старое состояние!
    beatContracts: {
      ...gameState.beatContracts,
      availableContracts: newContracts,
      lastRefreshDate: new Date().toISOString(),
    },
  })
}
```

**Исправление**:
```typescript
const refreshContracts = () => {
  // ... логика создания newContracts ...

  setGameState((prev) => {
    const updated = {
      ...prev,
      beatContracts: {
        ...prev.beatContracts,
        availableContracts: newContracts,
        lastRefreshDate: new Date().toISOString(),
      },
    }

    // ✅ Сохраняем обновленное состояние
    saveGameState(updated)

    return updated
  })
}
```

**Последствия**:
- При обновлении контрактов могут потеряться другие изменения состояния
- Потенциальная потеря прогресса игрока

---

### БАГ #4: Неправильное отображение бонуса энергии от артистов

**Приоритет**: 🟢 НИЗКИЙ (Косметический)

**Файл**: `components/artists-screen.tsx:120`

**Проблема**:
Бонус энергии от артистов отображается как процент (`+{totalEnergyBonus}%`), но это **абсолютное** значение энергии, а не процент.

**Код**:
```typescript
<p className="text-xl font-bold text-secondary">+{totalEnergyBonus}%</p>
<p className="text-xs text-muted-foreground">Энергия</p>
```

**Исправление**:
```typescript
<p className="text-xl font-bold text-secondary">+{totalEnergyBonus}</p>
<p className="text-xs text-muted-foreground">Максимальная энергия</p>
```

**Последствия**:
- Игрок может запутаться в том, как работают бонусы
- Визуальное несоответствие

---

### БАГ #5: Проверка истечения контрактов не работает

**Приоритет**: 🔴 КРИТИЧЕСКИЙ

**Файл**: `app/page.tsx:121-145`

**Проблема**:
Код пытается проверить истечение контрактов при загрузке игры, но `activeContracts` это массив **строк** (IDs), а не объектов `Contract`. Код обращается к `.timeLimit` и `.acceptedAt` на строках, что всегда `undefined`.

**Код**:
```typescript
if (savedState.activeContracts && savedState.activeContracts.length > 0) {
  const now = Date.now()
  const expiredContracts: Contract[] = []
  const validContracts: Contract[] = []

  savedState.activeContracts.forEach((contract) => {
    // ❌ contract это строка (ID), а не объект!
    if (contract.timeLimit && contract.acceptedAt) {  // всегда undefined!
      const timeElapsed = now - contract.acceptedAt
      const timeLimitMs = contract.timeLimit * 60 * 1000

      if (timeElapsed >= timeLimitMs) {
        expiredContracts.push(contract)
      } else {
        validContracts.push(contract)
      }
    } else {
      validContracts.push(contract)
    }
  })
  // ...
}
```

**Исправление**:
```typescript
if (savedState.beatContracts.activeContracts && savedState.beatContracts.activeContracts.length > 0) {
  const now = Date.now()
  const expiredContractIds: string[] = []
  const validContractIds: string[] = []

  savedState.beatContracts.activeContracts.forEach((contractId) => {
    // ✅ Получить объект контракта по ID
    const contract = BEAT_CONTRACTS_POOL.find(c => c.id === contractId)
    const progress = savedState.beatContracts.contractProgress[contractId]

    if (contract && contract.requirements.timeLimit && progress?.startedAt) {
      const timeElapsed = now - new Date(progress.startedAt).getTime()
      const timeLimitMs = contract.requirements.timeLimit * 60 * 60 * 1000 // часы в мс

      if (timeElapsed >= timeLimitMs) {
        expiredContractIds.push(contractId)
      } else {
        validContractIds.push(contractId)
      }
    } else {
      validContractIds.push(contractId)
    }
  })

  if (expiredContractIds.length > 0) {
    console.log(`[v0] ${expiredContractIds.length} contract(s) expired while offline`)

    // Удалить прогресс истекших контрактов
    const newProgress = { ...savedState.beatContracts.contractProgress }
    expiredContractIds.forEach(id => delete newProgress[id])

    savedState.beatContracts = {
      ...savedState.beatContracts,
      activeContracts: validContractIds,
      contractProgress: newProgress,
    }
  }
}
```

**Последствия**:
- Истекшие контракты никогда не удаляются при загрузке игры
- Игрок может иметь бесконечное время на выполнение контрактов с временными ограничениями
- Нарушение игрового баланса

---

## ℹ️ ДОПОЛНИТЕЛЬНЫЕ НАБЛЮДЕНИЯ

### 1. Дублирование логики расчета максимальной энергии

**Файлы**:
- `app/page.tsx:191-198`
- `components/home-screen.tsx:41-57`
- `lib/game-state.ts:1255-1278` (функция `calculateMaxEnergy`)
- `lib/game-storage.ts:112-129` (offline энергия)

**Проблема**: Логика расчета максимальной энергии дублируется в 4 местах. Это затрудняет поддержку и приводит к ошибкам (как в БАГ #1).

**Рекомендация**: Использовать `calculateMaxEnergy()` везде вместо дублирования кода.

---

### 2. Несогласованность типов контрактов

**Проблема**:
- В типах: `activeContracts: string[]` (IDs)
- В коде: обращение к полям объектов `Contract`

**Рекомендация**: Четко разделить:
- `BeatContract` - определение контракта из пула
- `ActiveContract` - данные активного контракта с progress

---

### 3. Потенциальная проблема с сохранением состояния

**Файл**: `app/page.tsx:173-178`

**Наблюдение**: Сохранение каждые 5 секунд может быть чрезмерным для Supabase. При интенсивной игре это 720 запросов в час.

**Рекомендация**: Увеличить интервал до 10-15 секунд или сохранять только при изменении критических параметров (money, reputation, energy).

---

## 📊 СТАТИСТИКА АУДИТА

**Всего проверено**:
- ✅ Главный файл app/page.tsx (500 строк)
- ✅ Система энергии и регенерации
- ✅ Система сохранения game-storage.ts
- ✅ Все экраны (7 компонентов)
- ✅ Игровая логика game-state.ts (1300+ строк)
- ✅ Система контрактов
- ✅ Система артистов и лейблов
- ✅ Система навыков
- ✅ Ритм-игра

**Найдено багов**:
- 🔴 Критические: 3 (БАГ #1, #3, #5)
- 🟡 Средние: 1 (БАГ #2)
- 🟢 Низкие/Косметические: 1 (БАГ #4)

**Всего**: 5 багов

---

## 🎯 ПРИОРИТЕТЫ ИСПРАВЛЕНИЯ

### Высокий приоритет (исправить немедленно):
1. **БАГ #1** - Регенерация энергии без бонусов артистов
2. **БАГ #5** - Истечение контрактов не работает
3. **БАГ #3** - Race condition при сохранении контрактов

### Средний приоритет:
4. **БАГ #2** - Несоответствие в ENERGY_REGEN_PER_MINUTE

### Низкий приоритет:
5. **БАГ #4** - Косметическая ошибка в UI

---

## ✅ ЧТО РАБОТАЕТ ПРАВИЛЬНО

- ✅ Offline энергия (lib/game-storage.ts) - исправлена корректно
- ✅ Расчет качества битов
- ✅ Расчет цены битов
- ✅ Система навыков
- ✅ Система offline earnings
- ✅ Модалка offline earnings
- ✅ Ритм-игра
- ✅ Аутентификация
- ✅ Сохранение в Supabase
- ✅ UI/UX всех экранов

---

**Дата аудита**: 29 октября 2025
**Проверено строк кода**: ~5000+
**Время аудита**: Полный и подробный
**Статус**: Готов к исправлению

---

## SUMMARY

Приложение в целом работает хорошо, но имеет **3 критических бага**, которые влияют на игровой баланс и прогресс игрока. После исправления этих багов игра будет полностью функциональной и готова к релизу.
