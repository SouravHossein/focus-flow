import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export function useMyDayTasks() {
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['my-day-tasks', user?.id, today],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('my_day_tasks')
        .select('*, tasks(*, task_labels(label_id, labels(*)))')
        .eq('user_id', user.id)
        .or(`added_date.eq.${today},pinned.eq.true`)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useAddToMyDay() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('my_day_tasks').insert({
        user_id: user.id,
        task_id: taskId,
        added_date: format(new Date(), 'yyyy-MM-dd'),
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-day-tasks'] }),
  });
}

export function useRemoveFromMyDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('my_day_tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-day-tasks'] }),
  });
}

export function usePinMyDayTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await supabase.from('my_day_tasks').update({ pinned }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-day-tasks'] }),
  });
}
