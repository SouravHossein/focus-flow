import { useState, useEffect } from 'react';
import { useUpdateTask, useDeleteTask, useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { useUIStore } from '@/stores/ui-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { TaskCheckbox } from './TaskCheckbox';
import { TaskList } from './TaskList';
import { useToggleTask, useCreateTask } from '@/hooks/use-tasks';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function TaskDetailDrawer() {
  const taskId = useUIStore((s) => s.taskDetailId);
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();
  const createSubtask = useCreateTask();
  const { data: projects } = useProjects();
  const { data: subtasks, isLoading: subtasksLoading } = useTasks({ parentTaskId: taskId || undefined });
  const { toast } = useToast();

  const [task, setTask] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(4);
  const [projectId, setProjectId] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (!taskId) return;
    supabase.from('tasks').select('*').eq('id', taskId).single().then(({ data }) => {
      if (data) {
        setTask(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setPriority(data.priority);
        setProjectId(data.project_id || '');
        setDueDate(data.due_date ? new Date(data.due_date) : undefined);
      }
    });
  }, [taskId]);

  const handleSave = async () => {
    if (!taskId) return;
    await updateTask.mutateAsync({
      id: taskId,
      title: title.trim(),
      description: description.trim() || null,
      priority,
      project_id: projectId || null,
      due_date: dueDate?.toISOString() || null,
    });
    toast({ title: 'Task updated' });
  };

  const handleDelete = async () => {
    if (!taskId) return;
    await deleteTask.mutateAsync(taskId);
    setTaskDetailId(null);
    toast({ title: 'Task deleted' });
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim() || !taskId) return;
    await createSubtask.mutateAsync({
      title: newSubtask.trim(),
      parent_task_id: taskId,
      project_id: task?.project_id || null,
    });
    setNewSubtask('');
  };

  return (
    <Sheet open={!!taskId} onOpenChange={(open) => !open && setTaskDetailId(null)}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-3">
            {task && (
              <TaskCheckbox
                checked={!!task.completed_at}
                priority={task.priority}
                onToggle={() => {
                  toggleTask.mutate({ id: task.id, completed: !task.completed_at });
                  setTask({ ...task, completed_at: task.completed_at ? null : new Date().toISOString() });
                }}
              />
            )}
            <span className="text-base">Task details</span>
          </SheetTitle>
        </SheetHeader>

        {task && (
          <div className="space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              className="text-base font-medium border-none px-0 focus-visible:ring-0"
              placeholder="Task title"
            />

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              placeholder="Add a description..."
              className="min-h-[80px] resize-none border-none px-0 focus-visible:ring-0"
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <Select value={String(priority)} onValueChange={(v) => { setPriority(Number(v)); }}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">🔴 Priority 1</SelectItem>
                    <SelectItem value="2">🟠 Priority 2</SelectItem>
                    <SelectItem value="3">🔵 Priority 3</SelectItem>
                    <SelectItem value="4">⚪ Priority 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due date</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {dueDate ? format(dueDate, 'MMM d') : 'No date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(d) => { setDueDate(d); }}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Project</span>
                <Select value={projectId} onValueChange={(v) => { setProjectId(v); }}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue placeholder="Inbox" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Inbox</SelectItem>
                    {projects?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="sm" className="w-full" onClick={handleSave} disabled={updateTask.isPending}>
                Save changes
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="mb-2 text-sm font-medium">Subtasks</h4>
              <TaskList tasks={subtasks} loading={subtasksLoading} emptyTitle="No subtasks" emptyDescription="Break this task into smaller steps" />
              <form onSubmit={handleAddSubtask} className="mt-2 flex gap-2">
                <Input
                  placeholder="Add subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button type="submit" size="sm" variant="ghost" className="h-8 px-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            </div>

            <div className="border-t pt-4">
              <Button variant="destructive" size="sm" className="w-full gap-1.5" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete task
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
