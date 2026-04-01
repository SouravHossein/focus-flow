import { create } from 'zustand';

export type SessionPhase = 'idle' | 'focus' | 'break' | 'recap';

interface FocusState {
  // Timer
  phase: SessionPhase;
  timerSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  intervalId: number | null;

  // Session config
  taskId: string | null;
  taskTitle: string | null;
  focusMinutes: number;
  breakMinutes: number;
  ambientSound: string | null;
  ambientVolume: number;
  strictMode: boolean;
  sessionTag: string | null;
  notes: string;
  sessionId: string | null;

  // Pre-session
  preSessionOpen: boolean;
  preSessionTaskId: string | null;
  preSessionTaskTitle: string | null;

  // Actions
  openPreSession: (taskId?: string, taskTitle?: string) => void;
  closePreSession: () => void;
  startSession: (config: {
    taskId?: string | null;
    taskTitle?: string | null;
    focusMinutes: number;
    breakMinutes: number;
    ambientSound?: string | null;
    strictMode?: boolean;
    sessionTag?: string | null;
    notes?: string;
  }) => void;
  tick: () => void;
  pause: () => void;
  resume: () => void;
  endSession: () => void;
  skipBreak: () => void;
  startBreak: () => void;
  setPhase: (phase: SessionPhase) => void;
  setSessionId: (id: string) => void;
  setAmbientSound: (sound: string | null) => void;
  setAmbientVolume: (volume: number) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  phase: 'idle' as SessionPhase,
  timerSeconds: 0,
  isRunning: false,
  isPaused: false,
  intervalId: null as number | null,
  taskId: null as string | null,
  taskTitle: null as string | null,
  focusMinutes: 25,
  breakMinutes: 5,
  ambientSound: null as string | null,
  ambientVolume: 0.5,
  strictMode: false,
  sessionTag: null as string | null,
  notes: '',
  sessionId: null as string | null,
  preSessionOpen: false,
  preSessionTaskId: null as string | null,
  preSessionTaskTitle: null as string | null,
};

export const useFocusStore = create<FocusState>((set, get) => ({
  ...INITIAL_STATE,

  openPreSession: (taskId, taskTitle) =>
    set({ preSessionOpen: true, preSessionTaskId: taskId || null, preSessionTaskTitle: taskTitle || null }),

  closePreSession: () =>
    set({ preSessionOpen: false, preSessionTaskId: null, preSessionTaskTitle: null }),

  startSession: (config) => {
    const state = get();
    if (state.intervalId) clearInterval(state.intervalId);
    const totalSeconds = config.focusMinutes * 60;
    const id = window.setInterval(() => get().tick(), 1000);
    set({
      phase: 'focus',
      timerSeconds: totalSeconds,
      isRunning: true,
      isPaused: false,
      intervalId: id,
      taskId: config.taskId || null,
      taskTitle: config.taskTitle || null,
      focusMinutes: config.focusMinutes,
      breakMinutes: config.breakMinutes,
      ambientSound: config.ambientSound || null,
      strictMode: config.strictMode || false,
      sessionTag: config.sessionTag || null,
      notes: config.notes || '',
      preSessionOpen: false,
    });
    // Persist to localStorage for crash recovery
    try {
      localStorage.setItem('focus-session-active', JSON.stringify({
        taskId: config.taskId, focusMinutes: config.focusMinutes,
        breakMinutes: config.breakMinutes, startedAt: new Date().toISOString(),
      }));
    } catch {}
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || state.isPaused) return;
    const next = state.timerSeconds - 1;
    if (next <= 0) {
      // Timer finished
      if (state.phase === 'focus') {
        // Auto-transition to break or recap
        if (state.breakMinutes > 0) {
          get().startBreak();
        } else {
          get().endSession();
        }
      } else if (state.phase === 'break') {
        get().endSession();
      }
    } else {
      set({ timerSeconds: next });
    }
  },

  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),

  startBreak: () => {
    const state = get();
    if (state.intervalId) clearInterval(state.intervalId);
    const breakSeconds = state.breakMinutes * 60;
    const id = window.setInterval(() => get().tick(), 1000);
    set({ phase: 'break', timerSeconds: breakSeconds, isRunning: true, isPaused: false, intervalId: id });
  },

  skipBreak: () => get().endSession(),

  endSession: () => {
    const state = get();
    if (state.intervalId) clearInterval(state.intervalId);
    set({ phase: 'recap', isRunning: false, isPaused: false, intervalId: null });
    try { localStorage.removeItem('focus-session-active'); } catch {}
  },

  setPhase: (phase) => set({ phase }),
  setSessionId: (id) => set({ sessionId: id }),
  setAmbientSound: (sound) => set({ ambientSound: sound }),
  setAmbientVolume: (volume) => set({ ambientVolume: volume }),
  setNotes: (notes) => set({ notes }),

  reset: () => {
    const state = get();
    if (state.intervalId) clearInterval(state.intervalId);
    set(INITIAL_STATE);
    try { localStorage.removeItem('focus-session-active'); } catch {}
  },
}));
