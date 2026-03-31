import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Reminder {
  id: string;
  task_id: string;
  user_id: string;
  remind_at: string;
  dismissed: boolean;
  created_at: string;
}

export function useReminders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reminders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('reminders' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('dismissed', false)
        .order('remind_at', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as Reminder[];
    },
    enabled: !!user,
    refetchInterval: 60000, // Check every minute
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ taskId, remindAt }: { taskId: string; remindAt: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('reminders' as any)
        .insert({ task_id: taskId, user_id: user.id, remind_at: remindAt })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }),
  });
}

export function useDismissReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reminders' as any)
        .update({ dismissed: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }),
  });
}
