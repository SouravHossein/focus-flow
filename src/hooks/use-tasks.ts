import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { getNextDueDate, type RecurringPattern } from '@/utils/recurring';
import { logActivity } from '@/lib/activity/activityLogger';

type Task = Tables<'tasks'>;
type TaskInsert = TablesInsert<'tasks'>;
type TaskUpdate = TablesUpdate<'tasks'>;

export function useTasks(options?: {
  projectId?: string | null;
  parentTaskId?: string | null;
  inboxOnly?: boolean;
  dueToday?: boolean;
  dueUpcoming?: boolean;
  dueOverdue?: boolean;
  completedOnly?: boolean;
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
      if (options?.completedOnly) {
        query = query.not('completed_at', 'is', null);
      } else if (!options?.includeCompleted) {
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
      if (options?.dueOverdue) {
        const now = new Date().toISOString();
        query = query.lt('due_date', now).is('completed_at', null);
      }

      // Filter out snoozed tasks (unless they're past snooze time)
      const now = new Date().toISOString();
      query = query.or(`snoozed_until.is.null,snoozed_until.lte.${now}`);

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
      if (user && data) {
        logActivity(user.id, 'task.created', 'task', data.id, data.title);
      }
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
      // Fetch name for activity log
      const { data: task } = await supabase.from('tasks').select('title, user_id').eq('id', id).single();
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      if (task) logActivity(task.user_id, 'task.deleted', 'task', id, task.title);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      // If completing, check if task is recurring
      if (completed) {
        const { data: task } = await supabase.from('tasks').select('*').eq('id', id).single();
        if (task?.is_recurring && task?.recurring_pattern) {
          const pattern = task.recurring_pattern as unknown as RecurringPattern;
          const nextDue = getNextDueDate(task.due_date, pattern);
          // Create next occurrence
          if (user) {
            await supabase.from('tasks').insert({
              title: task.title,
              description: task.description,
              priority: task.priority,
              project_id: task.project_id,
              section_id: task.section_id,
              user_id: user.id,
              is_recurring: true,
              recurring_pattern: task.recurring_pattern,
              due_date: nextDue,
              position: task.position,
            });
          }
        }
      }

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

export function useDuplicateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { data: original } = await supabase.from('tasks').select('*').eq('id', taskId).single();
      if (!original) throw new Error('Task not found');
      const { data, error } = await supabase.from('tasks').insert({
        title: `${original.title} (copy)`,
        description: original.description,
        priority: original.priority,
        due_date: original.due_date,
        project_id: original.project_id,
        section_id: original.section_id,
        user_id: user.id,
        is_recurring: original.is_recurring,
        recurring_pattern: original.recurring_pattern,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useSnoozeTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, until }: { id: string; until: string | null }) => {
      const { error } = await supabase.from('tasks').update({ snoozed_until: until }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tasks: { id: string; position: number }[]) => {
      await Promise.all(
        tasks.map((t) => supabase.from('tasks').update({ position: t.position }).eq('id', t.id))
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
