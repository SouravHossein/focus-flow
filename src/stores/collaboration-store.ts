import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkspaceRole } from '@/lib/workspace/workspacePermissions';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  owner_id: string;
  plan: string;
  is_personal: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
  invited_by: string | null;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
    email?: string;
  };
}

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  invited_by: string;
  email: string | null;
  token: string;
  role: string;
  type: string;
  max_uses: number | null;
  use_count: number;
  expires_at: string | null;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

interface CollaborationState {
  activeWorkspace: Workspace | null;
  activeWorkspaceId: string | null;
  myRole: WorkspaceRole | null;
  workspaces: Workspace[];

  setActiveWorkspace: (ws: Workspace, role: WorkspaceRole) => void;
  setWorkspaces: (ws: Workspace[]) => void;
  setMyRole: (role: WorkspaceRole) => void;
  clearWorkspace: () => void;
}

export const useCollaborationStore = create<CollaborationState>()(
  persist(
    (set) => ({
      activeWorkspace: null,
      activeWorkspaceId: null,
      myRole: null,
      workspaces: [],

      setActiveWorkspace: (ws, role) =>
        set({ activeWorkspace: ws, activeWorkspaceId: ws.id, myRole: role }),

      setWorkspaces: (ws) => set({ workspaces: ws }),

      setMyRole: (role) => set({ myRole: role }),

      clearWorkspace: () =>
        set({ activeWorkspace: null, activeWorkspaceId: null, myRole: null }),
    }),
    {
      name: 'collaboration-store',
      partialize: (state) => ({ activeWorkspaceId: state.activeWorkspaceId }),
    },
  ),
);
