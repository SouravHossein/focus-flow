import { TaskCheckbox } from './TaskCheckbox';
import { DueDateBadge } from './DueDateBadge';
import { PriorityIndicator } from './PriorityIndicator';
import { useToggleTask } from '@/hooks/use-tasks';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type Task = Tables<'tasks'> & {
  task_labels?: { label_id: string; labels: Tables<'labels'> }[];
};

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const toggleTask = useToggleTask();
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);
  const isCompleted = !!task.completed_at;

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors cursor-pointer hover:bg-accent/50',
        isCompleted && 'opacity-60'
      )}
      onClick={() => setTaskDetailId(task.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setTaskDetailId(task.id)}
    >
      <div className="mt-0.5">
        <TaskCheckbox
          checked={isCompleted}
          priority={task.priority}
          onToggle={() => toggleTask.mutate({ id: task.id, completed: !isCompleted })}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium leading-snug', isCompleted && 'line-through text-muted-foreground')}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{task.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {task.priority < 4 && <PriorityIndicator priority={task.priority} />}
          {task.due_date && <DueDateBadge date={task.due_date} completed={isCompleted} />}
          {task.task_labels?.map((tl) => (
            <span
              key={tl.label_id}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: tl.labels.color + '20', color: tl.labels.color }}
            >
              {tl.labels.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
