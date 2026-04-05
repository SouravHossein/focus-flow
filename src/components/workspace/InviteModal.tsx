import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateInvitation } from '@/hooks/use-workspaces';
import { useCollaborationStore } from '@/stores/collaboration-store';
import { useToast } from '@/hooks/use-toast';
import { X, Copy, Check } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteModal({ open, onOpenChange }: Props) {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [role, setRole] = useState<string>('member');
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const activeWorkspace = useCollaborationStore((s) => s.activeWorkspace);
  const createInvitation = useCreateInvitation();
  const { toast } = useToast();

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const addEmail = (raw: string) => {
    const parts = raw.split(/[,;\s\n]+/).map((s) => s.trim()).filter(Boolean);
    const valid = parts.filter(isValidEmail);
    const newEmails = [...new Set([...emails, ...valid])];
    setEmails(newEmails);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['Enter', 'Tab', ','].includes(e.key) && inputValue.trim()) {
      e.preventDefault();
      addEmail(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
      setEmails(emails.slice(0, -1));
    }
  };

  const handleSendInvites = async () => {
    if (!activeWorkspace || emails.length === 0) return;
    try {
      for (const email of emails) {
        await createInvitation.mutateAsync({
          workspace_id: activeWorkspace.id,
          email,
          role,
          type: 'email',
        });
      }
      toast({ title: `${emails.length} invite(s) created` });
      setEmails([]);
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleGenerateLink = async () => {
    if (!activeWorkspace) return;
    try {
      const inv = await createInvitation.mutateAsync({
        workspace_id: activeWorkspace.id,
        role,
        type: 'link',
        max_uses: 50,
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      });
      setInviteLink(`${window.location.origin}/invite/${inv.token}`);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const copyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite members to {activeWorkspace?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email addresses</Label>
            <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-ring">
              {emails.map((email) => (
                <Badge key={email} variant="secondary" className="gap-1">
                  {email}
                  <button onClick={() => setEmails(emails.filter((e) => e !== email))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => inputValue.trim() && addEmail(inputValue)}
                placeholder={emails.length ? '' : 'name@example.com'}
                className="flex-1 min-w-[120px] bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin — Can manage members and settings</SelectItem>
                <SelectItem value="member">Member — Can create and edit tasks</SelectItem>
                <SelectItem value="viewer">Viewer — View only access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSendInvites} disabled={emails.length === 0 || createInvitation.isPending} className="w-full">
            {createInvitation.isPending ? 'Sending...' : `Send ${emails.length} invite${emails.length !== 1 ? 's' : ''}`}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div>
          </div>

          {!inviteLink ? (
            <Button variant="outline" onClick={handleGenerateLink} className="w-full">
              Generate invite link
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
