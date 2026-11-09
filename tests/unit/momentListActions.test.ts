import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MOMENT_LIST_COOKIE } from '../../app/_utils/cookies.ts';
import { addMomentToList, removeMomentFromList } from '../../app/_utils/momentListActions.ts';
import { encodeMomentToken } from '../../app/_utils/momentUrl.ts';
import { createCookieStore } from '../support/cookies.ts';

const FIRST = encodeMomentToken('Birthday', new Date('2026-01-01T00:00:00.000Z'));
const SECOND = encodeMomentToken('Party', new Date('2027-06-15T18:30:00.000Z'));

describe('addMomentToList', () => {
  it('adds a new moment to the list cookie', () => {
    const store = createCookieStore();

    assert.equal(addMomentToList(store, FIRST), 'added');
    assert.equal(store.get(MOMENT_LIST_COOKIE)?.value, FIRST);
  });

  it('does not rewrite an existing moment', () => {
    const store = createCookieStore({ [MOMENT_LIST_COOKIE]: FIRST });

    assert.equal(addMomentToList(store, FIRST), 'exists');
    assert.deepEqual(store.calls, []);
  });

  it('rejects an invalid id before touching the store', () => {
    const store = createCookieStore();

    assert.equal(addMomentToList(store, 'bad id'), 'invalid');
    assert.deepEqual(store.calls, []);
  });

  it('stores the canonical token for an equivalent encoding', () => {
    const store = createCookieStore();
    const moment = `Caf%c3%a9@2026-01-01T00:00:00Z`;

    assert.equal(addMomentToList(store, moment), 'added');
    assert.equal(store.get(MOMENT_LIST_COOKIE)?.value, 'Caf%C3%A9@2026-01-01T00:00:00Z');
  });

  it('filters malformed entries before appending', () => {
    const store = createCookieStore({ [MOMENT_LIST_COOKIE]: `bad id,${SECOND}` });

    assert.equal(addMomentToList(store, FIRST), 'added');
    assert.equal(store.get(MOMENT_LIST_COOKIE)?.value, `${SECOND},${FIRST}`);
  });
});

describe('removeMomentFromList', () => {
  it('removes the matching moment and preserves the rest', () => {
    const store = createCookieStore({ [MOMENT_LIST_COOKIE]: `${FIRST},${SECOND}` });

    assert.equal(removeMomentFromList(store, FIRST), 'removed');
    assert.equal(store.get(MOMENT_LIST_COOKIE)?.value, SECOND);
  });

  it('deletes the cookie when the last moment is removed', () => {
    const store = createCookieStore({ [MOMENT_LIST_COOKIE]: FIRST });

    assert.equal(removeMomentFromList(store, FIRST), 'removed');
    assert.equal(store.get(MOMENT_LIST_COOKIE), undefined);
  });

  it('rejects an invalid id before touching the store', () => {
    const store = createCookieStore();

    assert.equal(removeMomentFromList(store, 'bad id'), 'invalid');
    assert.deepEqual(store.calls, []);
  });
});
