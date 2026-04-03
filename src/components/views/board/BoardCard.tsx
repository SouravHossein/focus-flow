import { TaskCheckbox } from '@/components/tasks/TaskCheckbox';
import { DueDateBadge } from '@/components/tasks/DueDateBadge';
import { PriorityIndicator } from '@/components/tasks/PriorityIndicator';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { Task } from '@/lib/views/types';

interface BoardCardProps {
  task: Task;
  onComplete: (id: string, completed: boolean) => void;
}

export function BoardCard({ task, onComplete }: BoardCardProps) {
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);
  const isCompleted = !!task.completed_at;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-lg border bg-card p-3 shadow-sm cursor-pointer transition-shadow hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg',
        isCompleted && 'opacity-60'
      )}
      onClick={() => setTaskDetailId(task.id)}
    >
      <div className="flex items-start gap-2">
        <div
          className="mt-0.5 opacity-0 group-hover:opacity-60 cursor-grab shrink-0"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div
          className="shrink-0 mt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <TaskCheckbox
            checked={isCompleted}
            priority={task.priority}
            onToggle={() => onComplete(task.id, !isCompleted)}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-medium leading-snug line-clamp-2', isCompleted && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-8">
        {task.priority < 4 && <PriorityIndicator priority={task.priority} />}
        {task.due_date && <DueDateBadge date={task.due_date} completed={isCompleted} />}
        {task.task_labels?.slice(0, 2).map((tl) => (
          <span
            key={tl.label_id}
            className="inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium"
            style={{ backgroundColor: tl.labels.color + '20', color: tl.labels.color }}
          >
            {tl.labels.name}
          </span>
        ))}
        {(task.task_labels?.length || 0) > 2 && (
          <span className="text-[9px] text-muted-foreground">+{(task.task_labels?.length || 0) - 2}</span>
        )}
      </div>
    </div>
  );
}
