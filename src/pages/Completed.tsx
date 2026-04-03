import { useTasks, useUpdateTask, useDeleteTask, useToggleTask } from '@/hooks/use-tasks';
import { ViewSwitcher } from '@/components/views/ViewSwitcher';
import { ViewRouter } from '@/components/views/ViewRouter';
import { CheckCircle2 } from 'lucide-react';

export default function CompletedPage() {
  const { data: tasks, isLoading } = useTasks({ completedOnly: true });
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <h1 className="text-xl font-bold text-foreground">Completed</h1>
        </div>
        <ViewSwitcher context="smart-view" contextId="completed" />
      </div>

      <ViewRouter
        tasks={tasks || []}
        context="smart-view"
        contextId="completed"
        onTaskUpdate={(id, data) => updateTask.mutate({ id, ...data })}
        onTaskDelete={(id) => deleteTask.mutate(id)}
        onTaskComplete={(id, completed) => toggleTask.mutate({ id, completed })}
        isLoading={isLoading}
        emptyTitle="Nothing completed yet"
        emptyDescription="Complete some tasks to see them here"
      />
    </div>
  );
}
