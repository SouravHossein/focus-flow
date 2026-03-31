import { useTasks } from '@/hooks/use-tasks';
import { TaskList } from '@/components/tasks/TaskList';
import { AlertTriangle } from 'lucide-react';

export default function OverduePage() {
  const { data: tasks, isLoading } = useTasks({ dueOverdue: true });

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h1 className="text-xl font-bold text-foreground">Overdue</h1>
      </div>
      <TaskList
        tasks={tasks}
        loading={isLoading}
        emptyTitle="All caught up!"
        emptyDescription="No overdue tasks — keep up the great work"
      />
    </div>
  );
}
