import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCollaborationStore, type Workspace, type WorkspaceMember, type WorkspaceInvitation } from '@/stores/collaboration-store';
import type { WorkspaceRole } from '@/lib/workspace/workspacePermissions';
import { useEffect } from 'react';

export function useWorkspaces() {
  const { user } = useAuth();
  const { setWorkspaces, setActiveWorkspace, activeWorkspaceId } = useCollaborationStore();

  const query = useQuery({
    queryKey: ['workspaces', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get workspaces where user is a member
      const { data: memberships, error: mErr } = await supabase
        .from('workspace_members')
        .select('workspace_id, role')
        .eq('user_id', user.id);
      if (mErr) throw mErr;
      if (!memberships?.length) return [];

      const wsIds = memberships.map((m) => m.workspace_id);
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .in('id', wsIds)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((ws) => ({
        ...ws,
        settings: (ws.settings ?? {}) as Record<string, unknown>,
        _role: memberships.find((m) => m.workspace_id === ws.id)?.role as WorkspaceRole,
      }));
    },
    enabled: !!user,
  });

  // Auto-select workspace
  useEffect(() => {
    if (!query.data?.length) return;
    const workspaces = query.data;
    setWorkspaces(workspaces as unknown as Workspace[]);

    // If we have a saved workspace ID, use it
    const saved = workspaces.find((w) => w.id === activeWorkspaceId);
    if (saved) {
      setActiveWorkspace(saved as unknown as Workspace, saved._role);
      return;
    }

    // Default to personal workspace
    const personal = workspaces.find((w) => w.is_personal);
    const first = personal ?? workspaces[0];
    if (first) {
      setActiveWorkspace(first as unknown as Workspace, first._role);
    }
  }, [query.data, activeWorkspaceId, setWorkspaces, setActiveWorkspace]);

  return query;
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { name: string; slug: string; description?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('workspaces')
        .insert({ ...input, owner_id: user.id })
        .select()
        .single();
      if (error) throw error;

      // Add creator as owner member
      await supabase.from('workspace_members').insert({
        workspace_id: data.id,
        user_id: user.id,
        role: 'owner',
      });

      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspaces'] }),
  });
}

export function useUpdateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; slug?: string; description?: string }) => {
      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspaces'] }),
  });
}

export function useDeleteWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workspaces').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspaces'] }),
  });
}

export function useWorkspaceMembers(workspaceId: string | null) {
  return useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('joined_at', { ascending: true });
      if (error) throw error;

      // Fetch profiles for members
      const userIds = (data ?? []).map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      return (data ?? []).map((m) => ({
        ...m,
        role: m.role as WorkspaceRole,
        profile: profiles?.find((p) => p.id === m.user_id) ?? null,
      })) as WorkspaceMember[];
    },
    enabled: !!workspaceId,
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: WorkspaceRole }) => {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace-members'] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from('workspace_members').delete().eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace-members'] }),
  });
}

export function useWorkspaceInvitations(workspaceId: string | null) {
  return useQuery({
    queryKey: ['workspace-invitations', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as WorkspaceInvitation[];
    },
    enabled: !!workspaceId,
  });
}

export function useCreateInvitation() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      workspace_id: string;
      email?: string;
      role?: string;
      type?: string;
      max_uses?: number;
      expires_at?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const token = crypto.randomUUID() + crypto.randomUUID();
      const { data, error } = await supabase
        .from('workspace_invitations')
        .insert({
          ...input,
          invited_by: user.id,
          token,
          expires_at: input.expires_at ?? new Date(Date.now() + 7 * 86400000).toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace-invitations'] }),
  });
}

export function useAcceptInvitation() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!user) throw new Error('Not authenticated');

      // Get invitation
      const { data: inv, error: invErr } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('token', token)
        .single();
      if (invErr || !inv) throw new Error('Invalid invitation');

      // Validate
      if (inv.revoked_at) throw new Error('Invitation has been revoked');
      if (inv.expires_at && new Date(inv.expires_at) < new Date()) throw new Error('Invitation has expired');
      if (inv.max_uses && inv.use_count >= inv.max_uses) throw new Error('Invitation limit reached');

      // Check if already a member
      const { data: existing } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', inv.workspace_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) throw new Error('Already a member');

      // Join workspace
      const { error: joinErr } = await supabase.from('workspace_members').insert({
        workspace_id: inv.workspace_id,
        user_id: user.id,
        role: inv.role as WorkspaceRole,
        invited_by: inv.invited_by,
      });
      if (joinErr) throw joinErr;

      // Update invitation
      await supabase
        .from('workspace_invitations')
        .update({
          accepted_at: new Date().toISOString(),
          use_count: (inv.use_count ?? 0) + 1,
        })
        .eq('id', inv.id);

      return inv;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      qc.invalidateQueries({ queryKey: ['workspace-members'] });
    },
  });
}

export function useRevokeInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workspace_invitations')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace-invitations'] }),
  });
}

export function useCheckSlugAvailability() {
  return useMutation({
    mutationFn: async (slug: string) => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return !data; // true if available
    },
  });
}
