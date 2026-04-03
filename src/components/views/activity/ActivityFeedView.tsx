import { useActivityFeed } from '@/hooks/views/useActivityFeed';
import { ActivityEntryComponent } from './ActivityEntry';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';

interface ActivityFeedViewProps {
  entityId?: string;
}

export function ActivityFeedView({ entityId }: ActivityFeedViewProps) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useActivityFeed(entityId);

  const entries = data?.pages.flatMap((p) => p.data) || [];

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Activity className="h-8 w-8 text-muted-foreground/40 mb-3" />
        <h3 className="text-base font-medium">No activity yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Actions you take will appear here</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-0.5">
        {entries.map((entry: any) => (
          <ActivityEntryComponent key={entry.id} entry={entry} />
        ))}
      </div>
      {hasNextPage && (
        <div className="py-4 text-center">
          <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
