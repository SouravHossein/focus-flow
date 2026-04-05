import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { PermissionAction } from '@/lib/workspace/workspacePermissions';

interface PermissionGateProps {
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ action, children, fallback = null }: PermissionGateProps) {
  const { can } = usePermissions();
  return can(action) ? <>{children}</> : <>{fallback}</>;
}
