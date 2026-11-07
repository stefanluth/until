import fc from 'fast-check';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCountdownId } from '../../app/_utils/countdownId.ts';
import { isValidCountdownId } from '../../app/_utils/validation.ts';

const name = fc.string({ unit: 'grapheme', maxLength: 20 });
const date = fc.integer({ min: 0, max: 253_402_300_799_999 }).map((milliseconds) => new Date(milliseconds));

describe('createCountdownId properties', () => {
  it('encodes the name and appends an eight-character hex hash', () => {
    fc.assert(
      fc.property(name, date, (value, when) => {
        const id = createCountdownId(value, when);

        assert.equal(id.slice(0, -9), encodeURIComponent(value));
        assert.match(id.slice(-9), /^-[0-9a-f]{8}$/);
        assert.equal(isValidCountdownId(id), true);
      }),
    );
  });

  it('is deterministic for identical inputs', () => {
    fc.assert(
      fc.property(name, date, (value, when) => {
        assert.equal(createCountdownId(value, when), createCountdownId(value, when));
      }),
    );
  });
});
