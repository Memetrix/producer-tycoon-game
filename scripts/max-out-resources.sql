-- Fixed UUID casting by converting auth.uid() to text
-- Max out all resources (energy, money, reputation)
-- Useful for testing
UPDATE game_state
SET 
  energy = 100,
  money = 999999,
  reputation = 50000,
  updated_at = NOW()
WHERE player_id = (
  SELECT id FROM players 
  WHERE user_id = auth.uid()::text 
  LIMIT 1
);

-- Verify the update
SELECT 
  energy,
  money,
  reputation,
  updated_at
FROM game_state
WHERE player_id = (
  SELECT id FROM players 
  WHERE user_id = auth.uid()::text 
  LIMIT 1
);
