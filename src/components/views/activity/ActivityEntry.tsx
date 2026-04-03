import { formatDistanceToNow } from 'date-fns';
import { formatActivityEntry } from '@/lib/activity/activityFormatter';
import { useUIStore } from '@/stores/ui-store';

interface ActivityEntryProps {
  entry: {
    id: string;
    event_type: string;
    entity_type: string;
    entity_id: string | null;
    entity_name: string | null;
    metadata: any;
    created_at: string;
  };
}

export function ActivityEntryComponent({ entry }: ActivityEntryProps) {
  const { icon, text } = formatActivityEntry(entry);
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);

  const handleClick = () => {
    if (entry.entity_type === 'task' && entry.entity_id) {
      setTaskDetailId(entry.entity_id);
    }
  };

  // Render bold markers as actual bold
  const renderedText = text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-semibold">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );

  return (
    <div
      className="flex items-start gap-3 px-3 py-2.5 hover:bg-accent/30 cursor-pointer rounded-lg transition-colors"
      onClick={handleClick}
    >
      <span className="text-base mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">{renderedText}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
