import { supabase } from '@/integrations/supabase/client';

export interface RarityResult {
  total_score: number;
  rarity_tier: 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic';
  venue_score: number;
  city_score: number;
  event_score: number;
  volume_score: number;
  venue_count: number;
  city_count: number;
  event_count: number;
  year_count: number;
}

export interface RarityBreakdown {
  venue: { score: number; count: number; maxScore: 40; label: string };
  city: { score: number; count: number; maxScore: 30; label: string };
  event: { score: number; count: number; maxScore: 20; label: string };
  volume: { score: number; count: number; maxScore: 10; label: string };
}

export const RARITY_TIERS = {
  common: { emoji: '💎', color: '#6B7280', label: 'Common', description: 'The "Resident" Gem' },
  uncommon: { emoji: '🔷', color: '#3B82F6', label: 'Uncommon', description: 'The "Tour" Gem' },
  rare: { emoji: '🟣', color: '#8B5CF6', label: 'Rare', description: 'The "Special Guest" Gem' },
  legendary: { emoji: '🟠', color: '#F59E0B', label: 'Legendary', description: 'The "Underplay" Gem' },
  mythic: { emoji: '🔴', color: '#EF4444', label: 'Mythic', description: 'The "White Whale" Gem' },
} as const;

export type RarityTier = keyof typeof RARITY_TIERS;

export const calculateRarity = async (
  djId: string,
  venueId: string | null,
  city: string | null,
  eventSeriesId: string | null,
  eventDate: string
): Promise<RarityResult | null> => {
  const { data, error } = await supabase
    .rpc('calculate_rarity_score', {
      p_dj_id: djId,
      p_venue_id: venueId,
      p_city: city || '',
      p_event_series_id: eventSeriesId,
      p_event_date: eventDate,
    });

  if (error) {
    console.error('Error calculating rarity:', error);
    return null;
  }

  // RPC returns an array, get first row
  const result = Array.isArray(data) ? data[0] : data;
  
  if (!result) {
    return null;
  }

  return {
    total_score: result.total_score,
    // Normalize to lowercase — DB returns uppercase ('MYTHIC'), types expect lowercase ('mythic')
    rarity_tier: (result.rarity_tier as string).toLowerCase() as RarityTier,
    venue_score: result.venue_score,
    city_score: result.city_score,
    event_score: result.event_score,
    volume_score: result.volume_score,
    venue_count: result.venue_count,
    city_count: result.city_count,
    event_count: result.event_count,
    year_count: result.year_count,
  };
};

export const getRarityBreakdown = (result: RarityResult): RarityBreakdown => {
  return {
    venue: {
      score: result.venue_score,
      count: result.venue_count,
      maxScore: 40,
      label: result.venue_count === 0 
        ? 'First time at venue!' 
        : `${result.venue_count} shows here (5yr)`,
    },
    city: {
      score: result.city_score,
      count: result.city_count,
      maxScore: 30,
      label: result.city_count === 0 
        ? 'First visit this year!' 
        : `${result.city_count} visits (12mo)`,
    },
    event: {
      score: result.event_score,
      count: result.event_count,
      maxScore: 20,
      label: result.event_count === 0 
        ? 'First time at event!' 
        : `${result.event_count} times at event`,
    },
    volume: {
      score: result.volume_score,
      count: result.year_count,
      maxScore: 10,
      label: result.year_count <= 5 
        ? 'Exclusive touring!' 
        : `${result.year_count} shows this year`,
    },
  };
};

export const getTierFromScore = (score: number): RarityTier => {
  if (score >= 99) return 'mythic';
  if (score >= 86) return 'legendary';
  if (score >= 71) return 'rare';
  if (score >= 41) return 'uncommon';
  return 'common';
};
