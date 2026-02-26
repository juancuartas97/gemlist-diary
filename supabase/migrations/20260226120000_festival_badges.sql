-- Create user_festival_badges table
CREATE TABLE IF NOT EXISTS public.user_festival_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  edition_id UUID REFERENCES public.event_editions(id) ON DELETE SET NULL,
  series_name TEXT NOT NULL,
  festival_date DATE NOT NULL,
  badge_color TEXT NOT NULL DEFAULT 'purple',
  custom_image_url TEXT,
  artist_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_festival_badges ENABLE ROW LEVEL SECURITY;

-- Users can view their own badges
CREATE POLICY "Users can view own festival badges"
  ON public.user_festival_badges
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own badges
CREATE POLICY "Users can insert own festival badges"
  ON public.user_festival_badges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own badges
CREATE POLICY "Users can update own festival badges"
  ON public.user_festival_badges
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own badges
CREATE POLICY "Users can delete own festival badges"
  ON public.user_festival_badges
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups by user
CREATE INDEX idx_user_festival_badges_user_id ON public.user_festival_badges(user_id);
