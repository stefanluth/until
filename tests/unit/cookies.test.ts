import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { COOKIE_OPTIONS, browserCookieOptions, isConsentGranted } from '../../app/_utils/cookies.ts';

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

describe('browserCookieOptions', () => {
  it('maps the shared options and only marks cookies secure over https', () => {
    assert.deepEqual(browserCookieOptions('https:'), {
      expires: 365,
      path: '/',
      sameSite: 'lax',
      secure: true,
    });
    assert.equal(browserCookieOptions('http:').secure, false);
    assert.equal(browserCookieOptions('').secure, false);
  });

  it('keeps a supplied option set', () => {
    const options = { maxAge: 60 * 60 * 24 * 30, path: '/moments', sameSite: 'strict' } as const;

    assert.deepEqual(browserCookieOptions('https:', options), {
      expires: 30,
      path: '/moments',
      sameSite: 'strict',
      secure: true,
    });
  });
});

describe('COOKIE_OPTIONS', () => {
  it('keeps the cookie for one year at the site root', () => {
    assert.equal(COOKIE_OPTIONS.maxAge, 60 * 60 * 24 * 365);
    assert.equal(COOKIE_OPTIONS.path, '/');
    assert.equal(COOKIE_OPTIONS.sameSite, 'lax');
  });
});
