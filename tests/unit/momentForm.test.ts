import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { momentFromInput } from '../../app/_utils/momentForm.ts';
import { encodeMomentToken } from '../../app/_utils/momentUrl.ts';

const NOW = new Date('2026-01-01T00:00:00.000Z');

function after(milliseconds: number) {
  return new Date(NOW.getTime() + milliseconds);
}

describe('momentFromInput', () => {
  it('trims the name and builds a token for a duration', () => {
    assert.deepEqual(momentFromInput('  Party  ', '1d 2h', NOW), {
      ok: true,
      id: encodeMomentToken('Party', after(26 * 60 * 60 * 1000)),
    });
  });

  it('keeps the exact name casing and accents in the token', () => {
    const result = momentFromInput('Café', '1d', NOW);

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.match(result.id, /^Caf%C3%A9@/);
    }
  });

  it('builds a token for a calendar date', () => {
    assert.deepEqual(momentFromInput('Party', '25-12-2026 18:00', NOW), {
      ok: true,
      id: encodeMomentToken('Party', new Date(2026, 11, 25, 18, 0, 0)),
    });
  });

  it('keeps seconds when the input sets them', () => {
    assert.deepEqual(momentFromInput('Party', '25-12-2026 18:00:30', NOW), {
      ok: true,
      id: encodeMomentToken('Party', new Date(2026, 11, 25, 18, 0, 30)),
    });
  });

  it('strips milliseconds from duration targets', () => {
    const now = new Date('2026-01-01T00:00:00.789Z');

    assert.deepEqual(momentFromInput('Party', '1d', now), {
      ok: true,
      id: 'Party@2026-01-02T00:00:00+00:00',
    });
  });

  it('rejects a missing or overlong name', () => {
    assert.deepEqual(momentFromInput('', '1d'), {
      ok: false,
      error: 'Name is required',
      location: 'name',
    });
    assert.deepEqual(momentFromInput(null, '1d'), {
      ok: false,
      error: 'Name is required',
      location: 'name',
    });
    assert.deepEqual(momentFromInput('a'.repeat(33), '1d'), {
      ok: false,
      error: 'Name must be 32 characters or fewer',
      location: 'name',
    });
  });

  it('rejects a missing or unparseable when value', () => {
    assert.deepEqual(momentFromInput('Party', ''), {
      ok: false,
      error: 'Duration or date is required',
      location: 'when',
    });
    assert.deepEqual(momentFromInput('Party', 'not a date'), {
      ok: false,
      error: 'e.g. 1d 2h 3m or 25-12-2026 18:00',
      location: 'when',
    });
  });
});
