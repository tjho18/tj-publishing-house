-- Insert the missing "Frog Orchestra" comic row.
-- The 31 page images are already deployed at /comics/frog-orchestra-comic/page-NN.jpg
-- Run this in the Supabase SQL editor. Safe to re-run (ON CONFLICT DO NOTHING).

-- Make sure the type constraint allows 'comic' (no-op if already correct).
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'works'::regclass AND contype = 'c' AND conname LIKE '%type%'
  ) LOOP
    EXECUTE 'ALTER TABLE works DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE works
  ADD CONSTRAINT works_type_check
  CHECK (type IN ('novel', 'story', 'essay', 'comic'));

ALTER TABLE works ADD COLUMN IF NOT EXISTS page_count integer;

INSERT INTO works (title, slug, type, description, status, page_count, created_at, updated_at)
VALUES (
  'Frog Orchestra',
  'frog-orchestra-comic',
  'comic',
  'A graphic narrative adapted from the short story — raw ink sketches with orange accents, thirty-one wordless pages.',
  'published',
  31,
  '2026-04-20T00:00:00Z',
  '2026-04-20T00:00:00Z'
)
ON CONFLICT (slug) DO NOTHING;
