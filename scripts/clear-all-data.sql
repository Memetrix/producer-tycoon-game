-- ============================================================================
-- CLEAR ALL GAME DATA
-- WARNING: This will DELETE ALL users and their game data!
-- Use only in development/testing
-- ============================================================================

-- Step 1: Check what we have before deletion
SELECT 'BEFORE DELETION:' as status;
SELECT 'players' as table_name, COUNT(*) as count FROM players
UNION ALL
SELECT 'game_state', COUNT(*) FROM game_state
UNION ALL
SELECT 'beats', COUNT(*) FROM beats
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'player_artists', COUNT(*) FROM player_artists
UNION ALL
SELECT 'player_courses', COUNT(*) FROM player_courses;

-- Step 2: Delete all data (order matters due to foreign keys)
-- Delete dependent tables first
DELETE FROM player_courses;
DELETE FROM player_artists;
DELETE FROM equipment;
DELETE FROM beats;
DELETE FROM game_state;

-- Delete players last (this has foreign key to auth.users)
DELETE FROM players;

-- Step 3: Check results
SELECT 'AFTER DELETION:' as status;
SELECT 'players' as table_name, COUNT(*) as count FROM players
UNION ALL
SELECT 'game_state', COUNT(*) FROM game_state
UNION ALL
SELECT 'beats', COUNT(*) FROM beats
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'player_artists', COUNT(*) FROM player_artists
UNION ALL
SELECT 'player_courses', COUNT(*) FROM player_courses;

-- Step 4: Optional - Delete auth users (only if you want to clear auth too)
-- UNCOMMENT BELOW LINES IF YOU WANT TO DELETE AUTH USERS TOO
-- WARNING: This will log everyone out and delete their accounts!
--
-- DELETE FROM auth.users;
--
-- SELECT 'Auth users cleared' as status;

SELECT '✅ All game data cleared successfully!' as result;
