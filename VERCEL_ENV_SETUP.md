# Настройка переменных окружения на Vercel

## Проблема

При деплое на Vercel возникала ошибка:
```
Error: supabaseUrl is required.
```

Это происходило потому, что переменные окружения не были настроены в Vercel проекте.

## Решение

Все необходимые переменные окружения были добавлены в Vercel через CLI.

## Установленные переменные

### ✅ Настроено (Production)

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Значение: `https://fptgtugvkebdmtzxiwrw.supabase.co`
   - Назначение: URL Supabase проекта
   - Видимость: Public (доступно в браузере)

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Значение: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Назначение: Публичный ключ Supabase для аутентификации
   - Видимость: Public (доступно в браузере)

3. **FAL_KEY**
   - Значение: `2e344922-f8bf-445a-88f0-4e08e1faa647:...`
   - Назначение: API ключ для генерации изображений через fal.ai
   - Видимость: Server-side only

4. **BLOB_READ_WRITE_TOKEN**
   - Значение: `vercel_blob_rw_0UGoRTR0sQPFtX2E...`
   - Назначение: Токен для Vercel Blob Storage
   - Видимость: Server-side only

5. **GROQ_API_KEY**
   - Значение: `PLACEHOLDER_ADD_YOUR_GROQ_KEY_HERE` ⚠️
   - Назначение: API ключ для генерации названий битов через Groq
   - Видимость: Server-side only
   - **Статус**: Требует замены на реальный ключ

## Как добавить/обновить переменные

### Через Vercel CLI

```bash
# Добавить новую переменную
vercel env add VARIABLE_NAME production

# Удалить переменную
vercel env rm VARIABLE_NAME production

# Посмотреть все переменные
vercel env ls
```

### Через Vercel Dashboard

1. Открыть проект на https://vercel.com
2. Перейти в Settings → Environment Variables
3. Добавить/изменить переменные
4. Сделать редеплой для применения изменений

## Получение GROQ API ключа

⚠️ **ВАЖНО**: Сейчас используется placeholder для GROQ_API_KEY

Чтобы включить генерацию названий битов:

1. Зарегистрироваться на https://console.groq.com
2. Создать API ключ
3. Добавить в Vercel:
```bash
vercel env add GROQ_API_KEY production
# Вставить реальный ключ при запросе
```
4. Сделать редеплой:
```bash
vercel --prod
```

## Что работает без GROQ_API_KEY?

✅ Работает:
- Аутентификация (Supabase)
- Сохранение прогресса
- Генерация обложек битов (fal.ai)
- Все игровые механики
- Лидерборды

❌ Не работает:
- Генерация названий битов через AI
- Будет использоваться fallback на дефолтные названия

## Проверка переменных

После деплоя можно проверить, что переменные применились:

```bash
# Посмотреть список переменных
vercel env ls

# Проверить последний деплой
vercel ls
```

## Безопасность

🔒 **Важно**:
- Переменные с префиксом `NEXT_PUBLIC_` доступны в браузере
- Остальные переменные доступны только на сервере
- Никогда не коммитьте `.env.local` в git
- Используйте `.env.example` для шаблона

## Troubleshooting

### Ошибка "supabaseUrl is required"
**Решение**: Переменные добавлены, нужен редеплой
```bash
vercel --prod
```

### Переменная не применяется
**Решение**: Убедитесь, что переменная добавлена для правильного окружения (production/preview/development)

### AI генерация не работает
**Решение**: Проверьте, что FAL_KEY и GROQ_API_KEY настроены правильно

## Статус

✅ **Все критические переменные настроены**
⚠️ **GROQ_API_KEY требует замены на реальный ключ**

Последний деплой: https://producer-tycoon-game-l7ftgzsl3-gakhaleksey-4260s-projects.vercel.app

---

**Дата**: 28 октября 2025
**Версия**: 1.0
