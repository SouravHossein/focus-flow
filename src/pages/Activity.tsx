import { Activity } from 'lucide-react';
import { ActivityFeedView } from '@/components/views/activity/ActivityFeedView';

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Activity</h1>
      </div>
      <ActivityFeedView />
    </div>
  );
}
