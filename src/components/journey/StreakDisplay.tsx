import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface StreakDisplayProps {
  days: number;
  className?: string;
}

export function StreakDisplay({ days, className }: StreakDisplayProps) {
  if (days <= 0) return null;
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-medium', className)}>
      <Flame className="h-4 w-4 text-warning" />
      <span>{days}</span>
    </span>
  );
}
