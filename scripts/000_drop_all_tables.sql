-- Drop all tables in reverse order of dependencies
DROP TABLE IF EXISTS player_courses CASCADE;
DROP TABLE IF EXISTS player_artists CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS beats CASCADE;
DROP TABLE IF EXISTS game_state CASCADE;
DROP TABLE IF EXISTS players CASCADE;

-- Drop any custom types if they exist
DROP TYPE IF EXISTS music_style CASCADE;
DROP TYPE IF EXISTS starting_bonus CASCADE;
