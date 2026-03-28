import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  quickAddOpen: boolean;
  taskDetailId: string | null;
  searchOpen: boolean;
  searchQuery: string;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setQuickAddOpen: (open: boolean) => void;
  setTaskDetailId: (id: string | null) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  quickAddOpen: false,
  taskDetailId: null,
  searchOpen: false,
  searchQuery: '',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
  setTaskDetailId: (id) => set({ taskDetailId: id }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
