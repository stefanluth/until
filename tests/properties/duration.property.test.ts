import fc from 'fast-check';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getVisibleUnits, splitRemaining } from '../../app/_utils/duration.ts';
import { countdownParts } from '../support/arbitraries.ts';

const UNITS = ['days', 'hours', 'minutes', 'seconds'] as const;

describe('splitRemaining properties', () => {
  it('recomposes to the floored total seconds', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }), (milliseconds) => {
        const { days, hours, minutes, seconds } = splitRemaining(milliseconds);

        assert.ok(Number.isInteger(days) && days >= 0);
        assert.ok(hours >= 0 && hours < 24);
        assert.ok(minutes >= 0 && minutes < 60);
        assert.ok(seconds >= 0 && seconds < 60);
        assert.equal(((days * 24 + hours) * 60 + minutes) * 60 + seconds, Math.floor(milliseconds / 1000));
      }),
    );
  });

  it('returns zeroes for non-positive input', () => {
    fc.assert(
      fc.property(fc.integer({ min: Number.MIN_SAFE_INTEGER, max: 0 }), (milliseconds) => {
        assert.deepEqual(splitRemaining(milliseconds), { days: 0, hours: 0, minutes: 0, seconds: 0 });
      }),
    );
  });
});

describe('getVisibleUnits properties', () => {
  it('returns a suffix below the days threshold', () => {
    fc.assert(
      fc.property(countdownParts, (parts) => {
        const units = getVisibleUnits(parts);

        if (parts.days >= 7) {
          assert.deepEqual(units, ['days']);
          return;
        }

        assert.deepEqual(units, UNITS.slice(UNITS.length - units.length));
      }),
    );
  });

  it('is empty only when every unit is zero', () => {
    fc.assert(
      fc.property(countdownParts, (parts) => {
        const allZero = parts.days + parts.hours + parts.minutes + parts.seconds === 0;

        assert.equal(getVisibleUnits(parts).length === 0, allZero);
      }),
    );
  });

  it('drops only leading zero units below the days threshold', () => {
    fc.assert(
      fc.property(countdownParts, (parts) => {
        const units = getVisibleUnits(parts);

        if (parts.days >= 7) {
          assert.deepEqual(units, ['days']);
          return;
        }

        const first = UNITS.findIndex((unit) => parts[unit] > 0);
        assert.deepEqual(units, first < 0 ? [] : UNITS.slice(first));
      }),
    );
  });
});
