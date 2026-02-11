import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { mockActiveGoals, mockGoals, mockTargetEvents } from '@/lib/mockData';

export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: 'target_event' | 'holy_grail_artist' | 'holy_grail_venue';
  reference_id: string | null;
  reference_name: string;
  target_date: string | null;
  completed_at: string | null;
  completed_gem_id: string | null;
  created_at: string;
}

export interface CreateGoalParams {
  goal_type: 'target_event' | 'holy_grail_artist' | 'holy_grail_venue';
  reference_id?: string;
  reference_name: string;
  target_date?: string;
}

// Fetch user's active goals (not completed)
export const useActiveGoals = (userId: string | undefined) => {
  const { isMockMode } = useAuth();
  return useQuery({
    queryKey: ['user-goals', userId, 'active'],
    queryFn: async () => {
      if (isMockMode) return mockActiveGoals;
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .is('completed_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserGoal[];
    },
    enabled: !!userId || isMockMode,
  });
};

// Fetch all user goals including completed
export const useAllGoals = (userId: string | undefined) => {
  const { isMockMode } = useAuth();
  return useQuery({
    queryKey: ['user-goals', userId, 'all'],
    queryFn: async () => {
      if (isMockMode) return mockGoals;
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false, nullsFirst: true })
        .order('target_date', { ascending: true });
      
      if (error) throw error;
      return data as UserGoal[];
    },
    enabled: !!userId,
  });
};

// Create a new goal
export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, goal }: { userId: string; goal: CreateGoalParams }) => {
      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: userId,
          goal_type: goal.goal_type,
          reference_id: goal.reference_id || null,
          reference_name: goal.reference_name,
          target_date: goal.target_date || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as UserGoal;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-goals', variables.userId] });
      toast.success('Goal added to your quest list!');
    },
    onError: (error) => {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    },
  });
};

// Delete a goal
export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ goalId, userId }: { goalId: string; userId: string }) => {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-goals', variables.userId] });
      toast.success('Goal removed');
    },
    onError: (error) => {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    },
  });
};

// Get target events (ghost gems) for the shelf display
export const useTargetEvents = (userId: string | undefined) => {
  const { isMockMode } = useAuth();
  return useQuery({
    queryKey: ['target-events', userId],
    queryFn: async () => {
      if (isMockMode) return mockTargetEvents;
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_type', 'target_event')
        .is('completed_at', null)
        .order('target_date', { ascending: true });
      
      if (error) throw error;
      return data as UserGoal[];
    },
    enabled: !!userId || isMockMode,
  });
};

// Get holy grail artists
export const useHolyGrailArtists = (userId: string | undefined) => {
  const { isMockMode } = useAuth();
  return useQuery({
    queryKey: ['holy-grail-artists', userId],
    queryFn: async () => {
      if (isMockMode) return mockGoals.filter(g => g.goal_type === 'holy_grail_artist' && !g.completed_at);
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_type', 'holy_grail_artist')
        .is('completed_at', null);
      
      if (error) throw error;
      return data as UserGoal[];
    },
    enabled: !!userId || isMockMode,
  });
};
