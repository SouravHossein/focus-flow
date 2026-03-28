import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface TaskCheckboxProps {
  checked: boolean;
  priority: number;
  onToggle: () => void;
}

const priorityRingColors: Record<number, string> = {
  1: 'border-priority-1 hover:bg-priority-1/10',
  2: 'border-priority-2 hover:bg-priority-2/10',
  3: 'border-priority-3 hover:bg-priority-3/10',
  4: 'border-border hover:bg-muted',
};

export function TaskCheckbox({ checked, priority, onToggle }: TaskCheckboxProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        'group flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
        checked
          ? 'border-muted-foreground bg-muted-foreground'
          : priorityRingColors[priority] || priorityRingColors[4]
      )}
      aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
    >
      {checked && <Check className="h-3 w-3 text-background animate-check-bounce" />}
    </button>
  );
}
