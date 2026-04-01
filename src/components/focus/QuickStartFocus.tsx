import { useFocusStore } from '@/stores/focus-store';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStartFocusProps {
  taskId: string;
  taskTitle: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function QuickStartFocus({ taskId, taskTitle, size = 'sm', className }: QuickStartFocusProps) {
  const openPreSession = useFocusStore(s => s.openPreSession);
  const isActive = useFocusStore(s => s.phase !== 'idle');

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isActive}
      className={cn(
        'rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10',
        size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        openPreSession(taskId, taskTitle);
      }}
      title="Start focus session"
    >
      <Play className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
    </Button>
  );
}
