import fc from 'fast-check';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  decodeMomentParam,
  decodeMomentToken,
  encodeMomentToken,
  isValidMomentId,
} from '../../app/_utils/momentUrl.ts';
import { validMomentId, validMomentName } from '../support/arbitraries.ts';

const date = fc
  .integer({ min: Date.UTC(1970, 0, 1), max: Date.UTC(9999, 11, 31, 23, 59, 59, 999) })
  .map((milliseconds) => new Date(milliseconds));

describe('moment URL properties', () => {
  it('round-trips a name and instant through the canonical token', () => {
    fc.assert(
      fc.property(validMomentName, date, (name, when) => {
        const token = encodeMomentToken(name, when);
        const moment = decodeMomentToken(token);

        assert.ok(moment);
        assert.equal(moment.name, name);
        assert.equal(moment.date.toISOString(), when.toISOString());
        assert.equal(moment.id, token);
        assert.equal(isValidMomentId(token), true);
      }),
    );
  });

  it('round-trips the server route parameter form', () => {
    fc.assert(
      fc.property(validMomentName, date, (name, when) => {
        const token = encodeMomentToken(name, when);
        const routeParam = encodeURIComponent(`${name}@${when.toISOString()}`);
        const moment = decodeMomentParam(routeParam);

        assert.ok(moment);
        assert.equal(moment.name, name);
        assert.equal(moment.date.toISOString(), when.toISOString());
        assert.equal(moment.id, token);
      }),
    );
  });

  it('always produces a canonical token with one raw delimiter', () => {
    fc.assert(
      fc.property(validMomentId, (token) => {
        assert.equal(token.split('@').length, 2);
        assert.equal(decodeMomentToken(token)?.id, token);
      }),
    );
  });
});
