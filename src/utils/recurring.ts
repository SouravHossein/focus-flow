import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // e.g. every 2 weeks
  daysOfWeek?: number[]; // 0=Sun..6=Sat for weekly
}

export function getNextDueDate(
  currentDueDate: string | null,
  pattern: RecurringPattern
): string {
  const base = currentDueDate ? new Date(currentDueDate) : new Date();
  let next: Date;

  switch (pattern.frequency) {
    case 'daily':
      next = addDays(base, pattern.interval);
      break;
    case 'weekly':
      next = addWeeks(base, pattern.interval);
      break;
    case 'monthly':
      next = addMonths(base, pattern.interval);
      break;
    case 'yearly':
      next = addYears(base, pattern.interval);
      break;
    default:
      next = addDays(base, 1);
  }

  // If next is in the past, keep advancing until it's in the future
  const now = new Date();
  while (next < now) {
    switch (pattern.frequency) {
      case 'daily':
        next = addDays(next, pattern.interval);
        break;
      case 'weekly':
        next = addWeeks(next, pattern.interval);
        break;
      case 'monthly':
        next = addMonths(next, pattern.interval);
        break;
      case 'yearly':
        next = addYears(next, pattern.interval);
        break;
    }
  }

  return next.toISOString();
}

export const RECURRING_OPTIONS = [
  { label: 'None', value: null },
  { label: 'Daily', value: { frequency: 'daily', interval: 1 } as RecurringPattern },
  { label: 'Weekly', value: { frequency: 'weekly', interval: 1 } as RecurringPattern },
  { label: 'Biweekly', value: { frequency: 'weekly', interval: 2 } as RecurringPattern },
  { label: 'Monthly', value: { frequency: 'monthly', interval: 1 } as RecurringPattern },
  { label: 'Yearly', value: { frequency: 'yearly', interval: 1 } as RecurringPattern },
];

export function getRecurringLabel(pattern: RecurringPattern | null): string {
  if (!pattern) return 'None';
  const match = RECURRING_OPTIONS.find(
    (o) => o.value?.frequency === pattern.frequency && o.value?.interval === pattern.interval
  );
  if (match) return match.label;
  return `Every ${pattern.interval} ${pattern.frequency}`;
}
