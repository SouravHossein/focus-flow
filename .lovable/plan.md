

# Task Intelligence Module — Full Implementation Plan

## Overview
Add 6 intelligent features to TaskFlow: NLP task input, AI-powered suggestions, clipboard date detection, task templates, task dependencies, and time blocking. Implementation in 4 batches.

---

## Database Changes (1 migration)

**New tables:**
- `task_templates` — id, user_id, name, category, template_data (JSONB), created_at, updated_at. RLS: user owns.
- `task_dependencies` — id, blocking_task_id (uuid), blocked_task_id (uuid), created_at. RLS: user owns both tasks (join to tasks table).
- `time_blocks` — id, task_id, user_id, block_date (date), start_time (time), end_time (time), created_at. RLS: user owns.

**Profile additions:**
- `working_hours_start` (time, default '09:00')
- `working_hours_end` (time, default '18:00')
- `timeline_view_default` (boolean, default false)

---

## Batch 1: NLP Parser + Clipboard Date Detection (Pure Logic + UI)

### 1. Natural Language Task Parser
**`src/lib/nlp/parseTaskInput.ts`** — Pure TypeScript parser, no AI calls. Regex-based extraction:
- Dates: "today", "tomorrow", "next Monday", "in 3 days", "on June 15", "06/15"
- Times: "at 3pm", "at 15:00", "at 9:30am"
- Recurrence: "every day", "daily", "every Monday", "every 2 weeks", "monthly"
- Priority: `p1`–`p4`, `!1`–`!4`
- Labels: `#labelname` (multiple)
- Project: `in ProjectName` or `@projectname`
- Returns `ParsedTaskInput` with extracted fields + cleaned title + token positions for highlighting

**`src/components/intelligence/NLPTaskInput.tsx`** — Wraps the Input component:
- Debounced parse on every keystroke (150ms)
- Live preview bar below input showing detected tokens as color-coded chips (blue=date, green=label, orange=priority, purple=project, teal=recurrence)
- On submit, strips tokens from title and populates task fields

**Integration:** Replace the plain Input in `QuickAddDialog.tsx` with `NLPTaskInput`. Wire parsed fields into `handleSubmit`.

### 2. Clipboard Date Detection
**`src/lib/nlp/detectDatesInText.ts`** — Pure function scanning pasted text for date patterns (ISO, formatted, relative). Returns array of `DetectedDate` objects with confidence scores.

**`src/hooks/useClipboardDateDetection.ts`** — Attaches paste listener, returns detected dates + confirmation state.

**`src/components/intelligence/ClipboardDateBanner.tsx`** — Non-blocking inline banner: "We found a date: Friday, May 9 — Set as due date?" with Accept/Dismiss buttons.

**Integration:** Add to `TaskDetailDrawer` description/notes fields.

---

## Batch 2: AI Suggestions + Task Templates

### 3. AI-Powered Task Suggestions
**`src/lib/intelligence/suggestionEngine.ts`** — Client-side engine that:
- Queries recent tasks from React Query cache
- Scores matches by title similarity (fuzzy), recency, day-of-week patterns
- Returns top 5 ranked suggestions with reason strings

**`src/hooks/useTaskSuggestions.ts`** — Debounced (300ms), returns suggestions array. Keyboard navigable.

**`src/components/intelligence/TaskSuggestionDropdown.tsx`** — Dropdown below input showing suggestions with title, label chips, project badge, and "Why suggested?" tooltip. Arrow keys + Enter to select, Escape to dismiss.

**Integration:** Rendered inside `NLPTaskInput` when user is typing. Selecting a suggestion fills all fields.

### 4. Task Templates
**Migration:** `task_templates` table.

**`src/lib/templates/applyTemplate.ts`** — Resolves template JSONB into a CreateTaskInput, handles `{{placeholder}}` variables and due date offsets.

**`src/components/templates/TemplatePickerModal.tsx`** — Triggered by typing `/` in QuickAdd. Search, category filter, template preview.

**`src/components/templates/TemplateVariablePrompt.tsx`** — Dialog for filling `{{placeholder}}` values.

**Settings > Templates page** — Full CRUD: create from scratch, edit, delete, duplicate, categorize. "Save as template" button added to `TaskDetailDrawer`.

