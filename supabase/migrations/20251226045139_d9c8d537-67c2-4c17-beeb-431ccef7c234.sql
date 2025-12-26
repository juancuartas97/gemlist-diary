-- Create event_series table (master recurring events)
CREATE TABLE public.event_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  typical_month INTEGER,                    -- 1-12 for month
  typical_duration_days INTEGER DEFAULT 3,
  primary_genre_id UUID REFERENCES public.genres(id),
  default_venue_id UUID REFERENCES public.venues(id),
  description TEXT,
  first_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create event_editions table (yearly instances)
CREATE TABLE public.event_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.event_series(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  venue_id UUID REFERENCES public.venues(id),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'ended', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(series_id, year)
);

-- Add edition_id to user_gems
ALTER TABLE public.user_gems 
ADD COLUMN edition_id UUID REFERENCES public.event_editions(id);

-- Enable RLS
ALTER TABLE public.event_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_editions ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_series
CREATE POLICY "Event series are viewable by everyone" 
ON public.event_series FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add event series" 
ON public.event_series FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for event_editions
CREATE POLICY "Event editions are viewable by everyone" 
ON public.event_editions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add event editions" 
ON public.event_editions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_event_editions_series_id ON public.event_editions(series_id);
CREATE INDEX idx_event_editions_year ON public.event_editions(year);
CREATE INDEX idx_event_series_name ON public.event_series(name);
CREATE INDEX idx_user_gems_edition_id ON public.user_gems(edition_id);

-- Add update triggers
CREATE TRIGGER update_event_series_updated_at
BEFORE UPDATE ON public.event_series
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_editions_updated_at
BEFORE UPDATE ON public.event_editions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();