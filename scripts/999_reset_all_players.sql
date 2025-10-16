-- ⚠️ WARNING: This script resets ALL player progress to initial state
-- Use with caution! This action cannot be undone.
-- Recommended for: Testing, major economy updates, season resets

-- Reset all game_state records to initial values
UPDATE game_state
SET
  -- Core stats (Phase 1 values)
  money = 100,
  reputation = 0,
  energy = 150,
  stage = 1,
  
  -- Statistics
  total_beats_created = 0,
  total_money_earned = 0,
  total_beats_earnings = 0,
  
  -- Daily tasks and streaks
  daily_tasks_completed = '[]'::jsonb,
  daily_tasks_last_reset = NOW(),
  daily_streak = 0,
  
  -- Quests
  four_hour_quests_completed = ARRAY[]::text[],
  four_hour_quests_last_reset = NOW(),
  quest_rewards_active = '[]'::jsonb,
  quest_progress = '{}'::jsonb,
  
  -- Training
  training_progress = '{}'::jsonb,
  
  -- Phase 3 features
  skills_unlocked = ARRAY[]::text[],
  beat_contracts = jsonb_build_object(
    'available', '[]'::jsonb,
    'active', '[]'::jsonb,
    'completed', '[]'::jsonb,
    'lastRefresh', ''
  ),
  label_deals = ARRAY[]::text[],
  
  -- Update timestamp
  last_active = NOW(),
  updated_at = NOW()
WHERE true; -- Reset ALL players

-- Reset equipment table to initial state (only phone at level 1)
DELETE FROM equipment;
INSERT INTO equipment (player_id, equipment_type, level)
SELECT id, 'phone', 1
FROM players;

-- Reset player_artists table (remove all hired artists)
DELETE FROM player_artists;

-- Delete all beats
DELETE FROM beats;

-- Reset player_courses (remove all purchased courses)
DELETE FROM player_courses;

-- Verify the reset worked
DO $$
DECLARE
  reset_count INTEGER;
  equipment_count INTEGER;
  sample_money INTEGER;
  sample_reputation INTEGER;
BEGIN
  SELECT COUNT(*) INTO reset_count FROM game_state;
  SELECT COUNT(*) INTO equipment_count FROM equipment;
  SELECT money, reputation INTO sample_money, sample_reputation FROM game_state LIMIT 1;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESET COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Players reset: %', reset_count;
  RAISE NOTICE 'Equipment records: % (phone level 1)', equipment_count;
  RAISE NOTICE 'Sample player money: %', sample_money;
  RAISE NOTICE 'Sample player reputation: %', sample_reputation;
  RAISE NOTICE 'All artists, beats, and courses cleared';
  RAISE NOTICE '========================================';
  RAISE NOTICE '⚠️  IMPORTANT: Refresh the page to load new data!';
  RAISE NOTICE '========================================';
END $$;

-- Show current state of all players
SELECT 
  player_id,
  money,
  reputation,
  energy,
  stage,
  total_beats_created,
  daily_streak
FROM game_state
ORDER BY player_id;
