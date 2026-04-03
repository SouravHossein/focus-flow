import { supabase } from '@/integrations/supabase/client';

export type ActivityEventType =
  | 'task.created'
  | 'task.completed'
  | 'task.uncompleted'
  | 'task.updated'
  | 'task.deleted'
  | 'task.moved'
  | 'project.created'
  | 'project.archived'
  | 'project.deleted'
  | 'label.created'
  | 'label.deleted';

export async function logActivity(
  userId: string,
  eventType: ActivityEventType,
  entityType: string,
  entityId: string | null,
  entityName: string,
  metadata?: Record<string, any>
) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      metadata: metadata || {},
    });
  } catch (e) {
    console.error('Failed to log activity:', e);
  }
}
