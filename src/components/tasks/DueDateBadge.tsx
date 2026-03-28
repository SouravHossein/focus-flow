import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface DueDateBadgeProps {
  date: string;
  completed?: boolean;
}

export function DueDateBadge({ date, completed }: DueDateBadgeProps) {
  const d = new Date(date);
  const overdue = isPast(d) && !isToday(d) && !completed;

  let label: string;
  if (isToday(d)) label = 'Today';
  else if (isTomorrow(d)) label = 'Tomorrow';
  else if (isThisWeek(d)) label = format(d, 'EEE');
  else label = format(d, 'MMM d');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs',
        overdue ? 'text-destructive font-medium' : 'text-muted-foreground'
      )}
    >
      <Calendar className="h-3 w-3" />
      {label}
    </span>
  );
}
