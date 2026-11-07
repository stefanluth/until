import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCountdownId } from '../app/utils/countdownId.ts';

const DATE = new Date('2026-01-01T00:00:00.000Z');

describe('createCountdownId', () => {
  it('is deterministic for the same name and date', () => {
    assert.equal(createCountdownId('Birthday', DATE), createCountdownId('Birthday', DATE));
  });

  it('uses an encoded name and eight hexadecimal hash characters', () => {
    const id = createCountdownId('My Event', DATE);

    assert.match(id, /^My%20Event-[a-f0-9]{8}$/);
  });

  it('changes when the date changes', () => {
    const later = new Date('2026-01-01T00:00:01.000Z');

    assert.notEqual(createCountdownId('Birthday', DATE), createCountdownId('Birthday', later));
  });
});
