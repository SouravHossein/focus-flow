import { useState, useEffect, useRef } from 'react';
import { useUpdateTask, useDeleteTask, useTasks, useDuplicateTask, useSnoozeTask } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { useLabels } from '@/hooks/use-labels';
import { useAddTaskLabel, useRemoveTaskLabel } from '@/hooks/use-task-labels';
import { useCreateReminder } from '@/hooks/use-reminders';
import { useCreateTemplate } from '@/hooks/use-templates';
import { useUIStore } from '@/stores/ui-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskCheckbox } from './TaskCheckbox';
import { TaskList } from './TaskList';
import { TaskComments } from './TaskComments';
import { DependencySection } from './DependencySection';
import { TimeBlockPicker } from './TimeBlockPicker';
import { ClipboardDateBanner } from '@/components/intelligence/ClipboardDateBanner';
import { useClipboardDateDetection } from '@/hooks/useClipboardDateDetection';
import { useTimeBlocks, useCreateTimeBlock, useDeleteTimeBlock } from '@/hooks/useTimeBlocks';
import { useToggleTask, useCreateTask } from '@/hooks/use-tasks';
import { cn } from '@/lib/utils';
import { format, addDays, addWeeks, addHours } from 'date-fns';
import { CalendarIcon, Trash2, Plus, Copy, Clock, Repeat, Bell, FileText, Pin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RECURRING_OPTIONS, getRecurringLabel, type RecurringPattern } from '@/utils/recurring';
import { useNavigationStore } from '@/stores/navigation-store';
import type { Tables } from '@/integrations/supabase/types';

const INBOX_PROJECT_VALUE = '__inbox__';

