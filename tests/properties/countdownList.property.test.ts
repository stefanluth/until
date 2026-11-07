import fc from 'fast-check';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { addCountdownId, hasCountdownId, readCountdownIds, removeCountdownId } from '../../app/_utils/countdownList.ts';
import { validCountdownId, validCountdownIds } from '../support/arbitraries.ts';

describe('countdownList properties', () => {
  it('round-trips valid IDs through the cookie format', () => {
    fc.assert(
      fc.property(validCountdownIds, (ids) => {
        assert.deepEqual(readCountdownIds(ids.join(',')), ids);
      }),
    );
  });

  it('keeps added IDs and is idempotent', () => {
    fc.assert(
      fc.property(validCountdownIds, validCountdownId, (ids, id) => {
        const next = addCountdownId(ids, id);

        assert.ok(hasCountdownId(next.join(','), id));
        assert.deepEqual(addCountdownId(next, id), next);
      }),
    );
  });

  it('removes IDs and preserves the rest', () => {
    fc.assert(
      fc.property(validCountdownIds, validCountdownId, (ids, id) => {
        const next = removeCountdownId(ids, id);

        assert.equal(hasCountdownId(next.join(','), id), false);
        assert.deepEqual(
          next,
          ids.filter((entry) => entry !== id),
        );
      }),
    );
  });
});
