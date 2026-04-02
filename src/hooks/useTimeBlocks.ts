import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useTimeBlocks(date?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['time-blocks', user?.id, date],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('time_blocks')
        .select('*, task:tasks(id, title, priority, completed_at)')
        .eq('user_id', user.id);
      if (date) query = query.eq('block_date', date);
      const { data, error } = await query.order('start_time');
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });
}

export function useCreateTimeBlock() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (block: { task_id: string; block_date: string; start_time: string; end_time: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('time_blocks')
        .insert({ ...block, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['time-blocks'] }),
  });
}

export function useUpdateTimeBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; start_time?: string; end_time?: string; block_date?: string }) => {
      const { error } = await supabase.from('time_blocks').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['time-blocks'] }),
  });
}

export function useDeleteTimeBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('time_blocks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['time-blocks'] }),
  });
}
