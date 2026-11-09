import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  decodeMomentParam,
  decodeMomentToken,
  encodeMomentToken,
  isValidMomentId,
  momentPath,
} from '../../app/_utils/momentUrl.ts';

const DATE = new Date('2026-01-01T00:00:00.000Z');
const ISO = DATE.toISOString();

function routeParam(name: string, date = DATE) {
  return encodeURIComponent(`${name}@${date.toISOString()}`);
}

describe('encodeMomentToken', () => {
  it('is deterministic and separates the encoded name from the instant with @', () => {
    const token = encodeMomentToken('My Event', DATE);

    assert.equal(token, encodeMomentToken('My Event', DATE));
    assert.equal(token, `My%20Event@${ISO}`);
  });

  it('preserves case, accents, and other characters exactly', () => {
    assert.match(encodeMomentToken('Café', DATE), /^Caf%C3%A9@/);
    assert.match(encodeMomentToken('CAFÉ', DATE), /^CAF%C3%89@/);
    assert.match(encodeMomentToken('a@b', DATE), /^a%40b@/);
    assert.match(encodeMomentToken('a/b', DATE), /^a%2Fb@/);
    assert.match(encodeMomentToken('100%', DATE), /^100%25@/);
  });

  it('escapes characters that plain encodeURIComponent leaves in place', () => {
    assert.equal(encodeMomentToken(`Party (2026)!`, DATE).startsWith('Party%20%282026%29%21@'), true);
  });
});

describe('decodeMomentToken', () => {
  it('round-trips Unicode and case without loss', () => {
    for (const name of ['Café', 'CAFÉ', 'Family Reunion', '🎉 party', 'a@b', '100%', 'a/b']) {
      const moment = decodeMomentToken(encodeMomentToken(name, DATE));

      assert.ok(moment);
      assert.equal(moment.name, name);
      assert.equal(moment.date.toISOString(), ISO);
    }
  });

  it('canonicalizes equivalent percent-encoding', () => {
    const token = `Caf%c3%a9@${ISO}`;
    const moment = decodeMomentToken(token);

    assert.ok(moment);
    assert.equal(moment.id, `Caf%C3%A9@${ISO}`);
  });

  it('treats the last raw @ as the delimiter', () => {
    const moment = decodeMomentToken(`a@b@${ISO}`);

    assert.ok(moment);
    assert.equal(moment.name, 'a@b');
  });

  it('accepts names at the 32-character limit and rejects longer ones', () => {
    assert.ok(decodeMomentToken(encodeMomentToken('a'.repeat(32), DATE)));
    assert.equal(decodeMomentToken(encodeMomentToken('a'.repeat(33), DATE)), null);
  });

  it('rejects malformed tokens', () => {
    for (const token of [
      '',
      '@2026-01-01T00:00:00.000Z',
      'no-delimiter',
      `Name@not-a-date`,
      `Name@2026-01-01`,
      `Name@2026-01-01T00:00:00Z`,
      `Name@2026-01-01T00:00:00.000Z `,
      `Bad%ZZ@${ISO}`,
      ` Bad@${ISO}`,
      `Bad@${ISO} `,
      `Name@2026-02-31T00:00:00.000Z`,
      `Name@0000-01-01T00:00:00.000Z`,
      `${'a'.repeat(513)}@${ISO}`,
      `${'a'.repeat(200)}@${ISO}`,
    ]) {
      assert.equal(decodeMomentToken(token), null, token);
    }

    assert.equal(decodeMomentToken(null), null);
    assert.equal(decodeMomentToken(123), null);
  });
});

describe('decodeMomentParam', () => {
  it('decodes the route parameter form Next.js passes to the page', () => {
    const token = encodeMomentToken('Café', DATE);
    const moment = decodeMomentParam(encodeURIComponent(`Café@${ISO}`));

    assert.ok(moment);
    assert.equal(moment.id, token);
    assert.equal(moment.name, 'Café');
  });

  it('keeps literal percent characters through the double encoding', () => {
    const token = encodeMomentToken('100%', DATE);
    const moment = decodeMomentParam(encodeURIComponent(`100%@${ISO}`));

    assert.ok(moment);
    assert.equal(moment.id, token);
    assert.equal(moment.name, '100%');
  });

  it('rejects malformed route parameters', () => {
    assert.equal(decodeMomentParam(encodeURIComponent('not-a-moment')), null);
    assert.equal(decodeMomentParam(encodeURIComponent(`Name@not-a-date`)), null);
    assert.equal(decodeMomentParam('%E0%A4%A'), null);
    assert.equal(decodeMomentParam(null), null);
  });
});

describe('isValidMomentId and momentPath', () => {
  it('accepts canonical tokens only', () => {
    assert.equal(isValidMomentId(encodeMomentToken('Café', DATE)), true);
    assert.equal(isValidMomentId('birthday-abc12345'), false);
    assert.equal(isValidMomentId('My%20Event-abc12345'), false);
    assert.equal(isValidMomentId(''), false);
  });

  it('builds an absolute site-relative path', () => {
    assert.equal(momentPath('a%40b@2026-01-01T00:00:00.000Z'), '/a%40b@2026-01-01T00:00:00.000Z');
  });

  it('rejects a route parameter passed as a plain name', () => {
    assert.equal(decodeMomentParam(routeParam('Café'))?.name, 'Café');
  });
});
