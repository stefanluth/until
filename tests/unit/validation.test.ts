import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isValidMomentId,
  parseClientDate,
  validateMomentName,
  validateMomentWhen,
} from '../../app/_utils/validation.ts';

describe('validateMomentName', () => {
  it('trims valid names', () => {
    assert.deepEqual(validateMomentName('  Birthday  '), { ok: true, value: 'Birthday' });
  });

  it('accepts names at the maximum length', () => {
    assert.deepEqual(validateMomentName('a'.repeat(48)), { ok: true, value: 'a'.repeat(48) });
  });

  it('rejects empty, whitespace, and non-string names', () => {
    assert.equal(validateMomentName('').ok, false);
    assert.equal(validateMomentName('   ').ok, false);
    assert.equal(validateMomentName(null).ok, false);
  });

  it('rejects names over the maximum length', () => {
    assert.equal(validateMomentName('a'.repeat(49)).ok, false);
  });
});

describe('validateMomentWhen', () => {
  it('trims valid values', () => {
    assert.deepEqual(validateMomentWhen(' 1d 2h '), { ok: true, value: '1d 2h' });
  });

  it('rejects overlong values', () => {
    assert.equal(validateMomentWhen('a'.repeat(65)).ok, false);
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

describe('isValidMomentId', () => {
  it('accepts slug moment IDs', () => {
    assert.equal(isValidMomentId('birthday-abc12345'), true);
    assert.equal(isValidMomentId('my-event-abc12345'), true);
    assert.equal(isValidMomentId('3-tage-abc12345'), true);
    assert.equal(isValidMomentId('moment-abc12345'), true);
  });

  it('rejects malformed IDs', () => {
    assert.equal(isValidMomentId('Birthday-abc12345'), false);
    assert.equal(isValidMomentId('My%20Event-abc12345'), false);
    assert.equal(isValidMomentId('my event-abc12345'), false);
    assert.equal(isValidMomentId('my--event-abc12345'), false);
    assert.equal(isValidMomentId('bad,id'), false);
    assert.equal(isValidMomentId('bad\nid'), false);
    assert.equal(isValidMomentId(''), false);
    assert.equal(isValidMomentId('a'.repeat(513)), false);
    assert.equal(isValidMomentId(null), false);
  });
});
