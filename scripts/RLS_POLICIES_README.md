# 🔒 RLS POLICIES SECURITY FIX

**Date:** 2025-10-21
**Priority:** 🔴 CRITICAL
**Status:** ✅ READY TO APPLY

---

## 🚨 ПРОБЛЕМА

**Критическая уязвимость безопасности:**
- Все RLS policies используют `using (true)` и `with check (true)`
- **ЛЮБОЙ** пользователь может читать/писать **ЛЮБЫЕ** данные
- Нет разделения данных между пользователями
- Возможна утечка персональных данных

**Затронутые таблицы:**
- `players` - профили игроков
- `game_state` - игровой прогресс
- `beats` - созданные биты
- `equipment` - оборудование
- `player_artists` - нанятые артисты
- `player_courses` - купленные курсы

---

## ✅ РЕШЕНИЕ

Создан файл миграции: `scripts/006_fix_rls_policies.sql`

**Что делает миграция:**
1. ✅ Удаляет старые permissive policies
2. ✅ Создаёт secure policies на основе `auth.uid()`
3. ✅ Разрешает только владельцу читать/писать свои данные
4. ✅ Создаёт публичный view для leaderboards
5. ✅ Разрешает публичное чтение beats (для лидерборда)

---

## 🔧 КАК ПРИМЕНИТЬ

### Вариант 1: Supabase Dashboard (рекомендуется)

1. Зайдите в **Supabase Dashboard** → **SQL Editor**
2. Создайте новый query
3. Скопируйте содержимое `scripts/006_fix_rls_policies.sql`
4. Вставьте в SQL Editor
5. Нажмите **Run** или **Ctrl+Enter**
6. Проверьте что все запросы выполнились успешно (зелёные галочки)

### Вариант 2: Через CLI (если используете Supabase CLI)

```bash
# Из корня проекта
supabase db push scripts/006_fix_rls_policies.sql
```

### Вариант 3: Programmatically (через TypeScript)

```typescript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // SERVICE ROLE KEY required

const supabase = createClient(supabaseUrl, supabaseKey)

const migrationSQL = fs.readFileSync('scripts/006_fix_rls_policies.sql', 'utf-8')

const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

if (error) {
  console.error('Migration failed:', error)
} else {
  console.log('✅ RLS policies migration successful!')
}
```

---

## 🧪 ТЕСТИРОВАНИЕ ПОСЛЕ МИГРАЦИИ

### Test 1: Проверка isolation

```typescript
// User A создаёт персонажа
const { data: playerA } = await supabase.auth.signInWithPassword({
  email: 'userA@example.com',
  password: 'password',
})

// User A создаёт beat
const { data: beatA } = await supabase.from('beats').insert({
  player_id: playerA.user.id,
  title: 'Test Beat A',
  // ...
})

// User B пытается прочитать beat User A
const { data: playerB } = await supabase.auth.signInWithPassword({
  email: 'userB@example.com',
  password: 'password',
})

// ✅ SHOULD SUCCEED - beats are public for leaderboards
const { data: beatsB } = await supabase.from('beats').select('*')

// ❌ SHOULD FAIL - User B cannot modify User A's beat
const { error } = await supabase.from('beats').update({
  sold: true
}).eq('id', beatA.id)

console.log(error) // Error: new row violates row-level security policy
```

### Test 2: Проверка leaderboards

```typescript
// Anonymous user (не залогинен)
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ✅ SHOULD SUCCEED - leaderboards view is public
const { data: leaderboards } = await supabaseAnon
  .from('leaderboards')
  .select('*')
  .limit(10)

console.log(leaderboards) // Should return top 10 players
```

### Test 3: Проверка game_state isolation

```typescript
// User A logged in
const { data: stateA } = await supabase
  .from('game_state')
  .select('*')
  .eq('player_id', playerA.id)

// ✅ SHOULD SUCCEED - own game state
console.log(stateA) // Returns User A's game state

// User B logged in
const { data: stateB } = await supabase
  .from('game_state')
  .select('*')
  .eq('player_id', playerA.id) // Try to read User A's state

// ❌ SHOULD FAIL or return empty array
console.log(stateB) // [] - empty array (filtered by RLS)
```

