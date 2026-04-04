import { LucideIcon } from 'lucide-react';

export interface CommandAction {
  id: string;
  label: string;
  keywords: string[];
  icon?: LucideIcon;
  shortcut?: string;
  handler: () => void;
  category: 'navigation' | 'task' | 'creation' | 'view' | 'settings';
}

class CommandRegistry {
  private actions = new Map<string, CommandAction>();
  private listeners = new Set<() => void>();

  register(action: CommandAction) {
    this.actions.set(action.id, action);
    this.notify();
    return () => {
      this.actions.delete(action.id);
      this.notify();
    };
  }

  registerMany(actions: CommandAction[]) {
    actions.forEach((a) => this.actions.set(a.id, a));
    this.notify();
    return () => {
      actions.forEach((a) => this.actions.delete(a.id));
      this.notify();
    };
  }

  getAll(): CommandAction[] {
    return Array.from(this.actions.values());
  }

  getByCategory(category: CommandAction['category']): CommandAction[] {
    return this.getAll().filter((a) => a.category === category);
  }

  get(id: string): CommandAction | undefined {
    return this.actions.get(id);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const commandRegistry = new CommandRegistry();
