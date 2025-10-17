/**
 * Clear All Auth Users
 * WARNING: This will delete ALL authenticated users!
 * Use only in development/testing
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials!')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function clearAllAuthUsers() {
  console.log('🗑️  Удаление всех auth пользователей...\n')

  // Step 1: List all users
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('❌ Error listing users:', listError.message)
    process.exit(1)
  }

  console.log(`📊 Найдено пользователей: ${users.length}`)

  if (users.length === 0) {
    console.log('✅ Нет пользователей для удаления')
    return
  }

  console.log('\n👥 Пользователи:')
  users.forEach((user, i) => {
    console.log(`  ${i + 1}. ${user.email || 'no email'} (${user.id})`)
  })

  console.log('\n⚠️  WARNING: Удаление всех пользователей через 5 секунд...')
  console.log('Press Ctrl+C to cancel\n')

  await new Promise(resolve => setTimeout(resolve, 5000))

  // Step 2: Delete all users
  console.log('🗑️  Deleting users...\n')

  let successCount = 0
  let errorCount = 0

  for (const user of users) {
    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (error) {
      console.error(`  ❌ Failed to delete ${user.email}: ${error.message}`)
      errorCount++
    } else {
      console.log(`  ✅ Deleted ${user.email || user.id}`)
      successCount++
    }
  }

  // Step 3: Verify
  console.log('\n📊 Results:')
  console.log(`  ✅ Successfully deleted: ${successCount}`)
  console.log(`  ❌ Failed to delete: ${errorCount}`)

  const { data: { users: remainingUsers } } = await supabase.auth.admin.listUsers()
  console.log(`  📊 Remaining users: ${remainingUsers.length}`)

  if (remainingUsers.length === 0) {
    console.log('\n✅ Все пользователи успешно удалены!')
  } else {
    console.log('\n⚠️  Остались пользователи:')
    remainingUsers.forEach(user => {
      console.log(`    - ${user.email || user.id}`)
    })
  }
}

clearAllAuthUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
