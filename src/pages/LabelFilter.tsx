import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useLabels, useDeleteLabel } from '@/hooks/use-labels';
import { useTasks } from '@/hooks/use-tasks';
import { TaskList } from '@/components/tasks/TaskList';
import { Button } from '@/components/ui/button';
import { Tag, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigationStore } from '@/stores/navigation-store';

export default function LabelFilterPage() {
  const { labelId } = useParams();
  const { data: labels } = useLabels();
  const { data: allTasks, isLoading } = useTasks({ includeCompleted: false });
  const deleteLabel = useDeleteLabel();
  const navigate = useNavigate();
  const { toast } = useToast();

  const label = labels?.find((l) => l.id === labelId);
  const trackRecentItem = useNavigationStore((s) => s.trackRecentItem);

  useEffect(() => {
    if (label) {
      trackRecentItem({ id: label.id, type: 'label', name: label.name, icon: label.color });
    }
  }, [label?.id, label?.name, trackRecentItem]);
  const tasks = allTasks?.filter((t) =>
    t.task_labels?.some((tl) => tl.label_id === labelId)
  );

  const handleDelete = async () => {
    if (!labelId) return;
    await deleteLabel.mutateAsync(labelId);
    toast({ title: 'Label deleted' });
    navigate('/app/inbox');
  };

  if (!label && !isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Label not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {label && <Tag className="h-5 w-5" style={{ color: label.color }} />}
          <h1 className="text-xl font-bold text-foreground">{label?.name}</h1>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <TaskList
        tasks={tasks}
        loading={isLoading}
        emptyTitle="No tasks with this label"
        emptyDescription="Assign this label to tasks to see them here"
      />
    </div>
  );
}
