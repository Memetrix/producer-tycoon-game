-- Add character_profiles table for stable character generation
CREATE TABLE IF NOT EXISTS character_profiles (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL REFERENCES players(user_id) ON DELETE CASCADE,
  character_id text UNIQUE NOT NULL,
  seed bigint NOT NULL,
  style_mode text NOT NULL DEFAULT 'celshade_2000s',
  stylization int NOT NULL DEFAULT 60,
  epoch text NOT NULL DEFAULT '2000s_early',
  music_style text NOT NULL,
  layers jsonb NOT NULL DEFAULT '{}',
  palette text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_character_profiles_user_id ON character_profiles(user_id);
CREATE INDEX idx_character_profiles_character_id ON character_profiles(character_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_character_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_character_profiles_updated_at
  BEFORE UPDATE ON character_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_character_profiles_updated_at();

-- Enable RLS
ALTER TABLE character_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on character_profiles" ON character_profiles
  FOR ALL USING (true) WITH CHECK (true);
