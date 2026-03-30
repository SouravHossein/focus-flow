import { useState, useCallback } from 'react';
import { TaskItem } from './TaskItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Inbox, CheckSquare, Trash2, ArrowRight } from 'lucide-react';
import { useToggleTask, useDeleteTask, useReorderTasks } from '@/hooks/use-tasks';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { Tables } from '@/integrations/supabase/types';

type Task = Tables<'tasks'> & {
  task_labels?: { label_id: string; labels: Tables<'labels'> }[];
};

interface TaskListProps {
  tasks: Task[] | undefined;
  loading: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function TaskList({ tasks, loading, emptyTitle, emptyDescription }: TaskListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();
  const reorderTasks = useReorderTasks();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !tasks) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(tasks, oldIndex, newIndex);
    const updates = reordered.map((t, i) => ({ id: t.id, position: i }));
    reorderTasks.mutate(updates);
  }, [tasks, reorderTasks]);

  const handleBulkComplete = async () => {
    for (const id of selectedIds) {
      await toggleTask.mutateAsync({ id, completed: true });
    }
    toast({ title: `${selectedIds.size} task(s) completed` });
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteTask.mutateAsync(id);
    }
    toast({ title: `${selectedIds.size} task(s) deleted` });
    setSelectedIds(new Set());
  };

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium text-foreground">{emptyTitle || 'No tasks yet'}</h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {emptyDescription || 'Create your first task to get started'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Bulk actions toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-muted/60 border">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={handleBulkComplete}>
            <CheckSquare className="h-3.5 w-3.5" /> Complete
          </Button>
          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-destructive" onClick={handleBulkDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-border/50">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start">
                <label
                  className="mt-3 ml-1 shrink-0 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-muted-foreground/40 accent-primary"
                    checked={selectedIds.has(task.id)}
                    onChange={() => {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(task.id)) next.delete(task.id);
                        else next.add(task.id);
                        return next;
                      });
                    }}
                  />
                </label>
                <div className="flex-1 min-w-0">
                  <TaskItem task={task} />
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
