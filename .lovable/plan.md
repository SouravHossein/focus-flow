

# TaskFlow — Remaining Features Implementation Plan

## Current State Assessment

### Fully Implemented
- Email auth (signup, login, logout, password reset, protected routes)
- Task CRUD with priorities, due dates, descriptions, subtasks
- Projects (create, edit, archive/restore, delete, sections, color picker)
- Labels (create dialog, assign in drawer, label filter page)
- Drag-and-drop reorder (@dnd-kit)
- Recurring tasks (daily/weekly/monthly, auto-create next on complete)
- Inline editing (double-click title), duplicate, snooze
- Bulk actions (complete, delete)
- Quick Add (Q shortcut), Search (Cmd+K)
- Smart views: Inbox, Today, Upcoming
- Dashboard with Recharts (completion trend, priority pie, streaks, overdue list)
- Onboarding flow (theme, first project, first task)
- Theme persistence on load + system listener
- Settings (theme, date format, week start, data export JSON/CSV)
- Mobile FAB, skeleton loaders, empty states

### Not Implemented (New in This Request)
1. **Landing page** for unauthenticated users (currently redirects straight to /auth)
2. **Google OAuth** sign-in
3. **Saved filters UI** (DB table exists, no UI)
4. **Reminders/notifications** (no DB table, no UI)
5. **Pomodoro/focus timer**
6. **Task comments/notes** section
7. **Task activity log**
8. **Overdue & Completed smart views** (only Inbox/Today/Upcoming exist)
9. **Notification preferences** in Settings
10. **Account deletion**

### Partially Implemented
- **Bulk actions**: Only complete/delete — missing "move to project" and "change priority"
- **Onboarding**: Missing "productivity style" choice (only has theme/project/task)
- **Keyboard shortcuts**: Only Q and Cmd+K — no Escape-to-close, no arrow nav
- **Sort options**: No sort UI (only position-based ordering)

---

## Implementation Plan

### Batch 1: Landing Page + Google OAuth (High Priority)

**1. Landing page** (`src/pages/Landing.tsx`)
- Hero section with tagline, feature highlights, CTA buttons (Sign up / Log in)
- Warm design matching the app's aesthetic
- Update `Index.tsx` to show Landing for unauthenticated users instead of redirecting to `/auth`

**2. Google OAuth**
- Use Lovable Cloud managed Google OAuth (no API keys needed)
- Add "Sign in with Google" button to Auth page
- Use `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`
- Run the Configure Social Auth tool to generate the lovable module

### Batch 2: Smart Views + Saved Filters

**3. Overdue & Completed views** — New pages at `/app/overdue` and `/app/completed`
- Add `dueOverdue` and `completedOnly` options to `useTasks`
- Add sidebar nav items
- Routes in App.tsx

**4. Saved filters UI**
- Filter builder dialog (project, label, priority, date range, status)
- Save/delete filters using existing `saved_filters` table
- `useSavedFilters` hook
- Sidebar section listing saved filters
- Filter results page

### Batch 3: Reminders + Notifications

**5. Reminders table** — New migration:
- `reminders` table (id, task_id, user_id, remind_at, dismissed, created_at) with RLS
- `useReminders` hook
- Set reminder UI in TaskDetailDrawer (date/time picker)
- In-app notification bell in header showing pending reminders
- Browser Notification API integration (request permission, trigger on