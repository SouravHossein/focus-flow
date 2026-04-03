import { useState } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, startOfMonth, startOfWeek, endOfMonth, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { Skeleton } from '@/components/ui/skeleton';
import type { ViewProps } from '@/lib/views/types';

export function CalendarView({ tasks, onTaskUpdate, isLoading }: ViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const weekStart = startOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(currentDate) });

  const tasksWithDueDate = tasks.filter((t) => t.due_date);

  const getTasksForDay = (day: Date) =>
    tasksWithDueDate.filter((t) => isSameDay(new Date(t.due_date!), day));

  const handlePrev = () => setCurrentDate((d) => (mode === 'month' ? subMonths(d, 1) : subWeeks(d, 1)));
  const handleNext = () => setCurrentDate((d) => (mode === 'month' ? addMonths(d, 1) : addWeeks(d, 1)));

  const priorityColor = (p: number) => {
    if (p === 1) return 'border-l-red-500';
    if (p === 2) return 'border-l-orange-500';
    if (p === 3) return 'border-l-blue-500';
    return 'border-l-transparent';
  };

  const renderDays = mode === 'month' ? days : weekDays;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-semibold min-w-[8rem] text-center">
            {mode === 'month' ? format(currentDate, 'MMMM yyyy') : `Week of ${format(weekStart, 'MMM d')}`}
          </h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
        <div className="flex gap-0.5 rounded-lg border p-0.5">
          <Button variant={mode === 'month' ? 'secondary' : 'ghost'} size="sm" className="h-6 text-xs px-2" onClick={() => setMode('month')}>
            Month
          </Button>
          <Button variant={mode === 'week' ? 'secondary' : 'ghost'} size="sm" className="h-6 text-xs px-2" onClick={() => setMode('week')}>
            Week
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px mb-px">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1.5 text-center text-xs font-medium text-muted-foreground">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {renderDays.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isCurrentMonth = mode === 'month' ? isSameMonth(day, currentDate) : true;
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'bg-card p-1.5 min-h-[5rem]',
                !isCurrentMonth && 'bg-muted/30',
                mode === 'week' && 'min-h-[12rem]'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full',
                    isToday(day) && 'bg-primary text-primary-foreground',
                    !isCurrentMonth && 'text-muted-foreground/50'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, mode === 'week' ? 8 : 3).map((task) => (
                  <button
                    key={task.id}
                    className={cn(
                      'w-full text-left rounded px-1 py-0.5 text-[10px] leading-tight truncate border-l-2 bg-accent/50 hover:bg-accent transition-colors',
                      priorityColor(task.priority),
                      task.completed_at && 'line-through opacity-50'
                    )}
                    onClick={() => setTaskDetailId(task.id)}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > (mode === 'week' ? 8 : 3) && (
                  <span className="text-[9px] text-muted-foreground px-1">
                    +{dayTasks.length - (mode === 'week' ? 8 : 3)} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unscheduled count */}
      {tasks.filter((t) => !t.due_date).length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {tasks.filter((t) => !t.due_date).length} unscheduled task(s)
        </p>
      )}
    </div>
  );
}
