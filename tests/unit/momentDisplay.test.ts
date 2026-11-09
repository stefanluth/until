import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatDateParts } from '../../app/_utils/momentDisplay.ts';

describe('formatDateParts', () => {
  it('omits the time for a midnight date', () => {
    assert.deepEqual(formatDateParts(new Date(2027, 0, 1, 0, 0, 0), 'en-US'), {
      date: 'Friday, January 1, 2027',
      time: null,
    });
  });

  it('includes the time for a non-midnight date', () => {
    const parts = formatDateParts(new Date(2027, 0, 1, 13, 5, 0), 'en-US');

    assert.equal(parts.date, 'Friday, January 1, 2027');
    assert.ok(parts.time?.includes('01:05'));
  });
});

describe('formatDateParts with a time zone', () => {
  it('formats the date and time in the requested zone', () => {
    const parts = formatDateParts(new Date('2026-12-31T23:30:00Z'), 'en-US', 'UTC');

    assert.equal(parts.date, 'Thursday, December 31, 2026');
    assert.ok(parts.time?.includes('11:30'));
  });

  it('omits the time when midnight falls in the requested zone', () => {
    const parts = formatDateParts(new Date('2026-12-31T00:00:00Z'), 'en-US', 'UTC');

    assert.equal(parts.date, 'Thursday, December 31, 2026');
    assert.equal(parts.time, null);
  });
});
