import { useViewPreferenceStore } from '@/stores/view-preference-store';
import type { ViewContext } from '@/lib/views/viewRegistry';
import type { ViewProps } from '@/lib/views/types';
import { TaskList } from '@/components/tasks/TaskList';
import { BoardView } from './board/BoardView';
import { CalendarView } from './calendar/CalendarView';
import { GanttView } from './gantt/GanttView';
import { TableView } from './table/TableView';
import { ActivityFeedView } from './activity/ActivityFeedView';

interface ViewRouterProps extends ViewProps {
  contextId?: string | null;
  /** fallback for list view empty state */
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ViewRouter({
  tasks,
  context,
  contextId,
  onTaskUpdate,
  onTaskDelete,
  onTaskComplete,
  isLoading,
  project,
  sections,
  emptyTitle,
  emptyDescription,
}: ViewRouterProps) {
  const activeView = useViewPreferenceStore((s) => s.getViewType(context, contextId));

  const viewProps: ViewProps = {
    tasks,
    context,
    onTaskUpdate,
    onTaskDelete,
    onTaskComplete,
    isLoading,
    project,
    sections,
  };

  switch (activeView) {
    case 'board':
      return <BoardView {...viewProps} />;
    case 'calendar':
      return <CalendarView {...viewProps} />;
    case 'gantt':
      return <GanttView {...viewProps} />;
    case 'table':
      return <TableView {...viewProps} />;
    case 'activity':
      return <ActivityFeedView />;
    case 'list':
    default:
      return (
        <TaskList
          tasks={tasks}
          loading={isLoading}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
      );
  }
}
