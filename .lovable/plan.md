

# Focus-Flow: Focus + Journey + Ambient Sounds Integration

This plan transforms TaskFlow into a focus-centered productivity system with task-linked focus sessions, a visual journey/climb progression, and ambient soundscapes. The existing Pomodoro timer dialog gets replaced with a full-screen immersive focus experience.

---

## Database Changes

**New table: `focus_sessions`**
- id, user_id, task_id (nullable), duration_seconds, focus_minutes, break_minutes, session_type (focus/break), started_at, ended_at, completed (boolean), notes, session_tag, ambient_sound, strict_mode (boolean), created_at
- RLS: users can CRUD own sessions

**New table: `journey_progress`**
- id, user_id, total_altitude (integer, incremented per session), current_tier (text: valley/forest/hills/ridge/snowline/peak/summit), streak_days (integer), best_streak (integer), total_focus_minutes (integer), last_focus_date (date), badges (jsonb array), updated_at
- RLS: users can read/update own progress
- One row per user, created on first session

**Profile additions** (migration):
- `focus_default_minutes` (integer, default 25)
- `break_default_minutes` (integer, default 5)
- `ambient_sound_preference` (text, nullable)
- `companion_style` (text, default 'lantern')
- `daily_focus_goal` (integer, default 120 — minutes)

---

## Architecture Overview

```text
Stores (Zustand)
├── ui-store.ts (existing — add focusMode state)
└── focus-store.ts (NEW — timer engine, session state, sound state)

Hooks
├── use-focus-sessions.ts (CRUD for focus_sessions table)
├── use-journey.ts (read/update journey_progress)

Components
├── focus/
│   ├── FocusPreSession.tsx      — bottom sheet: pick task, duration, sound, mode
│   ├── FocusScreen.tsx          — full-screen immersive timer
│   ├── FocusBreakScreen.tsx     — break interval view
│   ├── FocusRecap.tsx           — session completion recap
│   ├── AltitudeRing.tsx         — circular progress + altitude meter
│   ├── CompanionAvatar.tsx      — small animated companion (lantern/bird)
│   ├── AmbientSoundPicker.tsx   — sound selection grid
│   └── QuickStartFocus.tsx      — button on TaskItem / TaskDetailDrawer
├── journey/
│   ├── JourneyMap.tsx           — visual climb progress page
│   ├── TierBadge.tsx            — current tier indicator
│   └── StreakDisplay.tsx        — streak counter with flame icon
└── productivity/
    └── PomodoroTimer.tsx        — REPLACED by FocusScreen system

Pages
├── Focus.tsx                    — /app/focus — the immersive session screen
├── Journey.tsx                  — /app/journey — climb map + badges
```

---

## Implementation Batches

### Batch 1: Focus Engine + Database (Foundation)

1. **Migration**: Create `focus_sessions` and `journey_progress` tables with RLS. Add profile columns for focus preferences.

2. **`focus-store.ts`** (Zustand): Isolated timer engine with start/pause/resume/end/skip-break/auto-switch. Stores: `timerSeconds`, `isRunning`, `isPaused`, `sessionType` (focus/break), `taskId`, `duration`, `breakDuration`, `ambientSound`, `strictMode`, `sessionId`. Persists active session to localStorage for crash recovery.

3. **`use-focus-sessions.ts`**: React Query hook — create session on start, update on end, fetch session history per task and per user.

4. **`use-journey.ts`**: Fetch/update journey_progress. Increment altitude on session complete. Calculate tier from altitude thresholds. Update streak logic (check last_focus_date vs today).

### Batch 2: Focus UI (Core Experience)

5. **`FocusPreSession.tsx`**: Bottom sheet / dialog triggered from tasks or header. Shows: task selector, duration presets (25/5, 50/10, 90/20, custom), ambient sound picker, focus mode toggle, notes field. Primary CTA: "Begin Session".

6. **`FocusScreen.tsx`**: Full-screen overlay (hides sidebar, header, all task UI). Centered large timer with `AltitudeRing`. Shows task title, remaining time, companion. Controls: pause, resume, end, skip break. Soft gradient background that shifts with time. Auto-transitions to break when timer ends.

7. **`FocusBreakScreen.tsx`**: Softer palette, breathing prompt, skip button, companion resting state.

8. **`FocusRecap.tsx`**: Post-session modal — minutes earned, streak impact, journey checkpoint, companion reaction, "Continue" / "Mark task complete" / "Done" actions.

9. **`QuickStartFocus.tsx`**: Small play button added to `TaskItem` and `TaskDetailDrawer` — opens pre-session with task pre-selected.

