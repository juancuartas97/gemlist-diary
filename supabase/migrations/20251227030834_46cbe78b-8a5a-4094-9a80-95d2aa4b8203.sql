-- =====================================================
-- RPG ACHIEVEMENT SYSTEM
-- =====================================================

-- 1. Achievement Definitions (static catalog)
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('artist_mastery', 'genre_dedication', 'venue_loyalty', 'special')),
  name TEXT NOT NULL,
  description TEXT,
  tier INTEGER DEFAULT 1 CHECK (tier BETWEEN 1 AND 3),
  threshold INTEGER,
  threshold_percent INTEGER,
  icon_emoji TEXT DEFAULT '🏆',
  color_tier TEXT CHECK (color_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. User Achievement Progress
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  reference_id UUID,
  reference_name TEXT,
  current_count INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id, reference_id)
);

-- 3. User Goals (Quest System)
CREATE TABLE public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('target_event', 'holy_grail_artist', 'holy_grail_venue')),
  reference_id UUID,
  reference_name TEXT NOT NULL,
  target_date DATE,
  completed_at TIMESTAMPTZ,
  completed_gem_id UUID REFERENCES public.user_gems(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Add genesis mint tracking to user_gems
ALTER TABLE public.user_gems ADD COLUMN IF NOT EXISTS is_genesis_mint BOOLEAN DEFAULT FALSE;

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Achievements are viewable by everyone (static catalog)
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

-- Only admins can manage achievements
CREATE POLICY "Admins can manage achievements"
  ON public.achievements FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own achievement progress
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert/update achievements (via triggers)
CREATE POLICY "System can manage user achievements"
  ON public.user_achievements FOR ALL
  USING (auth.uid() = user_id);

-- Users can manage their own goals
CREATE POLICY "Users can manage their own goals"
  ON public.user_goals FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- SEED ACHIEVEMENT DEFINITIONS
-- =====================================================

INSERT INTO public.achievements (slug, category, name, description, tier, threshold, icon_emoji, color_tier) VALUES
-- Artist Mastery
('artist_supporter', 'artist_mastery', 'Supporter', 'Collect 3 gems from the same artist', 1, 3, '🥉', 'bronze'),
('artist_diehard', 'artist_mastery', 'Die-hard', 'Collect 10 gems from the same artist', 2, 10, '🥈', 'silver'),
('artist_dayone', 'artist_mastery', 'Day One', 'Collect 20 gems from the same artist', 3, 20, '🥇', 'gold'),

-- Venue Loyalty
('venue_regular', 'venue_loyalty', 'Regular', 'Visit the same venue 3 times', 1, 3, '🏠', 'bronze'),
('venue_resident', 'venue_loyalty', 'Resident', 'Visit the same venue 5 times in one year', 2, 5, '🔑', 'silver'),
('venue_local_hero', 'venue_loyalty', 'Local Hero', 'Visit the same venue 12 times in one year', 3, 12, '👑', 'gold'),

-- Genre Dedication
('genre_explorer', 'genre_dedication', 'Explorer', 'Collect gems from 10 different genres', 1, 10, '🧭', 'silver'),

-- Special
('genesis_collector', 'special', 'Genesis Collector', 'Be the first to mine a gem at an event', 1, 1, '⚡', 'gold'),
('century_club', 'special', 'Century Club', 'Collect 100 total gems', 2, 100, '💯', 'gold'),
('half_century', 'special', 'Half Century', 'Collect 50 total gems', 1, 50, '🎯', 'silver'),
('first_gem', 'special', 'First Steps', 'Collect your first gem', 1, 1, '✨', 'bronze')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- TRIGGER: Check Genesis Mint on Gem Insert
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_genesis_mint()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_count INTEGER;
BEGIN
  -- Check if this is the first gem for this DJ at this event
  IF NEW.event_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_existing_count
    FROM user_gems
    WHERE event_id = NEW.event_id 
      AND dj_id = NEW.dj_id
      AND id != NEW.id;
    
    IF v_existing_count = 0 THEN
      NEW.is_genesis_mint := TRUE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_genesis_mint_trigger
  BEFORE INSERT ON public.user_gems
  FOR EACH ROW
  EXECUTE FUNCTION public.check_genesis_mint();

-- =====================================================
-- FUNCTION: Update Achievement Progress
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_achievement_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_artist_count INTEGER;
  v_venue_count INTEGER;
  v_total_gems INTEGER;
  v_genre_count INTEGER;
  v_achievement RECORD;
  v_dj_name TEXT;
  v_venue_name TEXT;
BEGIN
  -- Get DJ name for reference
  SELECT stage_name INTO v_dj_name FROM djs WHERE id = NEW.dj_id;
  
  -- Get venue name for reference
  SELECT name INTO v_venue_name FROM venues WHERE id = NEW.venue_id;

  -- =====================================================
  -- ARTIST MASTERY ACHIEVEMENTS
  -- =====================================================
  
  SELECT COUNT(*) INTO v_artist_count
  FROM user_gems
  WHERE user_id = NEW.user_id AND dj_id = NEW.dj_id;

  FOR v_achievement IN 
    SELECT * FROM achievements WHERE category = 'artist_mastery' ORDER BY threshold ASC
  LOOP
    INSERT INTO user_achievements (user_id, achievement_id, reference_id, reference_name, current_count, unlocked_at)
    VALUES (
      NEW.user_id,
      v_achievement.id,
      NEW.dj_id,
      v_dj_name,
      v_artist_count,
      CASE WHEN v_artist_count >= v_achievement.threshold THEN now() ELSE NULL END
    )
    ON CONFLICT (user_id, achievement_id, reference_id) 
    DO UPDATE SET 
      current_count = v_artist_count,
      reference_name = COALESCE(v_dj_name, user_achievements.reference_name),
      unlocked_at = CASE 
        WHEN user_achievements.unlocked_at IS NULL AND v_artist_count >= v_achievement.threshold 
        THEN now() 
        ELSE user_achievements.unlocked_at 
      END,
      updated_at = now();
  END LOOP;

  -- =====================================================
  -- VENUE LOYALTY ACHIEVEMENTS
  -- =====================================================
  
  IF NEW.venue_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_venue_count
    FROM user_gems
    WHERE user_id = NEW.user_id AND venue_id = NEW.venue_id;

    FOR v_achievement IN 
      SELECT * FROM achievements WHERE category = 'venue_loyalty' ORDER BY threshold ASC
    LOOP
      INSERT INTO user_achievements (user_id, achievement_id, reference_id, reference_name, current_count, unlocked_at)
      VALUES (
        NEW.user_id,
        v_achievement.id,
        NEW.venue_id,
        v_venue_name,
        v_venue_count,
        CASE WHEN v_venue_count >= v_achievement.threshold THEN now() ELSE NULL END
      )
      ON CONFLICT (user_id, achievement_id, reference_id) 
      DO UPDATE SET 
        current_count = v_venue_count,
        reference_name = COALESCE(v_venue_name, user_achievements.reference_name),
        unlocked_at = CASE 
          WHEN user_achievements.unlocked_at IS NULL AND v_venue_count >= v_achievement.threshold 
          THEN now() 
          ELSE user_achievements.unlocked_at 
        END,
        updated_at = now();
    END LOOP;
  END IF;

  -- =====================================================
  -- SPECIAL ACHIEVEMENTS (Total gems, First gem, etc.)
  -- =====================================================
  
  SELECT COUNT(*) INTO v_total_gems FROM user_gems WHERE user_id = NEW.user_id;
  
  -- First gem achievement
  IF v_total_gems = 1 THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_count, unlocked_at)
    SELECT NEW.user_id, id, 1, now()
    FROM achievements WHERE slug = 'first_gem'
    ON CONFLICT (user_id, achievement_id, reference_id) DO NOTHING;
  END IF;
  
  -- Half century (50 gems)
  IF v_total_gems >= 50 THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_count, unlocked_at)
    SELECT NEW.user_id, id, v_total_gems, now()
    FROM achievements WHERE slug = 'half_century'
    ON CONFLICT (user_id, achievement_id, reference_id) 
    DO UPDATE SET current_count = v_total_gems, unlocked_at = COALESCE(user_achievements.unlocked_at, now());
  END IF;
  
  -- Century club (100 gems)
  IF v_total_gems >= 100 THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_count, unlocked_at)
    SELECT NEW.user_id, id, v_total_gems, now()
    FROM achievements WHERE slug = 'century_club'
    ON CONFLICT (user_id, achievement_id, reference_id) 
    DO UPDATE SET current_count = v_total_gems, unlocked_at = COALESCE(user_achievements.unlocked_at, now());
  END IF;
  
  -- Genesis collector (first to mine)
  IF NEW.is_genesis_mint = TRUE THEN
    INSERT INTO user_achievements (user_id, achievement_id, reference_id, current_count, unlocked_at)
    SELECT NEW.user_id, id, NEW.id, 1, now()
    FROM achievements WHERE slug = 'genesis_collector'
    ON CONFLICT (user_id, achievement_id, reference_id) DO NOTHING;
  END IF;

  -- =====================================================
  -- GENRE EXPLORER ACHIEVEMENT
  -- =====================================================
  
  SELECT COUNT(DISTINCT primary_genre_id) INTO v_genre_count
  FROM user_gems
  WHERE user_id = NEW.user_id;
  
  IF v_genre_count >= 10 THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_count, unlocked_at)
    SELECT NEW.user_id, id, v_genre_count, now()
    FROM achievements WHERE slug = 'genre_explorer'
    ON CONFLICT (user_id, achievement_id, reference_id) 
    DO UPDATE SET current_count = v_genre_count, unlocked_at = COALESCE(user_achievements.unlocked_at, now());
  ELSE
    INSERT INTO user_achievements (user_id, achievement_id, current_count)
    SELECT NEW.user_id, id, v_genre_count
    FROM achievements WHERE slug = 'genre_explorer'
    ON CONFLICT (user_id, achievement_id, reference_id) 
    DO UPDATE SET current_count = v_genre_count;
  END IF;

  -- =====================================================
  -- CHECK IF ANY GOALS ARE COMPLETED
  -- =====================================================
  
  UPDATE user_goals
  SET completed_at = now(), completed_gem_id = NEW.id
  WHERE user_id = NEW.user_id
    AND completed_at IS NULL
    AND (
      (goal_type = 'holy_grail_artist' AND reference_id = NEW.dj_id)
      OR (goal_type = 'holy_grail_venue' AND reference_id = NEW.venue_id)
      OR (goal_type = 'target_event' AND reference_id = NEW.event_id)
    );

  RETURN NEW;
END;
$$;

CREATE TRIGGER update_achievement_progress_trigger
  AFTER INSERT ON public.user_gems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_achievement_progress();

-- =====================================================
-- FUNCTION: Get Artist Leaderboard
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_artist_leaderboard(p_dj_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  gem_count BIGINT,
  first_collected TIMESTAMPTZ,
  rank BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.display_name,
    p.avatar_url,
    COUNT(ug.id) as gem_count,
    MIN(ug.collected_at) as first_collected,
    RANK() OVER (ORDER BY COUNT(ug.id) DESC, MIN(ug.collected_at) ASC) as rank
  FROM user_gems ug
  JOIN profiles p ON p.id = ug.user_id
  WHERE ug.dj_id = p_dj_id
  GROUP BY p.id, p.display_name, p.avatar_url
  ORDER BY rank
  LIMIT p_limit;
END;
$$;