export function TaskDetailDrawer() {
  const taskId = useUIStore((s) => s.taskDetailId);
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();
  const createSubtask = useCreateTask();
  const duplicateTask = useDuplicateTask();
  const snoozeTask = useSnoozeTask();
  const createReminder = useCreateReminder();
  const createTemplate = useCreateTemplate();
  const { data: projects } = useProjects();
  const { data: labels } = useLabels();
  const { data: subtasks, isLoading: subtasksLoading } = useTasks({ parentTaskId: taskId || undefined });
  const addTaskLabel = useAddTaskLabel();
  const removeTaskLabel = useRemoveTaskLabel();
  const { toast } = useToast();
  const clipboardDetection = useClipboardDateDetection();
  const descRef = useRef<HTMLTextAreaElement>(null);

  const [task, setTask] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(4);
  const [projectId, setProjectId] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [newSubtask, setNewSubtask] = useState('');
  const [recurringPattern, setRecurringPattern] = useState<string>('none');
  const [taskLabels, setTaskLabels] = useState<string[]>([]);

  // Time block
  const createTimeBlock = useCreateTimeBlock();
  const deleteTimeBlock = useDeleteTimeBlock();
  const { data: taskTimeBlocks } = useTimeBlocks();
  const currentBlock = (taskTimeBlocks || []).find((b) => b.task_id === taskId);

  useEffect(() => {
    if (descRef.current) {
      return clipboardDetection.attachTo(descRef.current);
    }
  }, [taskId, clipboardDetection.attachTo]);

  useEffect(() => {
    if (!taskId) return;
    supabase.from('tasks').select('*, task_labels(label_id)').eq('id', taskId).single().then(({ data }) => {
      if (data) {
        setTask(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setPriority(data.priority);
        setProjectId(data.project_id || '');
        setDueDate(data.due_date ? new Date(data.due_date) : undefined);
        const rp = data.recurring_pattern as unknown as RecurringPattern | null;
        if (rp) {
          const match = RECURRING_OPTIONS.findIndex(
            (o) => o.value?.frequency === rp.frequency && o.value?.interval === rp.interval
          );
          setRecurringPattern(match > 0 ? String(match) : 'none');
        } else {
          setRecurringPattern('none');
        }
        setTaskLabels((data.task_labels as any[])?.map((tl: any) => tl.label_id) || []);
      }
    });
  }, [taskId]);

  const handleSave = async () => {
    if (!taskId) return;
    const rpIndex = Number(recurringPattern);
    const rp = recurringPattern !== 'none' && !isNaN(rpIndex) ? RECURRING_OPTIONS[rpIndex]?.value : null;
    await updateTask.mutateAsync({
      id: taskId,
      title: title.trim(),
      description: description.trim() || null,
      priority,
      project_id: projectId || null,
      due_date: dueDate?.toISOString() || null,
      is_recurring: !!rp,
      recurring_pattern: rp as any,
    });
    toast({ title: 'Task updated' });
  };

  const handleDelete = async () => {
    if (!taskId) return;
    await deleteTask.mutateAsync(taskId);
    setTaskDetailId(null);
    toast({ title: 'Task deleted' });
  };

  const handleDuplicate = async () => {
    if (!taskId) return;
    await duplicateTask.mutateAsync(taskId);
    toast({ title: 'Task duplicated' });
  };

  const handleSnooze = async (until: Date) => {
    if (!taskId) return;
    await snoozeTask.mutateAsync({ id: taskId, until: until.toISOString() });
    setTaskDetailId(null);
    toast({ title: `Snoozed until ${format(until, 'MMM d')}` });
  };

  const handleSetReminder = async (remindAt: Date) => {
    if (!taskId) return;
    await createReminder.mutateAsync({ taskId, remindAt: remindAt.toISOString() });
    toast({ title: `Reminder set for ${format(remindAt, 'MMM d, h:mm a')}` });
  };

  const handleToggleLabel = async (labelId: string) => {
    if (!taskId) return;
    if (taskLabels.includes(labelId)) {
      await removeTaskLabel.mutateAsync({ taskId, labelId });
      setTaskLabels((prev) => prev.filter((id) => id !== labelId));
    } else {
      await addTaskLabel.mutateAsync({ taskId, labelId });
      setTaskLabels((prev) => [...prev, labelId]);
    }
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

  const handleSaveAsTemplate = async () => {
    if (!task) return;
    await createTemplate.mutateAsync({
      name: task.title,
      category: 'General',
      template_data: {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        projectId: task.project_id,
      },
    });
    toast({ title: 'Saved as template' });
  };

  const handleAcceptClipboardDate = () => {
    const result = clipboardDetection.accept();
    if (result) {
      setDueDate(result.date);
    }
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

            {/* Clipboard date banner */}
            {clipboardDetection.visible && clipboardDetection.detectedDate && (
              <ClipboardDateBanner
                detectedDate={clipboardDetection.detectedDate}
                onAccept={handleAcceptClipboardDate}
                onDismiss={clipboardDetection.dismiss}
              />
            )}

            <Textarea
              ref={descRef}
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
                <Select
                  value={projectId || INBOX_PROJECT_VALUE}
                  onValueChange={(value) => { setProjectId(value === INBOX_PROJECT_VALUE ? '' : value); }}
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue placeholder="Inbox" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={INBOX_PROJECT_VALUE}>Inbox</SelectItem>
                    {projects?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Repeat className="h-3.5 w-3.5" />
                  Recurring
                </span>
                <Select value={recurringPattern} onValueChange={setRecurringPattern}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {RECURRING_OPTIONS.filter((o) => o.value).map((o, i) => (
                      <SelectItem key={o.label} value={String(RECURRING_OPTIONS.indexOf(o))}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Block */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Time block
                </span>
                <TimeBlockPicker
                  blockDate={currentBlock?.block_date}
                  startTime={currentBlock?.start_time}
                  endTime={currentBlock?.end_time}
                  onSave={async (block) => {
                    if (currentBlock) await deleteTimeBlock.mutateAsync(currentBlock.id);
                    if (taskId) await createTimeBlock.mutateAsync({ task_id: taskId, ...block });
                    toast({ title: 'Time block set' });
                  }}
                  onRemove={currentBlock ? async () => {
                    await deleteTimeBlock.mutateAsync(currentBlock.id);
                    toast({ title: 'Time block removed' });
                  } : undefined}
                />
              </div>

              <Button variant="outline" size="sm" className="w-full" onClick={handleSave} disabled={updateTask.isPending}>
                Save changes
              </Button>
            </div>

            {/* Labels */}
            {labels && labels.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="mb-2 text-sm font-medium">Labels</h4>
                <div className="space-y-1.5">
                  {labels.map((label) => (
                    <label key={label.id} className="flex items-center gap-2 cursor-pointer text-sm py-1">
                      <Checkbox
                        checked={taskLabels.includes(label.id)}
                        onCheckedChange={() => handleToggleLabel(label.id)}
                      />
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                      <span>{label.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Dependencies */}
            {taskId && <DependencySection taskId={taskId} />}

            {/* Subtasks */}
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

            {/* Comments */}
            {taskId && <TaskComments taskId={taskId} />}

            {/* Actions */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={handleDuplicate}>
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Snooze
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="end">
                    <div className="space-y-1">
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleSnooze(addDays(new Date(), 1))}>
                        Tomorrow
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleSnooze(addDays(new Date(), 3))}>
                        In 3 days
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleSnooze(addWeeks(new Date(), 1))}>
                        Next week
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Reminder */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full gap-1.5">
                    <Bell className="h-3.5 w-3.5" />
                    Set reminder
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="end">
                  <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleSetReminder(addHours(new Date(), 1))}>
                      In 1 hour
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleSetReminder(addHours(new Date(), 3))}>
                      In 3 hours
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleSetReminder(addDays(new Date(), 1))}>
                      Tomorrow morning
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleSetReminder(addWeeks(new Date(), 1))}>
                      Next week
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Save as template */}
              <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={handleSaveAsTemplate}>
                <FileText className="h-3.5 w-3.5" />
                Save as template
              </Button>

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
