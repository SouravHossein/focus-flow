import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useReminders, useDismissReminder } from '@/hooks/use-reminders';
import { useUIStore } from '@/stores/ui-store';
import { formatDistanceToNow, isPast } from 'date-fns';

export function ReminderBell() {
  const { data: reminders } = useReminders();
  const dismissReminder = useDismissReminder();
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);
  const [notified, setNotified] = useState<Set<string>>(new Set());

  const dueReminders = reminders?.filter((r) => isPast(new Date(r.remind_at))) || [];

  // Browser notification for due reminders
  useEffect(() => {
    if (!dueReminders.length) return;
    dueReminders.forEach((r) => {
      if (notified.has(r.id)) return;
      if (Notification.permission === 'granted') {
        new Notification('TaskFlow Reminder', { body: `You have a task reminder due` });
      }
      setNotified((prev) => new Set(prev).add(r.id));
    });
  }, [dueReminders, notified]);

  // Request permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {dueReminders.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {dueReminders.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="end">
        <h4 className="px-2 py-1 text-sm font-medium">Reminders</h4>
        {(!reminders || reminders.length === 0) ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">No reminders</p>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-1">
            {reminders.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-accent text-sm cursor-pointer"
                onClick={() => setTaskDetailId(r.task_id)}
              >
                <span className={isPast(new Date(r.remind_at)) ? 'text-destructive font-medium' : 'text-foreground'}>
                  {formatDistanceToNow(new Date(r.remind_at), { addSuffix: true })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => { e.stopPropagation(); dismissReminder.mutate(r.id); }}
                >
                  Dismiss
                </Button>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
