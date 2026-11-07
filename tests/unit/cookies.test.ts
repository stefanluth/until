import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { COOKIE_OPTIONS, isConsentGranted } from '../../app/_utils/cookies.ts';

describe('isConsentGranted', () => {
  it('accepts only the true marker', () => {
    assert.equal(isConsentGranted('true'), true);
    assert.equal(isConsentGranted('false'), false);
    assert.equal(isConsentGranted(undefined), false);
  });
});

describe('COOKIE_OPTIONS', () => {
  it('keeps the cookie for one year at the site root', () => {
    assert.equal(COOKIE_OPTIONS.maxAge, 60 * 60 * 24 * 365);
    assert.equal(COOKIE_OPTIONS.path, '/');
    assert.equal(COOKIE_OPTIONS.sameSite, 'lax');
  });
});
