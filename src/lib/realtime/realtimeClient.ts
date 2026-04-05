// Stub for Part 2 — will be replaced with real Supabase Realtime implementation

export interface PresenceState {
  userId: string;
  status: 'online' | 'away' | 'offline';
  activeProjectId?: string;
  activeTaskId?: string;
  lastSeen: string;
}

export interface RealtimeClient {
  subscribe(channel: string, event: string, handler: (payload: unknown) => void): () => void;
  publish(channel: string, event: string, payload: unknown): void;
  joinPresence(channel: string, state: PresenceState): void;
  leavePresence(channel: string): void;
  onPresenceSync(channel: string, handler: (presenceMap: Record<string, PresenceState>) => void): void;
}

export const realtimeClient: RealtimeClient = {
  subscribe: (_channel, _event, _handler) => {
    return () => {};
  },
  publish: (_channel, _event, _payload) => {},
  joinPresence: (_channel, _state) => {},
  leavePresence: (_channel) => {},
  onPresenceSync: (_channel, _handler) => {},
};
