import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatMomentDateParts } from '../../app/_utils/momentDisplay.ts';

describe('formatMomentDateParts', () => {
  it('omits the time for a midnight date', () => {
    assert.deepEqual(formatMomentDateParts(new Date(2027, 0, 1, 0, 0, 0), 'en-US'), {
      date: 'Friday, January 1, 2027',
      time: null,
    });
  });

  it('includes the time for a non-midnight date', () => {
    const parts = formatMomentDateParts(new Date(2027, 0, 1, 13, 5, 0), 'en-US');

    assert.equal(parts.date, 'Friday, January 1, 2027');
    assert.ok(parts.time?.includes('01:05'));
  });
});
