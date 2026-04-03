import { isToday, isBefore, subDays, startOfDay } from 'date-fns';
import type { Task } from '@/lib/views/types';

export interface SuggestionSection {
  title: string;
  tasks: Task[];
}

export function generateSuggestions(
  allTasks: Task[],
  myDayTaskIds: Set<string>
): SuggestionSection[] {
  const now = new Date();
  const twoDaysAgo = subDays(now, 2);
  const available = allTasks.filter((t) => !t.completed_at && !myDayTaskIds.has(t.id));

  const overdue = available.filter((t) => t.due_date && isBefore(new Date(t.due_date), startOfDay(now)));
  const dueToday = available.filter((t) => t.due_date && isToday(new Date(t.due_date)));
  const recent = available.filter((t) => new Date(t.created_at) >= twoDaysAgo && !t.due_date);
  const highPriority = available.filter((t) => t.priority <= 2 && !t.due_date);

  const sections: SuggestionSection[] = [];
  if (overdue.length) sections.push({ title: 'Overdue', tasks: overdue });
  if (dueToday.length) sections.push({ title: 'Due Today', tasks: dueToday });
  if (recent.length) sections.push({ title: 'Recently Added', tasks: recent.slice(0, 5) });
  if (highPriority.length) sections.push({ title: 'High Priority', tasks: highPriority.slice(0, 5) });

  return sections;
}
