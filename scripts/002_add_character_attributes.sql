-- Add music_style and starting_bonus columns to players table
alter table public.players
add column if not exists music_style text,
add column if not exists starting_bonus text;
