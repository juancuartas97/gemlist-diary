-- Add Factory Town Miami + second-tier venues
-- Using INSERT with subquery to skip existing venues

-- Factory Town Miami
INSERT INTO public.venues (name, venue_type, city, state, country)
SELECT 'Factory Town Miami', 'club', 'Miami', 'FL', 'USA'
WHERE NOT EXISTS (SELECT 1 FROM public.venues WHERE LOWER(TRIM(name)) = LOWER('Factory Town Miami') AND LOWER(TRIM(city)) = LOWER('Miami'));

-- US Clubs (using a CTE to insert only new venues)
WITH new_venues AS (
  SELECT * FROM (VALUES
    ('SOMA San Diego', 'club', 'San Diego', 'CA', 'USA'),
    ('Spin Nightclub', 'club', 'San Diego', 'CA', 'USA'),
    ('It''ll Do Club', 'club', 'Dallas', 'TX', 'USA'),
    ('Stereo Live Houston', 'club', 'Houston', 'TX', 'USA'),
    ('Stereo Live Dallas', 'club', 'Dallas', 'TX', 'USA'),
    ('Temple Nightclub', 'club', 'Denver', 'CO', 'USA'),
    ('Beta Nightclub', 'club', 'Denver', 'CO', 'USA'),
    ('The Black Box', 'club', 'Denver', 'CO', 'USA'),
    ('Audio SF', 'club', 'San Francisco', 'CA', 'USA'),
    ('The Midway SF', 'club', 'San Francisco', 'CA', 'USA'),
    ('1015 Folsom', 'club', 'San Francisco', 'CA', 'USA'),
    ('Public Works SF', 'club', 'San Francisco', 'CA', 'USA'),
    ('Schimanski', 'club', 'Brooklyn', 'NY', 'USA'),
    ('Grasshopper Underground', 'club', 'Detroit', 'MI', 'USA'),
    ('TV Lounge', 'club', 'Detroit', 'MI', 'USA'),
    ('The Mid', 'club', 'Chicago', 'IL', 'USA'),
    ('Concord Music Hall', 'club', 'Chicago', 'IL', 'USA')
  ) AS t(name, venue_type, city, state, country)
)
INSERT INTO public.venues (name, venue_type, city, state, country)
SELECT nv.name, nv.venue_type, nv.city, nv.state, nv.country
FROM new_venues nv
WHERE NOT EXISTS (
  SELECT 1 FROM public.venues v 
  WHERE LOWER(TRIM(v.name)) = LOWER(nv.name) AND LOWER(TRIM(v.city)) = LOWER(nv.city)
);

-- US Festivals
WITH new_festivals AS (
  SELECT * FROM (VALUES
    ('Okeechobee Music Festival', 'festival', 'Okeechobee', 'FL', 'USA'),
    ('Bonnaroo', 'festival', 'Manchester', 'TN', 'USA'),
    ('Hulaween', 'festival', 'Live Oak', 'FL', 'USA'),
    ('Nocturnal Wonderland', 'festival', 'San Bernardino', 'CA', 'USA'),
    ('Escape Halloween', 'festival', 'San Bernardino', 'CA', 'USA'),
    ('Dreamstate', 'festival', 'San Bernardino', 'CA', 'USA'),
    ('Countdown NYE', 'festival', 'San Bernardino', 'CA', 'USA'),
    ('Ubbi Dubbi', 'festival', 'Ennis', 'TX', 'USA'),
    ('Imagine Music Festival', 'festival', 'Atlanta', 'GA', 'USA'),
    ('Phoenix Lights', 'festival', 'Phoenix', 'AZ', 'USA'),
    ('Global Dance Festival', 'festival', 'Denver', 'CO', 'USA'),
    ('Sunset Music Festival', 'festival', 'Tampa', 'FL', 'USA'),
    ('Something Wonderful', 'festival', 'Dallas', 'TX', 'USA'),
    ('Spring Awakening', 'festival', 'Chicago', 'IL', 'USA'),
    ('North Coast Music Festival', 'festival', 'Chicago', 'IL', 'USA'),
    ('Lightning in a Bottle', 'festival', 'Bakersfield', 'CA', 'USA'),
    ('Camp Bisco', 'festival', 'Scranton', 'PA', 'USA'),
    ('Electric Daisy Carnival NY', 'festival', 'East Rutherford', 'NJ', 'USA'),
    ('III Points', 'festival', 'Miami', 'FL', 'USA'),
    ('ARC Music Festival', 'festival', 'Chicago', 'IL', 'USA'),
    ('Seismic Dance Event', 'festival', 'Austin', 'TX', 'USA'),
    ('BUKU Music + Art Project', 'festival', 'New Orleans', 'LA', 'USA'),
    ('Shaky Beats', 'festival', 'Atlanta', 'GA', 'USA'),
    ('Middlelands', 'festival', 'Todd Mission', 'TX', 'USA'),
    ('Something Wicked', 'festival', 'Houston', 'TX', 'USA')
  ) AS t(name, venue_type, city, state, country)
)
INSERT INTO public.venues (name, venue_type, city, state, country)
SELECT nv.name, nv.venue_type, nv.city, nv.state, nv.country
FROM new_festivals nv
WHERE NOT EXISTS (
  SELECT 1 FROM public.venues v 
  WHERE LOWER(TRIM(v.name)) = LOWER(nv.name) AND LOWER(TRIM(v.city)) = LOWER(nv.city)
);

