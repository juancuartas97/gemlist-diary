CREATE OR REPLACE FUNCTION public.auto_generate_gem_dna()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Check for Genesis modifier
  IF NEW.is_genesis_mint = TRUE THEN
    v_modifiers := array_append(v_modifiers, 'G');
  ELSIF v_mint_number <= 100 THEN
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
  
  -- Check for Quest modifier
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
    UPDATE user_goals
    SET completed_at = now(), completed_gem_id = NEW.id
    WHERE id = v_matching_goal.id;
  END IF;
  
  -- Check for Verified (live-mined) modifier
  IF NEW.is_live_mined = TRUE THEN
    v_modifiers := array_append(v_modifiers, 'V');
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
$function$;