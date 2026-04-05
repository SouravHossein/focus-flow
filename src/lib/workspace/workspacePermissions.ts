export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export type PermissionAction =
  | 'workspace:invite_member'
  | 'workspace:remove_member'
  | 'workspace:change_role'
  | 'workspace:delete'
  | 'workspace:transfer_ownership'
  | 'workspace:manage_billing'
  | 'workspace:update'
  | 'project:create'
  | 'project:delete'
  | 'project:archive'
  | 'project:share'
  | 'task:create'
  | 'task:edit'
  | 'task:delete'
  | 'task:complete'
  | 'task:assign'
  | 'comment:create'
  | 'comment:delete_own'
  | 'comment:delete_any';

const ROLE_RANK: Record<WorkspaceRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

const PERMISSION_MATRIX: Record<PermissionAction, WorkspaceRole[]> = {
  'workspace:invite_member': ['owner', 'admin'],
  'workspace:remove_member': ['owner', 'admin'],
  'workspace:change_role': ['owner', 'admin'],
  'workspace:delete': ['owner'],
  'workspace:transfer_ownership': ['owner'],
  'workspace:manage_billing': ['owner', 'admin'],
  'workspace:update': ['owner', 'admin'],
  'project:create': ['owner', 'admin', 'member'],
  'project:delete': ['owner', 'admin'],
  'project:archive': ['owner', 'admin'],
  'project:share': ['owner', 'admin'],
  'task:create': ['owner', 'admin', 'member'],
  'task:edit': ['owner', 'admin', 'member'],
  'task:delete': ['owner', 'admin', 'member'],
  'task:complete': ['owner', 'admin', 'member'],
  'task:assign': ['owner', 'admin', 'member'],
  'comment:create': ['owner', 'admin', 'member', 'viewer'],
  'comment:delete_own': ['owner', 'admin', 'member', 'viewer'],
  'comment:delete_any': ['owner', 'admin'],
};

export function canPerform(role: WorkspaceRole | null, action: PermissionAction): boolean {
  if (!role) return false;
  return PERMISSION_MATRIX[action]?.includes(role) ?? false;
}

export function getRoleRank(role: WorkspaceRole): number {
  return ROLE_RANK[role] ?? 0;
}

export function isRoleHigherOrEqual(a: WorkspaceRole, b: WorkspaceRole): boolean {
  return getRoleRank(a) >= getRoleRank(b);
}

export function getEffectiveRole(
  workspaceRole: WorkspaceRole | null,
  projectRole?: WorkspaceRole | null,
): WorkspaceRole | null {
  if (!workspaceRole) return projectRole ?? null;
  if (!projectRole) return workspaceRole;
  return getRoleRank(projectRole) > getRoleRank(workspaceRole) ? projectRole : workspaceRole;
}
