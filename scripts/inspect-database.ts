/**
 * Complete Database Inspection
 * Checks all tables for any unexpected data or issues
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

async function inspectDatabase() {
  console.log('🔍 Полная инспекция базы данных\n')
  console.log('=' .repeat(60) + '\n')

  const tables = ['players', 'game_state', 'beats', 'equipment', 'player_artists', 'player_courses']

  // 1. Check row counts
  console.log('📊 ROW COUNTS:')
  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
    console.log(`  ${table}: ${count} rows`)
  }

  // 2. Check for any sample data in each table
  console.log('\n📋 SAMPLE DATA (first 3 rows from each table):\n')

  for (const table of tables) {
    console.log(`\n--- ${table.toUpperCase()} ---`)
    const { data, error } = await supabase.from(table).select('*').limit(3)

    if (error) {
      console.error(`  ❌ Error: ${error.message}`)
    } else if (!data || data.length === 0) {
      console.log('  ✅ Empty (no rows)')
    } else {
      console.log(`  ⚠️  Found ${data.length} rows:`)
      data.forEach((row, i) => {
        console.log(`    Row ${i + 1}:`, JSON.stringify(row, null, 2).split('\n').join('\n    '))
      })
    }
  }

  // 3. Check auth.users (if we can access it)
  console.log('\n\n👥 AUTH USERS:')
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.log('  ⚠️  Cannot access auth.users (might need admin privileges)')
      console.log(`  Error: ${error.message}`)
    } else {
      console.log(`  Total users: ${users?.length || 0}`)
      if (users && users.length > 0) {
        console.log('  User IDs:')
        users.forEach(user => {
          console.log(`    - ${user.id} (${user.email || 'no email'})`)
        })
      }
    }
  } catch (err: any) {
    console.log('  ℹ️  Auth users check skipped')
  }

  // 4. Summary
  console.log('\n' + '=' .repeat(60))
  console.log('✅ Инспекция завершена!')
}

inspectDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
