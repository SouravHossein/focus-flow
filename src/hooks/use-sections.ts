import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export function useSections(projectId: string | undefined) {
  return useQuery({
    queryKey: ['sections', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });
      if (error) throw error;
      return data as Tables<'sections'>[];
    },
    enabled: !!projectId,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (section: TablesInsert<'sections'>) => {
      const { data, error } = await supabase.from('sections').insert(section).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections'] }),
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sections').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
