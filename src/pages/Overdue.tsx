import { useTasks, useUpdateTask, useDeleteTask, useToggleTask } from '@/hooks/use-tasks';
import { ViewSwitcher } from '@/components/views/ViewSwitcher';
import { ViewRouter } from '@/components/views/ViewRouter';
import { AlertTriangle } from 'lucide-react';

export default function OverduePage() {
  const { data: tasks, isLoading } = useTasks({ dueOverdue: true });
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h1 className="text-xl font-bold text-foreground">Overdue</h1>
        </div>
        <ViewSwitcher context="smart-view" contextId="overdue" />
      </div>

      <ViewRouter
        tasks={tasks || []}
        context="smart-view"
        contextId="overdue"
        onTaskUpdate={(id, data) => updateTask.mutate({ id, ...data })}
        onTaskDelete={(id) => deleteTask.mutate(id)}
        onTaskComplete={(id, completed) => toggleTask.mutate({ id, completed })}
        isLoading={isLoading}
        emptyTitle="All caught up!"
        emptyDescription="No overdue tasks — keep up the great work"
      />
    </div>
  );
}
