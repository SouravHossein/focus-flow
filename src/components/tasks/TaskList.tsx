import { TaskItem } from './TaskItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Task = Tables<'tasks'> & {
  task_labels?: { label_id: string; labels: Tables<'labels'> }[];
};

interface TaskListProps {
  tasks: Task[] | undefined;
  loading: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function TaskList({ tasks, loading, emptyTitle, emptyDescription }: TaskListProps) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium text-foreground">{emptyTitle || 'No tasks yet'}</h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {emptyDescription || 'Create your first task to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
