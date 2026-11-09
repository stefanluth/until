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

function floorToSecond(date: Date): number {
  return Math.floor(date.getTime() / 1000) * 1000;
}

describe('moment URL properties', () => {
  it('round-trips a name and floored instant through the canonical token', () => {
    fc.assert(
      fc.property(validMomentName, date, (name, when) => {
        const token = encodeMomentToken(name, when);
        const moment = decodeMomentToken(token);

        assert.ok(moment);
        assert.equal(moment.name, name);
        assert.equal(moment.date.getTime(), floorToSecond(when));
        assert.equal(moment.id, token);
        assert.equal(isValidMomentId(token), true);
        assert.match(token, /[+-]\d{2}:\d{2}$/);
        assert.doesNotMatch(token, /Z$/);
      }),
    );
  });

  it('round-trips the server route parameter form', () => {
    fc.assert(
      fc.property(validMomentName, date, (name, when) => {
        const token = encodeMomentToken(name, when);
        const separatorIndex = token.lastIndexOf('@');
        const routeParam = encodeURIComponent(`${name}@${token.slice(separatorIndex + 1)}`);
        const moment = decodeMomentParam(routeParam);

        assert.ok(moment);
        assert.equal(moment.name, name);
        assert.equal(moment.date.getTime(), floorToSecond(when));
        assert.equal(moment.id, token);
      }),
    );
  });

  it('canonicalizes minute-precision tokens', () => {
    fc.assert(
      fc.property(validMomentName, date, (name, when) => {
        const withoutSeconds = new Date(Math.floor(when.getTime() / 60_000) * 60_000);
        const token = encodeMomentToken(name, withoutSeconds, 0);
        const separatorIndex = token.lastIndexOf('@');
        const datePart = token.slice(separatorIndex + 1);
        const minuteToken = `${token.slice(0, separatorIndex + 1)}${datePart.slice(0, 16)}${datePart.slice(-6)}`;
        const moment = decodeMomentToken(minuteToken);

        assert.ok(moment);
        assert.equal(moment.id, token);
        assert.equal(moment.date.getTime(), withoutSeconds.getTime());
      }),
    );
  });

  it('round-trips an explicit offset', () => {
    const offsetDate = fc
      .integer({ min: Date.UTC(1970, 0, 1), max: Date.UTC(9998, 11, 31, 23, 59, 59, 999) })
      .map((milliseconds) => new Date(milliseconds));

    fc.assert(
      fc.property(validMomentName, offsetDate, fc.integer({ min: -720, max: 840 }), (name, when, offsetMinutes) => {
        const token = encodeMomentToken(name, when, offsetMinutes);
        const moment = decodeMomentToken(token);

        assert.ok(moment);
        assert.equal(moment.id, token);
        assert.equal(moment.date.getTime(), floorToSecond(when));
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
