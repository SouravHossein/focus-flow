export function formatActivityEntry(entry: {
  event_type: string;
  entity_type: string;
  entity_name: string | null;
  metadata: any;
}): { icon: string; text: string } {
  const name = entry.entity_name || 'Unknown';

  switch (entry.event_type) {
    case 'task.created':
      return { icon: '➕', text: `Created task **${name}**` };
    case 'task.completed':
      return { icon: '✅', text: `Completed **${name}**` };
    case 'task.uncompleted':
      return { icon: '🔄', text: `Reopened **${name}**` };
    case 'task.updated': {
      const changes = entry.metadata?.changes;
      if (changes) {
        const parts = Object.entries(changes).map(([field, val]: [string, any]) => `${field}: **${val.from} → ${val.to}**`);
        return { icon: '✏️', text: `Updated **${name}**: ${parts.join(', ')}` };
      }
      return { icon: '✏️', text: `Updated **${name}**` };
    }
    case 'task.deleted':
      return { icon: '🗑️', text: `Deleted task **${name}**` };
    case 'task.moved':
      return { icon: '📦', text: `Moved **${name}** to **${entry.metadata?.to || 'another project'}**` };
    case 'project.created':
      return { icon: '📁', text: `Created project **${name}**` };
    case 'project.archived':
      return { icon: '📦', text: `Archived project **${name}**` };
    case 'project.deleted':
      return { icon: '🗑️', text: `Deleted project **${name}**` };
    case 'label.created':
      return { icon: '🏷️', text: `Created label **${name}**` };
    case 'label.deleted':
      return { icon: '🏷️', text: `Deleted label **${name}**` };
    default:
      return { icon: '📝', text: `${entry.event_type} on **${name}**` };
  }
}
