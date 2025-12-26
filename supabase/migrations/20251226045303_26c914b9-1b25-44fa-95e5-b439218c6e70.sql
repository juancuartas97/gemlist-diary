-- Seed event editions with proper venue history
-- Ultra Miami: Bicentennial Park 1999-2011, Bayfront Park 2012+
-- Need to link venues to series

-- Get venue IDs and update series with default venues
UPDATE public.event_series SET default_venue_id = (
  SELECT id FROM public.venues WHERE name ILIKE '%Bayfront Park%' LIMIT 1
) WHERE name = 'Ultra Music Festival';

UPDATE public.event_series SET default_venue_id = (
  SELECT id FROM public.venues WHERE name ILIKE '%Las Vegas Motor Speedway%' LIMIT 1
) WHERE name = 'Electric Daisy Carnival Las Vegas';

UPDATE public.event_series SET default_venue_id = (
  SELECT id FROM public.venues WHERE name ILIKE '%Tinker Field%' OR name ILIKE '%Camping World%' LIMIT 1
) WHERE name = 'Electric Daisy Carnival Orlando';

UPDATE public.event_series SET default_venue_id = (
  SELECT id FROM public.venues WHERE name ILIKE '%De Schorre%' OR city = 'Boom' LIMIT 1
) WHERE name = 'Tomorrowland';

UPDATE public.event_series SET default_venue_id = (
  SELECT id FROM public.venues WHERE name ILIKE '%Double JJ%' OR city ILIKE '%Rothbury%' LIMIT 1
) WHERE name = 'Electric Forest';

UPDATE public.event_series SET default_venue_id = (
  SELECT id FROM public.venues WHERE name ILIKE '%Hart Plaza%' LIMIT 1
) WHERE name = 'Movement Detroit';

UPDATE public.event_series SET default_venue_id = (
  SELECT id FROM public.venues WHERE name ILIKE '%Randall%' OR city ILIKE '%New York%' LIMIT 1
) WHERE name = 'Electric Zoo';

UPDATE public.event_series SET default_venue_id = (
  SELECT id FROM public.venues WHERE name ILIKE '%Empire Polo%' LIMIT 1
) WHERE name = 'Coachella';

UPDATE public.event_series SET default_venue_id = (
  SELECT id FROM public.venues WHERE name ILIKE '%Grant Park%' LIMIT 1
) WHERE name = 'Lollapalooza';

UPDATE public.event_series SET default_venue_id = (
  SELECT id FROM public.venues WHERE name ILIKE '%Legend Valley%' LIMIT 1
) WHERE name = 'Lost Lands';

UPDATE public.event_series SET default_venue_id = (
  SELECT id FROM public.venues WHERE name ILIKE '%NOS Events Center%' LIMIT 1
) WHERE name ILIKE '%Escape%' OR name ILIKE '%Beyond Wonderland%' OR name ILIKE '%Nocturnal%' OR name ILIKE '%Countdown%';

UPDATE public.event_series SET default_venue_id = (
  SELECT id FROM public.venues WHERE name ILIKE '%Gorge%' LIMIT 1
) WHERE name IN ('Paradiso', 'Bass Canyon');

-- Insert editions for major festivals (2015-2025 with venue overrides where needed)
-- Ultra Miami editions
INSERT INTO public.event_editions (series_id, year, start_date, end_date, venue_id, status)
SELECT 
  es.id,
  y.year,
  make_date(y.year, 3, 
    CASE 
      WHEN y.year = 2025 THEN 28
      WHEN y.year = 2024 THEN 22
      WHEN y.year = 2023 THEN 24
      WHEN y.year = 2022 THEN 25
      WHEN y.year = 2020 THEN 20
      WHEN y.year = 2019 THEN 29
      WHEN y.year = 2018 THEN 23
      ELSE 24
    END
  ),
  make_date(y.year, 3, 
    CASE 
      WHEN y.year = 2025 THEN 30
      WHEN y.year = 2024 THEN 24
      WHEN y.year = 2023 THEN 26
      WHEN y.year = 2022 THEN 27
      WHEN y.year = 2020 THEN 22
      WHEN y.year = 2019 THEN 31
      WHEN y.year = 2018 THEN 25
      ELSE 26
    END
  ),
  es.default_venue_id,
  CASE WHEN y.year <= 2024 THEN 'ended' ELSE 'scheduled' END
