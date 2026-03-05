-- =====================================================================
-- ACHIEVEMENT EXPANSION
-- Adds 8 new categories with 5 tiers each + expands existing to 5 tiers
-- Categories: critic, collector, explorer, city_collector, globe_trotter,
--             live_wire, streak, completionist
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- 1. EXPAND CONSTRAINTS
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE achievements DROP CONSTRAINT IF EXISTS achievements_category_check;
ALTER TABLE achievements DROP CONSTRAINT IF EXISTS achievements_tier_check;

ALTER TABLE achievements ADD CONSTRAINT achievements_category_check
  CHECK (category = ANY (ARRAY[
    'artist_mastery', 'genre_dedication', 'venue_loyalty', 'special',
    'critic', 'collector', 'explorer', 'city_collector', 'globe_trotter',
    'live_wire', 'streak', 'completionist'
  ]));

ALTER TABLE achievements ADD CONSTRAINT achievements_tier_check
  CHECK (tier >= 1 AND tier <= 5);

-- ─────────────────────────────────────────────────────────────────────
-- 2. NEW ACHIEVEMENT ROWS
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO achievements (slug, category, name, description, tier, threshold, icon_emoji, color_tier) VALUES
('artist_obsessed',    'artist_mastery',  'Obsessed',             'Collect 50 gems from the same artist',   4,   50, '🫀',  'platinum'),
('artist_devotee',     'artist_mastery',  'Devotee',              'Collect 100 gems from the same artist',  5,  100, '🕯️',  'platinum'),
('venue_institution',  'venue_loyalty',   'Institution',          'Visit the same venue 25 times',          4,   25, '🏛️',  'platinum'),
('venue_pillar',       'venue_loyalty',   'Pillar',               'Visit the same venue 50 times',          5,   50, '🗿',  'platinum'),
('critic_casual',      'critic',          'Casual Critic',        'Rate 3 sets',                            1,    3, '🎙️',  'bronze'),
('critic_regular',     'critic',          'Regular Reviewer',     'Rate 10 sets',                           2,   10, '📝',  'silver'),
('critic_discerning',  'critic',          'Discerning Ear',       'Rate 25 sets',                           3,   25, '👂',  'gold'),
('critic_press',       'critic',          'Music Press',          'Rate 50 sets',                           4,   50, '📰',  'platinum'),
('critic_oracle',      'critic',          'Oracle',               'Rate 100 sets',                          5,  100, '🔮',  'platinum'),
('collector_novice',   'collector',       'Novice Miner',         'Mine 5 gems',                            1,    5, '⛏️',  'bronze'),
('collector_rockhound','collector',       'Rock Hound',           'Mine 25 gems',                           2,   25, '🪨',  'silver'),
('collector_hunter',   'collector',       'Gem Hunter',           'Mine 50 gems',                           3,   50, '💎',  'gold'),
('collector_vault',    'collector',       'Crystal Vault',        'Mine 100 gems',                          4,  100, '🏦',  'platinum'),
('collector_legend',   'collector',       'Legendary Collector',  'Mine 250 gems',                          5,  250, '👑',  'platinum'),
('explorer_curious',   'explorer',        'Venue Curious',        'Log at 3 unique venues',                 1,    3, '🗺️',  'bronze'),
('explorer_scene',     'explorer',        'Scene Regular',        'Log at 5 unique venues',                 2,    5, '🎪',  'silver'),
('explorer_mappin',    'explorer',        'Map Pin',              'Log at 10 unique venues',                3,   10, '📍',  'silver'),
('explorer_circuit',   'explorer',        'Circuit Rider',        'Log at 25 unique venues',                4,   25, '🔁',  'gold'),
('explorer_collector', 'explorer',        'Venue Collector',      'Log at 50 unique venues',                5,   50, '🗃️',  'platinum'),
('city_local',         'city_collector',  'Local Scenester',      'Log shows in 2 cities',                  1,    2, '🏙️',  'bronze'),
('city_hopper',        'city_collector',  'City Hopper',          'Log shows in 5 cities',                  2,    5, '🚆',  'silver'),
('city_urban',         'city_collector',  'Urban Explorer',       'Log shows in 10 cities',                 3,   10, '🌆',  'gold'),
('city_nomad',         'city_collector',  'National Nomad',       'Log shows in 20 cities',                 4,   20, '🗺️',  'platinum'),
('city_national',      'city_collector',  'Country Completionist','Log shows in 35 cities',                 5,   35, '🧭',  'platinum'),
('globe_passport',     'globe_trotter',   'Passport Opened',      'Log shows in 2 countries',               1,    2, '🛂',  'bronze'),
('globe_frequent',     'globe_trotter',   'Frequent Flyer',       'Log shows in 3 countries',               2,    3, '✈️',  'silver'),
('globe_continent',    'globe_trotter',   'Continent Hopper',     'Log shows in 5 countries',               3,    5, '🌍',  'gold'),
('globe_trotter',      'globe_trotter',   'Globe Trotter',        'Log shows in 10 countries',              4,   10, '🌐',  'platinum'),
('globe_citizen',      'globe_trotter',   'World Citizen',        'Log shows in 15 countries',              5,   15, '🌏',  'platinum'),
('live_room',          'live_wire',       'In The Room',          'Mine 3 live verified gems',              1,    3, '📡',  'bronze'),
('live_verified',      'live_wire',       'Verified Regular',     'Mine 10 live verified gems',             2,   10, '✅',  'silver'),
('live_proof',         'live_wire',       'Proof of Life',        'Mine 25 live verified gems',             3,   25, '🎫',  'gold'),
('live_certified',     'live_wire',       'Certified Live',       'Mine 50 live verified gems',             4,   50, '🔒',  'platinum'),
('live_permanent',     'live_wire',       'Permanent Record',     'Mine 100 live verified gems',            5,  100, '⚡',  'platinum'),
('streak_start',       'streak',          'Getting Started',      '4 consecutive weeks logging',            1,    4, '🔥',  'bronze'),
('streak_regular',     'streak',          'Regular',              '8 consecutive weeks logging',            2,    8, '📅',  'silver'),
('streak_committed',   'streak',          'Committed',            '16 consecutive weeks logging',           3,   16, '💪',  'gold'),
('streak_devoted',     'streak',          'Devoted',              '26 consecutive weeks logging',           4,   26, '🎯',  'platinum'),
('streak_unstoppable', 'streak',          'Unstoppable',          '52 consecutive weeks logging',           5,   52, '🚀',  'platinum'),
('complete_thorough',  'completionist',   'Thorough',             'Log 3 fully detailed gems',              1,    3, '📋',  'bronze'),
('complete_detailed',  'completionist',   'Detailed',             'Log 10 fully detailed gems',             2,   10, '🗒️',  'silver'),
('complete_meticulous','completionist',   'Meticulous',           'Log 25 fully detailed gems',             3,   25, '🔬',  'gold'),
('complete_datanerd',  'completionist',   'Data Nerd',            'Log 50 fully detailed gems',             4,   50, '📊',  'platinum'),
('complete_perfect',   'completionist',   'Perfect Record',       'Log 100 fully detailed gems',            5,  100, '🏆',  'platinum')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- 3. HELPER: COMPUTE GLOBAL ACHIEVEMENT COUNTS FOR A USER
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.compute_global_achievement_counts(p_user_id UUID)
RETURNS TABLE (
  critic_count      INTEGER,
  collector_count   INTEGER,
  explorer_count    INTEGER,
  city_count        INTEGER,
  globe_count       INTEGER,
  live_count        INTEGER,
  streak_count      INTEGER,
  complete_count    INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Critic: gems with ≥1 non-null facet rating
    (SELECT COUNT(*)::INTEGER
     FROM user_gems
     WHERE user_id = p_user_id
       AND facet_ratings IS NOT NULL
       AND (
         ((facet_ratings->>'sound_quality') IS NOT NULL AND (facet_ratings->>'sound_quality') NOT IN ('null', ''))
         OR ((facet_ratings->>'energy') IS NOT NULL AND (facet_ratings->>'energy') NOT IN ('null', ''))
         OR ((facet_ratings->>'performance') IS NOT NULL AND (facet_ratings->>'performance') NOT IN ('null', ''))
         OR ((facet_ratings->>'crowd') IS NOT NULL AND (facet_ratings->>'crowd') NOT IN ('null', ''))
       )
    ),
    -- Collector: total gems
    (SELECT COUNT(*)::INTEGER FROM user_gems WHERE user_id = p_user_id),
    -- Explorer: unique venues
    (SELECT COUNT(DISTINCT venue_id)::INTEGER
     FROM user_gems WHERE user_id = p_user_id AND venue_id IS NOT NULL),
    -- City Collector: unique non-placeholder cities
    (SELECT COUNT(DISTINCT v.city)::INTEGER
     FROM user_gems ug
     JOIN venues v ON v.id = ug.venue_id
     WHERE ug.user_id = p_user_id
       AND v.city IS NOT NULL
       AND v.city NOT IN ('', 'Unknown City', 'Unknown')
    ),
    -- Globe Trotter: unique non-placeholder countries
    (SELECT COUNT(DISTINCT v.country)::INTEGER
     FROM user_gems ug
     JOIN venues v ON v.id = ug.venue_id
     WHERE ug.user_id = p_user_id
       AND v.country IS NOT NULL
       AND v.country NOT IN ('', 'Unknown', 'Unknown Country')
    ),
    -- Live Wire: GPS-verified gems
    (SELECT COUNT(*)::INTEGER FROM user_gems WHERE user_id = p_user_id AND is_live_mined = TRUE),
    -- Streak: longest consecutive week streak
    (SELECT COALESCE(MAX(streak_len), 0)::INTEGER
     FROM (
       SELECT COUNT(*) AS streak_len
       FROM (
         SELECT week_start,
                SUM(gap_flag) OVER (ORDER BY week_start) AS group_id
         FROM (
           SELECT DISTINCT DATE_TRUNC('week', event_date::timestamp) AS week_start,
                  CASE
                    WHEN DATE_TRUNC('week', event_date::timestamp)
                         - LAG(DATE_TRUNC('week', event_date::timestamp))
                           OVER (ORDER BY DATE_TRUNC('week', event_date::timestamp))
                         = INTERVAL '1 week'
                    THEN 0 ELSE 1
                  END AS gap_flag
           FROM user_gems
           WHERE user_id = p_user_id AND event_date IS NOT NULL
         ) weekly
       ) grouped
       GROUP BY group_id
     ) streak_groups
    ),
    -- Completionist: gems with venue + at least one non-null rating
    (SELECT COUNT(*)::INTEGER
     FROM user_gems
     WHERE user_id = p_user_id
       AND venue_id IS NOT NULL
       AND facet_ratings IS NOT NULL
       AND (
         ((facet_ratings->>'sound_quality') IS NOT NULL AND (facet_ratings->>'sound_quality') NOT IN ('null', ''))
         OR ((facet_ratings->>'energy') IS NOT NULL AND (facet_ratings->>'energy') NOT IN ('null', ''))
         OR ((facet_ratings->>'performance') IS NOT NULL AND (facet_ratings->>'performance') NOT IN ('null', ''))
         OR ((facet_ratings->>'crowd') IS NOT NULL AND (facet_ratings->>'crowd') NOT IN ('null', ''))
       )
    );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 4. HELPER: UPSERT A GLOBAL ACHIEVEMENT TIER
--    Takes id + threshold as separate args to avoid RECORD→row-type cast
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.upsert_global_achievement(
  p_user_id         UUID,
  p_achievement_id  UUID,
  p_threshold       INTEGER,
  p_current_count   INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_achievements SET
    current_count = p_current_count,
    unlocked_at   = CASE
      WHEN unlocked_at IS NULL AND p_current_count >= p_threshold THEN now()
      ELSE unlocked_at
    END,
    updated_at    = now()
  WHERE user_id       = p_user_id
    AND achievement_id = p_achievement_id
    AND reference_id IS NULL;

  IF NOT FOUND THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_count, unlocked_at)
    VALUES (
      p_user_id,
      p_achievement_id,
      p_current_count,
      CASE WHEN p_current_count >= p_threshold THEN now() ELSE NULL END
    );
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 5. REPLACE TRIGGER FUNCTION
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_achievement_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_artist_count    INTEGER;
  v_venue_count     INTEGER;
  v_total_gems      INTEGER;
  v_genre_count     INTEGER;
  v_achievement     RECORD;
  v_dj_name         TEXT;
  v_venue_name      TEXT;
  v_critic_count    INTEGER;
  v_collector_count INTEGER;
  v_explorer_count  INTEGER;
  v_city_count      INTEGER;
  v_globe_count     INTEGER;
  v_live_count      INTEGER;
  v_streak_count    INTEGER;
  v_complete_count  INTEGER;
BEGIN
  SELECT stage_name INTO v_dj_name    FROM djs    WHERE id = NEW.dj_id;
  SELECT name        INTO v_venue_name FROM venues WHERE id = NEW.venue_id;

  -- ARTIST MASTERY (per-DJ)
  SELECT COUNT(*) INTO v_artist_count
  FROM user_gems WHERE user_id = NEW.user_id AND dj_id = NEW.dj_id;

  FOR v_achievement IN
    SELECT * FROM achievements WHERE category = 'artist_mastery' ORDER BY threshold ASC
  LOOP
    INSERT INTO user_achievements (user_id, achievement_id, reference_id, reference_name, current_count, unlocked_at)
    VALUES (NEW.user_id, v_achievement.id, NEW.dj_id, v_dj_name, v_artist_count,
            CASE WHEN v_artist_count >= v_achievement.threshold THEN now() ELSE NULL END)
    ON CONFLICT (user_id, achievement_id, reference_id)
    DO UPDATE SET
      current_count  = v_artist_count,
      reference_name = COALESCE(v_dj_name, user_achievements.reference_name),
      unlocked_at    = CASE
        WHEN user_achievements.unlocked_at IS NULL AND v_artist_count >= v_achievement.threshold
        THEN now() ELSE user_achievements.unlocked_at
      END,
      updated_at = now();
  END LOOP;

  -- VENUE LOYALTY (per-venue)
  IF NEW.venue_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_venue_count
    FROM user_gems WHERE user_id = NEW.user_id AND venue_id = NEW.venue_id;

    FOR v_achievement IN
      SELECT * FROM achievements WHERE category = 'venue_loyalty' ORDER BY threshold ASC
    LOOP
      INSERT INTO user_achievements (user_id, achievement_id, reference_id, reference_name, current_count, unlocked_at)
      VALUES (NEW.user_id, v_achievement.id, NEW.venue_id, v_venue_name, v_venue_count,
              CASE WHEN v_venue_count >= v_achievement.threshold THEN now() ELSE NULL END)
      ON CONFLICT (user_id, achievement_id, reference_id)
      DO UPDATE SET
        current_count  = v_venue_count,
        reference_name = COALESCE(v_venue_name, user_achievements.reference_name),
        unlocked_at    = CASE
          WHEN user_achievements.unlocked_at IS NULL AND v_venue_count >= v_achievement.threshold
          THEN now() ELSE user_achievements.unlocked_at
        END,
        updated_at = now();
    END LOOP;
  END IF;

  -- SPECIAL
  SELECT COUNT(*) INTO v_total_gems FROM user_gems WHERE user_id = NEW.user_id;

  IF v_total_gems = 1 THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_count, unlocked_at)
    SELECT NEW.user_id, id, 1, now() FROM achievements WHERE slug = 'first_gem'
    ON CONFLICT (user_id, achievement_id, reference_id) DO NOTHING;
  END IF;

  IF v_total_gems >= 50 THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_count, unlocked_at)
    SELECT NEW.user_id, id, v_total_gems, now() FROM achievements WHERE slug = 'half_century'
    ON CONFLICT (user_id, achievement_id, reference_id)
    DO UPDATE SET current_count = v_total_gems, unlocked_at = COALESCE(user_achievements.unlocked_at, now());
  END IF;

  IF v_total_gems >= 100 THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_count, unlocked_at)
    SELECT NEW.user_id, id, v_total_gems, now() FROM achievements WHERE slug = 'century_club'
    ON CONFLICT (user_id, achievement_id, reference_id)
    DO UPDATE SET current_count = v_total_gems, unlocked_at = COALESCE(user_achievements.unlocked_at, now());
  END IF;

  IF NEW.is_genesis_mint = TRUE THEN
    INSERT INTO user_achievements (user_id, achievement_id, reference_id, current_count, unlocked_at)
    SELECT NEW.user_id, id, NEW.id, 1, now() FROM achievements WHERE slug = 'genesis_collector'
    ON CONFLICT (user_id, achievement_id, reference_id) DO NOTHING;
  END IF;

  -- GENRE EXPLORER
  SELECT COUNT(DISTINCT primary_genre_id) INTO v_genre_count
  FROM user_gems WHERE user_id = NEW.user_id;

  INSERT INTO user_achievements (user_id, achievement_id, current_count, unlocked_at)
  SELECT NEW.user_id, id, v_genre_count,
         CASE WHEN v_genre_count >= threshold THEN now() ELSE NULL END
  FROM achievements WHERE slug = 'genre_explorer'
  ON CONFLICT (user_id, achievement_id, reference_id)
  DO UPDATE SET
    current_count = v_genre_count,
    unlocked_at   = CASE
      WHEN user_achievements.unlocked_at IS NULL
       AND v_genre_count >= (SELECT threshold FROM achievements WHERE slug = 'genre_explorer')
      THEN now() ELSE user_achievements.unlocked_at
    END;

  -- NEW GLOBAL CATEGORIES
  SELECT
    r.critic_count, r.collector_count, r.explorer_count,
    r.city_count, r.globe_count, r.live_count,
    r.streak_count, r.complete_count
  INTO
    v_critic_count, v_collector_count, v_explorer_count,
    v_city_count, v_globe_count, v_live_count,
    v_streak_count, v_complete_count
  FROM compute_global_achievement_counts(NEW.user_id) r;

  FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'critic' ORDER BY threshold ASC
  LOOP
    PERFORM upsert_global_achievement(NEW.user_id, v_achievement.id, v_achievement.threshold, v_critic_count);
  END LOOP;

  FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'collector' ORDER BY threshold ASC
  LOOP
    PERFORM upsert_global_achievement(NEW.user_id, v_achievement.id, v_achievement.threshold, v_collector_count);
  END LOOP;

  FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'explorer' ORDER BY threshold ASC
  LOOP
    PERFORM upsert_global_achievement(NEW.user_id, v_achievement.id, v_achievement.threshold, v_explorer_count);
  END LOOP;

  FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'city_collector' ORDER BY threshold ASC
  LOOP
    PERFORM upsert_global_achievement(NEW.user_id, v_achievement.id, v_achievement.threshold, v_city_count);
  END LOOP;

  FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'globe_trotter' ORDER BY threshold ASC
  LOOP
    PERFORM upsert_global_achievement(NEW.user_id, v_achievement.id, v_achievement.threshold, v_globe_count);
  END LOOP;

  FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'live_wire' ORDER BY threshold ASC
  LOOP
    PERFORM upsert_global_achievement(NEW.user_id, v_achievement.id, v_achievement.threshold, v_live_count);
  END LOOP;

  FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'streak' ORDER BY threshold ASC
  LOOP
    PERFORM upsert_global_achievement(NEW.user_id, v_achievement.id, v_achievement.threshold, v_streak_count);
  END LOOP;

  FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'completionist' ORDER BY threshold ASC
  LOOP
    PERFORM upsert_global_achievement(NEW.user_id, v_achievement.id, v_achievement.threshold, v_complete_count);
  END LOOP;

  -- GOALS
  UPDATE user_goals
  SET completed_at = now(), completed_gem_id = NEW.id
  WHERE user_id = NEW.user_id
    AND completed_at IS NULL
    AND (
      (goal_type = 'holy_grail_artist' AND reference_id = NEW.dj_id)
      OR (goal_type = 'holy_grail_venue' AND reference_id = NEW.venue_id)
      OR (goal_type = 'target_event'    AND reference_id = NEW.event_id)
    );

  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 6. BACKFILL existing users
