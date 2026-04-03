import type { Task } from '@/lib/views/types';
import type { Tables } from '@/integrations/supabase/types';

export type GroupMode = 'status' | 'priority';

export interface BoardColumn {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

const PRIORITY_COLUMNS = [
  { id: 'p1', title: 'Priority 1', color: 'hsl(var(--priority-p1))' },
  { id: 'p2', title: 'Priority 2', color: 'hsl(var(--priority-p2))' },
  { id: 'p3', title: 'Priority 3', color: 'hsl(var(--priority-p3))' },
  { id: 'p4', title: 'No Priority', color: 'hsl(var(--muted-foreground))' },
];

export function groupTasks(
  tasks: Task[],
  mode: GroupMode,
  sections?: Tables<'sections'>[]
): BoardColumn[] {
  if (mode === 'priority') {
    return PRIORITY_COLUMNS.map((col, i) => ({
      ...col,
      tasks: tasks.filter((t) => t.priority === i + 1 || (i === 3 && t.priority >= 4)),
    }));
  }

  // By status / section
  if (sections && sections.length > 0) {
    const unsectioned: BoardColumn = {
      id: '__unsectioned__',
      title: 'No Section',
      color: 'hsl(var(--muted-foreground))',
      tasks: tasks.filter((t) => !t.section_id),
    };
    const sectionCols: BoardColumn[] = sections.map((s) => ({
      id: s.id,
      title: s.name,
      color: 'hsl(var(--primary))',
      tasks: tasks.filter((t) => t.section_id === s.id),
    }));
    return [unsectioned, ...sectionCols];
  }

  // Default columns when no sections exist
  const todo = tasks.filter((t) => !t.completed_at);
  const done = tasks.filter((t) => !!t.completed_at);
  return [
    { id: 'todo', title: 'To Do', color: 'hsl(var(--primary))', tasks: todo },
    { id: 'done', title: 'Done', color: 'hsl(var(--success))', tasks: done },
  ];
}
