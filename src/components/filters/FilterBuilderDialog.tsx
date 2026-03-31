import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useProjects } from '@/hooks/use-projects';
import { useLabels } from '@/hooks/use-labels';
import { useCreateSavedFilter, type FilterConfig } from '@/hooks/use-saved-filters';
import { useToast } from '@/hooks/use-toast';

interface FilterBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilterBuilderDialog({ open, onOpenChange }: FilterBuilderDialogProps) {
  const { data: projects } = useProjects();
  const { data: labels } = useLabels();
  const createFilter = useCreateSavedFilter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<number[]>([]);
  const [status, setStatus] = useState<'all' | 'completed' | 'incomplete'>('incomplete');

  const togglePriority = (p: number) => {
    setPriorities((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const toggleLabel = (id: string) => {
    setSelectedLabels((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const config: FilterConfig = { status };
    if (projectId) config.projectId = projectId;
    if (selectedLabels.length) config.labelIds = selectedLabels;
    if (priorities.length) config.priorities = priorities;

    await createFilter.mutateAsync({ name: name.trim(), filterConfig: config });
    toast({ title: 'Filter saved' });
    onOpenChange(false);
    setName('');
    setProjectId('');
    setSelectedLabels([]);
    setPriorities([]);
    setStatus('incomplete');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create Saved Filter</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Filter name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. High priority work" className="mt-1" />
          </div>

          <div>
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Any project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any project</SelectItem>
                {projects?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Priority</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={priorities.includes(p) ? 'default' : 'outline'}
                  className="h-7 w-7 p-0 text-xs"
                  onClick={() => togglePriority(p)}
                >
                  P{p}
                </Button>
              ))}
            </div>
          </div>

          {labels && labels.length > 0 && (
            <div>
              <Label className="mb-2 block">Labels</Label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {labels.map((l) => (
                  <label key={l.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={selectedLabels.includes(l.id)} onCheckedChange={() => toggleLabel(l.id)} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    {l.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleSave} className="w-full" disabled={!name.trim()}>
            Save filter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
