

# TaskFlow — Remaining Features Implementation Plan

## What's Already Built
- Auth (signup, login, logout, password reset, protected routes, profile auto-creation)
- Task CRUD (create, complete, delete, update, subtasks)
- Projects (create, delete, color picker, project view)
- Labels hook (CRUD), displayed in sidebar and on tasks
- Quick Add dialog with keyboard shortcut (Q)
- Search dialog (Cmd+K) with debounced search
- Task detail drawer (priority, due date, project, subtasks)
- Smart views: Inbox, Today, Upcoming
- Dashboard (basic stats cards, project progress bars)
- Settings (theme, date format, week start, sign out)
- Warm design system with light/dark themes

## What's Missing (Grouped by Priority)

### 1. Label Management UI
- Create label dialog (name + color picker) — sidebar has labels listed but no way to create/delete them
- Label filter view page (`/app/label/:labelId`) — sidebar links to it but route doesn't exist
- Assign/remove labels from tasks in the task detail drawer

### 2. Drag-and-Drop Task Reordering
- Install `@dnd-kit/core` and `@dnd-kit/sortable`
- Wrap TaskList with DndContext + SortableContext
- Make TaskItem draggable, persist position changes via `useUpdateTask`

### 3. Recurring Tasks
- Add recurring task UI in QuickAddDialog and TaskDetailDrawer (daily/weekly/monthly/custom)
- When completing a recurring task, auto-create the next occurrence using the `recurring_pattern` JSONB field
- Utility function for computing next due date from pattern

### 4. Bulk Actions
- Add multi-select mode to TaskList (checkboxes)
- Bulk complete, delete, move to project, change priority
- Selection toolbar that appears when tasks are selected

### 5. Inline Task Editing
- Click task title in list to edit inline (not just in drawer)
- Auto-save on blur or Enter

### 6. Duplicate & Snooze Task
- "Duplicate" button in task detail drawer
- "Snooze until..." with date picker using `snoozed_until` column (already in DB)
- Filter out snoozed tasks from Today/Inbox views

### 7. Project Edit & Archive
- Edit project name/color dialog
- Archive project (set `archived_at`), show in separate "Archived" section
- Restore archived project

### 8. Dashboard Enhancements
- Completion trend chart (last 7 days) using Recharts
- Priority distribution pie/bar chart
- Completion streak calculation
- "What needs attention" section with overdue tasks list

### 9. Onboarding Flow
- First-time onboarding after signup (check `onboarding_completed` on profile)
- Step 1: Choose theme (light/dark)
- Step 2: Create first project
- Step 3: Add first task
- Mark `onboarding_completed = true` when done

### 10. Dark Mode Application on Load
- Apply theme from profile on app load (currently only applies on settings save)
- System theme listener for `system` preference

### 11. Keyboard Shortcuts
- `Escape` to close any open dialog/drawer
- Arrow keys for task navigation (stretch)

### 12. Notifications / Reminders (Architecture)
- DB table: `reminders` (task_id, remind_at, dismissed)
- Migration to create table with RLS
- UI: Set reminder in task detail drawer
- In-app notification bell with pending reminders
- Browser Notification API permission + trigger

### 13. Data Export
- Settings page: Export all tasks as JSON or CSV
- Simple client-side generation and download

### 14. Saved Filters UI
- Create/manage saved filters (the DB table exists but no UI)
- Filter sidebar section with saved filter list
- Filter builder: combine project, label, priority, date range, completion status

### 15. Sections within Projects
- Add/manage sections in project view (the DB table exists)
- Group tasks by section
- Add tasks to specific sections

---

## Implementation Order (4 batches)

**Batch 1 — Core Missing Features** (highest impact)
1. Label management UI + label filter page + assign labels in drawer
2. Dark mode on load + onboarding flow
3. Drag-and-drop task reordering
4. Recurring tasks logic

**Batch 2 — Power User Features**
5. Inline editing, duplicate, snooze
6. Bulk actions
7. Project edit/archive/restore
8. Sections within projects

**Batch 3 — Analytics & Productivity**
9. Dashboard charts (Recharts) + streaks
10. Reminders table + in-app notification center
11. Saved filters UI

**Batch 4 — Polish**
12. Data export (JSON/CSV)
13. Keyboard navigation enhancements
14. Additional empty states and loading polish

### DB Changes Needed
- New `reminders` table with RLS (for batch 3)
- No other schema changes — `sections`, `snoozed_until`, `recurring_pattern`, `saved_filters` already exist

### New Dependencies
- `@dnd-kit/core`, `@dnd-kit/sortable` (drag-and-drop)
- `recharts` (dashboard charts)

### New Files (Batch 1)
- `src/components/labels/CreateLabelDialog.tsx`
- `src/components/labels/LabelManager.tsx`
- `src/pages/LabelFilter.tsx`
- `src/components/onboarding/OnboardingFlow.tsx`
- `src/utils/recurring.ts` (next-date calculation)
- Route for `/app/label/:labelId` in App.tsx

### Modified Files (Batch 1)
- `src/App.tsx` — add label route, onboarding check
- `src/components/layout/AppSidebar.tsx` — add create label button
- `src/components/tasks/TaskDetailDrawer.tsx` — label assignment, recurring UI
- `src/components/tasks/TaskList.tsx` — DnD wrapper
- `src/components/tasks/TaskItem.tsx` — sortable wrapper
- `src/hooks/use-tasks.ts` — filter snoozed, recurring completion logic
- `src/components/layout/AppLayout.tsx` — theme application on mount
- `src/pages/Dashboard.tsx` — Recharts integration (batch 3)

This plan covers all unimplemented features from the original spec. I recommend approving Batch 1 first, then iterating.

