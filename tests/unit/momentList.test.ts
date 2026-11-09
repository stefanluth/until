import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { COOKIE_OPTIONS, MOMENT_LIST_COOKIE } from '../../app/_utils/cookies.ts';
import {
  addMomentId,
  getMomentList,
  hasMomentId,
  readMomentIds,
  removeMomentId,
  setMomentList,
} from '../../app/_utils/momentList.ts';
import { createCookieStore } from '../support/cookies.ts';

describe('readMomentIds', () => {
  it('keeps valid IDs and drops malformed entries', () => {
    assert.deepEqual(readMomentIds('birthday-abc12345,bad id,my-event-def67890'), [
      'birthday-abc12345',
      'my-event-def67890',
    ]);
  });

  it('returns an empty list for a missing or empty cookie', () => {
    assert.deepEqual(readMomentIds(undefined), []);
    assert.deepEqual(readMomentIds(''), []);
    assert.deepEqual(readMomentIds(','), []);
  });

  it('preserves duplicates and drops whitespace or overlong entries', () => {
    assert.deepEqual(readMomentIds('a-12345678,a-12345678'), ['a-12345678', 'a-12345678']);
    assert.deepEqual(readMomentIds(' a-12345678'), []);
    assert.deepEqual(readMomentIds(`a-12345678,${'b'.repeat(513)}`), ['a-12345678']);
  });
});

describe('hasMomentId', () => {
  it('matches an exact ID only', () => {
    assert.equal(hasMomentId('birthday-abc12345,other-def67890', 'birthday-abc12345'), true);
    assert.equal(hasMomentId('birthday-abc12345,other-def67890', 'birthday'), false);
    assert.equal(hasMomentId(undefined, 'birthday-abc12345'), false);
  });
});

describe('addMomentId', () => {
  it('appends a new ID and leaves an existing list unchanged', () => {
    assert.deepEqual(addMomentId(['a-12345678'], 'b-12345678'), ['a-12345678', 'b-12345678']);
    assert.deepEqual(addMomentId(['a-12345678'], 'a-12345678'), ['a-12345678']);
  });

  it('keeps insertion order and handles an empty list', () => {
    assert.deepEqual(addMomentId([], 'a-12345678'), ['a-12345678']);
    assert.deepEqual(addMomentId(['b-12345678', 'a-12345678'], 'c-12345678'), [
      'b-12345678',
      'a-12345678',
      'c-12345678',
    ]);
  });
});

describe('removeMomentId', () => {
  it('removes only the matching ID and preserves order', () => {
    assert.deepEqual(removeMomentId(['a-12345678', 'b-12345678', 'c-12345678'], 'b-12345678'), [
      'a-12345678',
      'c-12345678',
    ]);
  });

  it('removes every duplicate and leaves the list unchanged when absent', () => {
    assert.deepEqual(removeMomentId(['a-12345678', 'b-12345678', 'a-12345678'], 'a-12345678'), ['b-12345678']);
    assert.deepEqual(removeMomentId(['a-12345678'], 'b-12345678'), ['a-12345678']);
  });
});

describe('getMomentList', () => {
  it('reads the ID list from the moment cookie', () => {
    const store = createCookieStore({ [MOMENT_LIST_COOKIE]: 'a-12345678' });

    assert.deepEqual(getMomentList(store), ['a-12345678']);
  });

  it('returns an empty list when the cookie is missing', () => {
    assert.deepEqual(getMomentList(createCookieStore()), []);
  });
});

describe('setMomentList', () => {
  it('writes the joined list with the shared cookie options', () => {
    const store = createCookieStore();

    setMomentList(store, ['a-12345678', 'b-12345678']);

    assert.deepEqual(store.calls, [
      { type: 'set', name: MOMENT_LIST_COOKIE, value: 'a-12345678,b-12345678', options: COOKIE_OPTIONS },
    ]);
    assert.deepEqual(getMomentList(store), ['a-12345678', 'b-12345678']);
  });

  it('deletes the cookie when the list becomes empty', () => {
    const store = createCookieStore({ [MOMENT_LIST_COOKIE]: 'a-12345678' });

    setMomentList(store, []);

    assert.deepEqual(store.calls, [
      { type: 'delete', options: { name: MOMENT_LIST_COOKIE, path: COOKIE_OPTIONS.path } },
    ]);
    assert.equal(store.get(MOMENT_LIST_COOKIE), undefined);
  });
});
