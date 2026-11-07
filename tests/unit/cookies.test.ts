import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { COOKIE_OPTIONS, isConsentGranted, isSecureCookie } from '../../app/_utils/cookies.ts';

describe('isConsentGranted', () => {
  it('accepts only the exact true marker', () => {
    assert.equal(isConsentGranted('true'), true);
    assert.equal(isConsentGranted('TRUE'), false);
    assert.equal(isConsentGranted(' true'), false);
    assert.equal(isConsentGranted('true '), false);
    assert.equal(isConsentGranted('1'), false);
    assert.equal(isConsentGranted('false'), false);
    assert.equal(isConsentGranted(''), false);
    assert.equal(isConsentGranted(undefined), false);
  });
});

describe('isSecureCookie', () => {
  it('is insecure by default', () => {
    assert.equal(isSecureCookie({}), false);
  });

  it('is secure by default in production', () => {
    assert.equal(isSecureCookie({ NODE_ENV: 'production' }), true);
    assert.equal(isSecureCookie({ NODE_ENV: 'production', COOKIE_SECURE: '' }), true);
  });

  it('honours an explicit COOKIE_SECURE override', () => {
    assert.equal(isSecureCookie({ COOKIE_SECURE: 'true' }), true);
    assert.equal(isSecureCookie({ COOKIE_SECURE: 'true', NODE_ENV: 'development' }), true);
    assert.equal(isSecureCookie({ COOKIE_SECURE: 'false', NODE_ENV: 'production' }), false);
  });
});

describe('COOKIE_OPTIONS', () => {
  it('keeps the cookie for one year at the site root', () => {
    assert.equal(COOKIE_OPTIONS.maxAge, 60 * 60 * 24 * 365);
    assert.equal(COOKIE_OPTIONS.path, '/');
    assert.equal(COOKIE_OPTIONS.sameSite, 'lax');
  });
});