FROM public.event_series es
CROSS JOIN (SELECT generate_series(2015, 2025) as year) y
WHERE es.name = 'Ultra Music Festival'
ON CONFLICT (series_id, year) DO NOTHING;

-- EDC Las Vegas editions
INSERT INTO public.event_editions (series_id, year, start_date, end_date, venue_id, status)
SELECT 
  es.id,
  y.year,
  make_date(y.year, 5, 
    CASE 
      WHEN y.year = 2025 THEN 16
      WHEN y.year = 2024 THEN 17
      WHEN y.year = 2023 THEN 19
      ELSE 18
    END
  ),
  make_date(y.year, 5, 
    CASE 
      WHEN y.year = 2025 THEN 18
      WHEN y.year = 2024 THEN 19
      WHEN y.year = 2023 THEN 21
      ELSE 20
    END
  ),
  es.default_venue_id,
  CASE WHEN y.year <= 2024 THEN 'ended' ELSE 'scheduled' END
FROM public.event_series es
CROSS JOIN (SELECT generate_series(2015, 2025) as year) y
WHERE es.name = 'Electric Daisy Carnival Las Vegas'
ON CONFLICT (series_id, year) DO NOTHING;

-- Tomorrowland editions (July)
INSERT INTO public.event_editions (series_id, year, start_date, end_date, venue_id, status)
SELECT 
  es.id,
  y.year,
  make_date(y.year, 7, 19),
  make_date(y.year, 7, 21),
  es.default_venue_id,
  CASE WHEN y.year <= 2024 THEN 'ended' ELSE 'scheduled' END
FROM public.event_series es
CROSS JOIN (SELECT generate_series(2015, 2025) as year) y
WHERE es.name = 'Tomorrowland'
ON CONFLICT (series_id, year) DO NOTHING;

-- Electric Forest editions (June)
INSERT INTO public.event_editions (series_id, year, start_date, end_date, venue_id, status)
SELECT 
  es.id,
  y.year,
  make_date(y.year, 6, 22),
  make_date(y.year, 6, 25),
  es.default_venue_id,
  CASE WHEN y.year <= 2024 THEN 'ended' ELSE 'scheduled' END
FROM public.event_series es
CROSS JOIN (SELECT generate_series(2015, 2025) as year) y
WHERE es.name = 'Electric Forest'
ON CONFLICT (series_id, year) DO NOTHING;

-- Coachella editions (April - two weekends, just insert weekend 1)
INSERT INTO public.event_editions (series_id, year, start_date, end_date, venue_id, status)
SELECT 
  es.id,
  y.year,
  make_date(y.year, 4, 11),
  make_date(y.year, 4, 13),
  es.default_venue_id,
  CASE WHEN y.year <= 2024 THEN 'ended' ELSE 'scheduled' END
FROM public.event_series es
CROSS JOIN (SELECT generate_series(2015, 2025) as year) y
WHERE es.name = 'Coachella'
ON CONFLICT (series_id, year) DO NOTHING;

-- Lollapalooza editions (August)
INSERT INTO public.event_editions (series_id, year, start_date, end_date, venue_id, status)
SELECT 
  es.id,
  y.year,
  make_date(y.year, 8, 1),
  make_date(y.year, 8, 4),
  es.default_venue_id,
  CASE WHEN y.year <= 2024 THEN 'ended' ELSE 'scheduled' END
FROM public.event_series es
CROSS JOIN (SELECT generate_series(2015, 2025) as year) y
WHERE es.name = 'Lollapalooza'
ON CONFLICT (series_id, year) DO NOTHING;

-- Lost Lands editions (September, 2017+)
INSERT INTO public.event_editions (series_id, year, start_date, end_date, venue_id, status)
SELECT 
  es.id,
  y.year,
  make_date(y.year, 9, 20),
  make_date(y.year, 9, 22),
  es.default_venue_id,
  CASE WHEN y.year <= 2024 THEN 'ended' ELSE 'scheduled' END
FROM public.event_series es
CROSS JOIN (SELECT generate_series(2017, 2025) as year) y
WHERE es.name = 'Lost Lands'
ON CONFLICT (series_id, year) DO NOTHING;