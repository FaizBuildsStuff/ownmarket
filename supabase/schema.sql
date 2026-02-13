-- Roles enum for dashboard views
create type public.user_role as enum ('admin', 'buyer', 'seller');

-- Basic profile table linked to Supabase auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  discord_handle text,
  role public.user_role default 'buyer',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- RLS: users can manage only their own profile
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- You can run this file in the Supabase SQL editor.
