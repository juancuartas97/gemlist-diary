import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from './useGemData';

export interface RecentPerformance {
  id: string;
  performance_date: string;
  venue_id: string | null;
  city: string;
  event_series_id: string | null;
  venue?: Venue;
  event_series?: {
    id: string;
    name: string;
  };
}

export const useDJRecentPerformances = (djId: string | null) => {
  const [performances, setPerformances] = useState<RecentPerformance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!djId) {
      setPerformances([]);
      return;
    }

    const fetchPerformances = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('dj_performances')
        .select(`
          id,
          performance_date,
          venue_id,
          city,
          event_series_id,
          venue:venues(*),
          event_series:event_series(id, name)
        `)
        .eq('dj_id', djId)
        .order('performance_date', { ascending: false })
        .limit(3);

      if (!error && data) {
        setPerformances(data as RecentPerformance[]);
      }
      setLoading(false);
    };

    fetchPerformances();
  }, [djId]);

  return { performances, loading };
};
