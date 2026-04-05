import { useState } from 'react';
import { useCollaborationStore, type Workspace } from '@/stores/collaboration-store';
import { useWorkspaces } from '@/hooks/use-workspaces';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronDown, Plus, Building2 } from 'lucide-react';
import { WorkspaceCreationModal } from './WorkspaceCreationModal';
import type { WorkspaceRole } from '@/lib/workspace/workspacePermissions';

export function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const { activeWorkspace, setActiveWorkspace, workspaces } = useCollaborationStore();
  const [createOpen, setCreateOpen] = useState(false);
  useWorkspaces(); // Keeps data loaded

  const handleSwitch = (ws: (typeof workspaces)[0]) => {
    // We need the role - fetch from workspace data
    setActiveWorkspace(ws, 'owner' as WorkspaceRole); // Will be refreshed by useWorkspaces
  };

  if (collapsed) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
          {activeWorkspace?.name?.charAt(0)?.toUpperCase() ?? 'W'}
        </div>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-accent/50 text-left transition-colors">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-semibold">
            {activeWorkspace?.name?.charAt(0)?.toUpperCase() ?? 'W'}
          </div>
          <span className="text-sm font-medium truncate flex-1">{activeWorkspace?.name ?? 'Workspace'}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => handleSwitch(ws)}
              className="flex items-center gap-2"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary text-xs font-semibold">
                {ws.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate flex-1">{ws.name}</span>
              {ws.id === activeWorkspace?.id && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create new workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <WorkspaceCreationModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
