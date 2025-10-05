-- Add level column to player_artists table
ALTER TABLE player_artists
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;

-- Update existing records to have level 1 (they were "hired" so they should be level 1)
UPDATE player_artists
SET level = 1
WHERE level = 0;
