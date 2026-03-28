import { cn } from '@/lib/utils';

interface PriorityIndicatorProps {
  priority: number;
  className?: string;
}

const priorityConfig = {
  1: { label: 'P1', className: 'text-priority-1 border-priority-1' },
  2: { label: 'P2', className: 'text-priority-2 border-priority-2' },
  3: { label: 'P3', className: 'text-priority-3 border-priority-3' },
  4: { label: 'P4', className: 'text-priority-4 border-priority-4' },
} as const;

export function PriorityIndicator({ priority, className }: PriorityIndicatorProps) {
  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig[4];

  return (
    <span
      className={cn(
        'inline-flex h-5 items-center rounded border px-1.5 text-[10px] font-semibold uppercase',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
