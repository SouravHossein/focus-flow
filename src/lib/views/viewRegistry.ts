import { List, Columns3, Calendar, GanttChart, Table2, Sun, Activity } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ViewId = 'list' | 'board' | 'calendar' | 'gantt' | 'table' | 'myday' | 'activity';
export type ViewContext = 'project' | 'label' | 'smart-view' | 'global';

export interface ViewDefinition {
  id: ViewId;
  label: string;
  icon: LucideIcon;
  description: string;
  supportedContexts: ViewContext[];
  supportsDnd: boolean;
  supportsBulkSelect: boolean;
  supportsColumnConfig: boolean;
}

export const VIEW_REGISTRY: ViewDefinition[] = [
  {
    id: 'list',
    label: 'List',
    icon: List,
    description: 'Simple task list',
    supportedContexts: ['project', 'label', 'smart-view', 'global'],
    supportsDnd: true,
    supportsBulkSelect: true,
    supportsColumnConfig: false,
  },
  {
    id: 'board',
    label: 'Board',
    icon: Columns3,
    description: 'Kanban board',
    supportedContexts: ['project', 'smart-view', 'global'],
    supportsDnd: true,
    supportsBulkSelect: false,
    supportsColumnConfig: false,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    description: 'Calendar view',
    supportedContexts: ['project', 'label', 'smart-view', 'global'],
    supportsDnd: true,
    supportsBulkSelect: false,
    supportsColumnConfig: false,
  },
  {
    id: 'gantt',
    label: 'Gantt',
    icon: GanttChart,
    description: 'Timeline chart',
    supportedContexts: ['project'],
    supportsDnd: true,
    supportsBulkSelect: false,
    supportsColumnConfig: false,
  },
  {
    id: 'table',
    label: 'Table',
    icon: Table2,
    description: 'Spreadsheet view',
    supportedContexts: ['project', 'label', 'smart-view', 'global'],
    supportsDnd: false,
    supportsBulkSelect: true,
    supportsColumnConfig: true,
  },
  {
    id: 'myday',
    label: 'My Day',
    icon: Sun,
    description: 'Daily focus list',
    supportedContexts: ['global'],
    supportsDnd: true,
    supportsBulkSelect: false,
    supportsColumnConfig: false,
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: Activity,
    description: 'Activity feed',
    supportedContexts: ['project', 'global'],
    supportsDnd: false,
    supportsBulkSelect: false,
    supportsColumnConfig: false,
  },
];

export function getViewsForContext(context: ViewContext): ViewDefinition[] {
  return VIEW_REGISTRY.filter((v) => v.supportedContexts.includes(context));
}

export function getViewById(id: ViewId): ViewDefinition | undefined {
  return VIEW_REGISTRY.find((v) => v.id === id);
}
