# 🎵 Анализ SUNO Track + Beatmap System

## 📊 Обзор

В этой папке находится полный анализ трека "Infernal Pulse" из Suno AI, разобранного на стемы и проанализированного с помощью Python скрипта для создания **ритм-игровых beatmap'ов**.

---

## 📁 Структура файлов

### 🎧 Аудио файлы
\`\`\`
Infernal Pulse.mp3                    # Полный микс (3.3 MB)
Infernal Pulse Stems/                 # Разобранные стемы:
  ├── Infernal Pulse (Backing Vocals).mp3  # 1.3 MB
  ├── Infernal Pulse (Bass).mp3            # 1.7 MB
  ├── Infernal Pulse (Drums).mp3           # 2.5 MB
  ├── Infernal Pulse (FX).mp3              # 3.0 MB
  ├── Infernal Pulse (Synth).mp3           # 727 KB
  └── Infernal Pulse (Vocals).mp3          # 2.4 MB
\`\`\`

### 🎮 Beatmap файлы
\`\`\`
beatmap.osu                 # OSU! формат (9.9 KB) - 377 нот
beatmap_easy.json           # Легкий уровень (17.8 KB) - 112 нот
beatmap_normal.json         # Средний уровень (32.7 KB) - 268 нот
beatmap_hard.json           # Сложный уровень (40.7 KB) - 354 нот
beatmap_full.json           # Полный анализ (40.7 KB) - 354 ноты
\`\`\`

### 🛠️ Инструменты
\`\`\`
beatmap_analyzer.py         # Python скрипт анализа (7.9 KB)
beatmap_visualizer.html     # Визуализатор beatmap (12.9 KB)
\`\`\`

---

## 🔬 Как работает beatmap_analyzer.py

### Технологии
- **librosa** - библиотека для анализа аудио
- **numpy** - математические операции
- Анализирует: темп (BPM), ритмические удары (beats), атаки звуков (onsets)

### Процесс анализа

#### 1. Определение BPM (темпа)
\`\`\`python
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
# Результат: 132.5 BPM
\`\`\`

#### 2. Onset Detection (обнаружение ударов)
Использует два типа detection:

**Strong onsets** (сильные удары):
- Kick drum
- Snare drum
- Основные ритмические элементы
- Параметры: `delta=0.2`, `wait=10`

**Weak onsets** (слабые удары):
- Hi-hats
- Перкуссия
- Тонкие ритмические детали
- Параметры: `delta=0.1`, `wait=5`

#### 3. Классификация типов ударов
Анализирует спектр частот в момент удара:

\`\`\`python
def classify_onset(time_sec):
    low = spectrum[0:50]      # Kick (низкие частоты)
    mid = spectrum[50:150]    # Snare (средние)
    high = spectrum[150:300]  # Hi-hat (высокие)
\`\`\`

**Классификация:**
- `kick` - доминируют низкие частоты (бас-бочка)
- `snare` - доминируют средние частоты (малый барабан)
- `hihat` - доминируют высокие частоты (хай-хэт)
- `note` - смешанные частоты (другие инструменты)

#### 4. Создание уровней сложности

**Easy** (112 нот):
\`\`\`python
# Только сильные удары kick и snare
notes = [n for n in notes if n['strength'] == 'strong'
         and n['type'] in ['kick', 'snare']]
\`\`\`

**Normal** (268 нот):
\`\`\`python
# Сильные удары + каждый второй слабый
strong_notes = [n for n in notes if n['strength'] == 'strong']
weak_notes = weak_notes[::2]  # Каждый второй
\`\`\`

**Hard** (354 ноты):
\`\`\`python
# Все ноты без фильтрации
\`\`\`

---

## 📈 Результаты анализа для "Infernal Pulse"

### Метаданные трека
\`\`\`json
{
  "title": "Infernal Pulse",
  "artist": "Suno AI",
  "duration": 137.68,  // 2:17
  "bpm": 132.51
}
\`\`\`

### Статистика нот

| Сложность | Количество нот | Плотность (нот/сек) | Описание |
|-----------|---------------|---------------------|----------|
| Easy      | 112           | 0.81/s             | Только основной ритм |
| Normal    | 268           | 1.95/s             | Базовый + половина деталей |
| Hard      | 354           | 2.57/s             | Все ритмические события |

### Распределение типов нот

**Пример структуры:**
\`\`\`json
{
  "time": 14.338,        // Время в секундах
  "type": "kick",        // Тип удара
  "strength": "strong"   // Сила удара
}
\`\`\`

---

## 🎮 beatmap.osu формат

### Что это?
Формат игры **osu!** - одна из самых популярных ритм-игр.

### Структура файла

\`\`\`ini
[General]
AudioFilename: audio.mp3
Mode: 0                    # Standard mode

[Metadata]
Title: Infernal Pulse
Artist: Suno AI

[Difficulty]
HPDrainRate: 5            # Урон от промахов
CircleSize: 4             # Размер нот
OverallDifficulty: 7      # Общая сложность
ApproachRate: 8           # Скорость приближения нот
SliderMultiplier: 1.4
SliderTickRate: 1

[TimingPoints]
0,452.79,4,2,0,50,1,0    # BPM timing

[HitObjects]
256,192,14338,5,0,0:0:0:0:  # x, y, time_ms, type, ...
384,192,14675,5,0,0:0:0:0:
128,192,15232,5,0,0:0:0:0:
...
\`\`\`

### Позиционирование нот
\`\`\`python
positions = {
    'kick': (256, 192),    # Центр
    'snare': (128, 192),   # Слева
    'hihat': (384, 192),   # Справа
    'note': (256, 192)     # Центр
}
\`\`\`

---

## 🌐 beatmap_visualizer.html

### Что это?
Интерактивный HTML/JS визуализатор beatmap в стиле Guitar Hero / Osu!

### Возможности

**Выбор сложности:**
- Easy (112 нот)
- Normal (268 нот)
- Hard (354 нот)

**4 трека:**
- 💥 KICK (красный)
- 🔔 SNARE (фиолетовый)
- ✨ HI-HAT (зелёный)
- 🎹 NOTE (жёлтый)

**UI элементы:**
- Hit zone - зона попадания (снизу)
- Timeline - прогресс бар
- Stats - статистика (время, количество нот, плотность)

### Как использовать

1. **Открыть в браузере:**
   \`\`\`bash
   open beatmap_visualizer.html
   \`\`\`

2. **Выбрать сложность:** Easy / Normal / Hard

3. **Запустить:** Нажать ▶ PLAY

4. **Наблюдать:** Ноты падают сверху вниз по 4 трекам

### Анимация
- Ноты появляются за 3 секунды до удара
- Падают с постоянной скоростью
- Должны попасть в зелёную зону внизу
- После прохождения - удаляются

---

## 💡 Применение для Producer Tycoon

### Потенциальное использование

#### 1. Ритм-игра для создания битов
\`\`\`typescript
// Интеграция beatmap в stage-screen.tsx
interface BeatmapNote {
  time: number        // Секунда появления
  type: 'kick' | 'snare' | 'hihat' | 'note'
  strength: 'strong' | 'weak'
}

// Можно генерировать beatmap на лету из библиотеки битов
\`\`\`

#### 2. Анализ реальных треков
\`\`\`python
# Загрузить любой трек из Suno
python beatmap_analyzer.py "track.mp3"

# Получить JSON с точными ритмами
# Использовать для сложности в игре
\`\`\`

#### 3. Динамическая сложность
\`\`\`typescript
// На основе плотности нот
const difficulty = {
  easy: beatmap.notes.length < 150,
  normal: beatmap.notes.length < 300,
  hard: beatmap.notes.length >= 300
}
\`\`\`

#### 4. Визуализация для игроков
- Показывать preview битмапа перед созданием бита
- Интерактивная визуализация качества бита
- Мини-игра "доведи бит до ума"

---

## 🎯 Выводы

### Преимущества этой системы

✅ **Автоматический анализ** - не нужно вручную размечать треки
✅ **Точность** - использует профессиональные алгоритмы librosa
✅ **Гибкость** - 3 уровня сложности из одного трека
✅ **Совместимость** - экспорт в OSU! формат
✅ **Визуализация** - красивый HTML интерфейс

### Технические детали

**Python зависимости:**
\`\`\`bash
pip install librosa numpy
\`\`\`

**Требования:**
- Python 3.7+
- ffmpeg (для librosa)
- Современный браузер (для visualizer)

---

## 🚀 Как запустить

### 1. Анализ трека
\`\`\`bash
python beatmap_analyzer.py "Infernal Pulse.mp3"
\`\`\`

### 2. Просмотр визуализации
\`\`\`bash
open beatmap_visualizer.html
# Или
python -m http.server 8000
# Затем открыть http://localhost:8000/beatmap_visualizer.html
\`\`\`

### 3. Интеграция в игру
\`\`\`typescript
// Загрузить beatmap
const beatmap = await fetch('/api/beatmaps/infernal-pulse.json')
const data = await beatmap.json()

// Использовать ноты
data.notes.forEach(note => {
  spawnNote(note.time, note.type, note.strength)
})
\`\`\`

---

## 📝 Формат JSON beatmap

\`\`\`json
{
  "metadata": {
    "title": "Infernal Pulse",
    "artist": "Suno AI",
    "duration": 137.68,
    "bpm": 132.51,
    "difficulty": "normal"
  },
  "timing": {
    "beats": [14.34, 14.80, 15.25, ...]  // Метрическая сетка
  },
  "notes": [
    {
      "time": 14.338,
      "type": "kick",
      "strength": "strong"
    },
    {
      "time": 14.466,
      "type": "kick",
      "strength": "weak"
    },
    ...
  ]
}
\`\`\`

---

## 🎨 Цветовая схема визуализатора

| Тип | Цвет | Emoji | Описание |
|-----|------|-------|----------|
| Kick | #ff006e (Розовый) | 💥 | Бас-бочка, низкие частоты |
| Snare | #8338ec (Фиолетовый) | 🔔 | Малый барабан, средние частоты |
| Hi-hat | #39ff14 (Зелёный) | ✨ | Хай-хэт, высокие частоты |
| Note | #ffc300 (Жёлтый) | 🎹 | Другие инструменты |

---

## 💭 Идеи для Producer Tycoon

### 1. Beat Creation Mini-Game
- Игрок создаёт бит, играя ритм-игру
- Точность = качество бита
- BPM влияет на сложность

### 2. Track Analysis System
- Анализировать загруженные треки игроков (если разрешено)
- Показывать "профиль ритма"
- Сравнивать с профессиональными битами

### 3. Difficulty-Based Pricing
- Сложные биты (больше нот) = выше цена
- Простые биты = быстрее создать
- Баланс между сложностью и скоростью

### 4. Collaboration System
- Игроки создают beatmap вместе
- Один делает kick/snare, другой hihat
- Синхронизация через WebSocket

---

**Создано:** 2025-10-20
**Автор анализа:** Claude Code
**Трек:** Infernal Pulse by Suno AI
**Технологии:** Python, librosa, HTML/CSS/JS
