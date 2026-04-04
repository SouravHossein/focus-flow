import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ShortcutEntry {
  keys: string;
  description: string;
  category: string;
}

const SHORTCUTS: ShortcutEntry[] = [
  // Navigation
  { keys: 'G → I', description: 'Go to Inbox', category: 'Navigation' },
  { keys: 'G → T', description: 'Go to Today', category: 'Navigation' },
  { keys: 'G → U', description: 'Go to Upcoming', category: 'Navigation' },
  { keys: 'G → M', description: 'Go to My Day', category: 'Navigation' },
  { keys: 'G → D', description: 'Go to Dashboard', category: 'Navigation' },
  { keys: 'G → A', description: 'Go to Activity', category: 'Navigation' },
  { keys: 'G → S', description: 'Go to Settings', category: 'Navigation' },
  { keys: 'G → 1-9', description: 'Go to project by position', category: 'Navigation' },
  // App
  { keys: '⌘K', description: 'Open command palette', category: 'App' },
  { keys: 'Q', description: 'Quick add task', category: 'App' },
  { keys: 'F', description: 'Start focus session', category: 'App' },
  { keys: '?', description: 'Show keyboard shortcuts', category: 'App' },
  { keys: 'Escape', description: 'Close dialog / drawer', category: 'App' },
];

export function ShortcutReferenceModal() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);
      if (isInput) return;

      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = filter.trim()
    ? SHORTCUTS.filter(
        (s) =>
          s.description.toLowerCase().includes(filter.toLowerCase()) ||
          s.keys.toLowerCase().includes(filter.toLowerCase())
      )
    : SHORTCUTS;

  const categories = [...new Set(filtered.map((s) => s.category))];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b pb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shortcuts..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border-none px-0 focus-visible:ring-0"
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto space-y-4">
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {cat}
              </h3>
              <div className="space-y-1">
                {filtered
                  .filter((s) => s.category === cat)
                  .map((s) => (
                    <div key={s.keys} className="flex items-center justify-between py-1.5">
                      <span className="text-sm">{s.description}</span>
                      <kbd className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-mono">
                        {s.keys}
                      </kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
