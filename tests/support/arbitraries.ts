import fc from 'fast-check';

export const validCountdownId = fc.stringMatching(/^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{8}$/);
export const validCountdownIds = fc.array(validCountdownId, { maxLength: 20 });

export const countdownParts = fc.record({
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
