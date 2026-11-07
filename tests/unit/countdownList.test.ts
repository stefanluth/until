import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { COOKIE_OPTIONS, COUNTDOWN_LIST_COOKIE } from '../../app/_utils/cookies.ts';
import {
  addCountdownId,
  getCountdownList,
  hasCountdownId,
  readCountdownIds,
  removeCountdownId,
  setCountdownList,
} from '../../app/_utils/countdownList.ts';
import { createCookieStore } from '../support/cookies.ts';

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

  it('preserves duplicates and drops whitespace or overlong entries', () => {
    assert.deepEqual(readCountdownIds('a-12345678,a-12345678'), ['a-12345678', 'a-12345678']);
    assert.deepEqual(readCountdownIds(' a-12345678'), []);
    assert.deepEqual(readCountdownIds(`a-12345678,${'b'.repeat(513)}`), ['a-12345678']);
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

  it('keeps insertion order and handles an empty list', () => {
    assert.deepEqual(addCountdownId([], 'a-12345678'), ['a-12345678']);
    assert.deepEqual(addCountdownId(['b-12345678', 'a-12345678'], 'c-12345678'), [
      'b-12345678',
      'a-12345678',
      'c-12345678',
    ]);
  });
});

describe('removeCountdownId', () => {
  it('removes only the matching ID and preserves order', () => {
    assert.deepEqual(removeCountdownId(['a-12345678', 'b-12345678', 'c-12345678'], 'b-12345678'), [
      'a-12345678',
      'c-12345678',
    ]);
  });

  it('removes every duplicate and leaves the list unchanged when absent', () => {
    assert.deepEqual(removeCountdownId(['a-12345678', 'b-12345678', 'a-12345678'], 'a-12345678'), ['b-12345678']);
    assert.deepEqual(removeCountdownId(['a-12345678'], 'b-12345678'), ['a-12345678']);
  });
});

describe('getCountdownList', () => {
  it('reads the ID list from the countdown cookie', () => {
    const store = createCookieStore({ [COUNTDOWN_LIST_COOKIE]: 'a-12345678' });

    assert.deepEqual(getCountdownList(store), ['a-12345678']);
  });

  it('returns an empty list when the cookie is missing', () => {
    assert.deepEqual(getCountdownList(createCookieStore()), []);
  });
});

describe('setCountdownList', () => {
  it('writes the joined list with the shared cookie options', () => {
    const store = createCookieStore();

    setCountdownList(store, ['a-12345678', 'b-12345678']);

    assert.deepEqual(store.calls, [
      { type: 'set', name: COUNTDOWN_LIST_COOKIE, value: 'a-12345678,b-12345678', options: COOKIE_OPTIONS },
    ]);
    assert.deepEqual(getCountdownList(store), ['a-12345678', 'b-12345678']);
  });

  it('deletes the cookie when the list becomes empty', () => {
    const store = createCookieStore({ [COUNTDOWN_LIST_COOKIE]: 'a-12345678' });

    setCountdownList(store, []);

    assert.deepEqual(store.calls, [
      { type: 'delete', options: { name: COUNTDOWN_LIST_COOKIE, path: COOKIE_OPTIONS.path } },
    ]);
    assert.equal(store.get(COUNTDOWN_LIST_COOKIE), undefined);
  });
});
