import type { TimeUnit } from './timer.ts';

const SINGULAR_LABELS: Record<TimeUnit, string> = {
  days: 'day',
  hours: 'hour',
  minutes: 'minute',
  seconds: 'second',
};

export function unitLabel(unit: TimeUnit, value: number): string {
  return value === 1 ? SINGULAR_LABELS[unit] : unit;
}
