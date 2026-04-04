import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentItem {
  id: string;
  type: 'task' | 'project' | 'label' | 'view';
  name: string;
  icon?: string;
  projectName?: string;
  visitedAt: string;
}

interface NavigationState {
  recentItems: RecentItem[];
  pinnedTaskIds: string[];
  pinnedProjectIds: string[];
  recentCommands: string[];
  jumpMode: boolean;

  trackRecentItem: (item: Omit<RecentItem, 'visitedAt'>) => void;
  removeRecentItem: (id: string) => void;
  togglePinTask: (id: string) => void;
  togglePinProject: (id: string) => void;
  trackCommand: (commandId: string) => void;
  setJumpMode: (active: boolean) => void;
}

const MAX_RECENT = 50;
const MAX_PINNED_TASKS = 20;
const MAX_PINNED_PROJECTS = 10;
const MAX_COMMANDS = 10;

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      recentItems: [],
      pinnedTaskIds: [],
      pinnedProjectIds: [],
      recentCommands: [],
      jumpMode: false,

      trackRecentItem: (item) =>
        set((s) => {
          const filtered = s.recentItems.filter((r) => r.id !== item.id);
          return {
            recentItems: [{ ...item, visitedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_RECENT),
          };
        }),

      removeRecentItem: (id) =>
        set((s) => ({ recentItems: s.recentItems.filter((r) => r.id !== id) })),

      togglePinTask: (id) =>
        set((s) => {
          const has = s.pinnedTaskIds.includes(id);
          return {
            pinnedTaskIds: has
              ? s.pinnedTaskIds.filter((i) => i !== id)
              : [...s.pinnedTaskIds, id].slice(0, MAX_PINNED_TASKS),
          };
        }),

      togglePinProject: (id) =>
        set((s) => {
          const has = s.pinnedProjectIds.includes(id);
          return {
            pinnedProjectIds: has
              ? s.pinnedProjectIds.filter((i) => i !== id)
              : [...s.pinnedProjectIds, id].slice(0, MAX_PINNED_PROJECTS),
          };
        }),

      trackCommand: (commandId) =>
        set((s) => ({
          recentCommands: [commandId, ...s.recentCommands.filter((c) => c !== commandId)].slice(0, MAX_COMMANDS),
        })),

      setJumpMode: (active) => set({ jumpMode: active }),
    }),
    { name: 'navigation-store' }
  )
);
