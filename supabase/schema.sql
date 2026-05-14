-- TJ Publishing House — Supabase Schema
-- Run this in your Supabase SQL editor

-- Works table (novels, short stories, essays)
create table if not exists works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  type text not null check (type in ('novel', 'story', 'essay')),
  description text,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Chapters table
-- Novels: many chapters. Stories & Essays: exactly one chapter (the content).
create table if not exists chapters (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references works(id) on delete cascade,
  title text not null,
  slug text not null,
  order_num integer not null default 1,
  content jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(work_id, slug)
);

-- Auto-update updated_at on works
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger works_updated_at
  before update on works
  for each row execute function update_updated_at();

create trigger chapters_updated_at
  before update on chapters
  for each row execute function update_updated_at();

-- Indexes
create index if not exists works_type_idx on works(type);
create index if not exists works_status_idx on works(status);
create index if not exists works_featured_idx on works(featured);
create index if not exists chapters_work_id_idx on chapters(work_id);
create index if not exists chapters_order_idx on chapters(work_id, order_num);

-- Row Level Security
alter table works enable row level security;
alter table chapters enable row level security;

-- Public can read published works
create policy "Public read published works"
  on works for select
  using (status = 'published');

-- Public can read published chapters
create policy "Public read published chapters"
  on chapters for select
  using (status = 'published');

-- Authenticated users (admin) can do everything
create policy "Admin full access works"
  on works for all
  using (auth.role() = 'authenticated');

create policy "Admin full access chapters"
  on chapters for all
  using (auth.role() = 'authenticated');

-- Storage bucket for cover images
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "Public read covers"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "Admin upload covers"
  on storage.objects for insert
  with check (bucket_id = 'covers' and auth.role() = 'authenticated');

create policy "Admin delete covers"
  on storage.objects for delete
  using (bucket_id = 'covers' and auth.role() = 'authenticated');
