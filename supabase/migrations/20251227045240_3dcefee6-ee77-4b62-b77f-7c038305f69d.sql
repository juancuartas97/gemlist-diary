-- Add Gem DNA fields to user_gems
ALTER TABLE user_gems ADD COLUMN IF NOT EXISTS gem_dna TEXT;
ALTER TABLE user_gems ADD COLUMN IF NOT EXISTS mint_number INTEGER;
ALTER TABLE user_gems ADD COLUMN IF NOT EXISTS modifiers TEXT[] DEFAULT '{}';

-- Function to generate artist/venue code (first 5 consonants uppercase)
CREATE OR REPLACE FUNCTION generate_code(name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  consonants TEXT := '';
  char TEXT;
  i INTEGER;
BEGIN
  IF name IS NULL OR name = '' THEN
    RETURN 'UNKN';
  END IF;
  
  -- Remove non-alpha chars and extract consonants
  FOR i IN 1..length(name) LOOP
    char := upper(substring(name from i for 1));
    IF char ~ '[BCDFGHJKLMNPQRSTVWXYZ]' THEN
      consonants := consonants || char;
    END IF;
  END LOOP;
  
  -- If we got fewer than 4 consonants, add vowels
  IF length(consonants) < 4 THEN
    FOR i IN 1..length(name) LOOP
      char := upper(substring(name from i for 1));
      IF char ~ '[AEIOU]' AND position(char in consonants) = 0 THEN
        consonants := consonants || char;
      END IF;
    END LOOP;
  END IF;
  
  -- Return first 5 characters, or pad if needed
  RETURN substring(consonants from 1 for 5);
END;
$$;

-- Function to get next mint number for a DJ+venue+date combo
CREATE OR REPLACE FUNCTION get_next_mint_number(p_dj_id UUID, p_venue_id UUID, p_event_date DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM user_gems
  WHERE dj_id = p_dj_id 
    AND (venue_id = p_venue_id OR (p_venue_id IS NULL AND venue_id IS NULL))
    AND event_date = p_event_date;
  
  RETURN v_count;
END;
$$;

-- Function to generate full Gem DNA string
CREATE OR REPLACE FUNCTION generate_gem_dna(
  p_dj_name TEXT,
  p_venue_name TEXT,
  p_date DATE,
  p_rarity_tier TEXT,
  p_mint_number INTEGER,
  p_modifiers TEXT[]
) RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  v_dna TEXT;
  v_rarity_code TEXT;
  v_date_code TEXT;
  v_modifier_str TEXT := '';
BEGIN
  -- Rarity tier code
  v_rarity_code := CASE p_rarity_tier
    WHEN 'mythic' THEN 'M'
    WHEN 'legendary' THEN 'L'
    WHEN 'rare' THEN 'R'
    WHEN 'uncommon' THEN 'U'
    ELSE 'C'
  END;
  
  -- Date code: MMYY format
  v_date_code := to_char(p_date, 'MMYY');
  
  -- Modifiers string
  IF array_length(p_modifiers, 1) > 0 THEN
    v_modifier_str := '-' || array_to_string(p_modifiers, '/');
  END IF;
  
  -- Build DNA: ARTIST-VENUE-DATE-RARITY-MINT#-MODIFIERS
  v_dna := generate_code(p_dj_name) || '-' ||
           COALESCE(generate_code(p_venue_name), 'NONE') || '-' ||
           v_date_code || '-' ||
           v_rarity_code || '-' ||
           lpad(p_mint_number::text, 4, '0') ||
           v_modifier_str;
  
  RETURN v_dna;
END;
$$;

-- Trigger to auto-generate gem DNA and check quest completion
CREATE OR REPLACE FUNCTION auto_generate_gem_dna()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_dj_name TEXT;
  v_venue_name TEXT;
  v_mint_number INTEGER;
  v_modifiers TEXT[] := '{}';
  v_matching_goal RECORD;
  v_genesis_count INTEGER;
BEGIN
  -- Get DJ name
  SELECT stage_name INTO v_dj_name FROM djs WHERE id = NEW.dj_id;
  
  -- Get venue name
  IF NEW.venue_id IS NOT NULL THEN
    SELECT name INTO v_venue_name FROM venues WHERE id = NEW.venue_id;
  END IF;
  
  -- Get mint number
  v_mint_number := get_next_mint_number(NEW.dj_id, NEW.venue_id, NEW.event_date);
  NEW.mint_number := v_mint_number;
  
  -- Check for Genesis modifier (first 100 mints for this event+dj combo)
  IF NEW.is_genesis_mint = TRUE THEN
    v_modifiers := array_append(v_modifiers, 'G');
  ELSIF v_mint_number <= 100 THEN
    -- Check total gems for this dj+venue+date
    SELECT COUNT(*) INTO v_genesis_count
    FROM user_gems
    WHERE dj_id = NEW.dj_id 
      AND event_date = NEW.event_date
      AND (venue_id = NEW.venue_id OR (NEW.venue_id IS NULL AND venue_id IS NULL));
    
    IF v_genesis_count < 100 THEN
      v_modifiers := array_append(v_modifiers, 'G');
      NEW.is_genesis_mint := TRUE;
    END IF;
  END IF;
  
  -- Check for Quest modifier (matching user_goals)
  SELECT * INTO v_matching_goal
  FROM user_goals
  WHERE user_id = NEW.user_id
    AND completed_at IS NULL
    AND (
      (goal_type = 'holy_grail_artist' AND reference_id = NEW.dj_id)
      OR (goal_type = 'holy_grail_venue' AND reference_id = NEW.venue_id)
      OR (goal_type = 'target_event' AND reference_id = NEW.event_id)
    )
  LIMIT 1;
  
  IF v_matching_goal.id IS NOT NULL THEN
    v_modifiers := array_append(v_modifiers, 'Q');
    
    -- Mark goal as completed
    UPDATE user_goals
    SET completed_at = now(), completed_gem_id = NEW.id
    WHERE id = v_matching_goal.id;
  END IF;
  
  NEW.modifiers := v_modifiers;
  
  -- Generate DNA
  NEW.gem_dna := generate_gem_dna(
    v_dj_name,
    v_venue_name,
    NEW.event_date,
    NEW.rarity_tier,
    v_mint_number,
    v_modifiers
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto DNA generation
DROP TRIGGER IF EXISTS auto_gem_dna_trigger ON user_gems;
CREATE TRIGGER auto_gem_dna_trigger
  BEFORE INSERT ON user_gems
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_gem_dna();