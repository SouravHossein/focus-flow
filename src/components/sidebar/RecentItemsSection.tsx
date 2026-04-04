import { useNavigate } from 'react-router-dom';
import { useNavigationStore } from '@/stores/navigation-store';
import { useUIStore } from '@/stores/ui-store';
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
import { CheckSquare, FolderOpen, Tag, Clock, ChevronRight, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

const typeIcons = {
  task: CheckSquare,
  project: FolderOpen,
  label: Tag,
  view: Clock,
};

export function RecentItemsSection() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const recentItems = useNavigationStore((s) => s.recentItems);
  const removeRecentItem = useNavigationStore((s) => s.removeRecentItem);
  const navigate = useNavigate();
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);
  const [open, setOpen] = useState(true);

  const items = recentItems.slice(0, 7);
  if (items.length === 0 || collapsed) return null;

  const handleClick = (item: (typeof items)[0]) => {
    if (item.type === 'task') setTaskDetailId(item.id);
    else if (item.type === 'project') navigate(`/app/project/${item.id}`);
    else if (item.type === 'label') navigate(`/app/label/${item.id}`);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="cursor-pointer flex items-center gap-1">
            <ChevronRight className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`} />
            <Clock className="h-3 w-3 mr-1" />
            <span>Recent</span>
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = typeIcons[item.type] || Clock;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleClick(item)}
                      className="group cursor-pointer"
                    >
                      <Icon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate flex-1 text-sm">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground hidden group-hover:hidden">
                        {formatDistanceToNow(new Date(item.visitedAt), { addSuffix: false })}
                      </span>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentItem(item.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
