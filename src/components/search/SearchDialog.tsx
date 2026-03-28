import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores/ui-store';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TaskItem } from '@/components/tasks/TaskItem';
import { Search, Loader2 } from 'lucide-react';

export function SearchDialog() {
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const { user } = useAuth();

  const search = useCallback(
    async (q: string) => {
      if (!q.trim() || !user) {
        setResults([]);
        return;
      }
      setSearching(true);
      const { data } = await supabase
        .from('tasks')
        .select('*, task_labels(label_id, labels(*))')
        .eq('user_id', user.id)
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        .is('parent_task_id', null)
        .order('created_at', { ascending: false })
        .limit(20);
      setResults(data || []);
      setSearching(false);
    },
    [user]
  );

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg top-[20%] translate-y-0">
        <DialogHeader>
          <DialogTitle className="sr-only">Search tasks</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b pb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-none px-0 focus-visible:ring-0 text-base"
            autoFocus
          />
          {searching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            results.map((task) => <TaskItem key={task.id} task={task} />)
          ) : query.trim() ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No tasks found</p>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Type to search tasks...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
