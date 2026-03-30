import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/use-projects';
import { useLabels } from '@/hooks/use-labels';
import { useUIStore } from '@/stores/ui-store';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import {
  Inbox, CalendarDays, CalendarRange, FolderOpen, Tag, Plus,
  Settings, LogOut, Search, CheckSquare, BarChart3,
} from 'lucide-react';
import { useState } from 'react';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { CreateLabelDialog } from '@/components/labels/CreateLabelDialog';

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut, profile } = useAuth();
  const { data: projects } = useProjects();
  const { data: labels } = useLabels();
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const navigate = useNavigate();

  const mainNavItems = [
    { title: 'Inbox', url: '/app/inbox', icon: Inbox },
    { title: 'Today', url: '/app/today', icon: CalendarDays },
    { title: 'Upcoming', url: '/app/upcoming', icon: CalendarRange },
  ];

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckSquare className="h-4 w-4" />
            </div>
            {!collapsed && <span className="text-base font-bold text-foreground">TaskFlow</span>}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {!collapsed && (
            <div className="px-3 pb-2 space-y-1">
              <Button
                variant="default"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setQuickAddOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add task
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          )}

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="hover:bg-accent/50"
                        activeClassName="bg-accent text-accent-foreground font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              <span>Projects</span>
              {!collapsed && (
                <button onClick={() => setProjectDialogOpen(true)} className="text-muted-foreground hover:text-foreground">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects?.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/app/project/${project.id}`}
                        className="hover:bg-accent/50"
                        activeClassName="bg-accent text-accent-foreground font-medium"
                      >
                        <span
                          className="mr-2 h-3 w-3 rounded-sm shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        {!collapsed && <span className="truncate">{project.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {(!projects || projects.length === 0) && !collapsed && (
                  <p className="px-3 py-2 text-xs text-muted-foreground">No projects yet</p>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              <span>Labels</span>
              {!collapsed && (
                <button onClick={() => setLabelDialogOpen(true)} className="text-muted-foreground hover:text-foreground">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {labels?.map((label) => (
                  <SidebarMenuItem key={label.id}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/app/label/${label.id}`}
                        className="hover:bg-accent/50"
                        activeClassName="bg-accent text-accent-foreground font-medium"
                      >
                        <Tag className="mr-2 h-3.5 w-3.5" style={{ color: label.color }} />
                        {!collapsed && <span className="truncate">{label.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 space-y-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/app/dashboard" className="hover:bg-accent/50" activeClassName="bg-accent text-accent-foreground font-medium">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/app/settings" className="hover:bg-accent/50" activeClassName="bg-accent text-accent-foreground font-medium">
                  <Settings className="mr-2 h-4 w-4" />
                  {!collapsed && <span>Settings</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut} className="text-muted-foreground hover:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {!collapsed && <span>Sign out</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <CreateProjectDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} />
      <CreateLabelDialog open={labelDialogOpen} onOpenChange={setLabelDialogOpen} />
    </>
  );
}
