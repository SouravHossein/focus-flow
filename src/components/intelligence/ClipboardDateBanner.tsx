import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CalendarCheck, X } from 'lucide-react';
import type { DetectedDate } from '@/lib/nlp/detectDatesInText';

interface Props {
  detectedDate: DetectedDate;
  onAccept: () => void;
  onDismiss: () => void;
}

export function ClipboardDateBanner({ detectedDate, onAccept, onDismiss }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 px-3 py-2 text-sm animate-in slide-in-from-top-2">
      <CalendarCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
      <span className="flex-1 text-blue-700 dark:text-blue-300">
        Date found: <strong>{format(detectedDate.date, 'EEEE, MMM d')}</strong> — Set as due date?
      </span>
      <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-700 dark:text-blue-300" onClick={onAccept}>
        Set it
      </Button>
      <button onClick={onDismiss} className="text-blue-400 hover:text-blue-600">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
