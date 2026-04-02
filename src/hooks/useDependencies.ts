import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { detectCircularDependency } from '@/lib/dependencies/dependencyValidator';

export function useDependencies(taskId: string | null) {
  return useQuery({
    queryKey: ['dependencies', taskId],
    queryFn: async () => {
      if (!taskId) return { blockedBy: [], blocks: [] };
      const [blockedByRes, blocksRes] = await Promise.all([
        supabase
          .from('task_dependencies')
          .select('*, blocking_task:tasks!task_dependencies_blocking_task_id_fkey(id, title, completed_at)')
          .eq('blocked_task_id', taskId),
        supabase
          .from('task_dependencies')
          .select('*, blocked_task:tasks!task_dependencies_blocked_task_id_fkey(id, title, completed_at)')
          .eq('blocking_task_id', taskId),
      ]);
      return {
        blockedBy: (blockedByRes.data || []) as any[],
        blocks: (blocksRes.data || []) as any[],
      };
    },
    enabled: !!taskId,
  });
}

export function useAddDependency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ blockingTaskId, blockedTaskId }: { blockingTaskId: string; blockedTaskId: string }) => {
      // Check for circular deps
      const { data: allDeps } = await supabase.from('task_dependencies').select('blocking_task_id, blocked_task_id');
      const isCircular = detectCircularDependency(
        (allDeps || []).map((d) => ({ blocking_task_id: d.blocking_task_id, blocked_task_id: d.blocked_task_id })),
        blockingTaskId,
        blockedTaskId
      );
      if (isCircular) throw new Error('This would create a circular dependency');

      const { error } = await supabase.from('task_dependencies').insert({
        blocking_task_id: blockingTaskId,
        blocked_task_id: blockedTaskId,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dependencies'] }),
  });
}

export function useRemoveDependency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('task_dependencies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dependencies'] }),
  });
}

export function useTaskBlockedStatus(taskId: string | null) {
  return useQuery({
    queryKey: ['blocked-status', taskId],
    queryFn: async () => {
      if (!taskId) return false;
      const { data } = await supabase
        .from('task_dependencies')
        .select('blocking_task:tasks!task_dependencies_blocking_task_id_fkey(completed_at)')
        .eq('blocked_task_id', taskId);
      if (!data || data.length === 0) return false;
      return data.some((d: any) => !d.blocking_task?.completed_at);
    },
    enabled: !!taskId,
  });
}
