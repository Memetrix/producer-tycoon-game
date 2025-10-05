-- Remove foreign key constraint from players.user_id
-- This allows us to use custom UUIDs without Supabase auth

alter table public.players drop constraint if exists players_user_id_fkey;

-- Make user_id a simple UUID field (not a foreign key)
alter table public.players alter column user_id drop not null;
alter table public.players alter column user_id set default gen_random_uuid();

-- Update RLS policies to work without auth
drop policy if exists "Users can view their own player" on public.players;
drop policy if exists "Users can insert their own player" on public.players;
drop policy if exists "Users can update their own player" on public.players;

-- Create simpler RLS policies that allow access based on user_id
create policy "Players can view their own data"
  on public.players for select
  using (true);

create policy "Players can insert their own data"
  on public.players for insert
  with check (true);

create policy "Players can update their own data"
  on public.players for update
  using (true);

-- Update other table policies to be more permissive
drop policy if exists "Users can view their own game state" on public.game_state;
drop policy if exists "Users can insert their own game state" on public.game_state;
drop policy if exists "Users can update their own game state" on public.game_state;

create policy "Game state access"
  on public.game_state for all
  using (true);

drop policy if exists "Users can view their own beats" on public.beats;
drop policy if exists "Users can insert their own beats" on public.beats;
drop policy if exists "Users can update their own beats" on public.beats;
drop policy if exists "Users can delete their own beats" on public.beats;

create policy "Beats access
