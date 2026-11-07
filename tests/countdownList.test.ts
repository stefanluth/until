import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { COOKIE_OPTIONS, COUNTDOWN_LIST_COOKIE, isConsentGranted } from '../app/_utils/cookies.ts';
import {
  addCountdownId,
  getCountdownList,
  hasCountdownId,
  readCountdownIds,
  removeCountdownId,
  setCountdownList,
} from '../app/_utils/countdownList.ts';

describe('readCountdownIds', () => {
  it('keeps valid IDs and drops malformed entries', () => {
    assert.deepEqual(readCountdownIds('Birthday-abc12345,bad id,My%20Event-def67890'), [
      'Birthday-abc12345',
      'My%20Event-def67890',
    ]);
  });

  it('returns an empty list for a missing or empty cookie', () => {
    assert.deepEqual(readCountdownIds(undefined), []);
    assert.deepEqual(readCountdownIds(''), []);
    assert.deepEqual(readCountdownIds(','), []);
  });
});

describe('hasCountdownId', () => {
  it('matches an exact ID only', () => {
    assert.equal(hasCountdownId('Birthday-abc12345,Other-def67890', 'Birthday-abc12345'), true);
    assert.equal(hasCountdownId('Birthday-abc12345,Other-def67890', 'Birthday'), false);
    assert.equal(hasCountdownId(undefined, 'Birthday-abc12345'), false);
  });
});

describe('addCountdownId', () => {
  it('appends a new ID and leaves an existing list unchanged', () => {
    assert.deepEqual(addCountdownId(['a-12345678'], 'b-12345678'), ['a-12345678', 'b-12345678']);
    assert.deepEqual(addCountdownId(['a-12345678'], 'a-12345678'), ['a-12345678']);
  });
});

describe('removeCountdownId', () => {
  it('removes only the matching ID and preserves order', () => {
    assert.deepEqual(removeCountdownId(['a-12345678', 'b-12345678', 'c-12345678'], 'b-12345678'), [
      'a-12345678',
      'c-12345678',
    ]);
  });
});

describe('getCountdownList', () => {
  it('reads the ID list from the countdown cookie', () => {
    const store = { get: (name: string) => (name === COUNTDOWN_LIST_COOKIE ? { value: 'a-12345678' } : undefined) };
    assert.deepEqual(getCountdownList(store), ['a-12345678']);
  });
});

describe('setCountdownList', () => {
  it('writes the joined list with the shared cookie options', () => {
    const calls: unknown[][] = [];
    const store = {
      set: (...args: unknown[]) => calls.push(['set', ...args]),
      delete: (...args: unknown[]) => calls.push(['delete', ...args]),
    };

    setCountdownList(store, ['a-12345678', 'b-12345678']);

    assert.deepEqual(calls, [['set', COUNTDOWN_LIST_COOKIE, 'a-12345678,b-12345678', COOKIE_OPTIONS]]);
  });

  it('deletes the cookie when the list becomes empty', () => {
    const calls: unknown[][] = [];
    const store = {
      set: (...args: unknown[]) => calls.push(['set', ...args]),
      delete: (...args: unknown[]) => calls.push(['delete', ...args]),
    };

    setCountdownList(store, []);

    assert.deepEqual(calls, [['delete', { name: COUNTDOWN_LIST_COOKIE, path: COOKIE_OPTIONS.path }]]);
  });
});

describe('isConsentGranted', () => {
  it('accepts only the true marker', () => {
    assert.equal(isConsentGranted('true'), true);
    assert.equal(isConsentGranted('false'), false);
    assert.equal(isConsentGranted(undefined), false);
  });
});
