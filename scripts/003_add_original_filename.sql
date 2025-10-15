-- Add original_filename column to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS original_filename TEXT;
