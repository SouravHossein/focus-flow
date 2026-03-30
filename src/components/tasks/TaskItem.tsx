import { useState, useRef } from 'react';
import { TaskCheckbox } from './TaskCheckbox';
import { DueDateBadge } from './DueDateBadge';
import { PriorityIndicator } from './PriorityIndicator';
import { useToggleTask, useUpdateTask } from '@/hooks/use-tasks';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { GripVertical, Repeat } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Tables } from '@/integrations/supabase/types';

type Task = Tables<'tasks'> & {
  task_labels?: { label_id: string; labels: Tables<'labels'> }[];
};

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const toggleTask = useToggleTask();
  const updateTask = useUpdateTask();
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);
  const isCompleted = !!task.completed_at;
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveInline = async () => {
    setEditing(false);
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      await updateTask.mutateAsync({ id: task.id, title: editTitle.trim() });
    } else {
      setEditTitle(task.title);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-start gap-2 rounded-lg border border-transparent px-3 py-2.5 transition-colors cursor-pointer hover:bg-accent/50',
        isCompleted && 'opacity-60',
        isDragging && 'opacity-40 shadow-lg bg-card'
      )}
      onClick={() => !editing && setTaskDetailId(task.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !editing && setTaskDetailId(task.id)}
    >
      {/* Drag handle */}
      <div
        className="mt-1 opacity-0 group-hover:opacity-60 cursor-grab active:cursor-grabbing shrink-0"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="mt-0.5 shrink-0">
        <TaskCheckbox
          checked={isCompleted}
          priority={task.priority}
          onToggle={() => toggleTask.mutate({ id: task.id, completed: !isCompleted })}
        />
      </div>

      <div className="min-w-0 flex-1">
        {editing ? (
          <Input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveInline}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveInline();
              if (e.key === 'Escape') { setEditing(false); setEditTitle(task.title); }
            }}
            className="h-auto py-0 px-0 text-sm font-medium border-none focus-visible:ring-0"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p
            className={cn('text-sm font-medium leading-snug', isCompleted && 'line-through text-muted-foreground')}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
              setEditTitle(task.title);
            }}
          >
            {task.title}
          </p>
        )}
        {task.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{task.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {task.priority < 4 && <PriorityIndicator priority={task.priority} />}
          {task.due_date && <DueDateBadge date={task.due_date} completed={isCompleted} />}
          {task.is_recurring && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Repeat className="h-3 w-3" />
            </span>
          )}
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
