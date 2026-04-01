import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useFocusSessions(taskId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['focus-sessions', user?.id, taskId],
    queryFn: async () => {
      let query = supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .order('started_at', { ascending: false });
      if (taskId) query = query.eq('task_id', taskId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useTodayFocusStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['focus-stats-today', user?.id],
    queryFn: async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .eq('completed', true)
        .eq('session_type', 'focus')
        .gte('started_at', todayStart.toISOString());
      if (error) throw error;
      const totalMinutes = (data || []).reduce((sum, s) => sum + s.focus_minutes, 0);
      return { sessions: data?.length || 0, totalMinutes };
    },
    enabled: !!user,
  });
}

export function useCreateFocusSession() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (session: {
      task_id?: string | null;
      duration_seconds: number;
      focus_minutes: number;
      break_minutes: number;
      session_type?: string;
      notes?: string;
      session_tag?: string | null;
      ambient_sound?: string | null;
      strict_mode?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({ ...session, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['focus-sessions'] });
      qc.invalidateQueries({ queryKey: ['focus-stats-today'] });
    },
  });
}

export function useCompleteFocusSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await supabase
        .from('focus_sessions')
        .update({ completed: true, ended_at: new Date().toISOString(), notes: notes || null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['focus-sessions'] });
      qc.invalidateQueries({ queryKey: ['focus-stats-today'] });
      qc.invalidateQueries({ queryKey: ['journey-progress'] });
    },
  });
}
