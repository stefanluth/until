import type { CountdownUnit } from './duration.ts';

const SINGULAR_LABELS: Record<CountdownUnit, string> = {
  days: 'day',
  hours: 'hour',
  minutes: 'minute',
  seconds: 'second',
};

export function unitLabel(unit: CountdownUnit, value: number): string {
  return value === 1 ? SINGULAR_LABELS[unit] : unit;
}

type CountdownDateParts = {
  date: string;
  time: string | null;
};

export function formatCountdownDateParts(date: Date, locale?: string): CountdownDateParts {
  const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const isMidnight = date.getHours() === 0 && date.getMinutes() === 0;

  return { date: dateString, time: isMidnight ? null : time };
}
