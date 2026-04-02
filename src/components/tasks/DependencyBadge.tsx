import { useTaskBlockedStatus } from '@/hooks/useDependencies';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

interface Props {
  taskId: string;
}

export function DependencyBadge({ taskId }: Props) {
  const { data: isBlocked } = useTaskBlockedStatus(taskId);
  if (!isBlocked) return null;

  return (
    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5 text-orange-600 border-orange-300 dark:text-orange-400 dark:border-orange-700">
      <Lock className="h-2.5 w-2.5" />
      Blocked
    </Badge>
  );
}
