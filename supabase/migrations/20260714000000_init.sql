create extension if not exists "pgcrypto";

-- ── Enums ──────────────────────────────────────────────────────────────────
create type bourdain_show as enum ('no_reservations', 'parts_unknown', 'the_layover');

-- ── Admins ─────────────────────────────────────────────────────────────────
create table admins (
  user_id    uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

-- ── Bourdain Locations ─────────────────────────────────────────────────────
create table bourdain_locations (
  id             uuid primary key default gen_random_uuid(),
  show           bourdain_show not null,
  season         smallint,
  episode        smallint,
  episode_title  text,
  location_name  text not null,
  city           text not null,
  country        text not null,
  lat            double precision not null,
  lng            double precision not null,
  description    text,
  air_date       date,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger bourdain_locations_updated_at
  before update on bourdain_locations
  for each row execute procedure set_updated_at();

-- ── Restaurants ────────────────────────────────────────────────────────────
create table restaurants (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  name         text not null,
  description  text,
  address      text,
  city         text not null,
  country      text not null,
  lat          double precision not null,
  lng          double precision not null,
  cuisine_type text,
  website      text,
  created_at   timestamptz not null default now()
);

-- ── Restaurant Images ──────────────────────────────────────────────────────
create table restaurant_images (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  user_id       uuid not null references auth.users on delete cascade,
  storage_path  text not null,
  caption       text,
  created_at    timestamptz not null default now()
);

-- ── Restaurant Comments ────────────────────────────────────────────────────
create table restaurant_comments (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  user_id       uuid not null references auth.users on delete cascade,
  body          text not null,
  created_at    timestamptz not null default now()
);

-- ── Restaurant Votes ───────────────────────────────────────────────────────
create table restaurant_votes (
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  user_id       uuid not null references auth.users on delete cascade,
  primary key (restaurant_id, user_id)
);

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table admins               enable row level security;
alter table bourdain_locations   enable row level security;
alter table restaurants          enable row level security;
alter table restaurant_images    enable row level security;
alter table restaurant_comments  enable row level security;
alter table restaurant_votes     enable row level security;

create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- admins
create policy "admins_self" on admins
  for select using (user_id = auth.uid());

-- bourdain_locations: public read, admin write
create policy "bourdain_public_read" on bourdain_locations
  for select using (true);
create policy "bourdain_admin_write" on bourdain_locations
  for all using (is_admin());

-- restaurants: public read, authenticated insert (own), admin delete
create policy "restaurants_public_read" on restaurants
  for select using (true);
create policy "restaurants_owner_insert" on restaurants
  for insert with check (user_id = auth.uid());
create policy "restaurants_owner_update" on restaurants
  for update using (user_id = auth.uid());
create policy "restaurants_admin_delete" on restaurants
  for delete using (user_id = auth.uid() or is_admin());

-- restaurant_images
create policy "images_public_read" on restaurant_images
  for select using (true);
create policy "images_owner_insert" on restaurant_images
  for insert with check (user_id = auth.uid());
create policy "images_owner_delete" on restaurant_images
  for delete using (user_id = auth.uid() or is_admin());

-- restaurant_comments
create policy "comments_public_read" on restaurant_comments
  for select using (true);
create policy "comments_owner_insert" on restaurant_comments
  for insert with check (user_id = auth.uid());
create policy "comments_owner_delete" on restaurant_comments
  for delete using (user_id = auth.uid() or is_admin());

-- restaurant_votes
create policy "votes_public_read" on restaurant_votes
  for select using (true);
create policy "votes_owner_insert" on restaurant_votes
  for insert with check (user_id = auth.uid());
create policy "votes_owner_delete" on restaurant_votes
  for delete using (user_id = auth.uid());
