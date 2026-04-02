import { useState, useMemo } from 'react';
import { useTimeBlocks, useCreateTimeBlock, useDeleteTimeBlock } from '@/hooks/useTimeBlocks';
import { useTasks } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { autoSchedule, minutesToTime } from '@/lib/timeblocking/autoScheduler';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Clock, Zap, GripVertical } from 'lucide-react';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm

interface Props {
  date: Date;
}

export function DailyTimeline({ date }: Props) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const { data: timeBlocks } = useTimeBlocks(dateStr);
  const { data: todayTasks } = useTasks({ dueToday: true });
  const createBlock = useCreateTimeBlock();
  const deleteBlock = useDeleteTimeBlock();

  const scheduledTaskIds = new Set((timeBlocks || []).map((b) => b.task_id));
  const unscheduledTasks = (todayTasks || []).filter(
    (t) => !scheduledTaskIds.has(t.id) && !t.completed_at
  );

  const handleAutoSchedule = async () => {
    if (!unscheduledTasks.length) return;
    const p1p2 = unscheduledTasks.filter((t) => t.priority <= 2);
    const tasksToSchedule = p1p2.length > 0 ? p1p2 : unscheduledTasks.slice(0, 4);

    const slots = autoSchedule(
      tasksToSchedule.map((t) => ({ id: t.id, title: t.title, priority: t.priority })),
      (timeBlocks || []).map((b) => ({ task_id: b.task_id, start_time: b.start_time, end_time: b.end_time }))
    );

    for (const slot of slots) {
      await createBlock.mutateAsync({
        task_id: slot.taskId,
        block_date: dateStr,
        start_time: minutesToTime(slot.startMinutes),
        end_time: minutesToTime(slot.endMinutes),
      });
    }
  };

  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex-1 relative border rounded-lg overflow-hidden bg-card">
        {HOURS.map((hour) => (
          <div key={hour} className="flex items-start border-b border-border/30 h-14">
            <div className="w-14 shrink-0 text-[10px] text-muted-foreground py-1 text-right pr-2">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            <div className="flex-1 relative" />
          </div>
        ))}

        {/* Render time blocks */}
        {(timeBlocks || []).map((block) => {
          const startMin = parseTime(block.start_time);
          const endMin = parseTime(block.end_time);
          const top = ((startMin - 6 * 60) / 60) * 56; // 56px per hour (h-14)
          const height = ((endMin - startMin) / 60) * 56;

          return (
            <div
              key={block.id}
              className="absolute left-14 right-1 rounded-md bg-primary/10 border border-primary/30 px-2 py-1 cursor-pointer group"
              style={{ top: `${top}px`, height: `${Math.max(height, 24)}px` }}
            >
              <div className="flex items-center gap-1">
                <p className="text-xs font-medium truncate flex-1">{block.task?.title || 'Task'}</p>
                <button
                  onClick={() => deleteBlock.mutate(block.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive text-[10px]"
                >
                  ×
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {block.start_time.slice(0, 5)} – {block.end_time.slice(0, 5)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Unscheduled column */}
      <div className="w-48 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Unscheduled</h4>
          {unscheduledTasks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] gap-1"
              onClick={handleAutoSchedule}
              disabled={createBlock.isPending}
            >
              <Zap className="h-3 w-3" />
              Auto
            </Button>
          )}
        </div>
        {unscheduledTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-md border bg-card px-2 py-1.5 text-xs cursor-move hover:bg-accent/50 transition-colors"
          >
            <p className="font-medium truncate">{task.title}</p>
            {task.priority < 4 && (
              <span className="text-[10px] text-muted-foreground">P{task.priority}</span>
            )}
          </div>
        ))}
        {unscheduledTasks.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">All scheduled ✓</p>
        )}
      </div>
    </div>
  );
}
