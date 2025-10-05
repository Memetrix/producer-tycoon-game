-- Restore energy to full for testing
UPDATE game_state
SET energy = 100
WHERE id IN (
  SELECT id FROM game_state
  ORDER BY updated_at DESC
  LIMIT 1
);
