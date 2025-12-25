import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Genre {
  id: string;
  name: string;
  parent_genre_id: string | null;
  color_hex: string;
}

export interface DJ {
  id: string;
  stage_name: string;
  primary_genre_id: string | null;
  home_city: string | null;
  genre?: Genre;
}

export interface Venue {
  id: string;
  name: string;
  venue_type: string;
  city: string;
  state: string | null;
  country: string;
}

export interface FacetRatings {
  sound_quality: number | null;
  energy: number | null;
  performance: number | null;
  crowd: number | null;
}

export interface UserGem {
  id: string;
  user_id: string;
  dj_id: string;
  primary_genre_id: string;
  event_date: string;
  collected_at: string;
  is_rated: boolean;
  facet_ratings: FacetRatings;
  private_note: string | null;
  venue_id: string | null;
  dj?: DJ;
  genre?: Genre;
  venue?: Venue;
}

export const useGenres = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      const { data, error } = await supabase
        .from('genres')
        .select('*')
        .order('name');
      
      if (!error && data) {
        setGenres(data);
      }
      setLoading(false);
    };

    fetchGenres();
  }, []);

  return { genres, loading };
};

export const useDJSearch = (query: string) => {
  const [djs, setDJs] = useState<DJ[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setDJs([]);
      return;
    }

    const searchDJs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('djs')
        .select(`
          *,
          genre:genres(*)
        `)
        .ilike('stage_name', `%${query}%`)
        .limit(10);
      
      if (!error && data) {
        setDJs(data as DJ[]);
      }
      setLoading(false);
    };

    const debounce = setTimeout(searchDJs, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return { djs, loading };
};

export const useVenueSearch = (query: string) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setVenues([]);
      return;
    }

    const searchVenues = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10);
      
      if (!error && data) {
        setVenues(data);
      }
      setLoading(false);
    };

    const debounce = setTimeout(searchVenues, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return { venues, loading };
};

export const useUserGems = (userId: string | undefined) => {
  const [gems, setGems] = useState<UserGem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGems = async () => {
    if (!userId) {
      setGems([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_gems')
      .select(`
        *,
        dj:djs(*),
        genre:genres(*),
        venue:venues(*)
      `)
      .eq('user_id', userId)
      .order('collected_at', { ascending: false });

    if (!error && data) {
      const transformedGems = data.map(gem => ({
        ...gem,
        facet_ratings: gem.facet_ratings as unknown as FacetRatings,
      })) as UserGem[];
      setGems(transformedGems);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGems();
  }, [userId]);

  return { gems, loading, refetch: fetchGems };
};

export const addDJ = async (stageName: string, genreId: string): Promise<DJ | null> => {
  const { data, error } = await supabase
    .from('djs')
    .insert({ stage_name: stageName, primary_genre_id: genreId })
    .select(`
      *,
      genre:genres(*)
    `)
    .single();

  if (error) {
    console.error('Error adding DJ:', error);
    return null;
  }

  return data as DJ;
};

export const addVenue = async (
  name: string, 
  venueType: string, 
  city: string, 
  country: string
): Promise<Venue | null> => {
  const { data, error } = await supabase
    .from('venues')
    .insert({ name, venue_type: venueType, city, country })
    .select()
    .single();

  if (error) {
    console.error('Error adding venue:', error);
    return null;
  }

  return data;
};

export const addUserGem = async (gem: {
  user_id: string;
  dj_id: string;
  primary_genre_id: string;
  event_date: string;
  venue_id?: string;
  facet_ratings?: {
    sound_quality: number | null;
    energy: number | null;
    performance: number | null;
    crowd: number | null;
  };
  private_note?: string;
}): Promise<UserGem | null> => {
  const { data, error } = await supabase
    .from('user_gems')
    .insert({
      ...gem,
      is_rated: gem.facet_ratings ? Object.values(gem.facet_ratings).some(v => v !== null) : false,
    })
    .select(`
      *,
      dj:djs(*),
      genre:genres(*),
      venue:venues(*)
    `)
    .single();

  if (error) {
    console.error('Error adding gem:', error);
    return null;
  }

  return {
    ...data,
    facet_ratings: data.facet_ratings as unknown as FacetRatings,
  } as UserGem;
};

// Get genre color for gem
export const getGenreColor = (colorHex: string) => {
  return colorHex;
};

// Group gems by DJ for stacking
export const groupGemsByDJ = (gems: UserGem[]): Map<string, UserGem[]> => {
  const grouped = new Map<string, UserGem[]>();
  
  gems.forEach(gem => {
    const key = gem.dj_id;
    const existing = grouped.get(key) || [];
    existing.push(gem);
    grouped.set(key, existing);
  });

  return grouped;
};
