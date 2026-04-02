import { addDays } from 'date-fns';

export interface TemplateData {
  title: string;
  description?: string;
  priority?: number;
  labels?: string[];
  projectId?: string;
  subtasks?: { title: string; dueDateOffset?: number }[];
  dueDateOffset?: number;
  recurrence?: { frequency: string; interval: number };
  estimatedMinutes?: number;
}

export interface ResolvedTask {
  title: string;
  description: string | null;
  priority: number;
  project_id: string | null;
  due_date: string | null;
  subtasks: { title: string; due_date: string | null }[];
}

export function applyTemplate(
  template: TemplateData,
  variables: Record<string, string> = {},
  anchorDate: Date = new Date()
): ResolvedTask {
  const resolveVars = (text: string): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
  };

  const title = resolveVars(template.title);
  const description = template.description ? resolveVars(template.description) : null;

  const dueDate = template.dueDateOffset != null
    ? addDays(anchorDate, template.dueDateOffset).toISOString()
    : null;

  const subtasks = (template.subtasks || []).map((st) => ({
    title: resolveVars(st.title),
    due_date: st.dueDateOffset != null
      ? addDays(anchorDate, st.dueDateOffset).toISOString()
      : null,
  }));

  return {
    title,
    description,
    priority: template.priority ?? 4,
    project_id: template.projectId ?? null,
    due_date: dueDate,
    subtasks,
  };
}

export function extractVariables(template: TemplateData): string[] {
  const vars = new Set<string>();
  const scan = (text?: string) => {
    if (!text) return;
    const matches = text.matchAll(/\{\{(\w+)\}\}/g);
    for (const m of matches) vars.add(m[1]);
  };
  scan(template.title);
  scan(template.description);
  template.subtasks?.forEach((st) => scan(st.title));
  return Array.from(vars);
}
