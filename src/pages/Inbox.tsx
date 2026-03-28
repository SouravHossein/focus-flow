import { useTasks, useCreateTask } from '@/hooks/use-tasks';
import { TaskList } from '@/components/tasks/TaskList';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function InboxPage() {
  const { data: tasks, isLoading } = useTasks({ inboxOnly: true });
  const createTask = useCreateTask();
  const [newTask, setNewTask] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    await createTask.mutateAsync({ title: newTask.trim() });
    setNewTask('');
  };

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="text-xl font-bold text-foreground mb-1">Inbox</h1>
      <p className="text-sm text-muted-foreground mb-6">Tasks that don't belong to any project</p>

      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <Input
          placeholder="Add a task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!newTask.trim() || createTask.isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <TaskList
        tasks={tasks}
        loading={isLoading}
        emptyTitle="Your inbox is empty"
        emptyDescription="Tasks without a project show up here"
      />
    </div>
  );
}