---

## 📊 ДО vs ПОСЛЕ

### ❌ ДО (INSECURE):

```sql
CREATE POLICY "Allow all operations on players"
  ON public.players FOR ALL
  USING (true)  -- ❌ Anyone can read/write ANY player
  WITH CHECK (true);
```

**Проблема:** User A может читать и модифицировать данные User B!

### ✅ ПОСЛЕ (SECURE):

```sql
CREATE POLICY "Users can view their own player"
  ON public.players FOR SELECT
  USING (auth.uid()::text = user_id);  -- ✅ Only own data

CREATE POLICY "Users can update their own player"
  ON public.players FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
```

**Результат:** User A может читать/писать только СВОИ данные!

---

## 🎯 SECURITY MODEL

### Таблицы с полной изоляцией:
- `players` - только свой профиль
- `game_state` - только свой прогресс
- `equipment` - только своё оборудование
- `player_artists` - только свои артисты
- `player_courses` - только свои курсы

### Таблицы с публичным чтением:
- `beats` - **SELECT для всех** (для leaderboards), **INSERT/UPDATE/DELETE только свои**

### Публичные views:
- `leaderboards` - топ 100 игроков (read-only, anonymous access)

---

## ⚠️ ВАЖНО

### После применения миграции:

1. **Убедитесь что Supabase Auth работает**
   - Все запросы должны быть от authenticated users
   - `auth.uid()` должен возвращать valid UUID

2. **Проверьте что anon key работает**
   - Leaderboards должны быть доступны без auth

3. **Обновите тесты**
   - Добавьте тесты для RLS policies
   - Убедитесь что isolation работает

4. **Мониторинг**
   - Следите за ошибками "violates row-level security policy"
   - Логируйте попытки несанкционированного доступа

---

## 🔍 ПРОВЕРКА СТАТУСА RLS

### Проверить включен ли RLS:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

**Ожидаемый результат:**
```
schemaname | tablename       | rowsecurity
-----------+-----------------+-------------
public     | players         | true
public     | game_state      | true
public     | beats           | true
public     | equipment       | true
public     | player_artists  | true
public     | player_courses  | true
```

### Проверить policies:

```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

**Должно быть:**
- 4 policies на каждую таблицу (SELECT, INSERT, UPDATE, DELETE)
- Всего ~24 policies

---

## 📝 ROLLBACK (если что-то пошло не так)

Если миграция сломала production:

```sql
-- Временно вернуть permissive policies (НЕ БЕЗОПАСНО!)
DROP POLICY IF EXISTS "Users can view their own player" ON public.players;
-- ... drop all other policies

CREATE POLICY "Allow all operations on players"
  ON public.players FOR ALL
  USING (true)
  WITH CHECK (true);

-- Repeat for other tables
```

**⚠️ ВНИМАНИЕ:** Это вернёт уязвимость! Используйте только для временного fix.

---

## ✅ CHECKLIST

- [ ] Создан backup базы данных
- [ ] Прочитана документация миграции
- [ ] Миграция применена в Supabase
- [ ] Проверены все policies (24 штуки)
- [ ] Протестирован isolation между users
- [ ] Протестирован leaderboards view
- [ ] Проверена работа игры после миграции
- [ ] Обновлен audit report
- [ ] Создан monitoring для RLS violations

---

## 📚 ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ

**Supabase RLS Docs:**
- https://supabase.com/docs/guides/auth/row-level-security
- https://supabase.com/docs/guides/database/postgres/row-level-security

**PostgreSQL RLS Docs:**
- https://www.postgresql.org/docs/current/ddl-rowsecurity.html

**Наш audit report:**
- `FULL_AUDIT_2025-10-21.md` → Issue #2

---

**Статус:** ✅ **READY TO APPLY**
**Estimated Time:** 5-10 минут
**Risk Level:** 🟡 MEDIUM (требует тестирования)
**Rollback Available:** ✅ YES
