import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Task = Tables<'tasks'>;
type TaskInsert = TablesInsert<'tasks'>;
type TaskUpdate = TablesUpdate<'tasks'>;

export function useTasks(options?: {
  projectId?: string | null;
  parentTaskId?: string | null;
  inboxOnly?: boolean;
  dueToday?: boolean;
  dueUpcoming?: boolean;
  includeCompleted?: boolean;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tasks', user?.id, options],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('tasks')
        .select('*, task_labels(label_id, labels(*))')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (options?.parentTaskId) {
        query = query.eq('parent_task_id', options.parentTaskId);
      } else if (!options?.parentTaskId) {
        query = query.is('parent_task_id', null);
      }

      if (options?.projectId) {
        query = query.eq('project_id', options.projectId);
      }
      if (options?.inboxOnly) {
        query = query.is('project_id', null);
      }
      if (!options?.includeCompleted) {
        query = query.is('completed_at', null);
      }
      if (options?.dueToday) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query = query.or(`due_date.lte.${tomorrow.toISOString()},and(due_date.lt.${new Date().toISOString()},completed_at.is.null)`);
      }
      if (options?.dueUpcoming) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        query = query.gte('due_date', today.toISOString()).lte('due_date', nextWeek.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Task & { task_labels: { label_id: string; labels: Tables<'labels'> }[] })[];
    },
    enabled: !!user,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (task: Omit<TaskInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ completed_at: completed ? new Date().toISOString() : null })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
