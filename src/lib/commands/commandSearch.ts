import Fuse from 'fuse.js';
import { CommandAction, commandRegistry } from './commandRegistry';

export interface SearchableItem {
  id: string;
  type: 'task' | 'project' | 'label' | 'action';
  label: string;
  secondary?: string;
  icon?: any;
  shortcut?: string;
  handler?: () => void;
  color?: string;
  priority?: number;
}

export function searchCommands(query: string): SearchableItem[] {
  const actions = commandRegistry.getAll();
  const items: SearchableItem[] = actions.map((a) => ({
    id: a.id,
    type: 'action' as const,
    label: a.label,
    secondary: a.category,
    icon: a.icon,
    shortcut: a.shortcut,
    handler: a.handler,
  }));

  if (!query.trim()) return items;

  const fuse = new Fuse(items, {
    keys: ['label', 'secondary'],
    threshold: 0.4,
    includeScore: true,
  });

  return fuse.search(query).map((r) => r.item);
}

export function searchItems(
  query: string,
  items: SearchableItem[]
): SearchableItem[] {
  if (!query.trim()) return items;

  const fuse = new Fuse(items, {
    keys: [
      { name: 'label', weight: 2 },
      { name: 'secondary', weight: 1 },
    ],
    threshold: 0.4,
    includeScore: true,
  });

  return fuse.search(query).map((r) => r.item);
}
