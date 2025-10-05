-- Add last_active column to track when user was last in the app
-- This is used to calculate offline earnings (capped at 4 hours)

ALTER TABLE game_state
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have current timestamp
UPDATE game_state
SET last_active = NOW()
WHERE last_active IS NULL;
