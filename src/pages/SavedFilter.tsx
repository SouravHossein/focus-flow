import { useParams } from 'react-router-dom';
import { useSavedFilters, type FilterConfig } from '@/hooks/use-saved-filters';
import { useTasks } from '@/hooks/use-tasks';
import { TaskList } from '@/components/tasks/TaskList';
import { Filter } from 'lucide-react';
import { useMemo } from 'react';

export default function SavedFilterPage() {
  const { filterId } = useParams();
  const { data: filters } = useSavedFilters();
  const filter = filters?.find((f) => f.id === filterId);
  const config = filter?.filter_config as unknown as FilterConfig | undefined;

  const { data: tasks, isLoading } = useTasks({
    projectId: config?.projectId || undefined,
    includeCompleted: config?.status === 'all' || config?.status === 'completed',
    completedOnly: config?.status === 'completed',
  });

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    let result = tasks;
    if (config?.priorities?.length) {
      result = result.filter((t) => config.priorities!.includes(t.priority));
    }
    if (config?.labelIds?.length) {
      result = result.filter((t) =>
        t.task_labels?.some((tl: any) => config.labelIds!.includes(tl.label_id))
      );
    }
    return result;
  }, [tasks, config]);

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Filter className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">{filter?.name || 'Filter'}</h1>
      </div>
      <TaskList
        tasks={filteredTasks}
        loading={isLoading}
        emptyTitle="No matching tasks"
        emptyDescription="Try adjusting your filter criteria"
      />
    </div>
  );
}
