-- Comics migration — run in Supabase SQL editor
-- 1. Expand the type CHECK constraint to include 'comic'
-- 2. Add page_count column
-- 3. Insert the two comic works

-- Drop old type check constraint (PostgreSQL names it works_type_check)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'works'::regclass
      AND contype = 'c'
      AND conname LIKE '%type%'
  ) LOOP
    EXECUTE 'ALTER TABLE works DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE works
  ADD CONSTRAINT works_type_check
  CHECK (type IN ('novel', 'story', 'essay', 'comic'));

ALTER TABLE works
  ADD COLUMN IF NOT EXISTS page_count integer;

INSERT INTO works (title, slug, type, description, status, page_count, created_at, updated_at)
VALUES
  (
    'Frog Orchestra',
    'frog-orchestra-comic',
    'comic',
    'A graphic narrative adapted from the short story — raw ink sketches with orange accents, thirty-one wordless pages.',
    'published',
    31,
    '2026-04-20T00:00:00Z',
    '2026-04-20T00:00:00Z'
  ),
  (
    'My Galaxy at Multiverse',
    'my-galaxy-at-multiverse',
    'comic',
    'A visual story of displacement and wonder — bold outlines on mint green, thirty-six pages.',
    'published',
    36,
    '2026-04-17T00:00:00Z',
    '2026-04-17T00:00:00Z'
  )
ON CONFLICT (slug) DO NOTHING;