**`src/hooks/use-templates.ts`** — React Query CRUD hook for `task_templates` table.

---

## Batch 3: Task Dependencies

### 5. Dependencies (Block / Blocked-By)
**Migration:** `task_dependencies` table with RLS joining through tasks table.

**`src/lib/dependencies/dependencyValidator.ts`** — DFS-based circular dependency detection.

**`src/hooks/useDependencies.ts`** — CRUD hook: add/remove dependencies, fetch blocked status.

**`src/components/tasks/DependencySection.tsx`** — Inside `TaskDetailDrawer`: "Blocked by" and "Blocks" sections with task search + linked task chips.

**`src/components/tasks/DependencyBadge.tsx`** — "Blocked" badge shown on `TaskItem` when task has unresolved blockers.

**Task list updates:** Query dependencies alongside tasks, show blocked badge, dimmed styling for blocked tasks.

---

## Batch 4: Time Blocking

### 6. Time Blocking System
**Migration:** `time_blocks` table + profile working hours columns.

**`src/components/timeblocking/DailyTimeline.tsx`** — Hour grid (6am–11pm), renders time blocks as positioned cards. Drag-and-drop from unscheduled column onto timeline.

**`src/components/timeblocking/TimeBlock.tsx`** — Draggable + resizable block on timeline.

**`src/components/timeblocking/UnscheduledColumn.tsx`** — Lists today's tasks without time blocks.

**`src/lib/timeblocking/autoScheduler.ts`** — "Plan My Day" algorithm: takes P1/P2 tasks, distributes across available slots respecting working hours.

**`src/hooks/useTimeBlocks.ts`** — CRUD hook for time_blocks table.

**`src/components/tasks/TimeBlockPicker.tsx`** — Inline time range picker in TaskDetailDrawer.

**Today page update:** Toggle between "List view" and "Timeline view". Auto-schedule button.

**Settings update:** Working hours (start/end) configuration.

---

## Technical Details

### New Files (~25)
```text
src/lib/nlp/parseTaskInput.ts
src/lib/nlp/detectDatesInText.ts
src/lib/intelligence/suggestionEngine.ts
src/lib/templates/applyTemplate.ts
src/lib/dependencies/dependencyValidator.ts
src/lib/timeblocking/autoScheduler.ts
src/components/intelligence/NLPTaskInput.tsx
src/components/intelligence/TaskSuggestionDropdown.tsx
src/components/intelligence/ClipboardDateBanner.tsx
src/components/templates/TemplatePickerModal.tsx
src/components/templates/TemplateVariablePrompt.tsx
src/components/tasks/DependencySection.tsx
src/components/tasks/DependencyBadge.tsx
src/components/timeblocking/DailyTimeline.tsx
src/components/timeblocking/TimeBlock.tsx
src/components/timeblocking/UnscheduledColumn.tsx
src/components/tasks/TimeBlockPicker.tsx
src/hooks/useTaskSuggestions.ts
src/hooks/useClipboardDateDetection.ts
src/hooks/use-templates.ts
src/hooks/useDependencies.ts
src/hooks/useTimeBlocks.ts
src/pages/settings/TemplatesSettings.tsx
```

### Modified Files (~8)
- `src/components/tasks/QuickAddDialog.tsx` — NLP input, template trigger, suggestions
- `src/components/tasks/TaskDetailDrawer.tsx` — clipboard detection, dependencies section, time block picker, save-as-template
- `src/components/tasks/TaskItem.tsx` — dependency badge
- `src/components/tasks/TaskList.tsx` — blocked task styling
- `src/pages/Today.tsx` — timeline view toggle, auto-schedule
- `src/pages/Settings.tsx` — templates link, working hours
- `src/components/layout/AppSidebar.tsx` — "Blocked" smart view
- `src/App.tsx` — template settings route

### No New Dependencies
All features use pure TypeScript logic + existing UI primitives (shadcn). Time blocking drag-and-drop reuses `@dnd-kit` already installed.

### DB Migration
1 migration creating `task_templates`, `task_dependencies`, `time_blocks` tables with RLS + profile columns.

