-- Drop all existing RLS policies that depend on auth.uid()
drop policy if exists "Users can view their own player" on public.players;
drop policy if exists "Users can insert their own player" on public.players;
drop policy if exists "Users can update their own player" on public.players;

drop policy if exists "Users can view their own game state" on public.game_state;
drop policy if exists "Users can insert their own game state" on public.game_state;
drop policy if exists "Users can update their own game state" on public.game_state;

drop policy if exists "Users can view their own beats" on public.beats;
drop policy if exists "Users can insert their own beats" on public.beats;
drop policy if exists "Users can update their own beats" on public.beats;
drop policy if exists "Users can delete their own beats" on public.beats;

drop policy if exists "Users can view their own equipment" on public.equipment;
drop policy if exists "Users can insert their own equipment" on public.equipment;
drop policy if exists "Users can update their own equipment" on public.equipment;

drop policy if exists "Users can view their own artists" on public.player_artists;
drop policy if exists "Users can insert their own artists" on public.player_artists;

drop policy if exists "Users can view their own courses" on public.player_courses;
drop policy if exists "Users can insert their own courses" on public.player_courses;

-- Create permissive RLS policies for single-player game
-- Players table - allow all operations
create policy "Allow all operations on players"
  on public.players for all
  using (true)
  with check (true);

-- Game state table - allow all operations
create policy "Allow all operations on game_state"
  on public.game_state for all
  using (true)
  with check (true);

-- Beats table - allow all operations
create policy "Allow all operations on beats"
  on public.beats for all
  using (true)
  with check (true);

-- Equipment table - allow all operations
create policy "Allow all operations on equipment"
  on public.equipment for all
  using (true)
  with check (true);

-- Player artists table - allow all operations
create policy "Allow all operations on player_artists"
  on public.player_artists for all
  using (true)
  with check (true);

-- Player courses table - allow all operations
create policy "Allow all operations on player_courses"
  on public.player_courses for all
  using (true)
  with check (true);
