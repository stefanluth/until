import fc from 'fast-check';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createMomentId } from '../../app/_utils/momentId.ts';
import { isValidMomentId } from '../../app/_utils/validation.ts';

const name = fc.string({ unit: 'grapheme', maxLength: 20 });
const date = fc.integer({ min: 0, max: 253_402_300_799_999 }).map((milliseconds) => new Date(milliseconds));

describe('createMomentId properties', () => {
  it('produces a readable URL-safe slug and an eight-character hex hash', () => {
    fc.assert(
      fc.property(name, date, (value, when) => {
        const id = createMomentId(value, when);

        assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{8}$/);
        assert.equal(isValidMomentId(id), true);
      }),
    );
  });

  it('is deterministic for identical inputs', () => {
    fc.assert(
      fc.property(name, date, (value, when) => {
        assert.equal(createMomentId(value, when), createMomentId(value, when));
      }),
    );
  });
});