### Batch 3: Journey + Companion + Sounds

10. **`JourneyMap.tsx`** page at `/app/journey`: Vertical trail visualization showing tiers (Valley → Summit). Current position highlighted. Checkpoints for milestones. Badges earned. Stats: total altitude, streak, focus minutes.

11. **`CompanionAvatar.tsx`**: Simple SVG/emoji-based companion (lantern that glows brighter with focus, dims on break). States: idle, focusing (glow pulse), break (dim), celebrating (sparkle). Shown on FocusScreen and JourneyMap.

12. **`AmbientSoundPicker.tsx`**: Grid of sound options using free royalty-free audio files hosted in Supabase Storage. Options: Rain, Wind, Fireplace, Coffee Shop, Ocean, White Noise, Lo-fi, Silence. Volume slider. Remembers last selection in profile. Uses HTML5 Audio API with looping.

13. **Ambient sound files**: Create a `sounds` storage bucket with ~8 short loopable audio files (or use web audio oscillator for white noise, and defer others to user-provided URLs initially).

### Batch 4: Integration + Polish

14. **Sidebar**: Add "Focus" and "Journey" nav items. Show active focus indicator when session running.

15. **Dashboard integration**: Add "Focus today" card showing minutes focused, sessions completed, current streak.

16. **Task integration**: Show focus time spent per task in TaskDetailDrawer. Show session count badge on tasks that have focus history.

17. **Settings**: Focus preferences section — default duration, default break, daily goal, companion style, ambient sound default.

18. **Keyboard shortcuts**: `F` to open focus pre-session, `Space` to pause/resume during focus, `Escape` to show exit confirmation.

---

## Journey Tier Thresholds

| Tier | Altitude (sessions) | Badge |
|------|---------------------|-------|
| Valley | 0–9 | First Steps |
| Forest | 10–29 | Trail Finder |
| Hills | 30–59 | Steady Climber |
| Ridge | 60–99 | Ridge Walker |
| Snow Line | 100–149 | Above the Clouds |
| Peak | 150–249 | Peak Seeker |
| Summit | 250+ | Summit Master |

---

## Ambient Sound Approach

Since we can't bundle large audio files easily, the initial implementation will use:
- **Web Audio API** for white noise / brown noise (generated procedurally)
- **Free hosted audio** in a Supabase Storage bucket for rain, fire, ocean (short 30s loops)
- Volume control + mute via HTML5 Audio
- Sound preference persisted in profile

---

## Design Direction

- Focus screen: Dark gradient background (slate-900 to slate-950), large centered timer in warm coral accent, soft glow ring
- Break screen: Muted blue-green gradient, softer typography
- Journey map: Vertical trail with warm earth tones, milestone markers as glowing dots
- Companion: Simple SVG lantern icon with CSS animation (pulse glow during focus, dim during break)
- All transitions: CSS transitions + framer-motion fade/scale, no jarring cuts
- Mobile-first: FocusScreen is full viewport, large touch targets, swipe-to-dismiss for pre-session

---

## Files Created/Modified Summary

**New files (~15):**
- `src/stores/focus-store.ts`
- `src/hooks/use-focus-sessions.ts`
- `src/hooks/use-journey.ts`
- `src/components/focus/FocusPreSession.tsx`
- `src/components/focus/FocusScreen.tsx`
- `src/components/focus/FocusBreakScreen.tsx`
- `src/components/focus/FocusRecap.tsx`
- `src/components/focus/AltitudeRing.tsx`
- `src/components/focus/CompanionAvatar.tsx`
- `src/components/focus/AmbientSoundPicker.tsx`
- `src/components/focus/QuickStartFocus.tsx`
- `src/components/journey/JourneyMap.tsx`
- `src/components/journey/TierBadge.tsx`
- `src/components/journey/StreakDisplay.tsx`
- `src/pages/Focus.tsx`
- `src/pages/Journey.tsx`

**Modified files (~8):**
- `src/stores/ui-store.ts` — add `focusActive` flag
- `src/components/layout/AppLayout.tsx` — render FocusScreen overlay when active, add keyboard shortcuts
- `src/components/layout/AppSidebar.tsx` — add Focus + Journey nav
- `src/components/tasks/TaskItem.tsx` — add QuickStartFocus button
- `src/components/tasks/TaskDetailDrawer.tsx` — add focus history + quick start
- `src/pages/Dashboard.tsx` — add focus stats card
- `src/pages/Settings.tsx` — add focus preferences section
- `src/App.tsx` — add /app/focus and /app/journey routes

**DB migration:** 1 migration for `focus_sessions`, `journey_progress` tables + profile columns

