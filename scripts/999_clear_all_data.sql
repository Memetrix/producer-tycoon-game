-- Clear all data from database
-- Run this script to reset the game and start fresh

-- Delete data from child tables first (to respect foreign key constraints)
DELETE FROM player_courses;
DELETE FROM player_artists;
DELETE FROM equipment;
DELETE FROM beats;
DELETE FROM game_state;
DELETE FROM players;

-- Reset sequences (optional, if you want IDs to start from 1 again)
-- Note: This is PostgreSQL specific
ALTER SEQUENCE IF EXISTS players_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS game_state_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS beats_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS equipment_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS player_artists_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS player_courses_id_seq RESTART WITH 1;
