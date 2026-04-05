import { useState } from 'react';
import { useCollaborationStore } from '@/stores/collaboration-store';
import { useWorkspaceMembers, useWorkspaceInvitations, useUpdateWorkspace, useDeleteWorkspace, useUpdateMemberRole, useRemoveMember, useRevokeInvitation } from '@/hooks/use-workspaces';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { InviteModal } from '@/components/workspace/InviteModal';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, UserPlus, Shield, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { WorkspaceRole } from '@/lib/workspace/workspacePermissions';

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  member: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  viewer: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const PERMISSIONS_MATRIX = [
  { action: 'Create projects', owner: true, admin: true, member: true, viewer: false },
  { action: 'Delete any project', owner: true, admin: true, member: false, viewer: false },
  { action: 'Invite members', owner: true, admin: true, member: false, viewer: false },
  { action: 'Remove members', owner: true, admin: true, member: false, viewer: false },
  { action: 'Change roles', owner: true, admin: true, member: false, viewer: false },
  { action: 'Create tasks', owner: true, admin: true, member: true, viewer: false },
  { action: 'Edit tasks', owner: true, admin: true, member: true, viewer: false },
  { action: 'Complete tasks', owner: true, admin: true, member: true, viewer: false },
  { action: 'Delete tasks', owner: true, admin: true, member: true, viewer: false },
  { action: 'Comment', owner: true, admin: true, member: true, viewer: true },
  { action: 'View tasks/projects', owner: true, admin: true, member: true, viewer: true },
  { action: 'Delete workspace', owner: true, admin: false, member: false, viewer: false },
];

export default function WorkspaceSettingsPage() {
  const ws = useCollaborationStore((s) => s.activeWorkspace);
  const { user } = useAuth();
  const { can } = usePermissions();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editName, setEditName] = useState(ws?.name ?? '');

  const { data: members } = useWorkspaceMembers(ws?.id ?? null);
  const { data: invitations } = useWorkspaceInvitations(ws?.id ?? null);
  const updateWorkspace = useUpdateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const revokeInvitation = useRevokeInvitation();

  if (!ws) return <div className="p-8 text-muted-foreground">No workspace selected</div>;

  const handleSaveName = async () => {
    if (editName.trim() && editName !== ws.name) {
      await updateWorkspace.mutateAsync({ id: ws.id, name: editName.trim() });
      toast({ title: 'Workspace updated' });
    }
  };

  const handleDeleteWorkspace = async () => {
    await deleteWorkspace.mutateAsync(ws.id);
    toast({ title: 'Workspace deleted' });
    navigate('/app/inbox');
  };

  const handleRoleChange = async (memberId: string, role: WorkspaceRole) => {
    await updateRole.mutateAsync({ memberId, role });
    toast({ title: 'Role updated' });
  };

  const handleRemoveMember = async (memberId: string) => {
    await removeMember.mutateAsync(memberId);
    toast({ title: 'Member removed' });
  };

  const getInviteStatus = (inv: any) => {
    if (inv.revoked_at) return 'revoked';
    if (inv.accepted_at) return 'accepted';
    if (inv.expires_at && new Date(inv.expires_at) < new Date()) return 'expired';
    return 'pending';
  };

  const STATUS_BADGE: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    expired: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    revoked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="text-xl font-bold text-foreground mb-6">Workspace Settings</h1>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Workspace Info</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <div className="flex gap-2">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <Button onClick={handleSaveName} disabled={!editName.trim() || editName === ws.name}>Save</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Slug</span>
                  <span className="text-sm font-mono">{ws.slug}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <Badge variant="outline" className="capitalize">{ws.plan}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm">{ws.is_personal ? 'Personal' : 'Team'}</span>
                </div>
              </CardContent>
            </Card>

            {can('workspace:delete') && !ws.is_personal && (
              <Card className="border-destructive/30">
                <CardHeader><CardTitle className="text-base text-destructive">Danger Zone</CardTitle></CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete workspace</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{ws.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all projects, tasks, and members in this workspace.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteWorkspace} className="bg-destructive text-destructive-foreground">
                          Delete workspace
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Members ({members?.length ?? 0})</CardTitle>
              <PermissionGate action="workspace:invite_member">
                <Button size="sm" onClick={() => setInviteOpen(true)} className="gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  Invite
                </Button>
              </PermissionGate>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members?.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            {m.profile?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <span className="text-sm">{m.profile?.display_name ?? 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {can('workspace:change_role') && m.role !== 'owner' && m.user_id !== user?.id ? (
                          <Select value={m.role} onValueChange={(r) => handleRoleChange(m.id, r as WorkspaceRole)}>
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={ROLE_COLORS[m.role] ?? ''} variant="secondary">
                            {m.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(m.joined_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {can('workspace:remove_member') && m.role !== 'owner' && m.user_id !== user?.id && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveMember(m.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Invitations</CardTitle>
              <PermissionGate action="workspace:invite_member">
                <Button size="sm" onClick={() => setInviteOpen(true)} className="gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  Invite
                </Button>
              </PermissionGate>
            </CardHeader>
            <CardContent>
              {(!invitations || invitations.length === 0) ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No invitations yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email / Type</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((inv) => {
                      const status = getInviteStatus(inv);
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="text-sm">{inv.email || `Invite link`}</TableCell>
                          <TableCell>
                            <Badge className={ROLE_COLORS[inv.role] ?? ''} variant="secondary">
                              {inv.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_BADGE[status]} variant="secondary">
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            {status === 'pending' && can('workspace:invite_member') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => revokeInvitation.mutate(inv.id)}
                              >
                                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Roles & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-center">Owner</TableHead>
                    <TableHead className="text-center">Admin</TableHead>
                    <TableHead className="text-center">Member</TableHead>
                    <TableHead className="text-center">Viewer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PERMISSIONS_MATRIX.map((row) => (
                    <TableRow key={row.action}>
                      <TableCell className="text-sm">{row.action}</TableCell>
                      {(['owner', 'admin', 'member', 'viewer'] as const).map((role) => (
                        <TableCell key={role} className="text-center">
                          {row[role] ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InviteModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
