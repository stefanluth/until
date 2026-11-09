import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { unitLabel } from '../../app/_utils/timerDisplay.ts';

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