-- ─────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_user_id     UUID;
  v_achievement RECORD;
  v_counts      RECORD;
BEGIN
  FOR v_user_id IN SELECT DISTINCT user_id FROM user_gems LOOP
    SELECT * INTO v_counts FROM compute_global_achievement_counts(v_user_id);

    FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'critic' ORDER BY threshold ASC
    LOOP
      PERFORM upsert_global_achievement(v_user_id, v_achievement.id, v_achievement.threshold, v_counts.critic_count);
    END LOOP;

    FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'collector' ORDER BY threshold ASC
    LOOP
      PERFORM upsert_global_achievement(v_user_id, v_achievement.id, v_achievement.threshold, v_counts.collector_count);
    END LOOP;

    FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'explorer' ORDER BY threshold ASC
    LOOP
      PERFORM upsert_global_achievement(v_user_id, v_achievement.id, v_achievement.threshold, v_counts.explorer_count);
    END LOOP;

    FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'city_collector' ORDER BY threshold ASC
    LOOP
      PERFORM upsert_global_achievement(v_user_id, v_achievement.id, v_achievement.threshold, v_counts.city_count);
    END LOOP;

    FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'globe_trotter' ORDER BY threshold ASC
    LOOP
      PERFORM upsert_global_achievement(v_user_id, v_achievement.id, v_achievement.threshold, v_counts.globe_count);
    END LOOP;

    FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'live_wire' ORDER BY threshold ASC
    LOOP
      PERFORM upsert_global_achievement(v_user_id, v_achievement.id, v_achievement.threshold, v_counts.live_count);
    END LOOP;

    FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'streak' ORDER BY threshold ASC
    LOOP
      PERFORM upsert_global_achievement(v_user_id, v_achievement.id, v_achievement.threshold, v_counts.streak_count);
    END LOOP;

    FOR v_achievement IN SELECT id, threshold FROM achievements WHERE category = 'completionist' ORDER BY threshold ASC
    LOOP
      PERFORM upsert_global_achievement(v_user_id, v_achievement.id, v_achievement.threshold, v_counts.complete_count);
    END LOOP;

  END LOOP;
END $$;
