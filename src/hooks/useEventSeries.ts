import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Venue, Genre } from './useGemData';

export interface EventSeries {
  id: string;
  name: string;
  typical_month: number | null;
  typical_duration_days: number | null;
  primary_genre_id: string | null;
  default_venue_id: string | null;
  description: string | null;
  first_year: number | null;
  default_venue?: Venue;
  genre?: Genre;
}

export interface EventEdition {
  id: string;
  series_id: string;
  year: number;
  start_date: string;
  end_date: string | null;
  venue_id: string | null;
  status: string;
  notes: string | null;
  series?: EventSeries;
  venue?: Venue;
}

// Search for event series by name
export const useEventSeriesSearch = (query: string) => {
  const [series, setSeries] = useState<EventSeries[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSeries([]);
      return;
    }

    const searchSeries = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_series')
        .select(`
          *,
          default_venue:venues(*),
          genre:genres(*)
        `)
        .ilike('name', `%${query}%`)
        .order('name')
        .limit(10);
      
      if (!error && data) {
        setSeries(data as unknown as EventSeries[]);
      }
      setLoading(false);
    };

    const debounce = setTimeout(searchSeries, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return { series, loading };
};

// Get editions for a specific series
export const useSeriesEditions = (seriesId: string | null) => {
  const [editions, setEditions] = useState<EventEdition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!seriesId) {
      setEditions([]);
      return;
    }

    const fetchEditions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_editions')
        .select(`
          *,
          venue:venues(*)
        `)
        .eq('series_id', seriesId)
        .order('year', { ascending: false });
      
      if (!error && data) {
        setEditions(data as unknown as EventEdition[]);
      }
      setLoading(false);
    };

    fetchEditions();
  }, [seriesId]);

  return { editions, loading };
};

// Check if an edition exists for a given series and year
export const getEditionForYear = async (
  seriesId: string, 
  year: number
): Promise<EventEdition | null> => {
  const { data, error } = await supabase
    .from('event_editions')
    .select(`
      *,
      venue:venues(*)
    `)
    .eq('series_id', seriesId)
    .eq('year', year)
    .single();

  if (error || !data) return null;
  return data as unknown as EventEdition;
};

// Create a new event series
export const addEventSeries = async (series: {
  name: string;
  typical_month?: number;
  typical_duration_days?: number;
  primary_genre_id?: string;
  default_venue_id?: string;
  description?: string;
  first_year?: number;
}): Promise<EventSeries | null> => {
  const { data, error } = await supabase
    .from('event_series')
    .insert(series)
    .select(`
      *,
      default_venue:venues(*),
      genre:genres(*)
    `)
    .single();

  if (error) {
    console.error('Error adding event series:', error);
    return null;
  }

  return data as unknown as EventSeries;
};

// Create a new edition for a series
export const addEventEdition = async (edition: {
  series_id: string;
  year: number;
  start_date: string;
  end_date?: string;
  venue_id?: string;
  status?: string;
  notes?: string;
}): Promise<EventEdition | null> => {
  const { data, error } = await supabase
    .from('event_editions')
    .insert({
      ...edition,
      status: edition.status || 'scheduled',
    })
    .select(`
      *,
      venue:venues(*)
    `)
    .single();

  if (error) {
    console.error('Error adding event edition:', error);
    return null;
  }

  return data as unknown as EventEdition;
};

// Get venue for a specific edition, with fallback to series default
export const getVenueForEdition = async (
  seriesId: string,
  year: number
): Promise<Venue | null> => {
  // First check if there's a specific edition with venue
  const edition = await getEditionForYear(seriesId, year);
  if (edition?.venue) {
    return edition.venue;
  }

  // Fall back to series default venue
  const { data: series } = await supabase
    .from('event_series')
    .select(`
      *,
      default_venue:venues(*)
    `)
    .eq('id', seriesId)
    .single();

  if (series?.default_venue) {
    return series.default_venue as unknown as Venue;
  }

  return null;
};

// Get typical date for a series (returns month as 1-12)
export const getTypicalDateForSeries = async (
  seriesId: string
): Promise<{ month: number; duration: number } | null> => {
  const { data } = await supabase
    .from('event_series')
    .select('typical_month, typical_duration_days')
    .eq('id', seriesId)
    .single();

  if (data?.typical_month) {
    return {
      month: data.typical_month,
      duration: data.typical_duration_days || 3,
    };
  }

  return null;
};

// Helper to generate a suggested date for a given series and year
export const getSuggestedDate = (month: number, year: number): string => {
  // Use middle of the month as default
  const day = 15;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};
