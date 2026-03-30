import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAddTaskLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, labelId }: { taskId: string; labelId: string }) => {
      const { error } = await supabase.from('task_labels').insert({ task_id: taskId, label_id: labelId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useRemoveTaskLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, labelId }: { taskId: string; labelId: string }) => {
      const { error } = await supabase.from('task_labels').delete().eq('task_id', taskId).eq('label_id', labelId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
