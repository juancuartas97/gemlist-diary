-- Seed 60 DJs from CSV data with their genres
-- Map genres: Commercial/EDM → House, Dubstep/Bass → DnB, Techno/Underground → Techno, Trance → Trance

-- First, get genre IDs for reference
DO $$
DECLARE
  v_house_id UUID;
  v_techno_id UUID;
  v_dnb_id UUID;
  v_trance_id UUID;
BEGIN
  SELECT id INTO v_house_id FROM genres WHERE LOWER(name) = 'house' LIMIT 1;
  SELECT id INTO v_techno_id FROM genres WHERE LOWER(name) = 'techno' LIMIT 1;
  SELECT id INTO v_dnb_id FROM genres WHERE LOWER(name) LIKE '%drum%' OR LOWER(name) = 'dnb' LIMIT 1;
  SELECT id INTO v_trance_id FROM genres WHERE LOWER(name) = 'trance' LIMIT 1;
  
  -- Use techno as fallback if specific genres don't exist
  IF v_house_id IS NULL THEN v_house_id := v_techno_id; END IF;
  IF v_dnb_id IS NULL THEN v_dnb_id := v_techno_id; END IF;
  IF v_trance_id IS NULL THEN v_trance_id := v_techno_id; END IF;

  -- Commercial/EDM Artists → House
  INSERT INTO djs (stage_name, primary_genre_id) VALUES 
    ('Martin Garrix', v_house_id),
    ('Calvin Harris', v_house_id),
    ('David Guetta', v_house_id),
    ('The Chainsmokers', v_house_id),
    ('Marshmello', v_house_id),
    ('Tiesto', v_house_id),
    ('Zedd', v_house_id),
    ('Kygo', v_house_id),
    ('Diplo', v_house_id),
    ('Steve Aoki', v_house_id),
    ('Alesso', v_house_id),
    ('Don Diablo', v_house_id),
    ('Afrojack', v_house_id),
    ('R3HAB', v_house_id),
    ('Armin van Buuren', v_trance_id)
  ON CONFLICT DO NOTHING;

  -- Dubstep/Bass Artists → DnB
  INSERT INTO djs (stage_name, primary_genre_id) VALUES 
    ('Excision', v_dnb_id),
    ('REZZ', v_dnb_id),
    ('Illenium', v_dnb_id),
    ('Subtronics', v_dnb_id),
    ('SVDDEN DEATH', v_dnb_id),
    ('Kayzo', v_dnb_id),
    ('Sullivan King', v_dnb_id),
    ('Wooli', v_dnb_id),
    ('Kompany', v_dnb_id),
    ('Riot Ten', v_dnb_id),
    ('Marauda', v_dnb_id),
    ('Kai Wachi', v_dnb_id),
    ('Midnight Tyrannosaurus', v_dnb_id),
    ('Dion Timmer', v_dnb_id),
    ('Barely Alive', v_dnb_id)
  ON CONFLICT DO NOTHING;

  -- Techno/Underground Artists → Techno
  INSERT INTO djs (stage_name, primary_genre_id) VALUES 
    ('Charlotte de Witte', v_techno_id),
    ('Amelie Lens', v_techno_id),
    ('I Hate Models', v_techno_id),
    ('ANNA', v_techno_id),
    ('Enrico Sangiuliano', v_techno_id),
    ('Reinier Zonneveld', v_techno_id),
    ('Sara Landry', v_techno_id),
    ('999999999', v_techno_id),
    ('Kobosil', v_techno_id),
    ('Blawan', v_techno_id),
    ('Paula Temple', v_techno_id),
    ('FJAAK', v_techno_id),
    ('HAAi', v_techno_id),
    ('Indira Paganotto', v_techno_id),
    ('Deborah de Luca', v_techno_id)
  ON CONFLICT DO NOTHING;

  -- Trance Artists → Trance
  INSERT INTO djs (stage_name, primary_genre_id) VALUES 
    ('Above & Beyond', v_trance_id),
    ('Gareth Emery', v_trance_id),
    ('Paul van Dyk', v_trance_id),
    ('Aly & Fila', v_trance_id),
    ('Giuseppe Ottaviani', v_trance_id),
    ('Andrew Rayel', v_trance_id),
    ('Cosmic Gate', v_trance_id),
    ('Markus Schulz', v_trance_id),
    ('Ferry Corsten', v_trance_id),
    ('Simon Patterson', v_trance_id),
    ('Bryan Kearney', v_trance_id),
    ('Vini Vici', v_trance_id),
    ('John O''Callaghan', v_trance_id),
    ('Ruben de Ronde', v_trance_id),
    ('Factor B', v_trance_id)
  ON CONFLICT DO NOTHING;
END $$;

-- Seed key venues (if not exists)
INSERT INTO venues (name, venue_type, city, country) VALUES
  ('Omnia', 'club', 'Las Vegas', 'USA'),
  ('Club Space', 'club', 'Miami', 'USA'),
  ('Printworks', 'club', 'London', 'UK'),
  ('Hi Ibiza', 'club', 'Ibiza', 'Spain'),
  ('Ushuaia', 'club', 'Ibiza', 'Spain'),
  ('Awakenings', 'festival', 'Amsterdam', 'Netherlands'),
  ('Time Warp', 'festival', 'Mannheim', 'Germany'),
  ('Hakkasan', 'club', 'Las Vegas', 'USA'),
  ('Amnesia', 'club', 'Ibiza', 'Spain'),
  ('Fabric', 'club', 'London', 'UK'),
  ('Output', 'club', 'Brooklyn', 'USA'),
  ('Cavo Paradiso', 'club', 'Mykonos', 'Greece'),
  ('Bootshaus', 'club', 'Cologne', 'Germany'),
  ('Zouk', 'club', 'Singapore', 'Singapore'),
  ('Exchange LA', 'club', 'Los Angeles', 'USA'),
  ('Bass Canyon', 'festival', 'George', 'USA'),
  ('Lost Lands', 'festival', 'Thornville', 'USA'),
  ('Dreamstate', 'festival', 'San Bernardino', 'USA')
