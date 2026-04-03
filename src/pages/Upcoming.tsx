import { useTasks, useUpdateTask, useDeleteTask, useToggleTask } from '@/hooks/use-tasks';
import { ViewSwitcher } from '@/components/views/ViewSwitcher';
import { ViewRouter } from '@/components/views/ViewRouter';

export default function UpcomingPage() {
  const { data: tasks, isLoading } = useTasks({ dueUpcoming: true });
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-foreground">Upcoming</h1>
        <ViewSwitcher context="smart-view" contextId="upcoming" />
      </div>
      <p className="text-sm text-muted-foreground mb-6">Tasks due in the next 7 days</p>

      <ViewRouter
        tasks={tasks || []}
        context="smart-view"
        contextId="upcoming"
        onTaskUpdate={(id, data) => updateTask.mutate({ id, ...data })}
        onTaskDelete={(id) => deleteTask.mutate(id)}
        onTaskComplete={(id, completed) => toggleTask.mutate({ id, completed })}
        isLoading={isLoading}
        emptyTitle="Nothing upcoming"
        emptyDescription="No tasks scheduled for the next 7 days"
      />
    </div>
  );
}