-- Canada Venues
WITH canada_venues AS (
  SELECT * FROM (VALUES
    ('Newspeak Montreal', 'club', 'Montreal', 'QC', 'Canada'),
    ('Velvet Speakeasy', 'club', 'Montreal', 'QC', 'Canada'),
    ('MYST Toronto', 'club', 'Toronto', 'ON', 'Canada'),
    ('Nest Toronto', 'club', 'Toronto', 'ON', 'Canada'),
    ('Shambhala', 'festival', 'Salmo', 'BC', 'Canada'),
    ('VELD', 'festival', 'Toronto', 'ON', 'Canada'),
    ('Ever After', 'festival', 'Kitchener', 'ON', 'Canada'),
    ('Digital Dreams', 'festival', 'Toronto', 'ON', 'Canada')
  ) AS t(name, venue_type, city, state, country)
)
INSERT INTO public.venues (name, venue_type, city, state, country)
SELECT nv.name, nv.venue_type, nv.city, nv.state, nv.country
FROM canada_venues nv
WHERE NOT EXISTS (
  SELECT 1 FROM public.venues v 
  WHERE LOWER(TRIM(v.name)) = LOWER(nv.name) AND LOWER(TRIM(v.city)) = LOWER(nv.city)
);

-- International festivals
WITH intl_festivals AS (
  SELECT * FROM (VALUES
    ('Untold Festival', 'festival', 'Cluj-Napoca', 'Romania'),
    ('Exit Festival', 'festival', 'Novi Sad', 'Serbia'),
    ('Primavera Sound', 'festival', 'Barcelona', 'Spain'),
    ('Loveland', 'festival', 'Amsterdam', 'Netherlands'),
    ('Dekmantel', 'festival', 'Amsterdam', 'Netherlands'),
    ('Dour Festival', 'festival', 'Dour', 'Belgium'),
    ('Pukkelpop', 'festival', 'Hasselt', 'Belgium'),
    ('Fusion Festival', 'festival', 'Lärz', 'Germany'),
    ('Melt Festival', 'festival', 'Gräfenhainichen', 'Germany'),
    ('Nature One', 'festival', 'Kastellaun', 'Germany'),
    ('Parookaville', 'festival', 'Weeze', 'Germany')
  ) AS t(name, venue_type, city, country)
)
INSERT INTO public.venues (name, venue_type, city, country)
SELECT nv.name, nv.venue_type, nv.city, nv.country
FROM intl_festivals nv
WHERE NOT EXISTS (
  SELECT 1 FROM public.venues v 
  WHERE LOWER(TRIM(v.name)) = LOWER(nv.name) AND LOWER(TRIM(v.city)) = LOWER(nv.city)
);