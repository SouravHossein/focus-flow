import { addDays, nextDay, startOfToday, parse, isValid } from 'date-fns';

export interface ParsedToken {
  type: 'date' | 'time' | 'priority' | 'label' | 'project' | 'recurrence';
  text: string;
  start: number;
  end: number;
  value: any;
}

export interface ParsedRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  dayOfWeek?: number;
}

export interface ParsedTaskInput {
  title: string;
  dueDate: Date | null;
  dueTime: string | null;
  recurrence: ParsedRecurrence | null;
  priority: number | null;
  labels: string[];
  projectHint: string | null;
  tokens: ParsedToken[];
}

const DAY_MAP: Record<string, number> = {
  sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3, thursday: 4, thu: 4, thurs: 4,
  friday: 5, fri: 5, saturday: 6, sat: 6,
};

const WEEKDAY_NAMES = Object.keys(DAY_MAP);

function resolveNextDay(dayName: string): Date {
  const dayIndex = DAY_MAP[dayName.toLowerCase()];
  if (dayIndex === undefined) return new Date();
  const today = startOfToday();
  const todayDay = today.getDay();
  const daysAhead = (dayIndex - todayDay + 7) % 7 || 7;
  return addDays(today, daysAhead);
}

export function parseTaskInput(input: string): ParsedTaskInput {
  const tokens: ParsedToken[] = [];
  let remaining = input;

  // Priority: p1-p4 or !1-!4
  const priorityRegex = /(?:^|\s)([p!])([1-4])(?:\s|$)/gi;
  let pm;
  while ((pm = priorityRegex.exec(remaining)) !== null) {
    const start = remaining.indexOf(pm[0].trim(), pm.index);
    tokens.push({
      type: 'priority',
      text: pm[0].trim(),
      start,
      end: start + pm[0].trim().length,
      value: parseInt(pm[2]),
    });
  }

  // Labels: #labelname
  const labelRegex = /(?:^|\s)#(\w[\w-]*)/g;
  let lm;
  while ((lm = labelRegex.exec(remaining)) !== null) {
    const text = '#' + lm[1];
    const start = remaining.indexOf(text, lm.index);
    tokens.push({
      type: 'label',
      text,
      start,
      end: start + text.length,
      value: lm[1],
    });
  }

  // Project: @projectname or "in ProjectName" (at end of string or before punctuation)
  const projectAtRegex = /(?:^|\s)@(\w[\w\s-]*?)(?=\s+(?:p[1-4]|![1-4]|#|@|today|tomorrow|every|daily|weekly|monthly|at\s)|\s*$)/gi;
  let projM = projectAtRegex.exec(remaining);
  if (projM) {
    const text = '@' + projM[1].trim();
    const start = remaining.indexOf(text, projM.index);
    tokens.push({
      type: 'project',
      text,
      start,
      end: start + text.length,
      value: projM[1].trim(),
    });
  }

  if (!tokens.some((t) => t.type === 'project')) {
    const projectInRegex = /\s+in\s+([A-Z][\w\s-]*?)(?=\s+(?:p[1-4]|![1-4]|#|@|today|tomorrow|every|daily|weekly|monthly|at\s)|\s*$)/gi;
    let inM = projectInRegex.exec(remaining);
    if (inM) {
      const fullText = inM[0].trimStart();
      const start = remaining.indexOf(fullText, inM.index);
      tokens.push({
        type: 'project',
        text: fullText,
        start,
        end: start + fullText.length,
        value: inM[1].trim(),
      });
    }
  }

  // Recurrence patterns
  const recurrencePatterns: [RegExp, () => ParsedRecurrence][] = [
    [/\b(?:every\s*day|daily)\b/i, () => ({ frequency: 'daily', interval: 1 })],
    [/\b(?:every\s*week|weekly)\b/i, () => ({ frequency: 'weekly', interval: 1 })],
    [/\b(?:every\s*month|monthly)\b/i, () => ({ frequency: 'monthly', interval: 1 })],
    [/\bevery\s+(\d+)\s+days?\b/i, () => ({ frequency: 'daily', interval: parseInt(RegExp.$1) })],
    [/\bevery\s+(\d+)\s+weeks?\b/i, () => ({ frequency: 'weekly', interval: parseInt(RegExp.$1) })],
    [/\bevery\s+(\d+)\s+months?\b/i, () => ({ frequency: 'monthly', interval: parseInt(RegExp.$1) })],
    [/\bevery\s+weekday\b/i, () => ({ frequency: 'daily', interval: 1 })],
  ];

  // Check for "every [dayname]"
  const everyDayRegex = new RegExp(`\\bevery\\s+(${WEEKDAY_NAMES.join('|')})\\b`, 'i');
  const everyDayMatch = everyDayRegex.exec(remaining);
  if (everyDayMatch) {
    const dayIndex = DAY_MAP[everyDayMatch[1].toLowerCase()];
    const text = everyDayMatch[0];
    const start = remaining.indexOf(text, everyDayMatch.index);
    tokens.push({
      type: 'recurrence',
      text,
      start,
      end: start + text.length,
      value: { frequency: 'weekly', interval: 1, dayOfWeek: dayIndex } as ParsedRecurrence,
    });
  }

  if (!tokens.some((t) => t.type === 'recurrence')) {
    for (const [regex, factory] of recurrencePatterns) {
      const match = regex.exec(remaining);
      if (match) {
        const text = match[0];
        const start = remaining.indexOf(text, match.index);
        tokens.push({
          type: 'recurrence',
          text,
          start,
          end: start + text.length,
          value: factory(),
        });
        break;
      }
    }
  }

  // Time: "at 3pm", "at 15:00", "at 9:30am"
  const timeRegex = /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;
  const timeMatch = timeRegex.exec(remaining);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const meridiem = timeMatch[3]?.toLowerCase();
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
    if (!meridiem && hours <= 12 && hours >= 1 && hours < 7) hours += 12; // assume PM for small numbers

    const text = timeMatch[0];
    const start = remaining.indexOf(text, timeMatch.index);
    tokens.push({
      type: 'time',
      text,
      start,
      end: start + text.length,
      value: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    });
  }

  // Date patterns
  const today = startOfToday();
  const datePatterns: [RegExp, (m: RegExpExecArray) => Date | null][] = [
    [/\btoday\b/i, () => today],
    [/\btomorrow\b/i, () => addDays(today, 1)],
    [/\byesterday\b/i, () => addDays(today, -1)],
    [/\bin\s+(\d+)\s+days?\b/i, (m) => addDays(today, parseInt(m[1]))],
    [/\bin\s+(\d+)\s+weeks?\b/i, (m) => addDays(today, parseInt(m[1]) * 7)],
    [/\bin\s+(\d+)\s+months?\b/i, (m) => {
      const d = new Date(today);
      d.setMonth(d.getMonth() + parseInt(m[1]));
      return d;
    }],
    [new RegExp(`\\bnext\\s+(${WEEKDAY_NAMES.join('|')})\\b`, 'i'), (m) => resolveNextDay(m[1])],
    [new RegExp(`\\bthis\\s+(${WEEKDAY_NAMES.join('|')})\\b`, 'i'), (m) => {
      const dayIndex = DAY_MAP[m[1].toLowerCase()];
      const todayDay = today.getDay();
      const daysAhead = (dayIndex - todayDay + 7) % 7;
      return daysAhead === 0 ? today : addDays(today, daysAhead);
    }],
    [/\bon\s+(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i, (m) => {
      const d = parse(`${m[1]} ${m[2]}`, 'MMMM d', new Date());
      return isValid(d) ? d : null;
    }],
    [/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/, (m) => {
      const month = parseInt(m[1]) - 1;
      const day = parseInt(m[2]);
      const year = m[3] ? (m[3].length === 2 ? 2000 + parseInt(m[3]) : parseInt(m[3])) : new Date().getFullYear();
      const d = new Date(year, month, day);
      return isValid(d) ? d : null;
    }],
  ];

  if (!tokens.some((t) => t.type === 'date')) {
    for (const [regex, resolver] of datePatterns) {
      const match = regex.exec(remaining);
      if (match) {
        const resolved = resolver(match);
        if (resolved) {
          const text = match[0];
          const start = remaining.indexOf(text, match.index);
          tokens.push({
            type: 'date',
            text,
            start,
            end: start + text.length,
            value: resolved,
          });
          break;
        }
      }
    }
  }

  // Build clean title by removing all token texts
  tokens.sort((a, b) => b.start - a.start); // reverse order for removal
  let cleanTitle = remaining;
  for (const token of tokens) {
    cleanTitle = cleanTitle.slice(0, token.start) + cleanTitle.slice(token.end);
  }
  cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();

  // Re-sort tokens by position
  tokens.sort((a, b) => a.start - b.start);

  const priority = tokens.find((t) => t.type === 'priority')?.value ?? null;
  const labels = tokens.filter((t) => t.type === 'label').map((t) => t.value as string);
  const projectHint = tokens.find((t) => t.type === 'project')?.value ?? null;
  const dueDate = tokens.find((t) => t.type === 'date')?.value ?? null;
  const dueTime = tokens.find((t) => t.type === 'time')?.value ?? null;
  const recurrence = tokens.find((t) => t.type === 'recurrence')?.value ?? null;

  return {
    title: cleanTitle || input.trim(),
    dueDate,
    dueTime,
    recurrence,
    priority,
    labels,
    projectHint,
    tokens,
  };
}
