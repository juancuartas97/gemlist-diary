-- Create genres table with proper gem colors
CREATE TABLE public.genres (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  parent_genre_id uuid REFERENCES public.genres(id),
  color_hex text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

-- Genres are viewable by everyone
CREATE POLICY "Genres are viewable by everyone"
ON public.genres FOR SELECT
USING (true);

-- Admins can manage genres
CREATE POLICY "Admins can manage genres"
ON public.genres FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed the core genres with gem colors
INSERT INTO public.genres (name, color_hex) VALUES
  ('Techno', '#1E4D8C'),      -- Sapphire
  ('House', '#1E8C6A'),       -- Emerald
  ('Trance', '#7A3EB1'),      -- Amethyst
  ('DnB', '#9E1B32'),         -- Ruby
  ('Ambient', '#6A7BA2'),     -- Moonstone
  ('Disco', '#D16C2F'),       -- Topaz
  ('Experimental', '#9C8FBF'); -- Opal

-- Create DJs table
CREATE TABLE public.djs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_name text NOT NULL,
  primary_genre_id uuid REFERENCES public.genres(id),
  home_city text,
  instagram_handle text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.djs ENABLE ROW LEVEL SECURITY;

-- DJs are viewable by everyone
CREATE POLICY "DJs are viewable by everyone"
ON public.djs FOR SELECT
USING (true);

-- Authenticated users can add DJs
CREATE POLICY "Authenticated users can add DJs"
ON public.djs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create venues table
CREATE TABLE public.venues (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  venue_type text NOT NULL CHECK (venue_type IN ('club', 'warehouse', 'outdoor', 'festival')),
  city text NOT NULL,
  state text,
  country text NOT NULL,
  lat numeric,
  lng numeric,
  capacity integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Venues are viewable by everyone
CREATE POLICY "Venues are viewable by everyone"
ON public.venues FOR SELECT
USING (true);

-- Authenticated users can add venues
CREATE POLICY "Authenticated users can add venues"
ON public.venues FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create events table
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  venue_id uuid REFERENCES public.venues(id),
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone,
  primary_genre_id uuid REFERENCES public.genres(id),
  headliner_dj_id uuid REFERENCES public.djs(id),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'ended')),
  source text NOT NULL DEFAULT 'user' CHECK (source IN ('seed', 'ra', 'user', 'promoter')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events are viewable by everyone
CREATE POLICY "Events are viewable by everyone"
ON public.events FOR SELECT
USING (true);

-- Authenticated users can add events
CREATE POLICY "Authenticated users can add events"
ON public.events FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create event_lineups table
CREATE TABLE public.event_lineups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  dj_id uuid NOT NULL REFERENCES public.djs(id),
  slot_order integer,
  set_start_at timestamp with time zone,
  set_end_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_lineups ENABLE ROW LEVEL SECURITY;

-- Event lineups are viewable by everyone
CREATE POLICY "Event lineups are viewable by everyone"
ON public.event_lineups FOR SELECT
USING (true);

-- Authenticated users can add event lineups
CREATE POLICY "Authenticated users can add event lineups"
ON public.event_lineups FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create user_gems table (replaces the old gems table concept)
CREATE TABLE public.user_gems (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  event_id uuid REFERENCES public.events(id),
  dj_id uuid NOT NULL REFERENCES public.djs(id),
  primary_genre_id uuid NOT NULL REFERENCES public.genres(id),
  collected_at timestamp with time zone NOT NULL DEFAULT now(),
  is_rated boolean DEFAULT false,
  facet_ratings jsonb DEFAULT '{"sound_quality": null, "energy": null, "performance": null, "crowd": null}'::jsonb,
  private_note text,
  venue_id uuid REFERENCES public.venues(id),
  event_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_gems ENABLE ROW LEVEL SECURITY;

-- Users can view their own gems
CREATE POLICY "Users can view their own gems"
ON public.user_gems FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own gems
CREATE POLICY "Users can insert their own gems"
ON public.user_gems FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own gems
CREATE POLICY "Users can update their own gems"
ON public.user_gems FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own gems
CREATE POLICY "Users can delete their own gems"
ON public.user_gems FOR DELETE
USING (auth.uid() = user_id);

-- Create live_pulse_votes table
CREATE TABLE public.live_pulse_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  event_id uuid NOT NULL REFERENCES public.events(id),
  vote_type text NOT NULL CHECK (vote_type IN ('fire', 'mid', 'dead')),
  lat numeric,
  lng numeric,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_pulse_votes ENABLE ROW LEVEL SECURITY;

-- Live pulse votes are viewable by everyone
CREATE POLICY "Live pulse votes are viewable by everyone"
ON public.live_pulse_votes FOR SELECT
USING (true);

-- Users can add their own votes
CREATE POLICY "Users can add their own votes"
ON public.live_pulse_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_djs_stage_name ON public.djs(stage_name);
CREATE INDEX idx_djs_primary_genre ON public.djs(primary_genre_id);
CREATE INDEX idx_venues_name ON public.venues(name);
CREATE INDEX idx_venues_city ON public.venues(city);
CREATE INDEX idx_user_gems_user_id ON public.user_gems(user_id);
CREATE INDEX idx_user_gems_dj_id ON public.user_gems(dj_id);
CREATE INDEX idx_events_venue_id ON public.events(venue_id);
CREATE INDEX idx_events_start_at ON public.events(start_at);