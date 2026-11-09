import fc from 'fast-check';

import { encodeMomentToken } from '../../app/_utils/momentUrl.ts';

const MIN_DATE = Date.UTC(1970, 0, 1);
const MAX_DATE = Date.UTC(9999, 11, 31, 23, 59, 59, 999);

export const validMomentName = fc.string({ unit: 'grapheme', maxLength: 32 }).filter((value) => {
  if (value.length === 0 || value.length > 32 || value.trim() !== value) return false;
  if (/[\u0000-\u001f\u007f]/.test(value)) return false;

  try {
    encodeURIComponent(value);
    return true;
  } catch {
    return false;
  }
});

const validDate = fc.integer({ min: MIN_DATE, max: MAX_DATE }).map((milliseconds) => new Date(milliseconds));

export const validMomentId = fc.tuple(validMomentName, validDate).map(([name, date]) => encodeMomentToken(name, date));

export const validMomentIds = fc.array(validMomentId, { maxLength: 20 });

export const remainingParts = fc.record({
  days: fc.integer({ min: 0, max: 100_000 }),
  hours: fc.integer({ min: 0, max: 23 }),
  minutes: fc.integer({ min: 0, max: 59 }),
  seconds: fc.integer({ min: 0, max: 59 }),
});

export const durationParts = fc.record({
  days: fc.integer({ min: 0, max: 36_499 }),
  hours: fc.integer({ min: 0, max: 23 }),
  minutes: fc.integer({ min: 0, max: 59 }),
  seconds: fc.integer({ min: 0, max: 59 }),
});

export const calendarDateParts = fc.record({
  day: fc.integer({ min: 1, max: 28 }),
  month: fc.integer({ min: 1, max: 12 }),
  year: fc.integer({ min: 1, max: 9999 }),
  hours: fc.integer({ min: 0, max: 23 }),
  minutes: fc.integer({ min: 0, max: 59 }),
  seconds: fc.integer({ min: 0, max: 59 }),
});
