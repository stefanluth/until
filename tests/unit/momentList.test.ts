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
import { encodeMomentToken } from '../../app/_utils/momentUrl.ts';
import { createCookieStore } from '../support/cookies.ts';

const FIRST = encodeMomentToken('Birthday', new Date('2026-01-01T00:00:00.000Z'));
const SECOND = encodeMomentToken('Party', new Date('2027-06-15T18:30:00.000Z'));
const THIRD = encodeMomentToken('Café', new Date('2028-12-24T09:00:00.000Z'));

describe('readMomentIds', () => {
  it('keeps valid IDs and drops malformed entries', () => {
    assert.deepEqual(readMomentIds(`${FIRST},bad id,${SECOND}`), [FIRST, SECOND]);
  });

  it('canonicalizes equivalent token encodings', () => {
    assert.deepEqual(readMomentIds('Caf%c3%a9@2026-01-01T00:00:00.000Z'), ['Caf%C3%A9@2026-01-01T00:00:00.000Z']);
  });

  it('returns an empty list for a missing or empty cookie', () => {
    assert.deepEqual(readMomentIds(undefined), []);
    assert.deepEqual(readMomentIds(''), []);
    assert.deepEqual(readMomentIds(','), []);
  });

  it('preserves duplicates and drops whitespace or overlong entries', () => {
    assert.deepEqual(readMomentIds(`${FIRST},${FIRST}`), [FIRST, FIRST]);
    assert.deepEqual(readMomentIds(` ${FIRST}`), []);
    assert.deepEqual(readMomentIds(`${FIRST},${'b'.repeat(513)}`), [FIRST]);
  });
});

describe('hasMomentId', () => {
  it('matches an exact ID only', () => {
    assert.equal(hasMomentId(`${FIRST},${SECOND}`, FIRST), true);
    assert.equal(hasMomentId(`${FIRST},${SECOND}`, 'birthday'), false);
    assert.equal(hasMomentId(undefined, FIRST), false);
  });
});

describe('addMomentId', () => {
  it('appends a new ID and leaves an existing list unchanged', () => {
    assert.deepEqual(addMomentId([FIRST], SECOND), [FIRST, SECOND]);
    assert.deepEqual(addMomentId([FIRST], FIRST), [FIRST]);
  });

  it('keeps insertion order and handles an empty list', () => {
    assert.deepEqual(addMomentId([], FIRST), [FIRST]);
    assert.deepEqual(addMomentId([SECOND, FIRST], THIRD), [SECOND, FIRST, THIRD]);
  });
});

describe('removeMomentId', () => {
  it('removes only the matching ID and preserves order', () => {
    assert.deepEqual(removeMomentId([FIRST, SECOND, THIRD], SECOND), [FIRST, THIRD]);
  });

  it('removes every duplicate and leaves the list unchanged when absent', () => {
    assert.deepEqual(removeMomentId([FIRST, SECOND, FIRST], FIRST), [SECOND]);
    assert.deepEqual(removeMomentId([FIRST], SECOND), [FIRST]);
  });
});

describe('getMomentList', () => {
  it('reads the ID list from the moment cookie', () => {
    const store = createCookieStore({ [MOMENT_LIST_COOKIE]: FIRST });

    assert.deepEqual(getMomentList(store), [FIRST]);
  });

  it('returns an empty list when the cookie is missing', () => {
    assert.deepEqual(getMomentList(createCookieStore()), []);
  });
});

describe('setMomentList', () => {
  it('writes the joined list with the shared cookie options', () => {
    const store = createCookieStore();

    setMomentList(store, [FIRST, SECOND]);

    assert.deepEqual(store.calls, [
      { type: 'set', name: MOMENT_LIST_COOKIE, value: `${FIRST},${SECOND}`, options: COOKIE_OPTIONS },
    ]);
    assert.deepEqual(getMomentList(store), [FIRST, SECOND]);
  });

  it('deletes the cookie when the list becomes empty', () => {
    const store = createCookieStore({ [MOMENT_LIST_COOKIE]: FIRST });

    setMomentList(store, []);

    assert.deepEqual(store.calls, [
      { type: 'delete', options: { name: MOMENT_LIST_COOKIE, path: COOKIE_OPTIONS.path } },
    ]);
    assert.equal(store.get(MOMENT_LIST_COOKIE), undefined);
  });
});
