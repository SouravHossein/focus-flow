

# Views & Layouts Module — Full Implementation Plan

## Database Changes (1 migration)

**New tables:**
- `activity_logs` — id, user_id, event_type, entity_type, entity_id, entity_name, metadata (JSONB), created_at. Indexes on user_id, entity_id, created_at DESC, event_type. RLS: user owns.
- `my_day_tasks` — id, user_id, task_id, added_date (date), pinned (boolean, default false), sort_order (integer), created_at. RLS: user owns. Unique on (user_id, task_id, added_date).
- `user_view_preferences` — id, user_id, context_type (text), context_id (text nullable), view_type (text), config (JSONB), updated_at. RLS: user owns. Unique on (user_id, context_type, context_id).

**Tasks table addition:**
- `start_date` (timestamptz, nullable) — needed for Gantt bar spans.

**New dependency:** `@tanstack/react-virtual`, `html-to-image`

---

## Shared Infrastructure (Batch 1)

### View Registry
`src/lib/views/viewRegistry.ts` — Static registry defining 7 views (list, board, calendar, gantt, table, myday, activity) with id, label, icon name, supported contexts, and capability flags (dnd, bulk-select, column-config).

### View Preference Store
`src/stores/view-preference-store.ts` — Zustand store that reads/writes `user_view_preferences` table. Exposes `getViewType(contextType, contextId)` and `setViewType(...)`.

### View Switcher
`src/components/views/ViewSwitcher.tsx` — Icon tab bar rendered in page headers. Shows available views for current context. Highlights active view. Tooltip per icon.

### View Router
`src/components/views/ViewRouter.tsx` — Takes tasks + context, reads active view from preference store, renders the correct view component. Handles fade transition between views.

### Shared ViewProps interface
All views receive: `tasks`, `context`, `onTaskCreate`, `onTaskUpdate`, `onTaskDelete`, `onTaskComplete`, `isLoading`, `project?`.

---

## Board View (Batch 2)

- `src/components/views/board/BoardView.tsx` — Orchestrator
- `src/components/views/board/BoardColumn.tsx` — Column with header, card list, add-task button
- `src/components/views/board/BoardCard.tsx` — Task card with checkbox, title, priority dot, due date, labels, subtask count, dependency badge
- `src/components/views/board/BoardToolbar.tsx` — Group toggle (status/priority), sort, collapse all
- `src/lib/views/board/boardGrouping.ts` — Groups tasks into columns by section or priority

DnD: Reuses `@dnd-kit/core` + `@dnd-kit/sortable` already installed. Cross-column drag updates section_id or priority. Within-column drag updates position.

---

## Calendar View (Batch 3)

- `src/components/views/calendar/CalendarView.tsx` — Mode switcher (month/week)
- `src/components/views/calendar/MonthGrid.tsx` — 7-column grid, task pills per day cell, overflow "+N more" popover, drag to reschedule due_date
- `src/components/views/calendar/WeekGrid.tsx` — Hourly time grid for 7 days, time-block tasks as positioned blocks, all-day tasks at top, current-time indicator
- `src/components/views/calendar/CalendarToolbar.tsx` — Month/week toggle, prev/next nav, "Today" button, color-by toggle
- `src/lib/views/calendar/calendarLayout.ts` — Pixel positioning math for week view blocks

---

## Gantt View (Batch 4)

- `src/components/views/gantt/GanttView.tsx` — Resizable split panel (left task list + right timeline)
- `src/components/views/gantt/GanttLeftPanel.tsx` — Task names, expand/collapse subtasks
- `src/components/views/gantt/GanttTimeline.tsx` — Horizontal scrollable timeline with date headers
- `src/components/views/gantt/GanttBar.tsx` — Draggable/resizable task bar (start_date → due_date)
- `src/components/views/gantt/GanttDependencyArrows.tsx` — SVG elbow connectors between dependent tasks
- `src/components/views/gantt/GanttToolbar.tsx` — Zoom (day/week/month), scroll-to-today, export PNG
- `src/lib/views/gantt/ganttLayout.ts` — Bar position calculations
- `src/lib/views/gantt/criticalPath.ts` — Longest dependency chain algorithm

