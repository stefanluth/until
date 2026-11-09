import fc from 'fast-check';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { addMomentId, hasMomentId, readMomentIds, removeMomentId } from '../../app/_utils/momentList.ts';
import { validMomentId, validMomentIds } from '../support/arbitraries.ts';

describe('momentList properties', () => {
  it('round-trips valid IDs through the cookie format', () => {
    fc.assert(
      fc.property(validMomentIds, (ids) => {
        assert.deepEqual(readMomentIds(ids.join(',')), ids);
      }),
    );
  });

  it('keeps added IDs and is idempotent', () => {
    fc.assert(
      fc.property(validMomentIds, validMomentId, (ids, id) => {
        const next = addMomentId(ids, id);

        assert.ok(hasMomentId(next.join(','), id));
        assert.deepEqual(addMomentId(next, id), next);
      }),
    );
  });

  it('removes IDs and preserves the rest', () => {
    fc.assert(
      fc.property(validMomentIds, validMomentId, (ids, id) => {
        const next = removeMomentId(ids, id);

        assert.equal(hasMomentId(next.join(','), id), false);
        assert.deepEqual(
          next,
          ids.filter((entry) => entry !== id),
        );
      }),
    );
  });
});
