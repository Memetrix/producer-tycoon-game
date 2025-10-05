-- Producer Tycoon Database Schema
-- This script creates all tables needed for the game
-- Uses simple player_id system (no Supabase Auth required)

-- Drop existing tables if they exist (for clean slate)
drop table if exists public.player_courses cascade;
drop table if exists public.player_artists cascade;
drop table if exists public.equipment cascade;
drop table if exists public.beats cascade;
drop table if exists public.game_state cascade;
drop table if exists public.players cascade;

-- Create players table
-- Stores basic player profile information
create table public.players (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique, -- Custom player ID from localStorage
  character_name text not null,
  character_avatar text not null, -- Made NOT NULL - avatar generation must work
  music_style text,
  starting_bonus text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create game_state table
-- Stores current game progress and resources
create table public.game_state (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade unique not null,
  money integer not null default 500,
  reputation integer not null default 0,
  energy integer not null default 100,
  stage integer not null default 1,
  total_beats_created integer not null default 0,
  total_money_earned integer not null default 0,
  updated_at timestamp with time zone default now()
);

-- Create beats table
-- Stores all beats created by players
create table public.beats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade not null,
  title text not null,
  cover_url text not null,
  quality integer not null,
  price integer not null,
  sold boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Create equipment table
-- Stores equipment levels for each player
create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade not null,
  equipment_type text not null,
  level integer not null default 1,
  updated_at timestamp with time zone default now(),
  unique(player_id, equipment_type)
);

-- Create player_artists table
-- Stores hired artists for each player
create table public.player_artists (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade not null,
  artist_id text not null,
  hired_at timestamp with time zone default now(),
  unique(player_id, artist_id)
);

-- Create player_courses table
-- Stores purchased courses/upgrades for each player
create table public.player_courses (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade not null,
  course_id text not null,
  purchased_at timestamp with time zone default now(),
  unique(player_id, course_id)
);

-- Create indexes for better query performance
create index players_user_id_idx on public.players(user_id);
create index game_state_player_id_idx on public.game_state(player_id);
create index beats_player_id_idx on public.beats(player_id);
create index beats_sold_idx on public.beats(sold);
create index equipment_player_id_idx on public.equipment(player_id);
create index player_artists_player_id_idx on public.player_artists(player_id);
create index player_courses_player_id_idx on public.player_courses(player_id);

-- Enable Row Level Security on all tables
alter table public.players enable row level security;
alter table public.game_state enable row level security;
alter table public.beats enable row level security;
alter table public.equipment enable row level security;
alter table public.player_artists enable row level security;
alter table public.player_courses enable row level security;

-- Create permissive RLS policies (no auth required)
-- Since we use custom player IDs, we allow all operations
-- Security is handled at the application level

-- Players table policies
create policy "Allow all operations on players"
  on public.players for all
  using (true)
  with check (true);

-- Game state table policies
create policy "Allow all operations on game_state"
  on public.game_state for all
  using (true)
  with check (true);

-- Beats table policies
create policy "Allow all operations on beats"
  on public.beats for all
  using (true)
  with check (true);

-- Equipment table policies
create policy "Allow all operations on equipment"
  on public.equipment for all
  using (true)
  with check (true);

-- Player artists table policies
create policy "Allow all operations on player_artists"
  on public.player_artists for all
  using (true)
  with check (true);

-- Player courses table policies
create policy "Allow all operations on player_courses"
  on public.player_courses for all
  using (true)
  with check (true);

-- Create function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for automatic timestamp updates
create trigger update_players_updated_at
  before update on public.players
  for each row
  execute function update_updated_at_column();

create trigger update_game_state_updated_at
  before update on public.game_state
  for each row
  execute function update_updated_at_column();

create trigger update_equipment_updated_at
  before update on public.equipment
  for each row
  execute function update_updated_at_column();

-- Additional triggers for beats table
create trigger update_beats_updated_at
  before update on public.beats
  for each row
  execute function update_updated_at_column();

-- Additional triggers for player_artists table
create trigger update_player_artists_updated_at
  before update on public.player_artists
  for each row
  execute function update_updated_at_column();

-- Additional triggers for player_courses table
create trigger update_player_courses_updated_at
  before update on public.player_courses
  for each row
  execute function update_updated_at_column();