ON CONFLICT DO NOTHING;

-- Seed event series
INSERT INTO event_series (name, typical_month) VALUES
  ('Ultra Music Festival', 3),
  ('Tomorrowland', 7),
  ('Electric Daisy Carnival', 5),
  ('Coachella', 4),
  ('Creamfields', 8),
  ('Electric Forest', 6),
  ('ASOT', 2),
  ('Defected Croatia', 8),
  ('Luminosity Beach', 6),
  ('Transmission', 10)
ON CONFLICT DO NOTHING;

-- Generate synthetic performance records based on CSV venue counts
-- This creates historical data for the rarity algorithm

-- Helper to get random dates distributed across years
CREATE OR REPLACE FUNCTION generate_performance_dates(
  p_count INTEGER,
  p_years_back INTEGER DEFAULT 5
) RETURNS DATE[] AS $$
DECLARE
  dates DATE[];
  i INTEGER;
BEGIN
  FOR i IN 1..p_count LOOP
    dates := array_append(dates, 
      (CURRENT_DATE - (random() * p_years_back * 365)::INTEGER)::DATE
    );
  END LOOP;
  RETURN dates;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Insert performance records for Commercial/EDM artists at key venues
DO $$
DECLARE
  v_dj_id UUID;
  v_venue_id UUID;
  perf_date DATE;
  perf_dates DATE[];
BEGIN
  -- Martin Garrix performances
  SELECT id INTO v_dj_id FROM djs WHERE stage_name = 'Martin Garrix';
  IF v_dj_id IS NOT NULL THEN
    -- Omnia (6 times)
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Omnia';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(6, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'Las Vegas', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
    -- Ushuaia (5 times)
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Ushuaia';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(5, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'Ibiza', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
    -- Hi Ibiza (4 times)
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Hi Ibiza';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(4, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'Ibiza', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END IF;

  -- Charlotte de Witte performances
  SELECT id INTO v_dj_id FROM djs WHERE stage_name = 'Charlotte de Witte';
  IF v_dj_id IS NOT NULL THEN
    -- Berghain (8 times)
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Berghain';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(8, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'Berlin', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
    -- Printworks (6 times)
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Printworks';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(6, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'London', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
    -- Amnesia (5 times)
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Amnesia';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(5, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'Ibiza', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END IF;

  -- Excision performances
  SELECT id INTO v_dj_id FROM djs WHERE stage_name = 'Excision';
  IF v_dj_id IS NOT NULL THEN
    -- Lost Lands (5 times - his own festival)
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Lost Lands';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(5, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'Thornville', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
    -- Bass Canyon (4 times)
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Bass Canyon';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(4, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'George', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END IF;

  -- Armin van Buuren performances
  SELECT id INTO v_dj_id FROM djs WHERE stage_name = 'Armin van Buuren';
  IF v_dj_id IS NOT NULL THEN
    -- Ushuaia (10 times)
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Ushuaia';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(10, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'Ibiza', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
    -- Hi Ibiza (8 times)
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Hi Ibiza';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(8, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'Ibiza', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END IF;

  -- Above & Beyond performances
  SELECT id INTO v_dj_id FROM djs WHERE stage_name = 'Above & Beyond';
  IF v_dj_id IS NOT NULL THEN
    -- Dreamstate (4 times)
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Dreamstate';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(4, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'San Bernardino', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END IF;

  -- Add more DJ performances for diversity
  -- Calvin Harris
  SELECT id INTO v_dj_id FROM djs WHERE stage_name = 'Calvin Harris';
  IF v_dj_id IS NOT NULL THEN
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Omnia';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(8, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'Las Vegas', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Ushuaia';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(6, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'Ibiza', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END IF;

  -- Amelie Lens
  SELECT id INTO v_dj_id FROM djs WHERE stage_name = 'Amelie Lens';
  IF v_dj_id IS NOT NULL THEN
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Berghain';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(6, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'Berlin', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Printworks';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(5, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'London', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END IF;

  -- Tiesto
  SELECT id INTO v_dj_id FROM djs WHERE stage_name = 'Tiesto';
  IF v_dj_id IS NOT NULL THEN
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Hakkasan';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(12, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'Las Vegas', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
    SELECT id INTO v_venue_id FROM venues WHERE name = 'Omnia';
    IF v_venue_id IS NOT NULL THEN
      perf_dates := generate_performance_dates(8, 5);
      FOREACH perf_date IN ARRAY perf_dates LOOP
        INSERT INTO dj_performances (dj_id, venue_id, city, performance_date, source)
        VALUES (v_dj_id, v_venue_id, 'Las Vegas', perf_date, 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END IF;

END $$;

-- Clean up helper function
DROP FUNCTION IF EXISTS generate_performance_dates(INTEGER, INTEGER);