const DATE_RE = /^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
const DURATION_RE = /^(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?$/i;
const MAX_DURATION_MS = 100 * 365.25 * 24 * 60 * 60 * 1000;

type DateParts = {
  day: number;
  month: number;
  year: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function parseWhen(value: string, now = new Date()): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  return parseCalendarDate(trimmed) ?? parseDuration(trimmed, now);
}

function parseCalendarDate(value: string): Date | null {
  const match = DATE_RE.exec(value);
  if (!match) return null;

  const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = match;
  const parts: DateParts = {
    day: Number(day),
    month: Number(month),
    year: Number(year),
    hours: Number(hours),
    minutes: Number(minutes),
    seconds: Number(seconds),
  };

  if (parts.year < 1 || parts.year > 9999) return null;

  const date = new Date(parts.year, parts.month - 1, parts.day, parts.hours, parts.minutes, parts.seconds);
  if (parts.year < 100) {
    date.setFullYear(parts.year);
  }

  return hasMatchingParts(date, parts) ? date : null;
}

function hasMatchingParts(date: Date, parts: DateParts): boolean {
  const actual = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ];
  const expected = [parts.year, parts.month, parts.day, parts.hours, parts.minutes, parts.seconds];

  return actual.every((value, index) => value === expected[index]);
}

function parseDuration(value: string, now: Date): Date | null {
  const match = DURATION_RE.exec(value);
  if (!match) return null;

  const rawUnits = match.slice(1);
  if (!rawUnits.some(Boolean)) return null;

  const units = rawUnits.map((part) => Number(part ?? 0));
  if (!units.every(Number.isSafeInteger)) return null;

  const [days, hours, minutes, seconds] = units;
  const durationMs = ((days * 24 * 60 + hours * 60 + minutes) * 60 + seconds) * 1000;

  if (durationMs < 0 || durationMs > MAX_DURATION_MS) return null;

  const result = new Date(now.getTime() + durationMs);
  return Number.isFinite(result.getTime()) ? result : null;
}
