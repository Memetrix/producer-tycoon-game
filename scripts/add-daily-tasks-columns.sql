-- Add columns to game_state table for daily tasks and training progress
ALTER TABLE game_state
ADD COLUMN IF NOT EXISTS daily_tasks_completed JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS daily_tasks_last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS training_progress JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the columns
COMMENT ON COLUMN game_state.daily_tasks_completed IS 'Array of task IDs completed today';
COMMENT ON COLUMN game_state.daily_tasks_last_reset IS 'Timestamp of last daily tasks reset';
COMMENT ON COLUMN game_state.daily_streak IS 'Current daily tasks completion streak';
COMMENT ON COLUMN game_state.training_progress IS 'Array of completed training item IDs';
