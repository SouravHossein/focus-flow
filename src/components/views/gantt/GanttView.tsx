import { useState, useRef, useMemo } from 'react';
import { startOfDay, addDays, addWeeks, addMonths, format, differenceInDays, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useUIStore } from '@/stores/ui-store';
import { Skeleton } from '@/components/ui/skeleton';
import { getBarPosition, getColumnWidth, type ZoomLevel } from '@/lib/views/gantt/ganttLayout';
import { cn } from '@/lib/utils';
import type { ViewProps } from '@/lib/views/types';

const ROW_HEIGHT = 36;

export function GanttView({ tasks, isLoading }: ViewProps) {
  const [zoom, setZoom] = useState<ZoomLevel>('day');
  const containerRef = useRef<HTMLDivElement>(null);
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);

  const timelineStart = useMemo(() => {
    const dates = tasks.filter((t) => t.due_date || t.start_date).map((t) => new Date(t.start_date || t.due_date!));
    if (dates.length === 0) return startOfDay(new Date());
    return startOfDay(new Date(Math.min(...dates.map((d) => d.getTime()))));
  }, [tasks]);

  const colWidth = getColumnWidth(zoom);
  const numCols = zoom === 'day' ? 30 : zoom === 'week' ? 16 : 12;
  const totalWidth = numCols * colWidth;

  const columns = useMemo(() => {
    return Array.from({ length: numCols }, (_, i) => {
      const date = zoom === 'day' ? addDays(timelineStart, i)
        : zoom === 'week' ? addWeeks(timelineStart, i)
        : addMonths(timelineStart, i);
      return { date, label: zoom === 'day' ? format(date, 'MMM d') : zoom === 'week' ? `W${format(date, 'w')}` : format(date, 'MMM yyyy') };
    });
  }, [timelineStart, zoom, numCols]);

  const todayOffset = differenceInDays(startOfDay(new Date()), timelineStart);
  const todayLeft = zoom === 'day' ? todayOffset * colWidth : zoom === 'week' ? (todayOffset / 7) * colWidth : (todayOffset / 30) * colWidth;

  if (isLoading) {
    return <div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground">No tasks to display in Gantt view</p>
        <p className="text-xs text-muted-foreground mt-1">Add due dates to your tasks to see them here</p>
      </div>
    );
  }

  const priorityColor = (p: number) => {
    if (p === 1) return 'bg-red-500';
    if (p === 2) return 'bg-orange-500';
    if (p === 3) return 'bg-blue-500';
    return 'bg-primary';
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">Zoom:</span>
        {(['day', 'week', 'month'] as ZoomLevel[]).map((z) => (
          <Button key={z} variant={zoom === z ? 'secondary' : 'ghost'} size="sm" className="h-6 text-xs px-2" onClick={() => setZoom(z)}>
            {z.charAt(0).toUpperCase() + z.slice(1)}
          </Button>
        ))}
        <div className="hidden lg:block text-xs text-muted-foreground ml-auto">
          {tasks.length} task(s)
        </div>
      </div>

      <div className="flex rounded-lg border overflow-hidden" ref={containerRef}>
        {/* Left panel */}
        <div className="w-48 shrink-0 border-r bg-muted/30">
          <div className="h-8 border-b px-2 flex items-center text-xs font-semibold text-muted-foreground">Task</div>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="h-9 border-b px-2 flex items-center text-xs truncate cursor-pointer hover:bg-accent/50"
              style={{ height: ROW_HEIGHT }}
              onClick={() => setTaskDetailId(task.id)}
            >
              {task.title}
            </div>
          ))}
        </div>

        {/* Right timeline */}
        <ScrollArea className="flex-1">
          <div style={{ width: totalWidth }} className="relative">
            {/* Header */}
            <div className="flex h-8 border-b">
              {columns.map((col, i) => (
                <div
                  key={i}
                  className="border-r text-[10px] text-muted-foreground flex items-center justify-center shrink-0"
                  style={{ width: colWidth }}
                >
                  {col.label}
                </div>
              ))}
            </div>

            {/* Rows */}
            {tasks.map((task) => {
              const bar = getBarPosition(
                task.start_date ? new Date(task.start_date) : null,
                task.due_date ? new Date(task.due_date) : null,
                timelineStart,
                zoom
              );
              return (
                <div key={task.id} className="relative border-b" style={{ height: ROW_HEIGHT }}>
                  {/* Grid lines */}
                  {columns.map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-r border-border/30"
                      style={{ left: i * colWidth, width: colWidth }}
                    />
                  ))}
                  {bar && (
                    <div
                      className={cn(
                        'absolute top-1.5 h-5 rounded-md cursor-pointer opacity-90 hover:opacity-100 transition-opacity flex items-center px-1.5',
                        priorityColor(task.priority)
                      )}
                      style={{ left: Math.max(0, bar.left), width: Math.max(16, bar.width) }}
                      onClick={() => setTaskDetailId(task.id)}
                    >
                      <span className="text-[9px] text-white truncate font-medium">{task.title}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Today marker */}
            {todayLeft >= 0 && todayLeft <= totalWidth && (
              <div
                className="absolute top-0 bottom-0 w-px bg-destructive z-10"
                style={{ left: todayLeft }}
              />
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <p className="mt-2 text-xs text-muted-foreground lg:hidden">
        ← Scroll horizontally for the full timeline. Best on desktop.
      </p>
    </div>
  );
}
