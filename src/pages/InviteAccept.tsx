import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAcceptInvitation } from '@/hooks/use-workspaces';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type InviteState = 'loading' | 'valid' | 'expired' | 'revoked' | 'invalid' | 'already_member' | 'accepted';

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const acceptInvitation = useAcceptInvitation();

  const [state, setState] = useState<InviteState>('loading');
  const [invitation, setInvitation] = useState<any>(null);
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    if (!token || authLoading) return;
    validateToken();
  }, [token, authLoading, user]);

  const validateToken = async () => {
    if (!token) { setState('invalid'); return; }

    const { data: inv, error } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (error || !inv) { setState('invalid'); return; }
    if (inv.revoked_at) { setState('revoked'); return; }
    if (inv.expires_at && new Date(inv.expires_at) < new Date()) { setState('expired'); return; }
    if (inv.max_uses && inv.use_count >= inv.max_uses) { setState('invalid'); return; }

    setInvitation(inv);

    // Fetch workspace name
    const { data: ws } = await supabase.from('workspaces').select('name').eq('id', inv.workspace_id).single();
    setWorkspaceName(ws?.name ?? 'Workspace');

    if (!user) {
      sessionStorage.setItem('pendingInviteToken', token);
      setState('valid');
      return;
    }

    // Check if already member
    const { data: existing } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', inv.workspace_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) { setState('already_member'); return; }
    setState('valid');
  };

  const handleAccept = async () => {
    if (!token) return;
    try {
      await acceptInvitation.mutateAsync(token);
      setState('accepted');
      toast({ title: `Welcome to ${workspaceName}!` });
      setTimeout(() => navigate('/app/inbox'), 1500);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>
            {state === 'loading' && 'Loading invitation...'}
            {state === 'valid' && `Join ${workspaceName}`}
            {state === 'accepted' && 'Welcome!'}
            {state === 'already_member' && 'Already a member'}
            {state === 'expired' && 'Invitation expired'}
            {state === 'revoked' && 'Invitation revoked'}
            {state === 'invalid' && 'Invalid invitation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {state === 'loading' && <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />}

          {state === 'valid' && !user && (
            <>
              <p className="text-sm text-muted-foreground">Sign in or create an account to join</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate('/auth')}>Sign in</Button>
                <Button variant="outline" onClick={() => navigate('/auth')}>Create account</Button>
              </div>
            </>
          )}

          {state === 'valid' && user && (
            <>
              <p className="text-sm text-muted-foreground">
                You'll join as <Badge variant="secondary" className="ml-1">{invitation?.role}</Badge>
              </p>
              <Button onClick={handleAccept} disabled={acceptInvitation.isPending} className="w-full">
                {acceptInvitation.isPending ? 'Joining...' : `Accept & Join ${workspaceName}`}
              </Button>
            </>
          )}

          {state === 'accepted' && <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />}

          {state === 'already_member' && (
            <>
              <p className="text-sm text-muted-foreground">You're already a member of this workspace</p>
              <Button onClick={() => navigate('/app/inbox')}>Go to workspace</Button>
            </>
          )}

          {(state === 'expired' || state === 'revoked' || state === 'invalid') && (
            <>
              <XCircle className="h-12 w-12 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">This invitation is no longer valid</p>
              <Button variant="outline" onClick={() => navigate('/')}>Go home</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
