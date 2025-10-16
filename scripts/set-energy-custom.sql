-- Fixed UUID casting by converting auth.uid() to text
-- Set energy to a custom value (change 100 to desired amount)
UPDATE game_state
SET 
  energy = 100,  -- Change this number to desired energy amount
  updated_at = NOW()
WHERE player_id = (
  SELECT id FROM players 
  WHERE user_id = auth.uid()::text 
  LIMIT 1
);

-- Verify the update
SELECT 
  energy as current_energy,
  updated_at
FROM game_state
WHERE player_id = (
  SELECT id FROM players 
  WHERE user_id = auth.uid()::text 
  LIMIT 1
);
