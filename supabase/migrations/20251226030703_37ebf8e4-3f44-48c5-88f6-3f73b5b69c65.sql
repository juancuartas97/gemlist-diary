-- Update user_gems to point to the first (oldest) DJ for each duplicate set
UPDATE user_gems ug
SET dj_id = (
  SELECT d2.id
  FROM djs d1
  JOIN djs d2 ON LOWER(TRIM(d1.stage_name)) = LOWER(TRIM(d2.stage_name))
  WHERE d1.id = ug.dj_id
  ORDER BY d2.created_at ASC
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM djs d1
  JOIN djs d2 ON LOWER(TRIM(d1.stage_name)) = LOWER(TRIM(d2.stage_name)) AND d1.id != d2.id
  WHERE d1.id = ug.dj_id
);

-- Now delete duplicate DJs keeping only the first one (by created_at)
DELETE FROM djs a
USING djs b
WHERE a.created_at > b.created_at
  AND LOWER(TRIM(a.stage_name)) = LOWER(TRIM(b.stage_name));

-- Create a unique index on lowercased stage_name to prevent future duplicates
CREATE UNIQUE INDEX djs_stage_name_unique_idx ON djs (LOWER(TRIM(stage_name)));