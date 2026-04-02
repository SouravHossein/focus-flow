import { useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { useDependencies, useAddDependency, useRemoveDependency } from '@/hooks/useDependencies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Link2, X, Search, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  taskId: string;
}

export function DependencySection({ taskId }: Props) {
  const { data: deps, isLoading } = useDependencies(taskId);
  const addDep = useAddDependency();
  const removeDep = useRemoveDependency();
  const { data: allTasks } = useTasks({});
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState<'blocked_by' | 'blocks' | null>(null);

  const filteredTasks = (allTasks || []).filter(
    (t) =>
      t.id !== taskId &&
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !deps?.blockedBy.some((d: any) => d.blocking_task_id === t.id) &&
      !deps?.blocks.some((d: any) => d.blocked_task_id === t.id)
  );

  const handleAdd = async (targetTaskId: string) => {
    try {
      if (showSearch === 'blocked_by') {
        await addDep.mutateAsync({ blockingTaskId: targetTaskId, blockedTaskId: taskId });
      } else {
        await addDep.mutateAsync({ blockingTaskId: taskId, blockedTaskId: targetTaskId });
      }
      setShowSearch(null);
      setSearchQuery('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) return null;

  return (
    <div className="border-t pt-4 space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-1.5">
        <Link2 className="h-3.5 w-3.5" />
        Dependencies
      </h4>

      {/* Blocked by */}
      {deps?.blockedBy && deps.blockedBy.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Blocked by</p>
          {deps.blockedBy.map((d: any) => (
            <div key={d.id} className="flex items-center gap-2 py-1">
              <AlertCircle className={cn('h-3 w-3 shrink-0', d.blocking_task?.completed_at ? 'text-green-500' : 'text-orange-500')} />
              <span className={cn('text-sm flex-1 truncate', d.blocking_task?.completed_at && 'line-through text-muted-foreground')}>
                {d.blocking_task?.title}
              </span>
              <button onClick={() => removeDep.mutate(d.id)} className="text-muted-foreground hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Blocks */}
      {deps?.blocks && deps.blocks.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Blocks</p>
          {deps.blocks.map((d: any) => (
            <div key={d.id} className="flex items-center gap-2 py-1">
              <span className="text-sm flex-1 truncate">{d.blocked_task?.title}</span>
              <button onClick={() => removeDep.mutate(d.id)} className="text-muted-foreground hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search UI */}
      {showSearch && (
        <div className="space-y-1">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-xs"
            autoFocus
          />
          <div className="max-h-32 overflow-y-auto">
            {filteredTasks.slice(0, 5).map((t) => (
              <button
                key={t.id}
                className="flex w-full items-center px-2 py-1.5 text-xs hover:bg-accent/50 rounded text-left"
                onClick={() => handleAdd(t.id)}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setShowSearch(showSearch === 'blocked_by' ? null : 'blocked_by')}
        >
          + Blocked by
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setShowSearch(showSearch === 'blocks' ? null : 'blocks')}
        >
          + Blocks
        </Button>
      </div>
    </div>
  );
}
