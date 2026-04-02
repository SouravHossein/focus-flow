interface SchedulableTask {
  id: string;
  title: string;
  priority: number;
  estimatedMinutes?: number;
}

interface TimeSlot {
  taskId: string;
  startMinutes: number; // minutes from midnight
  endMinutes: number;
}

export function autoSchedule(
  tasks: SchedulableTask[],
  existingBlocks: { task_id: string; start_time: string; end_time: string }[],
  workStartTime: string = '09:00',
  workEndTime: string = '18:00',
  nowMinutes?: number
): TimeSlot[] {
  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const workStart = parseTime(workStartTime);
  const workEnd = parseTime(workEndTime);
  const currentMinutes = nowMinutes ?? Math.max(parseTime(
    new Date().toTimeString().slice(0, 5)
  ), workStart);

  // Build list of occupied slots
  const occupied = existingBlocks.map((b) => ({
    start: parseTime(b.start_time),
    end: parseTime(b.end_time),
  })).sort((a, b) => a.start - b.start);

  // Find free slots
  const freeSlots: { start: number; end: number }[] = [];
  let cursor = Math.max(workStart, currentMinutes);

  for (const occ of occupied) {
    if (occ.start > cursor && occ.start <= workEnd) {
      freeSlots.push({ start: cursor, end: Math.min(occ.start, workEnd) });
    }
    cursor = Math.max(cursor, occ.end);
  }
  if (cursor < workEnd) {
    freeSlots.push({ start: cursor, end: workEnd });
  }

  // Sort tasks by priority (P1 first)
  const sorted = [...tasks].sort((a, b) => a.priority - b.priority);

  const result: TimeSlot[] = [];
  let slotIndex = 0;
  let slotCursor = freeSlots[0]?.start ?? workEnd;

  for (const task of sorted) {
    if (slotIndex >= freeSlots.length) break;

    const duration = task.estimatedMinutes || 30; // default 30 min
    const slot = freeSlots[slotIndex];

    if (slotCursor + duration <= slot.end) {
      result.push({
        taskId: task.id,
        startMinutes: slotCursor,
        endMinutes: slotCursor + duration,
      });
      slotCursor += duration;
    } else {
      // Move to next free slot
      slotIndex++;
      if (slotIndex < freeSlots.length) {
        slotCursor = freeSlots[slotIndex].start;
        if (slotCursor + duration <= freeSlots[slotIndex].end) {
          result.push({
            taskId: task.id,
            startMinutes: slotCursor,
            endMinutes: slotCursor + duration,
          });
          slotCursor += duration;
        }
      }
    }
  }

  return result;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
