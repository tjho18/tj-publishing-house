-- Run this in Supabase SQL editor (additions to existing schema)

-- Email subscribers
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

alter table subscribers enable row level security;

create policy "Anyone can subscribe"
  on subscribers for insert with check (true);

create policy "Admin read subscribers"
  on subscribers for select using (auth.role() = 'authenticated');

create policy "Admin delete subscribers"
  on subscribers for delete using (auth.role() = 'authenticated');

-- Site settings (about photo, etc.)
create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

alter table settings enable row level security;

create policy "Public read settings"
  on settings for select using (true);

create policy "Admin write settings"
  on settings for all using (auth.role() = 'authenticated');

-- Seed default settings
insert into settings (key, value) values ('about_photo_url', '')
on conflict (key) do nothing;
