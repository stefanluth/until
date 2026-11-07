import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getVisibleUnits, splitRemaining } from '../../app/_utils/duration.ts';

describe('splitRemaining', () => {
  it('splits a mixed duration', () => {
    const milliseconds = (((1 * 24 + 2) * 60 + 3) * 60 + 4) * 1000;

    assert.deepEqual(splitRemaining(milliseconds), { days: 1, hours: 2, minutes: 3, seconds: 4 });
  });

  it('starts counting seconds after one full second', () => {
    assert.deepEqual(splitRemaining(999), { days: 0, hours: 0, minutes: 0, seconds: 0 });
    assert.deepEqual(splitRemaining(1000), { days: 0, hours: 0, minutes: 0, seconds: 1 });
  });
});

describe('getVisibleUnits', () => {
  it('returns no units when the countdown has ended', () => {
    assert.deepEqual(getVisibleUnits({ days: 0, hours: 0, minutes: 0, seconds: 0 }), []);
  });

  it('keeps sub-day units below the days threshold', () => {
    assert.deepEqual(getVisibleUnits({ days: 1, hours: 0, minutes: 22, seconds: 13 }), [
      'days',
      'hours',
      'minutes',
      'seconds',
    ]);
  });

  it('shows only days at the threshold', () => {
    assert.deepEqual(getVisibleUnits({ days: 7, hours: 0, minutes: 0, seconds: 0 }), ['days']);
  });
});
