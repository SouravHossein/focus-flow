import { useNavigate } from 'react-router-dom';
import { useNavigationStore } from '@/stores/navigation-store';
import { useUIStore } from '@/stores/ui-store';
import { useProjects } from '@/hooks/use-projects';
import { useSidebar } from '@/components/ui/sidebar';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Pin, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function PinnedItemsSection() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const pinnedProjectIds = useNavigationStore((s) => s.pinnedProjectIds);
  const pinnedTaskIds = useNavigationStore((s) => s.pinnedTaskIds);
  const { data: projects } = useProjects();
  const navigate = useNavigate();
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);
  const [open, setOpen] = useState(true);

  const pinnedProjects = projects?.filter((p) => pinnedProjectIds.includes(p.id)) || [];
  const hasPins = pinnedProjects.length > 0 || pinnedTaskIds.length > 0;

  if (!hasPins || collapsed) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="cursor-pointer flex items-center gap-1">
            <ChevronRight className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`} />
            <Pin className="h-3 w-3 mr-1" />
            <span>Pinned</span>
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {pinnedProjects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    onClick={() => navigate(`/app/project/${project.id}`)}
                    className="cursor-pointer"
                  >
                    <span
                      className="mr-2 h-3 w-3 rounded-sm shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
