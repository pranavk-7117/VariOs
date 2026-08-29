create table if not exists public.live_dindis (
  id text primary key,
  number integer not null,
  name text not null,
  leader text not null,
  pilgrim_count integer not null check (pilgrim_count > 0),
  current_segment text not null,
  current_pace_kmh numeric not null,
  standard_pace_kmh numeric not null,
  pace_drop_percent numeric not null default 0,
  eta_next_halt text not null default 'Calculating...',
  next_halt text not null default 'Nearest Halt',
  status text not null default 'NORMAL',
  lat double precision not null,
  lng double precision not null,
  weather_delay_minutes integer not null default 0,
  terrain_factor numeric not null default 1,
  rerouted boolean not null default false,
  reroute_target text,
  bypass_route_name text,
  is_custom_registered boolean not null default true,
  passcode text,
  route_color text not null default '#F97316',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.live_dindis enable row level security;

drop policy if exists "Allow public live dindi read" on public.live_dindis;
create policy "Allow public live dindi read"
on public.live_dindis
for select
using (true);

drop policy if exists "Allow public live dindi insert" on public.live_dindis;
create policy "Allow public live dindi insert"
on public.live_dindis
for insert
with check (is_custom_registered = true);

drop policy if exists "Allow public live dindi update" on public.live_dindis;
create policy "Allow public live dindi update"
on public.live_dindis
for update
using (is_custom_registered = true)
with check (is_custom_registered = true);
