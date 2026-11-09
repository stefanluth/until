import { beforeEach, describe, expect, it, vi } from 'vitest';

import { removeMoment } from '@/_actions/removeMoment';
import { CONSENT_COOKIE, COOKIE_OPTIONS, MOMENT_LIST_COOKIE } from '@/_utils/cookies';
import { encodeMomentToken } from '@/_utils/momentUrl';

type CookieCall =
  | { type: 'get'; name: string }
  | { type: 'set'; name: string; value: string; options: unknown }
  | { type: 'delete'; options: { name: string; path: string } };

const runtime = vi.hoisted(() => {
  const values = new Map<string, string>();
  const calls: CookieCall[] = [];
  const cookies = vi.fn(async () => ({
    get(name: string) {
      calls.push({ type: 'get', name });
      const value = values.get(name);
      return value === undefined ? undefined : { value };
    },
    set(name: string, value: string, options: unknown) {
      values.set(name, value);
      calls.push({ type: 'set', name, value, options });
    },
    delete(options: { name: string; path: string }) {
      values.delete(options.name);
      calls.push({ type: 'delete', options });
    },
  }));

  return { calls, cookies, values };
});

vi.mock('next/headers', () => ({ cookies: runtime.cookies }));

const FIRST_ID = encodeMomentToken('Birthday', new Date('2026-01-01T00:00:00.000Z'));
const SECOND_ID = encodeMomentToken('Party', new Date('2027-06-15T18:30:00.000Z'));

function cookieWrites() {
  return runtime.calls.filter((call) => call.type === 'set' || call.type === 'delete');
}

beforeEach(() => {
  runtime.calls.length = 0;
  runtime.values.clear();
});

describe('removeMoment guards', () => {
  it('rejects an invalid id before reading cookies', async () => {
    const result = await removeMoment('bad id');

    expect(result).toBe('invalid');
    expect(runtime.cookies).not.toHaveBeenCalled();
    expect(runtime.calls).toEqual([]);
  });

  it('treats a missing consent cookie as not granted', async () => {
    const result = await removeMoment(FIRST_ID);

    expect(result).toBe('consent');
    expect(cookieWrites()).toEqual([]);
  });

  it('removes the matching id and preserves the rest', async () => {
    runtime.values.set(CONSENT_COOKIE, 'true');
    runtime.values.set(MOMENT_LIST_COOKIE, `${FIRST_ID},${SECOND_ID}`);

    const result = await removeMoment(FIRST_ID);

    expect(result).toBe('removed');
    expect(runtime.values.get(MOMENT_LIST_COOKIE)).toBe(SECOND_ID);
    expect(runtime.calls).toContainEqual({
      type: 'set',
      name: MOMENT_LIST_COOKIE,
      value: SECOND_ID,
      options: COOKIE_OPTIONS,
    });
  });

  it('deletes the cookie when the last id is removed', async () => {
    runtime.values.set(CONSENT_COOKIE, 'true');
    runtime.values.set(MOMENT_LIST_COOKIE, FIRST_ID);

    const result = await removeMoment(FIRST_ID);

    expect(result).toBe('removed');
    expect(runtime.values.has(MOMENT_LIST_COOKIE)).toBe(false);
    expect(runtime.calls).toContainEqual({
      type: 'delete',
      options: { name: MOMENT_LIST_COOKIE, path: COOKIE_OPTIONS.path },
    });
  });

  it('filters malformed entries while removing', async () => {
    runtime.values.set(CONSENT_COOKIE, 'true');
    runtime.values.set(MOMENT_LIST_COOKIE, `bad id,${FIRST_ID},${SECOND_ID}`);

    const result = await removeMoment(FIRST_ID);

    expect(result).toBe('removed');
    expect(runtime.values.get(MOMENT_LIST_COOKIE)).toBe(SECOND_ID);
  });
});
