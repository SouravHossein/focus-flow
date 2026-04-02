import { parse, isValid, addDays, startOfToday } from 'date-fns';

export interface DetectedDate {
  text: string;
  date: Date;
  confidence: number;
}

export function detectDatesInText(text: string): DetectedDate[] {
  const results: DetectedDate[] = [];
  const today = startOfToday();

  const patterns: { regex: RegExp; resolver: (m: RegExpExecArray) => Date | null; confidence: number }[] = [
    // ISO: 2025-06-15
    { regex: /\b(\d{4})-(\d{2})-(\d{2})\b/g, resolver: (m) => { const d = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])); return isValid(d) ? d : null; }, confidence: 0.95 },
    // Formatted: June 15, Jun 15, 15 June
    { regex: /\b([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?\b/g, resolver: (m) => { const d = parse(`${m[1]} ${m[2]} ${m[3] || new Date().getFullYear()}`, 'MMMM d yyyy', new Date()); return isValid(d) ? d : null; }, confidence: 0.8 },
    // MM/DD/YYYY or DD/MM/YYYY
    { regex: /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g, resolver: (m) => { const y = m[3].length === 2 ? 2000 + parseInt(m[3]) : parseInt(m[3]); const d = new Date(y, parseInt(m[1]) - 1, parseInt(m[2])); return isValid(d) ? d : null; }, confidence: 0.7 },
    // Relative: tomorrow, next week
    { regex: /\btomorrow\b/gi, resolver: () => addDays(today, 1), confidence: 0.9 },
    { regex: /\bnext week\b/gi, resolver: () => addDays(today, 7), confidence: 0.85 },
    { regex: /\btoday\b/gi, resolver: () => today, confidence: 0.9 },
  ];

  for (const { regex, resolver, confidence } of patterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const date = resolver(match);
      if (date && isValid(date)) {
        results.push({ text: match[0], date, confidence });
      }
    }
  }

  // Sort by confidence desc, prefer future dates
  results.sort((a, b) => {
    const aFuture = a.date >= today ? 1 : 0;
    const bFuture = b.date >= today ? 1 : 0;
    if (aFuture !== bFuture) return bFuture - aFuture;
    return b.confidence - a.confidence;
  });

  return results;
}
