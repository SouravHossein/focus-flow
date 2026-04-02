import type { Tables } from '@/integrations/supabase/types';

type Task = Tables<'tasks'> & {
  task_labels?: { label_id: string; labels: Tables<'labels'> }[];
};

export interface TaskSuggestion {
  title: string;
  priority: number;
  projectId: string | null;
  projectName: string | null;
  labels: { id: string; name: string; color: string }[];
  dueDate: string | null;
  reason: string;
  score: number;
}

function fuzzyMatch(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.startsWith(q)) return 1;
  if (t.includes(q)) return 0.7;
  // Simple character match score
  let score = 0;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) { score++; qi++; }
  }
  return qi === q.length ? score / t.length : 0;
}

export function generateSuggestions(
  query: string,
  recentTasks: Task[],
  projects: { id: string; name: string }[],
  maxResults = 5
): TaskSuggestion[] {
  if (!query || query.length < 2 || !recentTasks.length) return [];

  const now = new Date();
  const currentDay = now.getDay();
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

  const scored: TaskSuggestion[] = [];
  const seen = new Set<string>();

  for (const task of recentTasks) {
    const titleLower = task.title.toLowerCase();
    if (seen.has(titleLower)) continue;
    seen.add(titleLower);

    const similarity = fuzzyMatch(query, task.title);
    if (similarity < 0.3) continue;

    // Recency boost (tasks from last 7 days score higher)
    const createdAt = new Date(task.created_at);
    const daysSince = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - daysSince / 30);

    // Day-of-week pattern boost
    const createdDay = createdAt.getDay();
    const dayMatch = createdDay === currentDay ? 0.2 : 0;

    const totalScore = similarity * 0.5 + recencyScore * 0.3 + dayMatch;

    let reason = 'Similar to a recent task';
    if (dayMatch > 0) reason = `You often do this on ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][currentDay]}s`;
    if (recencyScore > 0.7) reason = 'Recently created task';

    scored.push({
      title: task.title,
      priority: task.priority,
      projectId: task.project_id,
      projectName: task.project_id ? (projectMap.get(task.project_id) || null) : null,
      labels: task.task_labels?.map((tl) => ({
        id: tl.label_id,
        name: tl.labels.name,
        color: tl.labels.color,
      })) || [],
      dueDate: task.due_date,
      reason,
      score: totalScore,
    });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, maxResults);
}
