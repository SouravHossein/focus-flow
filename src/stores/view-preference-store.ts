import { create } from 'zustand';
import type { ViewId } from '@/lib/views/viewRegistry';

interface ViewPreferenceState {
  preferences: Record<string, ViewId>;
  getViewType: (contextType: string, contextId?: string | null) => ViewId;
  setViewType: (contextType: string, contextId: string | null | undefined, viewType: ViewId) => void;
}

function makeKey(contextType: string, contextId?: string | null) {
  return `${contextType}:${contextId || '_'}`;
}

export const useViewPreferenceStore = create<ViewPreferenceState>((set, get) => ({
  preferences: {},
  getViewType: (contextType, contextId) => {
    return get().preferences[makeKey(contextType, contextId)] || 'list';
  },
  setViewType: (contextType, contextId, viewType) => {
    set((s) => ({
      preferences: { ...s.preferences, [makeKey(contextType, contextId)]: viewType },
    }));
  },
}));
