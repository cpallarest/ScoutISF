-- Tabla de campos destacados
create table if not exists public.featured_fields (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  system text not null, -- ej: '4-3-3', '4-2-3-1'
  created_at timestamptz default now()
);

-- Tabla de jugadores colocados en el campo destacado
create table if not exists public.featured_field_players (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.featured_fields(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  x numeric not null,  -- 0-100 posición horizontal
  y numeric not null,  -- 0-100 posición vertical
  note text,
  created_at timestamptz default now()
);

-- RLS
alter table public.featured_fields enable row level security;
alter table public.featured_field_players enable row level security;

create policy "featured_fields_by_owner"
  on public.featured_fields
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "featured_field_players_by_owner"
  on public.featured_field_players
  for all
  using (
    auth.uid() = (
      select user_id from public.featured_fields f
      where f.id = field_id
    )
  )
  with check (
    auth.uid() = (
      select user_id from public.featured_fields f
      where f.id = field_id
    )
  );
