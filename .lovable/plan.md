

# Navigation & Discoverability Module

## Overview
Replace the basic SearchDialog with a full command palette, add breadcrumbs, recent items tracking, jump-mode keyboard navigation, pinned items, and a shortcut reference panel.

---

## No Database Changes Required
All navigation state (recent items, pinned items, command history) stored client-side via Zustand + localStorage persistence. Pinned items use existing task/project data — just track IDs locally.

## New Dependency
- `fuse.js` — client-side fuzzy search for command palette

---

## Feature 1: Command Palette (replaces SearchDialog)

**Replace** `src/components/search/SearchDialog.tsx` with a full command palette.

**New files:**
- `src/lib/commands/commandRegistry.ts` — Singleton registry. Actions register with `{ id, label, keywords[], icon, shortcut?, handler, category }`. Query method returns filtered/scored results.
- `src/lib/commands/commandSearch.ts` — Fuse.js wrapper that searches across tasks, projects, labels, and registered actions. Scores by match quality + recency.
- `src/components/command/CommandPalette.tsx` — Full-screen backdrop + centered modal (max-w-xl). Uses shadcn Command primitive (`cmdk`) already installed. Sections: Recent, Quick Actions, Navigation, search results.
- `src/hooks/useCommandRegistry.ts` — Hook that registers/deregisters actions on mount/unmount. Used by pages to register context-specific actions.

**Behavior:**
- `Cmd+K` / `Ctrl+K` opens (already wired in SearchDialog — reuse)
- Empty state: Recent items + Quick Actions (Create task, Go to Today, etc.)
- Typing: fuzzy search across tasks (from Supabase), projects, labels, actions
- Arrow keys navigate, Enter executes, Escape closes
- Results show: icon + label + shortcut hint + secondary text
- Track last 10 executed commands in `navigationStore`

**Modified:** `src/components/layout/AppLayout.tsx` — replace `<SearchDialog />` with `<CommandPalette />`

---

## Feature 2: Navigation State Store

**New file:** `src/stores/navigation-store.ts` — Zustand with `persist` middleware:
- `recentItems: RecentItem[]` (max 50, deduped, most recent first)
- `pinnedTaskIds: string[]` (max 20)
- `pinnedProjectIds: string[]` (max 10)
- `recentCommands: string[]` (last 10 command IDs)
- `trackRecentItem(item)`, `removeRecentItem(id)`, `togglePinTask(id)`, `togglePinProject(id)`

---

## Feature 3: Recent Items in Sidebar

**New file:** `src/components/sidebar/RecentItemsSection.tsx` — Renders last 7 items from `navigationStore.recentItems`. Shows type icon + name + relative time. Collapsible, hidden when empty.

**Modified:** `src/components/layout/AppSidebar.tsx` — Add `<RecentItemsSection />` between Smart Views and Projects sections.

**Track events:** Call `trackRecentItem()` from:
- `TaskDetailDrawer` open (track task)
- Project page mount (track project)
- Label page mount (track label)

---

## Feature 4: Pinned Items in Sidebar

**New file:** `src/components/sidebar/PinnedItemsSection.tsx` — Shows pinned projects then pinned tasks from navigation store. Pin icon indicator. Click navigates. Collapsible, hidden when empty.

**Modified:** `src/components/layout/AppSidebar.tsx` — Add `<PinnedItemsSection />` above Recent section.

**Pin gestures:** Add pin toggle to TaskDetailDrawer header and project context (command palette action).

---

## Feature 5: Breadcrumbs

**New file:** `src/components/navigation/Breadcrumbs.tsx` — Reads current route via `useLocation` + `useParams`. Resolves crumb trail from route pattern:
- `/app/inbox` → Home › Inbox
- `/app/project/:id` → Home › [Project Name]
- `/app/settings/templates` → Home › Settings › Templates

Uses project/label names from React Query cache. Truncates to last 3 crumbs on mobile with ellipsis dropdown.

**Modified:** `src/components/layout/AppLayout.tsx` — Add `<Breadcrumbs />` in header between SidebarTrigger and right actions.

---

## Feature 6: Jump Mode (G-sequences)

**New file:** `src/hooks/useJumpMode.ts` — Listens for `G` keypress, enters jump mode with 1500ms timeout. Second key navigates: I→inbox, T→today, U→upcoming, D→dashboard, M→myday, A→activity, S→settings, 1-9→project by index.

**New file:** `src/components/navigation/JumpModeHUD.tsx` — Fixed bottom pill showing available jump targets during jump mode. Fades in/out.

**New file:** `src/components/navigation/ShortcutReferenceModal.tsx` — Triggered by `?` key. Lists all shortcuts grouped by category. Searchable.

**Modified:** `src/components/layout/AppLayout.tsx` — Mount `<JumpModeHUD />` and `<ShortcutReferenceModal />`. Add `?` and `G` to keyboard handler (only when not in text input).

---

## Implementation Order
1. Navigation store (foundation for everything)
2. Command palette (replaces SearchDialog, install fuse.js)
3. Breadcrumbs (header integration)
4. Recent items section (sidebar + tracking)
5. Pinned items section (sidebar + toggle UI)
6. Jump mode + shortcut reference

## Files Summary

**New (~10):**
- `src/stores/navigation-store.ts`
- `src/lib/commands/commandRegistry.ts`
- `src/lib/commands/commandSearch.ts`
- `src/components/command/CommandPalette.tsx`
- `src/hooks/useCommandRegistry.ts`
- `src/components/sidebar/RecentItemsSection.tsx`
- `src/components/sidebar/PinnedItemsSection.tsx`
- `src/components/navigation/Breadcrumbs.tsx`
- `src/hooks/useJumpMode.ts`
- `src/components/navigation/JumpModeHUD.tsx`
- `src/components/navigation/ShortcutReferenceModal.tsx`

**Modified (~5):**
- `src/components/layout/AppLayout.tsx` — command palette, breadcrumbs, jump mode, shortcut ref
- `src/components/layout/AppSidebar.tsx` — pinned + recent sections
- `src/components/tasks/TaskDetailDrawer.tsx` — track recent + pin toggle
- `src/pages/Project.tsx` — track recent project visit
- `src/pages/LabelFilter.tsx` — track recent label visit

