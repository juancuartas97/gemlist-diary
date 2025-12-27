-- Update the calculate_rarity_score function to return lowercase tier names
CREATE OR REPLACE FUNCTION public.calculate_rarity_score(
  p_dj_id UUID,
  p_venue_id UUID,
  p_city TEXT,
  p_event_series_id UUID,
  p_event_date DATE
) 
RETURNS TABLE (
  total_score INTEGER,
  rarity_tier TEXT,
  venue_score INTEGER,
  city_score INTEGER,
  event_score INTEGER,
  volume_score INTEGER,
  venue_count INTEGER,
  city_count INTEGER,
  event_count INTEGER,
  year_count INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_venue_count INTEGER;
  v_city_count INTEGER;
  v_event_count INTEGER;
  v_year_count INTEGER;
  v_venue_score INTEGER;
  v_city_score INTEGER;
  v_event_score INTEGER;
  v_volume_score INTEGER;
  v_total_score INTEGER;
  v_tier TEXT;
BEGIN
  -- 1. Venue Scarcity (40 points max) - Last 5 years
  SELECT COUNT(*)::INTEGER INTO v_venue_count
  FROM dj_performances dp
  WHERE dp.dj_id = p_dj_id 
    AND dp.venue_id = p_venue_id
    AND dp.performance_date >= (p_event_date - INTERVAL '5 years');
  
  v_venue_score := CASE
    WHEN p_venue_id IS NULL THEN 20
    WHEN v_venue_count = 0 THEN 40
    WHEN v_venue_count = 1 THEN 35
    WHEN v_venue_count <= 3 THEN 28
    WHEN v_venue_count <= 5 THEN 20
    WHEN v_venue_count <= 10 THEN 10
    ELSE 5
  END;

  -- 2. City Frequency (30 points max) - Last 12 months
  SELECT COUNT(*)::INTEGER INTO v_city_count
  FROM dj_performances dp
  WHERE dp.dj_id = p_dj_id 
    AND LOWER(dp.city) = LOWER(COALESCE(p_city, ''))
    AND dp.performance_date >= (p_event_date - INTERVAL '12 months');
  
  v_city_score := CASE
    WHEN p_city IS NULL OR p_city = '' THEN 15
    WHEN v_city_count = 0 THEN 30
    WHEN v_city_count = 1 THEN 24
    WHEN v_city_count <= 3 THEN 18
    WHEN v_city_count <= 6 THEN 12
    WHEN v_city_count <= 12 THEN 6
    ELSE 3
  END;

  -- 3. Event History (20 points max) - All time
  SELECT COUNT(*)::INTEGER INTO v_event_count
  FROM dj_performances dp
  WHERE dp.dj_id = p_dj_id 
    AND dp.event_series_id = p_event_series_id
    AND p_event_series_id IS NOT NULL;
  
  v_event_score := CASE
    WHEN p_event_series_id IS NULL THEN 10
    WHEN v_event_count = 0 THEN 20
    WHEN v_event_count = 1 THEN 16
    WHEN v_event_count <= 3 THEN 12
    WHEN v_event_count <= 5 THEN 8
    ELSE 4
  END;

  -- 4. Yearly Volume (10 points max)
  SELECT COUNT(*)::INTEGER INTO v_year_count
  FROM dj_performances dp
  WHERE dp.dj_id = p_dj_id 
    AND EXTRACT(YEAR FROM dp.performance_date) = EXTRACT(YEAR FROM p_event_date);
  
  v_volume_score := CASE
    WHEN v_year_count <= 5 THEN 10
    WHEN v_year_count <= 15 THEN 8
    WHEN v_year_count <= 30 THEN 6
    WHEN v_year_count <= 60 THEN 4
    WHEN v_year_count <= 100 THEN 2
    ELSE 1
  END;

  v_total_score := v_venue_score + v_city_score + v_event_score + v_volume_score;

  -- Return lowercase tier names to match constraint
  v_tier := CASE
    WHEN v_total_score >= 99 THEN 'mythic'
    WHEN v_total_score >= 86 THEN 'legendary'
    WHEN v_total_score >= 71 THEN 'rare'
    WHEN v_total_score >= 41 THEN 'uncommon'
    ELSE 'common'
  END;

  RETURN QUERY SELECT 
    v_total_score,
    v_tier,
    v_venue_score,
    v_city_score,
    v_event_score,
    v_volume_score,
    v_venue_count,
    v_city_count,
    v_event_count,
    v_year_count;
END;
$$;