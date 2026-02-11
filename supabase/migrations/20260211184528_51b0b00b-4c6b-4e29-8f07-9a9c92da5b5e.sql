-- Add is_live_mined flag to user_gems
ALTER TABLE public.user_gems
ADD COLUMN is_live_mined boolean NOT NULL DEFAULT false;

-- Add live mining location snapshot
ALTER TABLE public.user_gems
ADD COLUMN live_lat numeric NULL,
ADD COLUMN live_lng numeric NULL;

COMMENT ON COLUMN public.user_gems.is_live_mined IS 'True if gem was mined live at the venue with location verification';
COMMENT ON COLUMN public.user_gems.live_lat IS 'GPS latitude at time of live mining';
COMMENT ON COLUMN public.user_gems.live_lng IS 'GPS longitude at time of live mining';