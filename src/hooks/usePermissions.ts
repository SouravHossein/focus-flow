import { useCollaborationStore } from '@/stores/collaboration-store';
import { canPerform, type PermissionAction, type WorkspaceRole } from '@/lib/workspace/workspacePermissions';

export function usePermissions() {
  const myRole = useCollaborationStore((s) => s.myRole);
  const activeWorkspace = useCollaborationStore((s) => s.activeWorkspace);

  const can = (action: PermissionAction): boolean => {
    // Personal workspace: owner of everything
    if (activeWorkspace?.is_personal) return true;
    return canPerform(myRole, action);
  };

  return { can, role: myRole, isPersonal: activeWorkspace?.is_personal ?? true };
}
