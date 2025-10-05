-- Create players table
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  character_name text not null,
  character_avatar text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create game_state table
create table if not exists public.game_state (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade unique,
  money integer not null default 500,
  reputation integer not null default 0,
  energy integer not null default 100,
  stage integer not null default 0,
  total_beats_created integer not null default 0,
  total_money_earned integer not null default 0,
  updated_at timestamp with time zone default now()
);

-- Create beats table
create table if not exists public.beats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade,
  title text not null,
  cover_url text not null,
  quality integer not null,
  price integer not null,
  sold boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Create equipment table
create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade,
  equipment_type text not null,
  level integer not null default 1,
  updated_at timestamp with time zone default now(),
  unique(player_id, equipment_type)
);

-- Create artists table
create table if not exists public.player_artists (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade,
  artist_id text not null,
  hired_at timestamp with time zone default now(),
  unique(player_id, artist_id)
);

-- Create courses table
create table if not exists public.player_courses (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade,
  course_id text not null,
  purchased_at timestamp with time zone default now(),
  unique(player_id, course_id)
);

-- Enable RLS
alter table public.players enable row level security;
alter table public.game_state enable row level security;
alter table public.beats enable row level security;
alter table public.equipment enable row level security;
alter table public.player_artists enable row level security;
alter table public.player_courses enable row level security;

-- RLS Policies for players
create policy "Users can view their own player"
  on public.players for select
  using (auth.uid() = user_id);

create policy "Users can insert their own player"
  on public.players for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own player"
  on public.players for update
  using (auth.uid() = user_id);

-- RLS Policies for game_state
create policy "Users can view their own game state"
  on public.game_state for select
  using (player_id in (select id from public.players where user_id = auth.uid()));

create policy "Users can insert their own game state"
  on public.game_state for insert
  with check (player_id in (select id from public.players where user_id = auth.uid()));

create policy "Users can update their own game state"
  on public.game_state for update
  using (player_id in (select id from public.players where user_id = auth.uid()));

-- RLS Policies for beats
create policy "Users can view their own beats"
  on public.beats for select
  using (player_id in (select id from public.players where user_id = auth.uid()));

create policy "Users can insert their own beats"
  on public.beats for insert
  with check (player_id in (select id from public.players where user_id = auth.uid()));

create policy "Users can update their own beats"
  on public.beats for update
  using (player_id in (select id from public.players where user_id = auth.uid()));

create policy "Users can delete their own beats"
  on public.beats for delete
  using (player_id in (select id from public.players where user_id = auth.uid()));

-- RLS Policies for equipment
create policy "Users can view their own equipment"
  on public.equipment for select
  using (player_id in (select id from public.players where user_id = auth.uid()));

create policy "Users can insert their own equipment"
  on public.equipment for insert
  with check (player_id in (select id from public.players where user_id = auth.uid()));

create policy "Users can update their own equipment"
  on public.equipment for update
  using (player_id in (select id from public.players where user_id = auth.uid()));

-- RLS Policies for player_artists
create policy "Users can view their own artists"
  on public.player_artists for select
  using (player_id in (select id from public.players where user_id = auth.uid()));

create policy "Users can insert their own artists"
  on public.player_artists for insert
  with check (player_id in (select id from public.players where user_id = auth.uid()));

-- RLS Policies for player_courses
create policy "Users can view their own courses"
  on public.player_courses for select
  using (player_id in (select id from public.players where user_id = auth.uid()));

create policy "Users can insert their own courses"
  on public.player_courses for insert
  with check (player_id in (select id from public.players where user_id = auth.uid()));

-- Create indexes for better performance
create index if not exists players_user_id_idx on public.players(user_id);
create index if not exists game_state_player_id_idx on public.game_state(player_id);
create index if not exists beats_player_id_idx on public.beats(player_id);
create index if not exists equipment_player_id_idx on public.equipment(player_id);
create index if not exists player_artists_player_id_idx on public.player_artists(player_id);
create index if not exists player_courses_player_id_idx on public.player_courses(player_id);
