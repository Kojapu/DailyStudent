-- =============================================================================
-- DailyStudent — Grade Data Isolation
-- Run this in: Supabase Dashboard → SQL Editor → New query → Paste → Run
-- Reason: abi_halbjahre in profiles was silently overwritten by concurrent
-- profile syncs. Dedicated table provides isolated, reliable grade storage.
-- =============================================================================

CREATE TABLE IF NOT EXISTS grade_data (
  user_id      UUID        PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  abi_halbjahre JSONB      NOT NULL DEFAULT '[]',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE grade_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own grade data"
  ON grade_data
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Backfill: migrate existing abi_halbjahre from profiles into grade_data
-- Only inserts rows where profiles.abi_halbjahre is not null and grade_data row doesn't exist
INSERT INTO grade_data (user_id, abi_halbjahre)
SELECT id, abi_halbjahre
FROM profiles
WHERE abi_halbjahre IS NOT NULL
  AND abi_halbjahre != 'null'::jsonb
  AND abi_halbjahre != '[]'::jsonb
ON CONFLICT (user_id) DO NOTHING;
