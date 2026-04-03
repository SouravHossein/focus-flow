import { differenceInDays, startOfDay } from 'date-fns';

export type ZoomLevel = 'day' | 'week' | 'month';

export function getColumnWidth(zoom: ZoomLevel): number {
  switch (zoom) {
    case 'day': return 40;
    case 'week': return 120;
    case 'month': return 200;
  }
}

export function getBarPosition(
  startDate: Date | null,
  dueDate: Date | null,
  timelineStart: Date,
  zoom: ZoomLevel
): { left: number; width: number } | null {
  const start = startDate ? startOfDay(startDate) : dueDate ? startOfDay(dueDate) : null;
  const end = dueDate ? startOfDay(dueDate) : start;
  if (!start || !end) return null;

  const colWidth = getColumnWidth(zoom);
  let leftDays = differenceInDays(start, startOfDay(timelineStart));
  let spanDays = differenceInDays(end, start) + 1;
  if (spanDays < 1) spanDays = 1;

  if (zoom === 'week') {
    return { left: (leftDays / 7) * colWidth, width: (spanDays / 7) * colWidth };
  }
  if (zoom === 'month') {
    return { left: (leftDays / 30) * colWidth, width: (spanDays / 30) * colWidth };
  }
  return { left: leftDays * colWidth, width: spanDays * colWidth };
}
