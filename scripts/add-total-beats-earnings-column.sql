-- Add total_beats_earnings column to game_state table
-- This tracks earnings specifically from selling beats (not including passive income from artists)

ALTER TABLE game_state
ADD COLUMN IF NOT EXISTS total_beats_earnings INTEGER DEFAULT 0;

-- Update existing records to set total_beats_earnings to 0 if NULL
UPDATE game_state
SET total_beats_earnings = 0
WHERE total_beats_earnings IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN game_state.total_beats_earnings IS 'Total money earned from selling beats only (excludes passive income from artists)';