Uses `react-resizable-panels` (already have the shadcn resizable component). Requires `html-to-image` for PNG export.

---

## Table View (Batch 5)

- `src/components/views/table/TableView.tsx` — Orchestrator with virtualized rows via `@tanstack/react-virtual`
- `src/components/views/table/TableHeader.tsx` — Sortable, resizable column headers
- `src/components/views/table/TableRow.tsx` — Row with inline-editable cells
- `src/components/views/table/cells/` — TitleCell, PriorityCell, DueDateCell, ProjectCell, LabelsCell (each inline-editable)
- `src/components/views/table/TableColumnPicker.tsx` — Show/hide columns panel
- `src/components/views/table/TableBulkActionBar.tsx` — Multi-select actions bar
- `src/lib/views/table/tableSorting.ts` — Multi-column sort comparator
- `src/lib/views/table/tableGrouping.ts` — Group by project/priority/label/status
- `src/hooks/views/useTableColumnConfig.ts` — Persists column order/width/visibility

---

## My Day View (Batch 6)

- `src/components/views/myday/MyDayView.tsx` — Split: My Day list + Suggestions panel
- `src/components/views/myday/MyDayList.tsx` — Draggable focus task list, completion counter
- `src/components/views/myday/SuggestionsPanel.tsx` — 5 suggestion sections (overdue, due today, recent, high priority, recurring)
- `src/lib/views/myday/myDaySuggestions.ts` — Ranking logic for suggestion sources
- `src/hooks/views/useMyDay.ts` — CRUD hook for `my_day_tasks` table (add, remove, pin, reorder)
- Auto-reset at midnight: tasks with `added_date < today` and `pinned = false` are excluded from queries.

---

## Activity Feed (Batch 7)

- `src/components/views/activity/ActivityFeedView.tsx` — Full page, infinite scroll
- `src/components/views/activity/ActivityEntry.tsx` — Single entry with icon, action sentence, timestamp, diff
- `src/components/views/activity/ActivityFeedFilters.tsx` — Filter by event type, project, date range
- `src/lib/activity/activityLogger.ts` — Service called from mutations: `logActivity(userId, eventType, entityType, entityId, entityName, metadata?)`
- `src/lib/activity/activityFormatter.ts` — Converts raw log to human-readable sentence
- `src/hooks/views/useActivityFeed.ts` — Paginated query with cursor
- Integration: Hook `activityLogger` into existing task/project/label mutation hooks

Activity tab added to TaskDetailDrawer showing per-task activity.

---

## Integration Points

- **Project page**: Replace plain TaskList with ViewRouter. Add ViewSwitcher to header.
- **Today page**: Add ViewSwitcher (list, board, calendar, table, timeline). Wrap with ViewRouter.
- **Inbox/Upcoming/Overdue/Completed**: Add ViewSwitcher with applicable views.
- **Sidebar**: Add "My Day" and "Activity" nav items.
- **App.tsx**: Add `/app/myday` and `/app/activity` routes.
- **AppLayout.tsx**: Add keyboard shortcuts 1-7 for view switching.
- **TaskDetailDrawer**: Add Activity tab.

---

## Files Summary

**New files (~40+):** View infrastructure (4), Board (5), Calendar (5), Gantt (8), Table (9), My Day (4), Activity (6), shared hooks/stores (4).

**Modified files (~8):** Project.tsx, Today.tsx, Inbox.tsx, AppSidebar.tsx, App.tsx, AppLayout.tsx, TaskDetailDrawer.tsx, use-tasks.ts (add activity logging calls).

**DB migration:** 1 migration creating `activity_logs`, `my_day_tasks`, `user_view_preferences` tables + `start_date` column on tasks.

**New npm deps:** `@tanstack/react-virtual`, `html-to-image`

---

## Implementation Order

1. Migration + npm deps + view registry + view switcher + view router
2. Board view
3. Calendar view
4. Gantt view
5. Table view
6. My Day view
7. Activity feed + logger integration
8. Wire ViewSwitcher into all pages + keyboard shortcuts

