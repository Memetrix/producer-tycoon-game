-- Restore energy to 100 for all players
UPDATE game_state 
SET energy = 100
WHERE true;

-- Show the updated values
SELECT player_id, energy, money, reputation 
FROM game_state;
