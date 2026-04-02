import { useMemo } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { generateSuggestions, type TaskSuggestion } from '@/lib/intelligence/suggestionEngine';

export function useTaskSuggestions(query: string): TaskSuggestion[] {
  const { data: tasks } = useTasks({ includeCompleted: true });
  const { data: projects } = useProjects();

  return useMemo(() => {
    if (!query || query.length < 2 || !tasks) return [];
    return generateSuggestions(
      query,
      tasks,
      (projects || []).map((p) => ({ id: p.id, name: p.name }))
    );
  }, [query, tasks, projects]);
}
