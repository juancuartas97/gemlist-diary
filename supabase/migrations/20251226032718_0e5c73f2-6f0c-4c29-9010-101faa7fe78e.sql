-- Update placeholder venues with proper data (including the referenced ones)
UPDATE venues SET 
  city = 'Miami', 
  state = 'FL', 
  country = 'USA', 
  venue_type = 'club',
  lat = 25.7883,
  lng = -80.1911,
  capacity = 1500
WHERE id = 'e7e547da-8ead-4fe4-9162-5e7f5ec8427e'; -- Space

UPDATE venues SET 
  city = 'George', 
  state = 'WA', 
  country = 'USA', 
  venue_type = 'outdoor',
  lat = 47.0995,
  lng = -119.9969,
  capacity = 27000
WHERE id = '67e0200b-f144-4e7a-80d6-399003b49bf4'; -- The Gorge

UPDATE venues SET 
  city = 'Costa Mesa', 
  state = 'CA', 
  country = 'USA', 
  venue_type = 'club',
  lat = 33.6846,
  lng = -117.9011,
  capacity = 3500
WHERE id = 'ea094b30-4682-4462-a511-070bb7b8bcc1'; -- Factory Town

-- Fix Spacedw typo - rename to a real venue
UPDATE venues SET 
  name = 'Smartbar',
  city = 'Chicago', 
  state = 'IL', 
  country = 'USA', 
  venue_type = 'club',
  lat = 41.9484,
  lng = -87.6594,
  capacity = 300
WHERE id = '91311a00-b273-45aa-b397-0040d4f98aef';

-- Fix duplicate Space - rename to different venue
UPDATE venues SET 
  name = 'Space Ibiza',
  city = 'Ibiza', 
  state = NULL, 
  country = 'Spain', 
  venue_type = 'club',
  lat = 38.9067,
  lng = 1.4206,
  capacity = 3500
WHERE id = '473d262b-98ae-4fbf-81a8-f3bf308168bf';

-- Add unique constraint
CREATE UNIQUE INDEX venues_name_city_unique ON venues (LOWER(TRIM(name)), LOWER(TRIM(city)));