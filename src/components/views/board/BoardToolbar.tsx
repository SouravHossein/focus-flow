import { Button } from '@/components/ui/button';
import type { GroupMode } from '@/lib/views/board/boardGrouping';

interface BoardToolbarProps {
  groupMode: GroupMode;
  onGroupModeChange: (mode: GroupMode) => void;
}

export function BoardToolbar({ groupMode, onGroupModeChange }: BoardToolbarProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs text-muted-foreground">Group by:</span>
      <div className="flex gap-0.5 rounded-lg border p-0.5">
        <Button
          variant={groupMode === 'status' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-6 text-xs px-2"
          onClick={() => onGroupModeChange('status')}
        >
          Status
        </Button>
        <Button
          variant={groupMode === 'priority' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-6 text-xs px-2"
          onClick={() => onGroupModeChange('priority')}
        >
          Priority
        </Button>
      </div>
    </div>
  );
}
