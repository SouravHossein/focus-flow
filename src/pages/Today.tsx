import { useState } from 'react';
import { useTasks, useUpdateTask, useDeleteTask, useToggleTask } from '@/hooks/use-tasks';
import { ViewSwitcher } from '@/components/views/ViewSwitcher';
import { ViewRouter } from '@/components/views/ViewRouter';
import { format } from 'date-fns';

export default function TodayPage() {
  const { data: tasks, isLoading } = useTasks({ dueToday: true });
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Today</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <ViewSwitcher context="smart-view" contextId="today" />
      </div>

      <ViewRouter
        tasks={tasks || []}
        context="smart-view"
        contextId="today"
        onTaskUpdate={(id, data) => updateTask.mutate({ id, ...data })}
        onTaskDelete={(id) => deleteTask.mutate(id)}
        onTaskComplete={(id, completed) => toggleTask.mutate({ id, completed })}
        isLoading={isLoading}
        emptyTitle="All clear for today!"
        emptyDescription="No tasks due today — enjoy your free time"
      />
    </div>
  );
}
