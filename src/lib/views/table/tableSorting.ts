import type { Task } from '@/lib/views/types';

export type SortDirection = 'asc' | 'desc';
export interface SortColumn {
  field: keyof Task | string;
  direction: SortDirection;
}

export function multiColumnSort(tasks: Task[], sorts: SortColumn[]): Task[] {
  if (sorts.length === 0) return tasks;
  return [...tasks].sort((a, b) => {
    for (const sort of sorts) {
      const field = sort.field as keyof Task;
      const aVal = a[field];
      const bVal = b[field];
      const dir = sort.direction === 'asc' ? 1 : -1;

      if (aVal == null && bVal == null) continue;
      if (aVal == null) return 1 * dir;
      if (bVal == null) return -1 * dir;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        if (aVal !== bVal) return (aVal - bVal) * dir;
      } else {
        const cmp = String(aVal).localeCompare(String(bVal));
        if (cmp !== 0) return cmp * dir;
      }
    }
    return 0;
  });
}
