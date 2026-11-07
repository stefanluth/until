import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { splitRemaining } from '../app/_utils/duration.ts';

describe('splitRemaining', () => {
  it('splits days, hours, minutes, and seconds', () => {
    const milliseconds = (((1 * 24 + 2) * 60 + 3) * 60 + 4) * 1000;

    assert.deepEqual(splitRemaining(milliseconds), { days: 1, hours: 2, minutes: 3, seconds: 4 });
  });

  it('wraps hours at 24 and minutes/seconds at 60', () => {
    assert.deepEqual(splitRemaining((25 * 60 + 59) * 60 * 1000 + 59 * 1000), {
      days: 1,
      hours: 1,
      minutes: 59,
      seconds: 59,
    });
  });

  it('returns zeroes at and after the deadline', () => {
    assert.deepEqual(splitRemaining(0), { days: 0, hours: 0, minutes: 0, seconds: 0 });
    assert.deepEqual(splitRemaining(-5000), { days: 0, hours: 0, minutes: 0, seconds: 0 });
    assert.deepEqual(splitRemaining(999), { days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it('starts counting seconds after one full second', () => {
    assert.deepEqual(splitRemaining(1000), { days: 0, hours: 0, minutes: 0, seconds: 1 });
  });
});
