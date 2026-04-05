import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateWorkspace, useCheckSlugAvailability } from '@/hooks/use-workspaces';
import { useCollaborationStore } from '@/stores/collaboration-store';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { WorkspaceRole } from '@/lib/workspace/workspacePermissions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkspaceCreationModal({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);

  const createWorkspace = useCreateWorkspace();
  const checkSlug = useCheckSlugAvailability();
  const { setActiveWorkspace } = useCollaborationStore();
  const { toast } = useToast();

  const generateSlug = (n: string) =>
    n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

  const handleNameChange = (val: string) => {
    setName(val);
    const newSlug = generateSlug(val);
    setSlug(newSlug);
    if (newSlug.length >= 2) {
      setSlugChecking(true);
      checkSlug.mutate(newSlug, {
        onSuccess: (available) => {
          setSlugAvailable(available);
          setSlugChecking(false);
        },
        onError: () => setSlugChecking(false),
      });
    }
  };

  const handleCreate = async () => {
    try {
      const ws = await createWorkspace.mutateAsync({ name, slug, description: description || undefined });
      setActiveWorkspace(ws as any, 'owner' as WorkspaceRole);
      toast({ title: 'Workspace created!' });
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setStep(1);
    setName('');
    setSlug('');
    setDescription('');
    setSlugAvailable(null);
  };

  const canProceed = name.length >= 2 && slug.length >= 2 && slugAvailable !== false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Create workspace' : step === 2 ? 'Invite members' : 'All set!'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Workspace name</Label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="My Team"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label>URL slug</Label>
              <div className="relative">
                <Input
                  value={slug}
                  onChange={(e) => {
                    const s = generateSlug(e.target.value);
                    setSlug(s);
                    if (s.length >= 2) {
                      setSlugChecking(true);
                      checkSlug.mutate(s, {
                        onSuccess: (a) => { setSlugAvailable(a); setSlugChecking(false); },
                        onError: () => setSlugChecking(false),
                      });
                    }
                  }}
                  placeholder="my-team"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {slugChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!slugChecking && slugAvailable === true && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {!slugChecking && slugAvailable === false && <XCircle className="h-4 w-4 text-destructive" />}
                </div>
              </div>
              {slugAvailable === false && (
                <p className="text-xs text-destructive">This slug is already taken</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this workspace for?"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={() => setStep(2)} disabled={!canProceed}>Next</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can invite team members after creating the workspace from the workspace settings.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleCreate} disabled={createWorkspace.isPending}>
                {createWorkspace.isPending ? 'Creating...' : 'Create workspace'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary text-2xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <p className="font-medium">{name}</p>
            <Button onClick={() => { onOpenChange(false); resetForm(); }} className="w-full">
              Go to workspace
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
