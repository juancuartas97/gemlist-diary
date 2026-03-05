-- Migration: Retroactively recalculate rarity scores for all existing user_gems
--
-- Fixes two production bugs that were silently capping rarity scores:
--   1. event_series_id was always NULL in AddGemModal (max score was 90, not 100)
--   2. rarity_tier was stored as uppercase ('MYTHIC') but frontend expected lowercase
--
-- This migration re-runs calculate_rarity_score for every gem with the correct
-- series_id (from event_editions) and city (from venues), then stores the
-- lowercased tier string back to user_gems.

WITH recalculated AS (
  SELECT
    ug.id,
    rs.total_score,
    LOWER(rs.rarity_tier) AS rarity_tier
  FROM user_gems ug
  LEFT JOIN venues      v  ON v.id  = ug.venue_id
  LEFT JOIN event_editions ee ON ee.id = ug.edition_id
  CROSS JOIN LATERAL calculate_rarity_score(
    ug.dj_id,
    ug.venue_id,
    COALESCE(v.city, ''),
    ee.series_id,          -- was always NULL before; now correctly resolved
    ug.event_date
  ) rs
)
UPDATE user_gems ug
SET
  rarity_score = recalculated.total_score,
  rarity_tier  = recalculated.rarity_tier,
  updated_at   = NOW()
FROM recalculated
WHERE ug.id = recalculated.id;
