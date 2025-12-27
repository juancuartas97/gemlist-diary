-- Create dj_performances table to track historical DJ performance data
CREATE TABLE public.dj_performances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id UUID NOT NULL REFERENCES djs(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  city TEXT NOT NULL,
  event_series_id UUID REFERENCES event_series(id) ON DELETE SET NULL,
  performance_date DATE NOT NULL,
  source TEXT DEFAULT 'user_gem',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dj_id, venue_id, performance_date)
);

-- Enable RLS
ALTER TABLE public.dj_performances ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "DJ performances are viewable by everyone"
ON public.dj_performances FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add performances"
ON public.dj_performances FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Index for fast lookups
CREATE INDEX idx_dj_performances_dj_id ON public.dj_performances(dj_id);
CREATE INDEX idx_dj_performances_venue_id ON public.dj_performances(venue_id);
CREATE INDEX idx_dj_performances_city ON public.dj_performances(city);
CREATE INDEX idx_dj_performances_series ON public.dj_performances(event_series_id);
CREATE INDEX idx_dj_performances_date ON public.dj_performances(performance_date);

-- Create the calculate_rarity_score function
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
    WHEN p_venue_id IS NULL THEN 20  -- No venue = middle score
    WHEN v_venue_count = 0 THEN 40   -- First time ever!
    WHEN v_venue_count = 1 THEN 35
    WHEN v_venue_count <= 3 THEN 28
    WHEN v_venue_count <= 5 THEN 20
    WHEN v_venue_count <= 10 THEN 10
    ELSE 5  -- Resident status
  END;

  -- 2. City Frequency (30 points max) - Last 12 months
  SELECT COUNT(*)::INTEGER INTO v_city_count
  FROM dj_performances dp
  WHERE dp.dj_id = p_dj_id 
    AND LOWER(dp.city) = LOWER(COALESCE(p_city, ''))
    AND dp.performance_date >= (p_event_date - INTERVAL '12 months');
  
  v_city_score := CASE
    WHEN p_city IS NULL OR p_city = '' THEN 15  -- No city = middle score
    WHEN v_city_count = 0 THEN 30   -- First visit in a year!
    WHEN v_city_count = 1 THEN 24
    WHEN v_city_count <= 3 THEN 18
    WHEN v_city_count <= 6 THEN 12
    WHEN v_city_count <= 12 THEN 6
    ELSE 3  -- Frequent visitor
  END;

  -- 3. Event History (20 points max) - All time
  SELECT COUNT(*)::INTEGER INTO v_event_count
  FROM dj_performances dp
  WHERE dp.dj_id = p_dj_id 
    AND dp.event_series_id = p_event_series_id
    AND p_event_series_id IS NOT NULL;
  
  v_event_score := CASE
    WHEN p_event_series_id IS NULL THEN 10  -- No series = middle score
    WHEN v_event_count = 0 THEN 20   -- First time at this festival!
    WHEN v_event_count = 1 THEN 16
    WHEN v_event_count <= 3 THEN 12
    WHEN v_event_count <= 5 THEN 8
    ELSE 4  -- Annual regular
  END;

  -- 4. Yearly Volume (10 points max) - Current calendar year
  SELECT COUNT(*)::INTEGER INTO v_year_count
  FROM dj_performances dp
  WHERE dp.dj_id = p_dj_id 
    AND EXTRACT(YEAR FROM dp.performance_date) = EXTRACT(YEAR FROM p_event_date);
  
  v_volume_score := CASE
    WHEN v_year_count <= 5 THEN 10   -- Rare, exclusive tours
    WHEN v_year_count <= 15 THEN 8
    WHEN v_year_count <= 30 THEN 6
    WHEN v_year_count <= 60 THEN 4
    WHEN v_year_count <= 100 THEN 2
    ELSE 1  -- World tour mode
  END;

  -- Calculate total
  v_total_score := v_venue_score + v_city_score + v_event_score + v_volume_score;

  -- Determine tier
  v_tier := CASE
    WHEN v_total_score >= 99 THEN 'MYTHIC'
    WHEN v_total_score >= 86 THEN 'LEGENDARY'
    WHEN v_total_score >= 71 THEN 'RARE'
    WHEN v_total_score >= 41 THEN 'UNCOMMON'
    ELSE 'COMMON'
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

-- Create trigger function to sync gems to performances
CREATE OR REPLACE FUNCTION public.sync_gem_to_performance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_city TEXT;
  v_series_id UUID;
BEGIN
  -- Get city from venue
  SELECT city INTO v_city
  FROM venues
  WHERE id = NEW.venue_id;

  -- Get event series from edition
  SELECT series_id INTO v_series_id
  FROM event_editions
  WHERE id = NEW.edition_id;

  -- Insert performance record
  INSERT INTO dj_performances (dj_id, venue_id, city, event_series_id, performance_date, source)
  VALUES (
    NEW.dj_id,
    NEW.venue_id,
    COALESCE(v_city, 'Unknown'),
    v_series_id,
    NEW.event_date,
    'user_gem'
  )
  ON CONFLICT (dj_id, venue_id, performance_date) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_gems
CREATE TRIGGER after_gem_insert_sync_performance
AFTER INSERT ON public.user_gems
FOR EACH ROW EXECUTE FUNCTION public.sync_gem_to_performance();