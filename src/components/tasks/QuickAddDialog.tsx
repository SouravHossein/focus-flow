import { useState, useCallback } from 'react';
import { useCreateTask } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { useLabels } from '@/hooks/use-labels';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useUIStore } from '@/stores/ui-store';
import { CalendarIcon, Flag, FolderOpen, Send } from 'lucide-react';
import { NLPTaskInput } from '@/components/intelligence/NLPTaskInput';
import { TemplatePickerModal } from '@/components/templates/TemplatePickerModal';
import { TemplateVariablePrompt } from '@/components/templates/TemplateVariablePrompt';
import { applyTemplate, extractVariables, type TemplateData } from '@/lib/templates/applyTemplate';
import type { ParsedTaskInput } from '@/lib/nlp/parseTaskInput';
import { useAddTaskLabel } from '@/hooks/use-task-labels';

const INBOX_PROJECT_VALUE = '__inbox__';

export function QuickAddDialog() {
  const open = useUIStore((s) => s.quickAddOpen);
  const setOpen = useUIStore((s) => s.setQuickAddOpen);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<number>(4);
  const [projectId, setProjectId] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<TemplateData | null>(null);
  const [templateVars, setTemplateVars] = useState<string[]>([]);
  const createTask = useCreateTask();
  const { data: projects } = useProjects();
  const { data: labels } = useLabels();
  const addTaskLabel = useAddTaskLabel();

  const [parsedLabels, setParsedLabels] = useState<string[]>([]);

  const handleParsed = useCallback((parsed: ParsedTaskInput) => {
    if (parsed.priority) setPriority(parsed.priority);
    if (parsed.dueDate) setDueDate(parsed.dueDate);
    if (parsed.projectHint && projects) {
      const match = projects.find((p) => p.name.toLowerCase() === parsed.projectHint!.toLowerCase());
      if (match) setProjectId(match.id);
    }
    if (parsed.labels.length > 0) setParsedLabels(parsed.labels);
  }, [projects]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;

    // Use parsed title (cleaned of tokens)
    const taskData = {
      title: title.trim(),
      priority,
      project_id: projectId || null,
      due_date: dueDate?.toISOString() || null,
    };

    const result = await createTask.mutateAsync(taskData);

    // Assign parsed labels
    if (parsedLabels.length > 0 && labels) {
      for (const labelName of parsedLabels) {
        const match = labels.find((l) => l.name.toLowerCase() === labelName.toLowerCase());
        if (match && result) {
          await addTaskLabel.mutateAsync({ taskId: result.id, labelId: match.id });
        }
      }
    }

    setTitle('');
    setPriority(4);
    setProjectId('');
    setDueDate(undefined);
    setParsedLabels([]);
    setOpen(false);
  };

  const handleTemplateSelect = (template: TemplateData, _name: string) => {
    const vars = extractVariables(template);
    if (vars.length > 0) {
      setPendingTemplate(template);
      setTemplateVars(vars);
    } else {
      applyTemplateToForm(template, {});
    }
  };

  const applyTemplateToForm = (template: TemplateData, variables: Record<string, string>) => {
    const resolved = applyTemplate(template, variables);
    setTitle(resolved.title);
    setPriority(resolved.priority);
    if (resolved.project_id) setProjectId(resolved.project_id);
    if (resolved.due_date) setDueDate(new Date(resolved.due_date));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick add task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <NLPTaskInput
              value={title}
              onChange={setTitle}
              onParsed={handleParsed}
              onSubmit={() => handleSubmit()}
              onTemplateTriggered={() => setTemplatePickerOpen(true)}
              autoFocus
            />

            <div className="flex flex-wrap gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {dueDate ? format(dueDate, 'MMM d') : 'Due date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <Select value={String(priority)} onValueChange={(v) => setPriority(Number(v))}>
                <SelectTrigger className="h-8 w-auto gap-1.5">
                  <Flag className="h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Priority 1</SelectItem>
                  <SelectItem value="2">Priority 2</SelectItem>
                  <SelectItem value="3">Priority 3</SelectItem>
                  <SelectItem value="4">Priority 4</SelectItem>
                </SelectContent>
              </Select>

              {projects && projects.length > 0 && (
                <Select
                  value={projectId || INBOX_PROJECT_VALUE}
                  onValueChange={(value) => setProjectId(value === INBOX_PROJECT_VALUE ? '' : value)}
                >
                  <SelectTrigger className="h-8 w-auto gap-1.5">
                    <FolderOpen className="h-3.5 w-3.5" />
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={INBOX_PROJECT_VALUE}>Inbox</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!title.trim() || createTask.isPending} size="sm" className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Add task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <TemplatePickerModal
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        onSelect={handleTemplateSelect}
      />

      {pendingTemplate && templateVars.length > 0 && (
        <TemplateVariablePrompt
          open={!!pendingTemplate}
          onOpenChange={(open) => { if (!open) setPendingTemplate(null); }}
          variables={templateVars}
          onResolve={(values) => {
            applyTemplateToForm(pendingTemplate!, values);
            setPendingTemplate(null);
          }}
        />
      )}
    </>
  );
}
