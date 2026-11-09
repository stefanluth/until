import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { validateMomentName, validateMomentWhen } from '../../app/_utils/validation.ts';

describe('validateMomentName', () => {
  it('trims valid names', () => {
    assert.deepEqual(validateMomentName('  Birthday  '), { ok: true, value: 'Birthday' });
  });

  it('accepts names at the maximum length', () => {
    assert.deepEqual(validateMomentName('a'.repeat(32)), { ok: true, value: 'a'.repeat(32) });
  });

  it('rejects empty, whitespace, and non-string names', () => {
    assert.equal(validateMomentName('').ok, false);
    assert.equal(validateMomentName('   ').ok, false);
    assert.equal(validateMomentName(null).ok, false);
  });

  it('rejects names over the maximum length', () => {
    assert.equal(validateMomentName('a'.repeat(33)).ok, false);
  });

  it('rejects control characters and lone surrogates', () => {
    assert.equal(validateMomentName('a\u0000b').ok, false);
    assert.equal(validateMomentName('a\nb').ok, false);
    assert.equal(validateMomentName('a\uD800b').ok, false);
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
