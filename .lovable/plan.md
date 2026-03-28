

# TaskFlow — A Premium Task Manager MVP

## Design Direction
- **Style**: Warm & friendly — soft shadows, rounded corners (0.75rem radius), approachable typography
- **Accent**: Red/Coral (`hsl(4, 90%, 58%)`) — energetic, action-oriented
- **Theme**: Light default with dark mode toggle. Warm neutral backgrounds (`#FAFAF8` light, `#1A1A1E` dark)
- **Font**: Inter for all text, with clear weight hierarchy

---

## Phase 1: Foundation & Auth

### Database Schema (Supabase)
Create tables with RLS policies:
- **profiles** — display_name, avatar_url, theme_preference, date_format, week_start
- **user_roles** — role-based access (future-ready)
- **projects** — name, color, icon, position, archived_at, user_id
- **sections** — name, project_id, position
- **tasks** — title, description, priority (1-4), due_date, completed_at, project_id, section_id, parent_task_id (subtasks), position, user_id
- **labels** — name, color, user_id
- **task_labels** — task_id, label_id (junction)
- **saved_filters** — name, filter_config (JSONB), user_id

All tables have created_at, updated_at, soft-delete where appropriate, RLS policies scoped to authenticated user.

### Auth Flow
- Email/password sign up & login via Supabase Auth
- Password reset flow with `/reset-password` page
- Protected routes wrapper component
- Profile auto-creation via database trigger
- Simple onboarding: pick theme (light/dark) and create first project

---

## Phase 2: Layout & Navigation

### App Shell
- **Sidebar** (collapsible): Inbox, Today, Upcoming, Projects list, Labels, Filters, Settings
- **Main content area**: Task list view
- **Task detail drawer**: Slide-out panel for editing task details
- **Quick Add**: Floating button (mobile) / keyboard shortcut `Q` (desktop) opens quick-add modal
- Smart badges showing task counts on sidebar items

### Responsive Behavior
- Mobile: Sidebar as overlay sheet, FAB for quick add
- Desktop: Persistent sidebar, inline quick add

---

## Phase 3: Task CRUD & Core Features

### Task Management
- Create tasks with title, description, priority, due date, project, labels
- Inline title editing (click to edit)
- Complete/uncomplete with satisfying checkbox animation
- Subtasks (one level deep)
- Drag-and-drop reorder within project/section (using @dnd-kit)
- Bulk select and bulk actions (complete, move, delete)
- Duplicate task
- Task detail drawer with all fields, notes section

### Priority System
- P1 (red), P2 (orange), P3 (blue), P4 (none/gray)
- Visual indicator on task row

### Due Dates
- Date picker with quick options: Today, Tomorrow, Next Week, No Date
- Overdue visual highlighting (red text)
- Relative date display ("Today", "Tomorrow", "Mon, Apr 7")

---

## Phase 4: Projects, Labels & Filtering

### Projects
- Create/edit/archive/delete projects
- Assign color from preset palette
- Project view shows sections and tasks
- Move tasks between projects
- Progress indicator (completion %)

### Labels
- Create colored labels
- Assign multiple labels per task
- Filter by label

### Smart Views
- **Inbox**: Tasks with no project
- **Today**: Due today + overdue
- **Upcoming**: Next 7 days, grouped by date
- **Filters**: Custom saved filters (by priority, label, project, date range)

### Search
- Debounced search across task titles, descriptions, and labels
- Search results page with highlighted matches

---

## Phase 5: Polish & Settings

### Settings Page
- Theme toggle (light/dark/system)
- Date format preference
- Week start day
- Default priority
- Account section (email display, sign out)

### Dashboard (Simple)
- Tasks completed today/this week
- Overdue count
- Completion streak counter
- Priority distribution mini-chart
- "Needs attention" section (overdue + due today)

### UX Polish
- Skeleton loaders for all data-fetching states
- Empty states with illustrations and helpful CTAs
- Optimistic UI updates for task completion
- Toast notifications for actions (undo support for complete/delete)
- Smooth transitions with CSS + subtle Framer Motion
- Keyboard shortcuts: `Q` quick add, `Escape` close modals

---

## Tech Decisions
- **State**: Zustand for global UI state (sidebar, modals, theme), React Query for server state
- **Forms**: React Hook Form + Zod validation
- **DnD**: @dnd-kit/core + @dnd-kit/sortable
- **Charts**: Recharts (lightweight)
- **Date handling**: date-fns
- **Components**: shadcn/ui as base, customized to warm style

