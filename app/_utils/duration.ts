export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const UNITS = ['days', 'hours', 'minutes', 'seconds'] as const;

export type CountdownUnit = (typeof UNITS)[number];

const DAYS_ONLY_THRESHOLD = 7;

export function getVisibleUnits(parts: CountdownParts): CountdownUnit[] {
  const first = UNITS.findIndex((unit) => parts[unit] > 0);

  if (first < 0) {
    return [];
  }

  if (parts.days >= DAYS_ONLY_THRESHOLD) {
    return ['days'];
  }

  return UNITS.slice(first);
}

export function splitRemaining(milliseconds: number): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor(totalSeconds / 3600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
  };
}
