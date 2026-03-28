import { useState } from 'react';
import { useCreateProject } from '@/hooks/use-projects';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const PROJECT_COLORS = [
  '#E85D4A', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
];

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const createProject = useCreateProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createProject.mutateAsync({ name: name.trim(), color });
    setName('');
    setColor(PROJECT_COLORS[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: c === color ? '2px solid hsl(var(--ring))' : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={!name.trim() || createProject.isPending}>
            {createProject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create project
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
