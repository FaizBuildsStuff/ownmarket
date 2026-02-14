-- Roles enum for dashboard views
create type public.user_role as enum ('admin', 'buyer', 'seller');

-- Basic profile table linked to Supabase auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  discord_handle text,
  discord_id text,
  discord_username text,
  discord_avatar text,
  role public.user_role default 'buyer',
  created_at timestamptz default now()
);

-- Run this if profiles already exists (add Discord columns):
-- alter table public.profiles add column if not exists discord_id text;
-- alter table public.profiles add column if not exists discord_username text;
-- alter table public.profiles add column if not exists discord_avatar text;

alter table public.profiles enable row level security;

-- RLS: users can manage only their own profile
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Public can read basic profile info for marketplace views
create policy "Anyone can view profiles"
  on public.profiles
  for select
  using (true);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Products listed by sellers
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  quantity integer not null default 1,
  description text,
  discord_channel_link text,
  created_at timestamptz default now()
);

alter table public.products enable row level security;

-- Everyone can read products
create policy "Anyone can view products"
  on public.products
  for select
  using (true);

-- Only owner can insert/update/delete their products
create policy "Sellers manage own products"
  on public.products
  for all
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

-- You can run this file in the Supabase SQL editor.
