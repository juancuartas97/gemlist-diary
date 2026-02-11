import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { mockUnlockedAchievements } from '@/lib/mockData';

export interface Achievement {
  id: string;
  slug: string;
  category: 'artist_mastery' | 'genre_dedication' | 'venue_loyalty' | 'special';
  name: string;
  description: string | null;
  tier: number;
  threshold: number | null;
  threshold_percent: number | null;
  icon_emoji: string;
  color_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  reference_id: string | null;
  reference_name: string | null;
  current_count: number;
  unlocked_at: string | null;
  achievement: Achievement;
}

export interface ArtistLeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  gem_count: number;
  first_collected: string;
  rank: number;
}

// Fetch all achievement definitions
export const useAchievementDefinitions = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true })
        .order('tier', { ascending: true });
      
      if (error) throw error;
      return data as Achievement[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour - these rarely change
  });
};

// Fetch user's achievement progress
export const useUserAchievements = (userId: string | undefined) => {
  const { isMockMode } = useAuth();
  return useQuery({
    queryKey: ['user-achievements', userId],
    queryFn: async () => {
      if (isMockMode) return mockUnlockedAchievements;
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!userId || isMockMode,
  });
};

// Get only unlocked achievements for trophy case display
export const useUnlockedAchievements = (userId: string | undefined) => {
  const { isMockMode } = useAuth();
  return useQuery({
    queryKey: ['unlocked-achievements', userId],
    queryFn: async () => {
      if (isMockMode) return mockUnlockedAchievements;
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .not('unlocked_at', 'is', null)
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!userId || isMockMode,
  });
};

// Get achievement progress for a specific artist
export const useArtistMasteryProgress = (userId: string | undefined, djId: string | undefined) => {
  return useQuery({
    queryKey: ['artist-mastery', userId, djId],
    queryFn: async () => {
      if (!userId || !djId) return null;
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .eq('reference_id', djId)
        .eq('achievement.category', 'artist_mastery')
        .order('achievement(tier)', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0] as UserAchievement | null;
    },
    enabled: !!userId && !!djId,
  });
};

// Get artist leaderboard using the database function
export const useArtistLeaderboard = (djId: string | undefined, limit: number = 10) => {
  return useQuery({
    queryKey: ['artist-leaderboard', djId, limit],
    queryFn: async () => {
      if (!djId) return [];
      
      const { data, error } = await supabase
        .rpc('get_artist_leaderboard', { p_dj_id: djId, p_limit: limit });
      
      if (error) throw error;
      return data as ArtistLeaderboardEntry[];
    },
    enabled: !!djId,
  });
};

// Get user's rank for a specific artist
export const useUserArtistRank = (userId: string | undefined, djId: string | undefined) => {
  return useQuery({
    queryKey: ['user-artist-rank', userId, djId],
    queryFn: async () => {
      if (!userId || !djId) return null;
      
      const { data, error } = await supabase
        .rpc('get_artist_leaderboard', { p_dj_id: djId, p_limit: 1000 });
      
      if (error) throw error;
      
      const leaderboard = data as ArtistLeaderboardEntry[];
      const userEntry = leaderboard.find(entry => entry.user_id === userId);
      
      if (!userEntry) return null;
      
      const totalCollectors = leaderboard.length;
      const percentile = Math.round((1 - (userEntry.rank - 1) / totalCollectors) * 100);
      
      return {
        ...userEntry,
        totalCollectors,
        percentile,
      };
    },
    enabled: !!userId && !!djId,
  });
};
