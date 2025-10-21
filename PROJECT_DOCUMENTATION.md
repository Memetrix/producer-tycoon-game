# Producer Tycoon - Полная Документация Проекта

**Версия:** 2.0 (Обновлено после аудита и исправлений)
**Дата:** 20 октября 2025
**Статус:** 90% MVP готов, система контрактов полностью реализована

---

## 📋 Оглавление

1. [Обзор Проекта](#обзор-проекта)
2. [Архитектура](#архитектура)
3. [Игровые Системы](#игровые-системы)
4. [База Данных](#база-данных)
5. [API и Интеграции](#api-и-интеграции)
6. [Компоненты](#компоненты)
7. [Последние Исправления](#последние-исправления)
8. [Известные Проблемы](#известные-проблемы)
9. [Roadmap](#roadmap)

---

## Обзор Проекта

### Что это?
Producer Tycoon - мобильная idle/incremental игра где вы строите карьеру музыкального продюсера. Создавайте биты через ритм-игру, улучшайте оборудование, нанимайте артистов и поднимайтесь в рейтинге!

### Технологический Стек
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Storage**: Vercel Blob
- **AI**: Groq API (названия битов), fal.ai (обложки)
- **Deployment**: Vercel

### Ключевые Особенности
- ✅ Ритм-игра с OSU beatmap поддержкой (29+ треков)
- ✅ AI генерация названий битов и обложек
- ✅ Система прогрессии (оборудование, артисты, скиллы)
- ✅ Система контрактов с отслеживанием прогресса
- ✅ Реальные лидерборды с базой данных
- ✅ Пассивный доход и offline earnings
- ✅ Система энергии с регенерацией

---

## Архитектура

### Структура Файлов

\`\`\`
producer-tycoon-game/
├── app/
│   ├── page.tsx                 # Главный контейнер игры
│   ├── api/
│   │   ├── generate-beat-name/  # Groq API для названий
│   │   ├── generate-beat-cover/ # fal.ai для обложек
│   │   └── leaderboards/        # Реальные данные лидерборда
│   └── globals.css              # Tailwind v4 конфиг
│
├── components/
│   ├── home-screen.tsx          # Главный экран
│   ├── stage-screen.tsx         # Создание битов + ритм-игра
│   ├── studio-screen.tsx        # Улучшение оборудования
│   ├── artists-screen.tsx       # Найм артистов
│   ├── contracts-screen.tsx     # Система контрактов
│   ├── skills-screen.tsx        # Дерево навыков
│   ├── leaderboards-screen.tsx  # Рейтинги
│   ├── shop-screen.tsx          # Магазин (Telegram Stars)
│   └── rhythm-game-rhythm-plus.tsx  # Ритм-игра
│
├── lib/
│   ├── game-state.ts            # Типы, константы, хелперы
│   ├── game-storage.ts          # Supabase интеграция
│   ├── osz-parser.ts            # Парсинг OSU beatmaps
│   └── rhythm-plus/             # Движок ритм-игры
│
├── scripts/
│   ├── *.sql                    # SQL миграции и утилиты
│   └── *.ts                     # TypeScript скрипты
│
└── public/
    └── tracks/                  # OSZ файлы (29+ треков)
\`\`\`

### Управление Состоянием

**Паттерн**: Lift state to `app/page.tsx`, передача через props

**Почему не Context API?**
- Проще для отладки
- Меньше ре-рендеров
- Прямой контроль над состоянием
- Легче тестировать

**Автосохранение**:
- Каждые 5 секунд в Supabase
- При размонтировании компонента
- После важных действий (создание бита, покупка)

---

## Игровые Системы

### 1. Система Энергии

**Константы** (`lib/game-state.ts`):
\`\`\`typescript
BASE_MAX_ENERGY = 150
ENERGY_REGEN_RATE = 2 // в минуту
BEAT_ENERGY_COST = 15
\`\`\`

**Расчет максимальной энергии**:
\`\`\`typescript
function calculateMaxEnergy(gameState: GameState): number {
  let maxEnergy = BASE_MAX_ENERGY
  
  // Бонусы от артистов
  Object.entries(gameState.artists).forEach(([artistId, level]) => {
    const artist = ARTISTS[artistId]
    maxEnergy += artist.energyBonus * level
  })
  
  // Бонусы от скиллов
  if (gameState.skills.stamina) maxEnergy *= 1.2
  
  // Стартовый бонус
  if (gameState.startingBonus === "energizer") maxEnergy += 50
  
  return Math.floor(maxEnergy)
}
\`\`\`

**Регенерация**:
- Клиент: `setInterval` каждые 5 секунд, +0.167 энергии
- Сервер: Расчет при загрузке на основе `last_active`

### 2. Создание Битов

**Поток** (`components/stage-screen.tsx`):

1. **Выбор трека** → Загрузка OSZ файла
2. **Выбор сложности** → Определение beatmap (1-5)
3. **Ритм-игра** → Игрок играет, получает accuracy
4. **Генерация AI** → Название (Groq) + Обложка (fal.ai)
5. **Расчет качества** → На основе accuracy, оборудования, сложности
6. **Расчет цены** → Качество × Сложность × Репутация × Скиллы
7. **Награды** → Деньги + Репутация
8. **Сохранение** → Бит в базу данных

**Формула качества**:
\`\`\`typescript
quality = (accuracy * 0.6) + (equipmentBonus * 0.3) + (difficultyBonus * 0.1)
\`\`\`

**Формула цены**:
\`\`\`typescript
basePrice = 30
qualityBonus = Math.max(0, (quality - 60) * 1.5) // Не может быть отрицательным!
difficultyMultiplier = 1 + (difficulty - 1) * 0.3
reputationBonus = reputation * 0.05
tierMultiplier = getTierPriceMultiplier(reputation)
skillMultiplier = getSkillPriceMultiplier(skills)

finalPrice = (basePrice + qualityBonus + reputationBonus) 
             × difficultyMultiplier 
             × tierMultiplier 
             × skillMultiplier
\`\`\`

### 3. Система Контрактов

**Полностью реализована!** (`components/contracts-screen.tsx`)

**Типы контрактов**:
- **Volume**: Создать N битов
- **Quality**: Создать биты с качеством ≥ X%
- **Accuracy**: Создать биты с точностью ≥ X%
- **Combined**: Комбинация требований
- **Time-limited**: Выполнить за N часов

**Сложности**:
- **Easy** (Tier 2+): 2-3 бита, 60% качество, $500-1000 + 20-30 rep
- **Medium** (Tier 3+): 3-5 битов, 70% качество, $2000-4000 + 50-80 rep
- **Hard** (Tier 4+): 5-8 битов, 80% качество, $8000-15000 + 150-250 rep

**Отслеживание прогресса**:
\`\`\`typescript
interface ContractProgress {
  contractId: string
  beatsCreated: number
  beatsRequired: number
  startedAt: number
  expiresAt?: number
}
\`\`\`

При создании бита проверяются все активные контракты:
\`\`\`typescript
gameState.activeContracts.forEach(contract => {
  if (beatMeetsRequirements(beat, contract)) {
    contract.progress.beatsCreated++
    if (contract.progress.beatsCreated >= contract.requirements.beats) {
      // Контракт выполнен!
    }
  }
})
\`\`\`

### 4. Система Репутации

**6 тиров**:
| Тир | Название | Репутация | Множитель цены |
|-----|----------|-----------|----------------|
| 1 | Улица | 0-500 | 1.0x |
| 2 | Андеграунд | 500-2000 | 1.2x |
| 3 | Восходящий | 2000-5000 | 1.5x |
| 4 | Признанный | 5000-10000 | 1.8x |
| 5 | Известный | 10000-20000 | 2.1x |
| 6 | Легенда | 20000+ | 2.5x |

**Разблокировки по тирам**:
- Tier 1: Базовые артисты (Street Poet, MC Flow, Lil Dreamer, Young Legend)
- Tier 2: Контракты Easy, артисты (Local Hero, Scene Leader)
- Tier 3: Контракты Medium, артисты (City Star, State Champion)
- Tier 4: Контракты Hard
- Tier 5: Лейблы Major
- Tier 6: Эксклюзивный контент

### 5. Оборудование

**6 категорий, 10 уровней каждая**:
1. **Phone** (Телефон) - базовое устройство
2. **Headphones** (Наушники) - качество звука
3. **Microphone** (Микрофон) - запись вокала
4. **Computer** (Компьютер) - производительность
5. **MIDI** (MIDI-клавиатура) - создание мелодий
6. **Audio Interface** (Аудиоинтерфейс) - профессиональный звук

**Формула стоимости**:
\`\`\`typescript
cost = basePrice × 1.4^currentLevel
\`\`\`

**Бонус качества**:
\`\`\`typescript
equipmentQuality = sum(allEquipmentLevels) × 0.5
\`\`\`

### 6. Артисты

**8 артистов, 3 тира**:

**Tier 1** (0 rep):
- Street Poet (Hip-Hop) - $5/min, +2% energy
- MC Flow (Trap) - $8/min, +3% energy
- Lil Dreamer (R&B) - $6/min, +2% energy
- Young Legend (Pop) - $10/min, +4% energy

**Tier 2** (500 rep):
- Local Hero (R&B) - $20/min, +5% energy
- Scene Leader (Trap) - $25/min, +6% energy

**Tier 3** (2000 rep):
- City Star (Pop) - $50/min, +8% energy
- State Champion (Hip-Hop) - $60/min, +10% energy

**Формула стоимости**:
\`\`\`typescript
cost = baseCost × 1.6^currentLevel
\`\`\`

### 7. Скиллы

**3 ветки, 9 скиллов**:

**Energy Branch**:
- Caffeine Rush (Tier 1, 500 rep, $5000) - Стоимость бита -10% энергии
- Stamina (Tier 2, 2000 rep, $20000) - Макс. энергия +20%
- Flow State (Tier 3, 5000 rep, $50000) - Регенерация +1/мин

**Quality Branch**:
- Ear Training (Tier 1, 500 rep, $5000) - Качество +5%
- Studio Mastery (Tier 2, 2000 rep, $20000) - Качество +10%
- Perfect Pitch (Tier 3, 5000 rep, $50000) - Качество +15%

**Money Branch**:
- Negotiation (Tier 1, 500 rep, $5000) - Цена +10%
- Marketing (Tier 2, 2000 rep, $20000) - Цена +20%
- Brand Power (Tier 3, 5000 rep, $50000) - Цена +30%

---

## База Данных

### Схема Supabase

**Таблица**: `game_state`

\`\`\`sql
CREATE TABLE game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  
  -- Ресурсы
  money DECIMAL DEFAULT 500,
  reputation INTEGER DEFAULT 0,
  energy INTEGER DEFAULT 150,
  
  -- Оборудование (0-10)
  equipment_phone INTEGER DEFAULT 0,
  equipment_headphones INTEGER DEFAULT 0,
  equipment_mic INTEGER DEFAULT 0,
  equipment_computer INTEGER DEFAULT 0,
  equipment_midi INTEGER DEFAULT 0,
  equipment_audio_interface INTEGER DEFAULT 0,
  
  -- Артисты (0-10)
  artist_street_poet INTEGER DEFAULT 0,
  artist_mc_flow INTEGER DEFAULT 0,
  artist_lil_dreamer INTEGER DEFAULT 0,
  artist_young_legend INTEGER DEFAULT 0,
  artist_local_hero INTEGER DEFAULT 0,
  artist_scene_leader INTEGER DEFAULT 0,
  artist_city_star INTEGER DEFAULT 0,
  artist_state_champion INTEGER DEFAULT 0,
  
  -- Скиллы (boolean)
  skill_caffeine_rush BOOLEAN DEFAULT FALSE,
  skill_stamina BOOLEAN DEFAULT FALSE,
  skill_flow_state BOOLEAN DEFAULT FALSE,
  skill_ear_training BOOLEAN DEFAULT FALSE,
  skill_studio_mastery BOOLEAN DEFAULT FALSE,
  skill_perfect_pitch BOOLEAN DEFAULT FALSE,
  skill_negotiation BOOLEAN DEFAULT FALSE,
  skill_marketing BOOLEAN DEFAULT FALSE,
  skill_brand_power BOOLEAN DEFAULT FALSE,
  
  -- Лейблы (boolean)
  label_indie BOOLEAN DEFAULT FALSE,
  label_small BOOLEAN DEFAULT FALSE,
  label_major BOOLEAN DEFAULT FALSE,
  
  -- Контракты (JSONB)
  active_contracts JSONB DEFAULT '[]'::jsonb,
  completed_contracts JSONB DEFAULT '[]'::jsonb,
  
  -- Персонаж
  avatar_url TEXT,
  character_name TEXT,
  gender TEXT,
  music_style TEXT,
  starting_bonus TEXT,
  
  -- Прогресс
  total_beats_created INTEGER DEFAULT 0,
  total_money_earned DECIMAL DEFAULT 0,
  
  -- Timestamps
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Таблица**: `songs` (треки)

\`\`\`sql
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  osz_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Таблица**: `beats` (созданные биты)

\`\`\`sql
CREATE TABLE beats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  cover_url TEXT,
  quality INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  difficulty INTEGER NOT NULL,
  accuracy DECIMAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### RLS Policies

\`\`\`sql
-- game_state
CREATE POLICY "Users can view own game state"
  ON game_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own game state"
  ON game_state FOR UPDATE
  USING (auth.uid() = user_id);

-- beats
CREATE POLICY "Users can view own beats"
  ON beats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own beats"
  ON beats FOR INSERT
  WITH CHECK (auth.uid() = user_id);
\`\`\`

---

## API и Интеграции

### 1. Groq API (Названия битов)

**Endpoint**: `/api/generate-beat-name`

**Запрос**:
\`\`\`typescript
POST /api/generate-beat-name
{
  "originalName": "Feel Good Inc.",
  "originalArtist": "Gorillaz"
}
\`\`\`

**Ответ**:
\`\`\`typescript
{
  "beatName": "Vibe Syndicate"
}
\`\`\`

**Промпт**:
\`\`\`
You are a creative music producer. Create a parody/homage beat name based on the original track.

Original: Feel Good Inc. by Gorillaz

Create a short, catchy beat name (2-4 words) that's a playful reference to the original.
Be creative and varied - here are some example styles:
- "Vibe Syndicate" (corporate twist)
- "Good Energy Co." (business parody)
- "Mood Factory" (industrial theme)
- "Chill Corporation" (office humor)

Only respond with the beat name, nothing else.
\`\`\`

**Параметры**:
- Model: `llama-3.3-70b-versatile`
- Temperature: 0.9 (для разнообразия)
- Max tokens: 20

### 2. fal.ai (Обложки битов)

**Endpoint**: `/api/generate-beat-cover`

**Запрос**:
\`\`\`typescript
POST /api/generate-beat-cover
{
  "beatName": "Vibe Syndicate"
}
\`\`\`

**Ответ**:
\`\`\`typescript
{
  "coverUrl": "https://blob.vercel-storage.com/..."
}
\`\`\`

**Процесс**:
1. Генерация промпта через Groq
2. Генерация изображения через fal.ai (FLUX.1 dev)
3. Загрузка в Vercel Blob
4. Возврат URL

**Параметры fal.ai**:
- Model: `fal-ai/flux-dev`
- Image size: `square_hd` (512x512)
- Num inference steps: 28
- Guidance scale: 3.5

### 3. Leaderboards API

**Endpoint**: `/api/leaderboards`

**Запрос**:
\`\`\`typescript
GET /api/leaderboards?type=global&playerId=uuid
GET /api/leaderboards?type=weekly&playerId=uuid
\`\`\`

**Ответ**:
\`\`\`typescript
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "name": "Player Name",
      "avatar": "url",
      "reputation": 5000,
      "totalBeats": 150,
      "totalMoney": 500000,
      "score": 550000
    },
    // ... top 10
  ],
  "currentPlayer": {
    "rank": 42,
    "score": 12000
  }
}
\`\`\`

**Расчет score**:
\`\`\`typescript
score = total_money_earned + (reputation × 10)
\`\`\`

---

## Компоненты

### Главные Экраны

**1. HomeScreen** (`components/home-screen.tsx`)
- Отображение ресурсов (деньги, репутация, энергия)
- Прогресс тира
- Быстрые действия (кнопки навигации)
- История активности (последние биты)
- Offline earnings модалка

**2. StageScreen** (`components/stage-screen.tsx`)
- Выбор трека из библиотеки
- Выбор сложности (1-5)
- Запуск ритм-игры
- AI генерация названия и обложки
- Отображение результатов
- Сохранение бита

**3. StudioScreen** (`components/studio-screen.tsx`)
- 6 категорий оборудования
- Отображение текущего уровня
- Стоимость следующего уровня
- Бонус качества
- Кнопка улучшения

**4. ArtistsScreen** (`components/artists-screen.tsx`)
- 8 артистов с портретами
- Отображение уровня и стоимости
- Пассивный доход/час
- Бонус энергии
- Требования по репутации
- Кнопка найма/улучшения

**5. ContractsScreen** (`components/contracts-screen.tsx`)
- 3 вкладки: Доступные, Активные, Завершенные
- Карточки контрактов с требованиями
- Прогресс-бары
- Таймеры для time-limited
- Кнопки Accept/Cancel/Complete
- Автообновление списка

**6. SkillsScreen** (`components/skills-screen.tsx`)
- 3 ветки скиллов
- Визуальное дерево
- Требования по репутации
- Стоимость разблокировки
- Описание эффектов

**7. LeaderboardsScreen** (`components/leaderboards-screen.tsx`)
- Вкладки Global/Weekly
- Top 10 игроков
- Виниловые диски для топ-3
- Текущий ранг игрока
- Статистика (репутация, биты, деньги)

**8. ShopScreen** (`components/shop-screen.tsx`)
- 4 категории: Combos, Energy, Money, Reputation
- Карточки товаров
- Интеграция Telegram Stars
- Обработка покупок
- Тосты успеха/ошибки

### Ритм-Игра

**RhythmGameRhythmPlus** (`components/rhythm-game-rhythm-plus.tsx`)
- Canvas-based рендеринг
- 4 дорожки (Kick, Snare, Hi-Hat, Tom)
- Клавиатурное управление (D/F/J/K)
- Тач-кнопки для мобильных
- Система HP (0-100%)
- Комбо система
- Скоринг (Perfect/Good/Offbeat/Miss)
- Звуковые эффекты (DrumSynthesizer)

**Движок** (`lib/rhythm-plus/`)
- `GameInstance.ts` - главный игровой цикл
- `Track.ts` - управление дорожками
- `Note.ts` - ноты и хит-детекция
- `AudioManager.ts` - управление звуком

---

## Последние Исправления

### Критические Баги (Исправлены 20.10.2025)

**1. Character Creation Bonuses**
- Проблема: UI показывал неправильные значения бонусов
- Решение: Обновлены все значения в `character-creation.tsx`
- Файл: `FIXES_APPLIED.md`

**2. Price Calculation Negative Bonus**
- Проблема: При качестве < 60% получался отрицательный бонус
- Решение: Добавлен `Math.max(0, ...)` в формулу
- Файл: `components/stage-screen.tsx:130`

**3. Contracts Refresh Logic**
- Проблема: Кнопка обновления блокировалась при активных контрактах
- Решение: Убрано ограничение
- Файл: `components/contracts-screen.tsx:254-265`

**4. Music Style ID Inconsistency**
- Проблема: "hiphop" vs "hip-hop" несоответствие
- Решение: Везде заменено на "hip-hop"
- Файлы: `character-creation.tsx`, `app/page.tsx`

### Система Контрактов (Реализована 20.10.2025)

**Добавлено**:
- Полное отслеживание прогресса контрактов
- Проверка выполнения при создании битов
- Таймеры для time-limited контрактов
- Автоматическое удаление истекших контрактов
- UI с 3 вкладками
- Система наград

**Файлы**:
- `lib/game-state.ts` - типы и константы
- `components/contracts-screen.tsx` - UI
- `components/stage-screen.tsx` - интеграция с созданием битов
- `lib/game-storage.ts` - сохранение в БД
- `app/page.tsx` - проверка истечения при загрузке

### OSZ Error Handling (Добавлено 20.10.2025)

**Проблема**: Поврежденные OSZ файлы ломали всю игру

**Решение**:
- Добавлена обработка ошибок в `osz-parser.ts`
- Try-catch блоки на каждом этапе парсинга
- Понятные сообщения об ошибках для пользователя
- Опция `checkCRC32: false` для мягкой обработки
- Fallback на другие треки при ошибке

**Файлы**:
- `lib/osz-parser.ts`
- `components/stage-screen.tsx`

---

## Известные Проблемы

### Высокий Приоритет

**1. Энергия не растет выше 100**
- Описание: Энергия застревает на 100/150
- Причина: Возможно проблема с регенерацией или отображением
- Статус: Требует исследования

**2. Модалка Offline Earnings пропала**
- Описание: После AFK не показывается модалка с заработком
- Причина: Возможно удалена при рефакторинге
- Статус: Требует восстановления

### Средний Приоритет

**3. Некоторые OSZ файлы повреждены**
- Описание: `infernal-pulse.osz` и возможно другие
- Решение: Пересоздать с правильными zip флагами
- Статус: Частично исправлено (добавлена обработка ошибок)

**4. Портреты артистов - плейсхолдеры**
- Описание: Большинство артистов без портретов
- Решение: Сгенерировать через fal.ai
- Статус: Не критично для MVP

### Низкий Приоритет

**5. Форматирование больших чисел**
- Описание: >$1B показывается в научной нотации
- Решение: Добавить форматтер (1.2B, 3.5M)
- Статус: Не произойдет в 60-дневном геймплее

---

## Roadmap

### Фаза 1: MVP Завершение (90% готово)

**Осталось**:
- [ ] Исправить энергию (не растет выше 100)
- [ ] Восстановить offline earnings модалку
- [ ] Пофиксить поврежденные OSZ файлы
- [ ] Добавить портреты артистов

### Фаза 2: Контент

**Треки**:
- [ ] Добавить 70+ треков (до 100 total)
- [ ] Интеграция реальной музыки от Григория
- [ ] MIDI парсер для кастомных треков

**Нарратив**:
- [ ] Система диалогов
- [ ] 30-40 сцен истории
- [ ] 4 концовки
- [ ] Портреты персонажей

### Фаза 3: Монетизация

**Telegram Stars**:
- [ ] Реальная интеграция (сейчас симуляция)
- [ ] Backend верификация покупок
- [ ] История покупок

**Gacha**:
- [ ] 5 типов ящиков ($1-$50)
- [ ] Система pity (90 pulls = legendary)
- [ ] Анимация открытия
- [ ] Инвентарь предметов

**Battle Pass**:
- [ ] Free/Premium/Elite треки
- [ ] 30-50 наград
- [ ] Система сезонов

### Фаза 4: Web3

**TON Integration**:
- [ ] TON Connect
- [ ] $BEAT токен
- [ ] TGE (Day 60)
- [ ] NFT система

### Фаза 5: Социальные Фичи

**Competitive**:
- [ ] Автоматический weekly reset
- [ ] Призы топ-100
- [ ] Friend leaderboards

**Viral**:
- [ ] Реферальная система
- [ ] Социальный шеринг
- [ ] Кланы/гильдии

---

## Полезные Команды

### Development

\`\`\`bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Билд для продакшена
npm run build

# Запуск продакшен билда
npm start
\`\`\`

### SQL Scripts

**Восстановить энергию**:
\`\`\`sql
-- scripts/restore-energy.sql
UPDATE game_state 
SET energy = 150 
WHERE user_id = auth.uid()::text;
\`\`\`

**Установить кастомную энергию**:
\`\`\`sql
-- scripts/set-energy-custom.sql
UPDATE game_state 
SET energy = 200 
WHERE user_id = auth.uid()::text;
\`\`\`

**Максимизировать ресурсы**:
\`\`\`sql
-- scripts/max-out-resources.sql
UPDATE game_state 
SET 
  money = 1000000,
  reputation = 50000,
  energy = 500
WHERE user_id = auth.uid()::text;
\`\`\`

### Debugging

**Проверить состояние игры**:
\`\`\`typescript
console.log("[v0] Game State:", gameState)
console.log("[v0] Max Energy:", calculateMaxEnergy(gameState))
console.log("[v0] Passive Income:", calculateTotalPassiveIncome(gameState))
\`\`\`

**Проверить контракты**:
\`\`\`typescript
console.log("[v0] Active Contracts:", gameState.activeContracts)
console.log("[v0] Available Contracts:", getAvailableContracts(gameState))
\`\`\`

---

## Контакты и Ресурсы

**Live App**: https://vercel.com/gakhaleksey-4260s-projects/v0-producer-tycoon-app
**v0 Project**: https://v0.app/chat/projects/DR7RjPI607V
**GitHub**: producer-tycoon-game (private)

**Документация**:
- `README.md` - Краткий обзор
- `INSTRUCTIONS_FOR_NEW_CHAT.md` - Онбординг для новых разработчиков
- `FEATURE_AUDIT.md` - Полный аудит фич
- `FIXES_APPLIED.md` - История исправлений
- `CRITICAL_BUGS_FOUND.md` - Найденные баги

**Дизайн Документы**:
- `ECONOMY_REBALANCE_SPEC.md` - Баланс экономики
- `COMPOSER_BRIEF.md` - Спецификация музыки
- `GAME_DESIGN_DOCUMENT.md` - Оригинальный GDD

---

**Версия документации**: 2.0
**Последнее обновление**: 20 октября 2025
**Статус проекта**: 90% MVP готов
**Следующий шаг**: Исправить энергию и offline earnings
