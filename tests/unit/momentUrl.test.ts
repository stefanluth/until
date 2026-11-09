import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  decodeMomentParam,
  decodeMomentToken,
  encodeMomentToken,
  momentDisplayPath,
  momentPath,
  offsetMinutes,
} from '../../app/_utils/momentUrl.ts';

const DATE = new Date('2026-01-01T00:00:00.000Z');
const DATE_ISO = DATE.toISOString();
const ISO = '2026-01-01T00:00:00+00:00';

function routeParam(name: string) {
  return encodeURIComponent(`${name}@${ISO}`);
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

  it('encodes the local offset instead of Z', () => {
    assert.equal(encodeMomentToken('Party', DATE, 60), 'Party@2026-01-01T01:00:00+01:00');
    assert.equal(encodeMomentToken('Party', DATE, -300), 'Party@2025-12-31T19:00:00-05:00');
    assert.equal(encodeMomentToken('Party', DATE, 330), 'Party@2026-01-01T05:30:00+05:30');
    assert.equal(encodeMomentToken('Party', DATE, 0), `Party@${ISO}`);
  });

  it('strips milliseconds from the instant', () => {
    assert.equal(encodeMomentToken('Party', new Date('2026-01-01T00:00:00.789Z'), 0), `Party@${ISO}`);
  });
});

describe('decodeMomentToken', () => {
  it('round-trips Unicode and case without loss', () => {
    for (const name of ['Café', 'CAFÉ', 'Family Reunion', '🎉 party', 'a@b', '100%', 'a/b']) {
      const moment = decodeMomentToken(encodeMomentToken(name, DATE));

      assert.ok(moment);
      assert.equal(moment.name, name);
      assert.equal(moment.date.toISOString(), DATE_ISO);
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

  it('accepts tokens without seconds and adds :00', () => {
    const moment = decodeMomentToken('Caf%C3%A9@2026-12-25T18:00+01:00');

    assert.ok(moment);
    assert.equal(moment.id, 'Caf%C3%A9@2026-12-25T18:00:00+01:00');
    assert.equal(moment.date.toISOString(), '2026-12-25T17:00:00.000Z');
  });

  it('treats the parsed offset as the canonical offset', () => {
    const moment = decodeMomentToken('Caf%C3%A9@2026-12-25T12:00-05:00');

    assert.ok(moment);
    assert.equal(moment.id, 'Caf%C3%A9@2026-12-25T12:00:00-05:00');
    assert.equal(moment.date.toISOString(), '2026-12-25T17:00:00.000Z');
  });

  it('accepts a percent-encoded plus in the offset', () => {
    const moment = decodeMomentToken('Caf%C3%A9@2026-12-25T18:00:00%2B01:00');

    assert.ok(moment);
    assert.equal(moment.id, 'Caf%C3%A9@2026-12-25T18:00:00+01:00');
  });

  it('accepts names at the 32-character limit and rejects longer ones', () => {
    assert.ok(decodeMomentToken(encodeMomentToken('a'.repeat(32), DATE)));
    assert.equal(decodeMomentToken(encodeMomentToken('a'.repeat(33), DATE)), null);
  });

  it('rejects malformed tokens', () => {
    for (const token of [
      '',
      '@2026-01-01T00:00:00Z',
      'no-delimiter',
      `Name@not-a-date`,
      `Name@2026-01-01`,
      `Name@2026-01-01T00:00:00`,
      `Name@2026-01-01T00:00:00Z`,
      `Name@2026-01-01T00:00:00.1Z`,
      `Name@2026-01-01T00:00:00.12Z`,
      `Name@2026-01-01T00:00:00.000Z`,
      `Name@2026-01-01T00:00:00.000Z `,
      `Name@2026-01-01T00:00:00+15:00`,
      `Name@2026-01-01T00:00:00+14:30`,
      `Name@2026-01-01T00:00:00-13:00`,
      `Name@2026-01-01T00:00:00+00:60`,
      `Bad%ZZ@${ISO}`,
      ` Bad@${ISO}`,
      `Bad@${ISO} `,
      `Name@2026-02-31T00:00:00+00:00`,
      `Name@0000-01-01T00:00:00+00:00`,
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

  it('accepts route parameters without seconds', () => {
    const moment = decodeMomentParam(encodeURIComponent('Café@2026-12-25T18:00+01:00'));

    assert.ok(moment);
    assert.equal(moment.id, 'Caf%C3%A9@2026-12-25T18:00:00+01:00');
    assert.equal(moment.date.toISOString(), '2026-12-25T17:00:00.000Z');
  });

  it('rejects malformed route parameters', () => {
    assert.equal(decodeMomentParam(encodeURIComponent('not-a-moment')), null);
    assert.equal(decodeMomentParam(encodeURIComponent(`Name@not-a-date`)), null);
    assert.equal(decodeMomentParam(encodeURIComponent('Café@2026-01-01T00:00:00.000Z')), null);
    assert.equal(decodeMomentParam('%E0%A4%A'), null);
    assert.equal(decodeMomentParam(null), null);
  });
});

describe('momentPath', () => {
  it('builds an absolute site-relative path', () => {
    assert.equal(momentPath(`a%40b@${ISO}`), `/a%40b@${ISO}`);
  });

  it('rejects a route parameter passed as a plain name', () => {
    assert.equal(decodeMomentParam(routeParam('Café'))?.name, 'Café');
  });
});

describe('momentDisplayPath', () => {
  it('decodes non-ASCII escapes for display', () => {
    assert.equal(momentDisplayPath(`Caf%C3%A9@${ISO}`), `/Café@${ISO}`);
    assert.equal(momentDisplayPath(`%F0%9F%8E%89%20party@${ISO}`), `/🎉%20party@${ISO}`);
  });

  it('leaves ASCII delimiters encoded so the URL stays unambiguous', () => {
    assert.equal(momentDisplayPath(`a%2Fb%40c%25d%3Fe@${ISO}`), `/a%2Fb%40c%25d%3Fe@${ISO}`);
  });

  it('leaves an invalid UTF-8 run unchanged', () => {
    assert.equal(momentDisplayPath(`bad%C3@${ISO}`), `/bad%C3@${ISO}`);
  });

  it('keeps the copied link path encoded', () => {
    const token = encodeMomentToken('Café', DATE);

    assert.equal(momentPath(token), `/Caf%C3%A9@${ISO}`);
    assert.equal(momentDisplayPath(token), `/Café@${ISO}`);
  });
});

describe('offsetMinutes', () => {
  it('reads the canonical offset suffix from a moment id', () => {
    assert.equal(offsetMinutes(`Party@${ISO}`), 0);
    assert.equal(offsetMinutes('Party@2026-01-01T01:00:00+01:00'), 60);
    assert.equal(offsetMinutes('Party@2025-12-31T19:00:00-05:00'), -300);
    assert.equal(offsetMinutes('Party@2026-01-01T05:30:00+05:30'), 330);
  });

  it('falls back to UTC when the id has no usable offset', () => {
    assert.equal(offsetMinutes('not-a-moment'), 0);
    assert.equal(offsetMinutes('Party@2026-01-01T00:00:00+15:00'), 0);
  });
});
