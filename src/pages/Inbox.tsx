import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useToggleTask } from '@/hooks/use-tasks';
import { ViewSwitcher } from '@/components/views/ViewSwitcher';
import { ViewRouter } from '@/components/views/ViewRouter';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function InboxPage() {
  const { data: tasks, isLoading } = useTasks({ inboxOnly: true });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();
  const [newTask, setNewTask] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    await createTask.mutateAsync({ title: newTask.trim() });
    setNewTask('');
  };

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-foreground">Inbox</h1>
        <ViewSwitcher context="smart-view" contextId="inbox" />
      </div>
      <p className="text-sm text-muted-foreground mb-6">Tasks that don't belong to any project</p>

      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <Input placeholder="Add a task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} className="flex-1" />
        <Button type="submit" size="icon" disabled={!newTask.trim() || createTask.isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <ViewRouter
        tasks={tasks || []}
        context="smart-view"
        contextId="inbox"
        onTaskUpdate={(id, data) => updateTask.mutate({ id, ...data })}
        onTaskDelete={(id) => deleteTask.mutate(id)}
        onTaskComplete={(id, completed) => toggleTask.mutate({ id, completed })}
        isLoading={isLoading}
        emptyTitle="Your inbox is empty"
        emptyDescription="Tasks without a project show up here"
      />
    </div>
  );
}
