import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatCountdownDate, unitLabel } from '../../app/_utils/countdownDisplay.ts';

describe('formatCountdownDate', () => {
  it('omits the time for a midnight date', () => {
    assert.equal(formatCountdownDate(new Date(2027, 0, 1, 0, 0, 0), 'en-US'), 'Friday, January 1, 2027');
  });

  it('includes the time for a non-midnight date', () => {
    const label = formatCountdownDate(new Date(2027, 0, 1, 13, 5, 0), 'en-US');

    assert.ok(label.includes('Friday, January 1, 2027'));
    assert.ok(label.includes(' | '));
    assert.ok(label.includes('01:05'));
  });
});

describe('unitLabel', () => {
  it('uses the singular label only for one', () => {
    assert.equal(unitLabel('days', 0), 'days');
    assert.equal(unitLabel('days', 1), 'day');
    assert.equal(unitLabel('days', 2), 'days');
    assert.equal(unitLabel('hours', 1), 'hour');
    assert.equal(unitLabel('minutes', 1), 'minute');
    assert.equal(unitLabel('seconds', 1), 'second');
  });
});
