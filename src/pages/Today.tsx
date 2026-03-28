import { useTasks } from '@/hooks/use-tasks';
import { TaskList } from '@/components/tasks/TaskList';
import { format } from 'date-fns';

export default function TodayPage() {
  const { data: tasks, isLoading } = useTasks({ dueToday: true });

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Today</h1>
        <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      <TaskList
        tasks={tasks}
        loading={isLoading}
        emptyTitle="All clear for today!"
        emptyDescription="No tasks due today — enjoy your free time"
      />
    </div>
  );
}
