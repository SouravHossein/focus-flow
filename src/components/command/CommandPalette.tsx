import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useUIStore } from '@/stores/ui-store';
import { useNavigationStore, type RecentItem } from '@/stores/navigation-store';
import { commandRegistry, type CommandAction } from '@/lib/commands/commandRegistry';
import { searchItems, type SearchableItem } from '@/lib/commands/commandSearch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/use-projects';
import { useLabels } from '@/hooks/use-labels';
import {
  Inbox, CalendarDays, CalendarRange, Sun, BarChart3, Settings, Plus,
  CheckSquare, FolderOpen, Tag, Clock, Search, Mountain, Compass, Activity,
} from 'lucide-react';
import Fuse from 'fuse.js';

export function CommandPalette() {
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen);
  const recentItems = useNavigationStore((s) => s.recentItems);
  const trackCommand = useNavigationStore((s) => s.trackCommand);
  const { user } = useAuth();
  const { data: projects } = useProjects();
  const { data: labels } = useLabels();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [taskResults, setTaskResults] = useState<any[]>([]);

  // Search tasks from DB when query changes
  useEffect(() => {
    if (!query.trim() || !user) {
      setTaskResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('tasks')
        .select('id, title, priority, project_id, completed_at')
        .eq('user_id', user.id)
        .is('parent_task_id', null)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(8);
      setTaskResults(data || []);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, user]);

  // Build action items from registry
  const actions = useMemo(() => {
    const all = commandRegistry.getAll();
    if (!query.trim()) return all;
    const fuse = new Fuse(all, { keys: ['label', 'keywords'], threshold: 0.4 });
    return fuse.search(query).map((r) => r.item);
  }, [query]);

  // Project search results
  const projectResults = useMemo(() => {
    if (!query.trim() || !projects) return [];
    const fuse = new Fuse(projects, { keys: ['name'], threshold: 0.4 });
    return fuse.search(query).map((r) => r.item).slice(0, 5);
  }, [query, projects]);

  // Label search results
  const labelResults = useMemo(() => {
    if (!query.trim() || !labels) return [];
    const fuse = new Fuse(labels, { keys: ['name'], threshold: 0.4 });
    return fuse.search(query).map((r) => r.item).slice(0, 5);
  }, [query, labels]);

  const executeAction = useCallback(
    (action: CommandAction) => {
      trackCommand(action.id);
      action.handler();
      setOpen(false);
      setQuery('');
    },
    [trackCommand, setOpen]
  );

  const handleSelect = useCallback(
    (value: string) => {
      if (value.startsWith('task:')) {
        const id = value.replace('task:', '');
        useUIStore.getState().setTaskDetailId(id);
        setOpen(false);
        setQuery('');
      } else if (value.startsWith('project:')) {
        navigate(`/app/project/${value.replace('project:', '')}`);
        setOpen(false);
        setQuery('');
      } else if (value.startsWith('label:')) {
        navigate(`/app/label/${value.replace('label:', '')}`);
        setOpen(false);
        setQuery('');
      } else if (value.startsWith('recent:')) {
        const item = recentItems.find((r) => r.id === value.replace('recent:', ''));
        if (item) {
          if (item.type === 'task') useUIStore.getState().setTaskDetailId(item.id);
          else if (item.type === 'project') navigate(`/app/project/${item.id}`);
          else if (item.type === 'label') navigate(`/app/label/${item.id}`);
        }
        setOpen(false);
        setQuery('');
      } else {
        const action = commandRegistry.get(value);
        if (action) executeAction(action);
      }
    },
    [navigate, setOpen, executeAction, recentItems]
  );

  // Cmd+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setOpen, open]);

  // Register default navigation + creation commands
  useEffect(() => {
    const navActions: CommandAction[] = [
      { id: 'nav:inbox', label: 'Go to Inbox', keywords: ['inbox'], icon: Inbox, shortcut: 'G I', handler: () => navigate('/app/inbox'), category: 'navigation' },
      { id: 'nav:today', label: 'Go to Today', keywords: ['today'], icon: CalendarDays, shortcut: 'G T', handler: () => navigate('/app/today'), category: 'navigation' },
      { id: 'nav:upcoming', label: 'Go to Upcoming', keywords: ['upcoming', 'schedule'], icon: CalendarRange, shortcut: 'G U', handler: () => navigate('/app/upcoming'), category: 'navigation' },
      { id: 'nav:myday', label: 'Go to My Day', keywords: ['my day', 'focus'], icon: Sun, shortcut: 'G M', handler: () => navigate('/app/myday'), category: 'navigation' },
      { id: 'nav:dashboard', label: 'Go to Dashboard', keywords: ['dashboard', 'analytics'], icon: BarChart3, shortcut: 'G D', handler: () => navigate('/app/dashboard'), category: 'navigation' },
      { id: 'nav:activity', label: 'Go to Activity', keywords: ['activity', 'feed', 'log'], icon: Activity, shortcut: 'G A', handler: () => navigate('/app/activity'), category: 'navigation' },
      { id: 'nav:focus', label: 'Go to Focus', keywords: ['focus', 'pomodoro'], icon: Mountain, handler: () => navigate('/app/focus'), category: 'navigation' },
      { id: 'nav:journey', label: 'Go to Journey', keywords: ['journey', 'climb'], icon: Compass, handler: () => navigate('/app/journey'), category: 'navigation' },
      { id: 'nav:settings', label: 'Go to Settings', keywords: ['settings', 'preferences'], icon: Settings, shortcut: 'G S', handler: () => navigate('/app/settings'), category: 'navigation' },
      { id: 'create:task', label: 'Create new task', keywords: ['add', 'new', 'task'], icon: Plus, shortcut: 'Q', handler: () => setQuickAddOpen(true), category: 'creation' },
    ];
    return commandRegistry.registerMany(navActions);
  }, [navigate, setQuickAddOpen]);

  const showRecent = !query.trim() && recentItems.length > 0;
  const showActions = !query.trim() || actions.length > 0;

  const priorityColors: Record<number, string> = {
    1: 'text-destructive',
    2: 'text-orange-500',
    3: 'text-blue-500',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl top-[15%] translate-y-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command className="rounded-lg" shouldFilter={false}>
          <CommandInput
            placeholder="Search tasks, projects, or type a command..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>No results found</CommandEmpty>

            {/* Recent items when empty */}
            {showRecent && (
              <CommandGroup heading="Recent">
                {recentItems.slice(0, 5).map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`recent:${item.id}`}
                    onSelect={handleSelect}
                    className="gap-2"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{item.name}</span>
                    {item.projectName && (
                      <span className="ml-auto text-xs text-muted-foreground">{item.projectName}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Quick actions when empty */}
            {!query.trim() && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Quick Actions">
                  {actions
                    .filter((a) => a.category === 'creation')
                    .slice(0, 3)
                    .map((action) => (
                      <CommandItem
                        key={action.id}
                        value={action.id}
                        onSelect={handleSelect}
                        className="gap-2"
                      >
                        {action.icon && <action.icon className="h-4 w-4 text-muted-foreground" />}
                        <span>{action.label}</span>
                        {action.shortcut && (
                          <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                            {action.shortcut}
                          </kbd>
                        )}
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Navigation">
                  {actions
                    .filter((a) => a.category === 'navigation')
                    .slice(0, 6)
                    .map((action) => (
                      <CommandItem
                        key={action.id}
                        value={action.id}
                        onSelect={handleSelect}
                        className="gap-2"
                      >
                        {action.icon && <action.icon className="h-4 w-4 text-muted-foreground" />}
                        <span>{action.label}</span>
                        {action.shortcut && (
                          <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                            {action.shortcut}
                          </kbd>
                        )}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </>
            )}

            {/* Task search results */}
            {query.trim() && taskResults.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Tasks">
                  {taskResults.map((task) => {
                    const proj = projects?.find((p) => p.id === task.project_id);
                    return (
                      <CommandItem
                        key={task.id}
                        value={`task:${task.id}`}
                        onSelect={handleSelect}
                        className="gap-2"
                      >
                        <CheckSquare className={`h-4 w-4 ${priorityColors[task.priority] || 'text-muted-foreground'}`} />
                        <span className={task.completed_at ? 'line-through text-muted-foreground' : ''}>
                          {task.title}
                        </span>
                        {proj && (
                          <span className="ml-auto text-xs text-muted-foreground">{proj.name}</span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}

            {/* Project search results */}
            {query.trim() && projectResults.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Projects">
                  {projectResults.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={`project:${p.id}`}
                      onSelect={handleSelect}
                      className="gap-2"
                    >
                      <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: p.color }} />
                      <span>{p.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Label search results */}
            {query.trim() && labelResults.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Labels">
                  {labelResults.map((l) => (
                    <CommandItem
                      key={l.id}
                      value={`label:${l.id}`}
                      onSelect={handleSelect}
                      className="gap-2"
                    >
                      <Tag className="h-3.5 w-3.5" style={{ color: l.color }} />
                      <span>{l.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Action search results */}
            {query.trim() && actions.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Actions">
                  {actions.slice(0, 8).map((action) => (
                    <CommandItem
                      key={action.id}
                      value={action.id}
                      onSelect={handleSelect}
                      className="gap-2"
                    >
                      {action.icon && <action.icon className="h-4 w-4 text-muted-foreground" />}
                      <span>{action.label}</span>
                      {action.shortcut && (
                        <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                          {action.shortcut}
                        </kbd>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
