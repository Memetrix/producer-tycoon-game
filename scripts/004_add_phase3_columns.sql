-- Add Phase 3 columns to game_state table for skills, contracts, and label deals

-- Skills: Array of unlocked skill IDs
ALTER TABLE game_state
ADD COLUMN IF NOT EXISTS skills_unlocked text[] DEFAULT '{}';

-- Beat Contracts: JSON object with available, active, completed contracts and last refresh date
ALTER TABLE game_state
ADD COLUMN IF NOT EXISTS beat_contracts jsonb DEFAULT '{"available": [], "active": [], "completed": [], "lastRefresh": ""}'::jsonb;

-- Label Deals: Array of signed label deal IDs (indie, small, major)
ALTER TABLE game_state
ADD COLUMN IF NOT EXISTS label_deals text[] DEFAULT '{}';

-- Add index for faster queries on skills
CREATE INDEX IF NOT EXISTS idx_game_state_skills ON game_state USING GIN (skills_unlocked);

-- Add index for faster queries on label deals
CREATE INDEX IF NOT EXISTS idx_game_state_labels ON game_state USING GIN (label_deals);

-- Update existing rows to have default values
UPDATE game_state
SET 
  skills_unlocked = COALESCE(skills_unlocked, '{}'),
  beat_contracts = COALESCE(beat_contracts, '{"available": [], "active": [], "completed": [], "lastRefresh": ""}'::jsonb),
  label_deals = COALESCE(label_deals, '{}')
WHERE skills_unlocked IS NULL OR beat_contracts IS NULL OR label_deals IS NULL;
