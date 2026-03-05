-- ============================================================
-- Gem Completeness Score
-- ============================================================
-- Each gem gets a 0–100 score based on 4 data-quality signals:
--   venue_id IS NOT NULL         → +25  (place)
--   is_rated = true              → +25  (ratings)
--   private_note IS NOT NULL     → +25  (reflection)
--   is_live_mined = true         → +25  (GPS-verified)
--
-- Purpose:
--   1. Gamification — shows users how "rich" each gem is
--   2. B2B data pipeline — high-score gems are premium data points
-- ============================================================

-- ── 1. Add column ────────────────────────────────────────────

ALTER TABLE public.user_gems
  ADD COLUMN IF NOT EXISTS completeness_score INTEGER NOT NULL DEFAULT 0
  CHECK (completeness_score BETWEEN 0 AND 100);

-- ── 2. Pure function — compute score from a row ──────────────

CREATE OR REPLACE FUNCTION public.compute_gem_completeness_score(
  p_venue_id        UUID,
  p_is_rated        BOOLEAN,
  p_private_note    TEXT,
  p_is_live_mined   BOOLEAN
) RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT
    (CASE WHEN p_venue_id    IS NOT NULL                              THEN 25 ELSE 0 END) +
    (CASE WHEN p_is_rated    = TRUE                                   THEN 25 ELSE 0 END) +
    (CASE WHEN p_private_note IS NOT NULL AND p_private_note <> ''   THEN 25 ELSE 0 END) +
    (CASE WHEN p_is_live_mined = TRUE                                 THEN 25 ELSE 0 END);
$$;

-- ── 3. Trigger function — recompute on INSERT / UPDATE ───────

CREATE OR REPLACE FUNCTION public.update_gem_completeness_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.completeness_score := public.compute_gem_completeness_score(
    NEW.venue_id,
    NEW.is_rated,
    NEW.private_note,
    NEW.is_live_mined
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gem_completeness ON public.user_gems;

CREATE TRIGGER trg_gem_completeness
  BEFORE INSERT OR UPDATE OF venue_id, is_rated, private_note, is_live_mined
  ON public.user_gems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gem_completeness_score();

-- ── 4. Backfill existing rows ────────────────────────────────

UPDATE public.user_gems
SET completeness_score = public.compute_gem_completeness_score(
  venue_id,
  is_rated,
  private_note,
  is_live_mined
)
WHERE completeness_score = 0;  -- only rows not yet scored (safe re-run)

-- Full recalc (in case a row already had 0 legitimately — double-update is cheap)
UPDATE public.user_gems
SET completeness_score = public.compute_gem_completeness_score(
  venue_id,
  is_rated,
  private_note,
  is_live_mined
);
