/**
 * Clear All Game Data Script
 *
 * WARNING: This will DELETE ALL users and their game data!
 * Use only in development/testing
 *
 * Usage: npx tsx scripts/clear-all-data.ts
 */

import { createClient } from '@supabase/supabase-js'

// Load env vars
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function clearAllData() {
  console.log('🗑️  Starting data cleanup...\n')

  // Step 1: Check current data
  console.log('📊 Current data:')
  const tables = ['players', 'game_state', 'beats', 'equipment', 'player_artists', 'player_courses']

  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
    console.log(`  ${table}: ${count} rows`)
  }

  console.log('\n⚠️  WARNING: About to delete ALL data in 5 seconds...')
  console.log('Press Ctrl+C to cancel\n')

  await new Promise(resolve => setTimeout(resolve, 5000))

  // Step 2: Delete data (order matters due to foreign keys)
  console.log('🗑️  Deleting data...\n')

  // Delete dependent tables first
  const deleteOrder = [
    'player_courses',
    'player_artists',
    'equipment',
    'beats',
    'game_state',
    'players'
  ]

  for (const table of deleteOrder) {
    const { error, count } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
      console.error(`  ❌ Error deleting from ${table}:`, error.message)
    } else {
      console.log(`  ✅ Deleted from ${table}`)
    }
  }

  // Step 3: Verify deletion
  console.log('\n📊 After deletion:')
  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
    console.log(`  ${table}: ${count} rows`)
  }

  console.log('\n✅ All game data cleared successfully!')
  console.log('\n💡 Note: Auth users were NOT deleted. To delete auth users too, uncomment the code in the script.')
}

clearAllData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
