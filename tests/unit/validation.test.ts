import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isValidCountdownId,
  parseClientDate,
  validateCountdownName,
  validateCountdownWhen,
} from '../../app/_utils/validation.ts';

describe('validateCountdownName', () => {
  it('trims valid names', () => {
    assert.deepEqual(validateCountdownName('  Birthday  '), { ok: true, value: 'Birthday' });
  });

  it('accepts names at the maximum length', () => {
    assert.deepEqual(validateCountdownName('a'.repeat(48)), { ok: true, value: 'a'.repeat(48) });
  });

  it('rejects empty, whitespace, and non-string names', () => {
    assert.equal(validateCountdownName('').ok, false);
    assert.equal(validateCountdownName('   ').ok, false);
    assert.equal(validateCountdownName(null).ok, false);
  });

  it('rejects names over the maximum length', () => {
    assert.equal(validateCountdownName('a'.repeat(49)).ok, false);
  });
});

describe('validateCountdownWhen', () => {
  it('trims valid values', () => {
    assert.deepEqual(validateCountdownWhen(' 1d 2h '), { ok: true, value: '1d 2h' });
  });

  it('rejects overlong values', () => {
    assert.equal(validateCountdownWhen('a'.repeat(65)).ok, false);
  });
});

describe('parseClientDate', () => {
  it('parses ISO dates', () => {
    assert.equal(parseClientDate('2026-01-01T00:00:00.000Z')?.toISOString(), '2026-01-01T00:00:00.000Z');
  });

  it('rejects invalid and non-string values', () => {
    assert.equal(parseClientDate('not-a-date'), null);
    assert.equal(parseClientDate(123), null);
    assert.equal(parseClientDate(''), null);
  });
});

describe('isValidCountdownId', () => {
  it('accepts slug countdown IDs', () => {
    assert.equal(isValidCountdownId('birthday-abc12345'), true);
    assert.equal(isValidCountdownId('my-event-abc12345'), true);
    assert.equal(isValidCountdownId('3-tage-abc12345'), true);
    assert.equal(isValidCountdownId('countdown-abc12345'), true);
  });

  it('rejects malformed IDs', () => {
    assert.equal(isValidCountdownId('Birthday-abc12345'), false);
    assert.equal(isValidCountdownId('My%20Event-abc12345'), false);
    assert.equal(isValidCountdownId('my event-abc12345'), false);
    assert.equal(isValidCountdownId('my--event-abc12345'), false);
    assert.equal(isValidCountdownId('bad,id'), false);
    assert.equal(isValidCountdownId('bad\nid'), false);
    assert.equal(isValidCountdownId(''), false);
    assert.equal(isValidCountdownId('a'.repeat(513)), false);
    assert.equal(isValidCountdownId(null), false);
  });
});
