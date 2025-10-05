# ТЗ: Матрица генерации аватаров в стиле MTV 2000-х

## Общая концепция

Система генерации уникальных аватаров для игроков музыкального симулятора Producer Tycoon. Целевая аудитория - поколение MTV (2000-е годы), ностальгирующее по эпохе хип-хопа, R&B и урбанистической культуры начала 2000-х.

## Текущая реализация

### Базовая структура промпта

\`\`\`
Disposable camera snapshot of a [GENDER] [ETHNICITY] [MUSIC_STYLE] music producer, named [NAME], [HAIRSTYLE], wearing [ACCESSORY], wearing [CLOTHING], [SETTING] background, [LIGHTING], 2000s hip-hop aesthetic, MTV era style, early 2000s fashion, Y2K vibes, disposable camera flash, slightly overexposed, film grain, candid moment, high quality, detailed face, 4k, photorealistic
\`\`\`

### Компоненты матрицы (100,000 комбинаций)

#### 1. GENDER (Пол)
- `male` - мужской
- `female` - женский

#### 2. ETHNICITY (Этническая принадлежность) - 7 вариантов
Для русскоязычной аудитории:
- `Slavic` - славянский тип
- `Russian` - русский тип
- `Eastern European` - восточноевропейский
- `Central Asian` - центральноазиатский (казахи, узбеки, киргизы)
- `Caucasian` - кавказский тип
- `mixed ethnicity` - смешанный тип
- `Eurasian` - евразийский тип

#### 3. MUSIC_STYLE (Музыкальный стиль) - 5 вариантов
Зависит от выбора игрока:
- `hip-hop` - хип-хоп продюсер
- `trap` - трэп продюсер
- `R&B` - R&B продюсер
- `pop` - поп продюсер
- `electronic` - электронный продюсер

#### 4. HAIRSTYLE (Прическа) - 10 вариантов
Иконические стили 2000-х:
- `spiky frosted tips hair` - шипастые осветленные кончики (как у *NSYNC)
- `cornrows braids` - косички (как у Ludacris, Allen Iverson)
- `buzz cut with design` - короткая стрижка с узором
- `dreadlocks` - дреды (как у Lil Wayne)
- `afro` - афро (классика)
- `slicked back with gel hair` - зализанные гелем волосы
- `messy layered hair` - небрежные многослойные волосы
- `mohawk fade` - ирокез с фейдом
- `curly top fade` - кудрявый топ с фейдом
- `man bun` - мужской пучок

#### 5. ACCESSORY (Аксессуары) - 10 вариантов
Культовые аксессуары эпохи:
- `oversized sunglasses` - огромные солнечные очки
- `bandana` - бандана
- `durag` - дюраг
- `snapback backwards` - кепка задом наперед
- `chunky chain necklace` - массивная цепь
- `diamond studs earrings` - бриллиантовые серьги-гвоздики
- `fitted cap` - облегающая кепка
- `headphones around neck` - наушники на шее
- `tinted glasses` - тонированные очки
- `clean look no accessories` - чистый образ без аксессуаров

#### 6. CLOTHING (Одежда) - 10 вариантов
Мода 2000-х:
- `baggy jersey` - мешковатая спортивная майка
- `leather jacket` - кожаная куртка
- `oversized hoodie` - огромная толстовка с капюшоном
- `velour tracksuit` - велюровый спортивный костюм (как у P.Diddy)
- `denim jacket with patches` - джинсовая куртка с нашивками
- `graphic t-shirt` - футболка с принтом
- `bomber jacket` - бомбер
- `white tank top` - белая майка-алкоголичка
- `varsity jacket` - университетская куртка
- `designer polo shirt` - дизайнерское поло

#### 7. SETTING (Сеттинг/Фон) - 10 вариантов
Культовые локации MTV эры:
- `MTV cribs style mansion` - особняк в стиле MTV Cribs
- `recording studio with equipment` - студия звукозаписи с оборудованием
- `graffiti wall urban` - городская стена с граффити
- `luxury car interior` - салон роскошного автомобиля
- `rooftop city skyline` - крыша с панорамой города
- `nightclub with neon lights` - ночной клуб с неоновыми огнями
- `basketball court` - баскетбольная площадка
- `penthouse apartment` - пентхаус
- `music video set with smoke` - съемочная площадка клипа с дымом
- `street corner urban` - уличный угол

#### 8. LIGHTING (Освещение/Эффекты) - 10 вариантов
Кинематографические эффекты 2000-х:
- `dramatic rim lighting` - драматичная контровая подсветка
- `colored gel lighting purple and blue` - цветной гель фиолетовый и синий
- `high contrast shadows` - высококонтрастные тени
- `soft focus with lens flare` - мягкий фокус с бликами объектива
- `fisheye lens effect` - эффект рыбий глаз
- `low angle hero shot` - героический кадр снизу
- `cinematic color grading teal and orange` - кинематографическая цветокоррекция (бирюзовый и оранжевый)
- `vintage film grain texture` - текстура винтажного пленочного зерна
- `neon glow effect` - эффект неонового свечения
- `golden hour warm lighting` - теплое освещение золотого часа

### Дополнительные ключевые слова (всегда присутствуют)

**Стилистические:**
- `2000s hip-hop aesthetic` - эстетика хип-хопа 2000-х
- `MTV era style` - стиль эпохи MTV
- `early 2000s fashion` - мода начала 2000-х
- `Y2K vibes` - вайбы Y2K (Year 2000)

**Технические (одноразовая камера):**
- `disposable camera flash` - вспышка одноразовой камеры
- `slightly overexposed` - слегка переэкспонировано
- `film grain` - пленочное зерно
- `candid moment` - спонтанный момент

**Качество:**
- `high quality` - высокое качество
- `detailed face` - детализированное лицо
- `4k` - разрешение 4K
- `photorealistic` - фотореалистичность

## Пример полного промпта

\`\`\`
Disposable camera snapshot of a male Slavic hip-hop music producer, named Gold Duck, spiky frosted tips hair, wearing oversized sunglasses, wearing baggy jersey, MTV cribs style mansion background, dramatic rim lighting, 2000s hip-hop aesthetic, MTV era style, early 2000s fashion, Y2K vibes, disposable camera flash, slightly overexposed, film grain, candid moment, high quality, detailed face, 4k, photorealistic
\`\`\`

## Математика комбинаций

\`\`\`
2 (gender) × 
7 (ethnicity) × 
5 (music style) × 
10 (hairstyle) × 
10 (accessory) × 
10 (clothing) × 
10 (setting) × 
10 (lighting) = 
7,000,000 уникальных комбинаций
\`\`\`

## Текущие проблемы и ограничения

1. **Качество генерации:** Не все комбинации дают одинаково хорошие результаты
2. **Этническое разнообразие:** Нужно больше вариантов для русскоязычной аудитории
3. **Женские образы:** Прически и аксессуары больше заточены под мужчин
4. **Консистентность:** Некоторые комбинации могут конфликтовать (например, mohawk + man bun)

## Идеи для улучшения

### 1. Гендерно-специфичные элементы

**Женские прически:**
- Long straight hair with highlights
- Box braids
- High ponytail with baby hairs
- Crimped hair
- Side-swept bangs
- Sleek bob cut

**Женские аксессуары:**
- Hoop earrings
- Butterfly clips
- Nameplate necklace
- Velvet choker
- Tinted lip gloss visible

### 2. Больше этнического разнообразия

- `Tatar` - татарский тип
- `Ukrainian` - украинский тип
- `Belarusian` - белорусский тип
- `Armenian` - армянский тип
- `Georgian` - грузинский тип
- `Azerbaijani` - азербайджанский тип

### 3. Специфичные стили для жанров

**Hip-Hop:**
- Больше уличной одежды
- Граффити фоны
- Золотые цепи

**R&B:**
- Более гладкий, элегантный стиль
- Студийные сеттинги
- Мягкое освещение

**Electronic:**
- Футуристичные элементы
- Неоновые цвета
- Клубные сеттинги

### 4. Эпохальные подстили

**Early 2000s (2000-2003):**
- Baggy everything
- Timberlands
- Bandanas
- Bling era

**Mid 2000s (2004-2006):**
- Fitted caps
- Tall tees
- Air Force 1s
- Snap music era

**Late 2000s (2007-2009):**
- Skinny jeans начинают появляться
- Kanye West influence
- Shutter shades
- Auto-tune era

### 5. Дополнительные визуальные эффекты

- `VHS tape distortion` - искажения VHS кассеты
- `MTV logo watermark style` - стиль водяного знака MTV
- `Behind the Music documentary feel` - ощущение документалки Behind the Music
- `Paparazzi flash photography` - фотография со вспышкой папарацци
- `Magazine cover composition` - композиция обложки журнала

### 6. Эмоции и позы

- `confident pose` - уверенная поза
- `arms crossed` - скрещенные руки
- `pointing at camera` - указывает на камеру
- `peace sign` - знак мира
- `serious expression` - серьезное выражение
- `slight smile` - легкая улыбка

## Технические детали реализации

### API: fal.ai
- Модель: `fal-ai/flux-pro/v1.1`
- Размер: 512x512 (квадратный аватар)
- Формат: JPEG

### Процесс генерации

1. Пользователь выбирает имя, пол, музыкальный стиль, стартовый бонус
2. Система случайно выбирает элементы из каждой категории матрицы
3. Формируется финальный промпт
4. Отправляется запрос в fal.ai API
5. Полученное изображение отображается на экране подтверждения
6. Пользователь может перегенерировать (новая случайная комбинация)
7. После подтверждения аватар сохраняется в базу данных

### Хранение

- URL аватара сохраняется в таблице `players` в поле `character_avatar`
- Изображения хостятся на серверах fal.ai
- Локальное кэширование не используется

## Метрики успеха

1. **Разнообразие:** Каждый игрок должен получать уникальный аватар
2. **Узнаваемость:** Стиль 2000-х должен быть очевиден
3. **Качество:** Лица должны быть детализированы и реалистичны
4. **Скорость:** Генерация не должна занимать более 10 секунд
5. **Удовлетворенность:** Игроки должны хотеть перегенерировать не более 2-3 раз

## Вопросы для обсуждения

1. Стоит ли добавить возможность ручного выбора элементов стиля?
2. Нужны ли пресеты для разных эпох (early/mid/late 2000s)?
3. Как улучшить женские образы?
4. Стоит ли добавить больше этнических типов?
5. Нужны ли анимированные аватары или GIF?
6. Как избежать конфликтующих комбинаций?
7. Стоит ли добавить negative prompts для фильтрации нежелательных элементов?

## Negative Prompts (что исключать)

Возможные элементы для добавления в negative prompt:
- `cartoon, anime, illustration, drawing, painting` - избегать нереалистичных стилей
- `blurry, low quality, pixelated` - избегать низкого качества
- `multiple people, group photo` - только один человек
- `nudity, inappropriate` - контент-фильтры
- `distorted face, deformed` - избегать искажений

## Roadmap

### Фаза 1 (Текущая) ✅
- Базовая матрица стилей
- Случайная генерация
- Кнопка перегенерации

### Фаза 2 (Планируется)
- Гендерно-специфичные элементы
- Больше этнического разнообразия
- Жанрово-специфичные стили

### Фаза 3 (Будущее)
- Ручная кастомизация элементов
- Пресеты эпох
- Сохранение избранных комбинаций
- Галерея аватаров сообщества

## Заключение

Текущая система генерации аватаров создает уникальные, стилизованные под 2000-е изображения с огромным количеством вариаций. Основные направления улучшения - гендерная специфичность, этническое разнообразие и жанровая дифференциация.
