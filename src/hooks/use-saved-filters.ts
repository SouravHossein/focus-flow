import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

type SavedFilter = Tables<'saved_filters'>;

export interface FilterConfig {
  projectId?: string;
  labelIds?: string[];
  priorities?: number[];
  dueDateRange?: { from?: string; to?: string };
  status?: 'all' | 'completed' | 'incomplete';
}

export function useSavedFilters() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-filters', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as SavedFilter[];
    },
    enabled: !!user,
  });
}

export function useCreateSavedFilter() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, filterConfig }: { name: string; filterConfig: FilterConfig }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('saved_filters')
        .insert({ name, filter_config: filterConfig as any, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-filters'] }),
  });
}

export function useDeleteSavedFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('saved_filters').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-filters'] }),
  });
}
