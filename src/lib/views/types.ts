import type { Tables } from '@/integrations/supabase/types';
import type { ViewContext, ViewId } from './viewRegistry';

export type Task = Tables<'tasks'> & {
  task_labels?: { label_id: string; labels: Tables<'labels'> }[];
  start_date?: string | null;
};

export interface ViewProps {
  tasks: Task[];
  context: ViewContext;
  onTaskUpdate: (id: string, data: Record<string, any>) => void;
  onTaskDelete: (id: string) => void;
  onTaskComplete: (id: string, completed: boolean) => void;
  isLoading: boolean;
  project?: Tables<'projects'>;
  sections?: Tables<'sections'>[];
}
