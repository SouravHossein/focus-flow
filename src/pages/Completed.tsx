import { useTasks } from '@/hooks/use-tasks';
import { TaskList } from '@/components/tasks/TaskList';
import { CheckCircle2 } from 'lucide-react';

export default function CompletedPage() {
  const { data: tasks, isLoading } = useTasks({ completedOnly: true });

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-success" />
        <h1 className="text-xl font-bold text-foreground">Completed</h1>
      </div>
      <TaskList
        tasks={tasks}
        loading={isLoading}
        emptyTitle="Nothing completed yet"
        emptyDescription="Complete some tasks to see them here"
      />
    </div>
  );
}
