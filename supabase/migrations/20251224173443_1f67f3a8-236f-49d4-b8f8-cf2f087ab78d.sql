-- Create enum for the 9 Genre Systems (Gem Types)
CREATE TYPE public.gem_system AS ENUM (
  'techno',      -- Sapphire
  'house',       -- Emerald
  'dnb',         -- Ruby
  'bass',        -- Amethyst
  'trance',      -- Opal
  'uk',          -- Topaz
  'disco',       -- Gold
  'harder',      -- Obsidian
  'experimental' -- Moonstone
);

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  raver_rank TEXT DEFAULT 'Newcomer',
  total_gems INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create subgenres reference table
CREATE TABLE public.subgenres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  system gem_system NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gems (set entries) table
CREATE TABLE public.gems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_name TEXT NOT NULL,
  venue TEXT NOT NULL,
  event_date DATE NOT NULL,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  gem_system gem_system NOT NULL,
  subgenre_id UUID REFERENCES public.subgenres(id),
  photo_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create taste profile table for cached genre weights
CREATE TABLE public.taste_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  genre_weights JSONB DEFAULT '{}',
  top_artists JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subgenres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taste_profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- PROFILES POLICIES (Public by default)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- USER ROLES POLICIES
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- SUBGENRES POLICIES (Public read, admin write)
CREATE POLICY "Subgenres are viewable by everyone"
  ON public.subgenres FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage subgenres"
  ON public.subgenres FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- GEMS POLICIES (Public by default - the "Billboard" concept)
CREATE POLICY "Gems are viewable by everyone"
  ON public.gems FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own gems"
  ON public.gems FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gems"
  ON public.gems FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gems"
  ON public.gems FOR DELETE
  USING (auth.uid() = user_id);

-- TASTE PROFILES POLICIES (Public by default)
CREATE POLICY "Taste profiles are viewable by everyone"
  ON public.taste_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own taste profile"
  ON public.taste_profiles FOR ALL
  USING (auth.uid() = user_id);

-- Create trigger function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', 'Raver'),
    LOWER(REPLACE(NEW.id::text, '-', ''))
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.taste_profiles (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update gem count
CREATE OR REPLACE FUNCTION public.update_gem_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET total_gems = total_gems + 1, updated_at = NOW()
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET total_gems = total_gems - 1, updated_at = NOW()
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for gem count
CREATE TRIGGER on_gem_change
  AFTER INSERT OR DELETE ON public.gems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gem_count();

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gems_updated_at
  BEFORE UPDATE ON public.gems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the subgenres data
INSERT INTO public.subgenres (name, system, color) VALUES
-- Techno System (Sapphire)
('Berlin Techno', 'techno', '#3b82f6'),
('Detroit Techno', 'techno', '#60a5fa'),
('Acid Techno', 'techno', '#22d3ee'),
('Industrial Techno', 'techno', '#475569'),
('Minimal Techno', 'techno', '#94a3b8'),
('Hard Techno', 'techno', '#1e3a8a'),
('Melodic Techno', 'techno', '#818cf8'),
-- House System (Emerald)
('Deep House', 'house', '#22c55e'),
('Tech House', 'house', '#4ade80'),
('Acid House', 'house', '#a3e635'),
('Progressive House', 'house', '#86efac'),
('Afro House', 'house', '#fbbf24'),
('Funky House', 'house', '#fb923c'),
('Soulful House', 'house', '#f472b6'),
-- DnB System (Ruby)
('Liquid DnB', 'dnb', '#ef4444'),
('Neurofunk', 'dnb', '#dc2626'),
('Jungle', 'dnb', '#16a34a'),
('Jump Up', 'dnb', '#f97316'),
('Rollers', 'dnb', '#fbbf24'),
-- Bass System (Amethyst)
('Dubstep', 'bass', '#a855f7'),
('Riddim', 'bass', '#9333ea'),
('Future Bass', 'bass', '#c084fc'),
('Trap', 'bass', '#7c3aed'),
('Wave', 'bass', '#6366f1'),
-- Trance System (Opal)
('Psytrance', 'trance', '#06b6d4'),
('Progressive Trance', 'trance', '#14b8a6'),
('Goa Trance', 'trance', '#8b5cf6'),
('Uplifting Trance', 'trance', '#0ea5e9'),
('Tech Trance', 'trance', '#0284c7'),
-- UK System (Topaz)
('UK Garage', 'uk', '#eab308'),
('Grime', 'uk', '#ca8a04'),
('2-Step', 'uk', '#facc15'),
('Bassline', 'uk', '#fde047'),
('Speed Garage', 'uk', '#fef08a'),
-- Disco System (Gold)
('Nu-Disco', 'disco', '#f59e0b'),
('French Touch', 'disco', '#d97706'),
('Funk', 'disco', '#b45309'),
('Italo Disco', 'disco', '#92400e'),
('Cosmic Disco', 'disco', '#78350f'),
-- Harder Styles (Obsidian)
('Hardstyle', 'harder', '#1f2937'),
('Gabber', 'harder', '#374151'),
('Hardcore', 'harder', '#4b5563'),
('Frenchcore', 'harder', '#6b7280'),
-- Experimental System (Moonstone)
('IDM', 'experimental', '#e2e8f0'),
('Ambient', 'experimental', '#cbd5e1'),
('Synthwave', 'experimental', '#f472b6'),
('Downtempo', 'experimental', '#a78bfa'),
('Leftfield', 'experimental', '#67e8f9');