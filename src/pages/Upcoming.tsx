import { useTasks } from '@/hooks/use-tasks';
import { TaskList } from '@/components/tasks/TaskList';

export default function UpcomingPage() {
  const { data: tasks, isLoading } = useTasks({ dueUpcoming: true });

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="text-xl font-bold text-foreground mb-1">Upcoming</h1>
      <p className="text-sm text-muted-foreground mb-6">Tasks due in the next 7 days</p>

      <TaskList
        tasks={tasks}
        loading={isLoading}
        emptyTitle="Nothing upcoming"
        emptyDescription="No tasks scheduled for the next 7 days"
      />
    </div>
  );
}
