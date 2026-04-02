import { useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { TaskList } from '@/components/tasks/TaskList';
import { DailyTimeline } from '@/components/timeblocking/DailyTimeline';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { List, Clock } from 'lucide-react';

export default function TodayPage() {
  const { data: tasks, isLoading } = useTasks({ dueToday: true });
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Today</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div className="flex gap-1 rounded-lg border p-0.5">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setViewMode('list')}
          >
            <List className="h-3.5 w-3.5" />
            List
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setViewMode('timeline')}
          >
            <Clock className="h-3.5 w-3.5" />
            Timeline
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <TaskList
          tasks={tasks}
          loading={isLoading}
          emptyTitle="All clear for today!"
          emptyDescription="No tasks due today — enjoy your free time"
        />
      ) : (
        <DailyTimeline date={new Date()} />
      )}
    </div>
  );
}
