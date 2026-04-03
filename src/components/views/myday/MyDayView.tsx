import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Sun, Plus, Pin, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCheckbox } from '@/components/tasks/TaskCheckbox';
import { DueDateBadge } from '@/components/tasks/DueDateBadge';
import { PriorityIndicator } from '@/components/tasks/PriorityIndicator';
import { useUIStore } from '@/stores/ui-store';
import { useMyDayTasks, useAddToMyDay, useRemoveFromMyDay, usePinMyDayTask } from '@/hooks/views/useMyDay';
import { useToggleTask, useTasks } from '@/hooks/use-tasks';
import { generateSuggestions } from '@/lib/views/myday/myDaySuggestions';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function MyDayPage() {
  const { data: myDayData, isLoading } = useMyDayTasks();
  const { data: allTasks } = useTasks({ includeCompleted: false });
  const addToMyDay = useAddToMyDay();
  const removeFromMyDay = useRemoveFromMyDay();
  const pinTask = usePinMyDayTask();
  const toggleTask = useToggleTask();
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const myDayTaskIds = useMemo(() => new Set((myDayData || []).map((d: any) => d.task_id)), [myDayData]);
  const suggestions = useMemo(
    () => generateSuggestions(allTasks || [], myDayTaskIds),
    [allTasks, myDayTaskIds]
  );

  const completedCount = (myDayData || []).filter((d: any) => d.tasks?.completed_at).length;
  const totalCount = (myDayData || []).length;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="flex items-center gap-3 mb-1">
        <Sun className="h-6 w-6 text-amber-500" />
        <h1 className="text-xl font-bold text-foreground">My Day</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{format(new Date(), 'EEEE, MMMM d')}</p>

      <div className="flex gap-8">
        {/* Main list */}
        <div className="flex-1 min-w-0">
          {totalCount > 0 && (
            <p className="text-xs text-muted-foreground mb-3">
              {completedCount} of {totalCount} done{completedCount === totalCount && totalCount > 0 ? ' 🎉' : ''}
            </p>
          )}

          {(myDayData || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sun className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <h3 className="text-base font-medium">What will you focus on today?</h3>
              <p className="text-sm text-muted-foreground mt-1">Add tasks from suggestions or your inbox</p>
            </div>
          ) : (
            <div className="space-y-1">
              {(myDayData || []).map((item: any) => {
                const task = item.tasks;
                if (!task) return null;
                const isCompleted = !!task.completed_at;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-accent/50 group cursor-pointer"
                    onClick={() => setTaskDetailId(task.id)}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <TaskCheckbox
                        checked={isCompleted}
                        priority={task.priority}
                        onToggle={() => toggleTask.mutate({ id: task.id, completed: !isCompleted })}
                      />
                    </div>
                    <span className={cn('flex-1 text-sm', isCompleted && 'line-through text-muted-foreground')}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-1">
                      {task.priority < 4 && <PriorityIndicator priority={task.priority} />}
                      {task.due_date && <DueDateBadge date={task.due_date} completed={isCompleted} />}
                      {item.pinned && <Pin className="h-3 w-3 text-amber-500" />}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => pinTask.mutate({ id: item.id, pinned: !item.pinned })}
                      >
                        <Pin className={cn('h-3 w-3', item.pinned && 'text-amber-500')} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromMyDay.mutate(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Suggestions panel */}
        <div className={cn('w-72 shrink-0 hidden md:block', !showSuggestions && 'w-8')}>
          {showSuggestions ? (
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Suggestions</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowSuggestions(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              {suggestions.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">No suggestions right now</p>
              )}
              {suggestions.map((section) => (
                <div key={section.title} className="mb-3">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    {section.title}
                  </h4>
                  {section.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-1.5 py-1 text-xs">
                      <span className="flex-1 truncate">{task.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0"
                        onClick={() => addToMyDay.mutate(task.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSuggestions(true)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
